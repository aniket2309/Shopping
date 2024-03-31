import Joi from "joi";
import Mongoose from "mongoose";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import bcrypt from 'bcryptjs';
import responseMessage from '../../../../../assets/responseMessage';
import commonFunction from '../../../../helper/util';
import jwt from 'jsonwebtoken';
import status from '../../../../enums/status';
import auth from "../../../../helper/auth"
import speakeasy from 'speakeasy';
import userType from "../../../../enums/userType";
const secret = speakeasy.generateSecret({ length: 10 });
import { userServices } from '../../services/user';
import axios from 'axios';
const { userCheck, paginateSearch, insertManyUser, createAddress, checkUserExists, emailMobileExist, createUser, findUser, updateUser, updateUserById, checkSocialLogin } = userServices;
export class userController {

    /**
     * @swagger
     * /user/userSignup:
     *   post:
     *     tags:
     *       - USER
     *     description: userSignup
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: firstName
     *         description: First name
     *         in: formData
     *         required: false
     *       - name: lastName
     *         description: Last name
     *         in: formData
     *         required: false
     *       - name: email
     *         description: email
     *         in: formData
     *         required: true
     *       - name: password
     *         description: password
     *         in: formData
     *         required: true
     *       - name: confirmPassword
     *         description: confirmPassword
     *         in: formData
     *         required: true
     *       - name: countryCode
     *         description: countryCode
     *         in: formData
     *         required: false
     *       - name: mobileNumber
     *         description: mobileNumber
     *         in: formData
     *         required: true
     *       - name: dateOfBirth
     *         description: dateOfBirth
     *         in: formData
     *         required: false
     *       - name: gender
     *         description: gender
     *         in: formData
     *         required: false
     *         enum: [MALE,FEMALE]
     *       - name: address
     *         description: address
     *         in: formData
     *         required: false
     *       - name: city
     *         description: city
     *         in: formData
     *         required: false
     *       - name: state
     *         description: state
     *         in: formData
     *         required: false
     *       - name: country
     *         description: country
     *         in: formData
     *         required: false
     *       - name: profilePic
     *         type: file
     *         in: formData
     *         description: Profile picture
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async userSignup(req, res, next) {
        const validationSchema = {
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            email: Joi.string().required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required(),
            countryCode: Joi.string().optional(),
            mobileNumber: Joi.string().required(),
            dateOfBirth: Joi.string().optional(),
            gender: Joi.string().optional(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            profilePic: Joi.string().optional(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, mobileNumber, firstName, password, confirmPassword } = validatedBody;
            let userInfo = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: mobileNumber }] }, { userType: userType.USER, status: { $ne: status.DELETE } }] });
            if (userInfo) {
                if (userInfo.email == email) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
                else if (userInfo.mobileNumber == mobileNumber) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            if (password != confirmPassword) {
                throw apiError.badRequest(responseMessage.PWD_CONFPWD_NOT_MATCH)
            }
            validatedBody.password = bcrypt.hashSync(validatedBody.password);
            validatedBody.otp = commonFunction.getOTP();
            validatedBody.otpExpireTime = new Date().getTime() + config.get('OTP_TIME_MINUTE') * 60 * 1000;
            await commonFunction.sendEmailOtp(email, firstName, validatedBody.otp);
            if (req.files.length != 0) {
                validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
            }
            let result = await createUser(validatedBody);
            result = JSON.parse(JSON.stringify(result));
            delete result.password;
            delete result.otp;
            return res.json(new response(result, responseMessage.USER_CREATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/verifyOTP:
     *   patch:
     *     tags:
     *       - USER
     *     description: verifyOTP
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: verifyOTP
     *         description: verifyOTP
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/verifyOTP'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async verifyOTP(req, res, next) {
        let validationSchema = {
            email: Joi.string().required(),
            otp: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, otp } = validatedBody;
            let userResult = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: email }] }, { userType: userType.USER, status: { $ne: status.DELETE } }] })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            console.log(Date.now() > userResult.otpExpireTime, Date.now(), userResult.otpExpireTime)
            if (Date.now() > userResult.otpExpireTime) {
                throw apiError.badRequest(responseMessage.OTP_EXPIRED);
            }
            if (userResult.otp != otp) {
                throw apiError.badRequest(responseMessage.INCORRECT_OTP);
            }

            let updateResult = await updateUser({ _id: userResult._id }, { otpVerified: true })
            let token = await commonFunction.getToken({ _id: updateResult._id, email: updateResult.email, userType: updateResult.userType });
            let obj = {
                _id: updateResult._id,
                firstName: updateResult.firstName,
                email: updateResult.email,
                countryCode: updateResult.countryCode,
                mobileNumber: updateResult.mobileNumber,
                token: token
            }
            return res.json(new response(obj, responseMessage.OTP_VERIFY));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/resendOTP:
     *   patch:
     *     tags:
     *       - USER
     *     description: resendOTP
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: resendOTP
     *         description: resendOTP
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/resendOTP'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async resendOTP(req, res, next) {
        let validationSchema = {
            email: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            let userResult = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: email }] }, { userType: userType.USER, status: { $ne: status.DELETE } }] })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let otp = await commonFunction.getOTP();
            let otpExpireTime = Date.now() + config.get('OTP_TIME_MINUTE') * 60 * 1000;
            if (userResult.email == email) {
                await commonFunction.sendEmailOtp(email, userResult.firstName, otp)
            }
            if (userResult.mobileNumber == email) {
                await commonFunction.sendSms(userResult.countryCode + userResult.mobileNumber, otp);
            }
            let updateResult = await updateUser({ _id: userResult._id }, { otp: otp, otpExpireTime: otpExpireTime, otpVerified: false });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            delete updateResult.password;
            delete updateResult.otp;
            return res.json(new response(updateResult, responseMessage.OTP_SEND));
        }
        catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/forgotPassword:
     *   patch:
     *     tags:
     *       - USER
     *     description: forgotPassword
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: forgotPassword
     *         description: forgotPassword
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/forgotPassword'
     *     responses:
     *       200:
     *         description: Returns success message
     */

    async forgotPassword(req, res, next) {
        let validationSchema = {
            email: Joi.string().required()
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const { email } = validatedBody;
            let userResult = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: email }] }, { userType: userType.USER, status: { $ne: status.DELETE } }] })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let otp = await commonFunction.getOTP();
            let otpExpireTime = Date.now() + config.get('OTP_TIME_MINUTE') * 60 * 1000;
            if (userResult.email == email) {
                await commonFunction.sendEmailOtp(email, userResult.firstName, otp)
            }
            if (userResult.mobileNumber == email) {
                await commonFunction.sendSms(userResult.countryCode + userResult.mobileNumber, otp);
            }
            let updateResult = await updateUser({ _id: userResult._id }, { otp: otp, otpExpireTime: otpExpireTime, otpVerified: false });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            delete updateResult.password;
            delete updateResult.otp;
            return res.json(new response(updateResult, responseMessage.OTP_SEND));
        }
        catch (error) {
            return next(error);
        }
    }
    /**
      * @swagger
      * /user/resetPassword:
      *   patch:
      *     tags:
      *       - USER
      *     description: resetPassword
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: resetPassword
      *         description: resetPassword
      *         in: body
      *         required: true
      *         schema:
      *           $ref: '#/definitions/resetPassword'
      *     responses:
      *       200:
      *         description: Returns success message
      */

    async resetPassword(req, res, next) {
        const validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, password, confirmPassword } = validatedBody;
            let userInfo = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: email }] }, { userType: userType.USER, status: { $ne: status.DELETE } }] })
            if (!userInfo) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND)
            }
            if (password != confirmPassword) {  
                throw apiError.badRequest(responseMessage.PWD_CONFPWD_NOT_MATCH)
            }
            if (userInfo.otpVerified == false) {
                throw apiError.unauthorized(responseMessage.RESET_OTP_NOT_VERIFY);
            }
            let updateResult = await updateUserById({ _id: userInfo._id }, { $set: { password: bcrypt.hashSync(password) } });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            delete updateResult.password;
            delete updateResult.otp;
            return res.json(new response(updateResult, responseMessage.PWD_CHANGED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/userLogin:
     *   post:
     *     tags:
     *       - USER
     *     description: userLogin
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: userLogin
     *         description: userLogin
     *         in: body
     *         required: true
     *         schema:
     *           $ref: '#/definitions/userLogin'
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async userLogin(req, res, next) {
        let validationSchema = {
            email: Joi.string().required(),
            password: Joi.string().required(),
        }
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, password, mobileNumber } = validatedBody;
            var userResult = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: email }] }, { userType: userType.USER, status: { $ne: status.DELETE } }] })
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (bcrypt.compareSync(password, userResult.password) == false) {
                throw apiError.invalid(responseMessage.INCORRECT_LOGIN);
            }
            let token = await commonFunction.getToken({ _id: userResult._id, email: userResult.email, userType: userResult.userType });
            let obj = {
                _id: userResult._id,
                fullName: userResult.fullName,
                email: userResult.email,
                userType: userResult.userType,
                otpVerification: userResult.otpVerified,
                token: token
            }
            console.log(obj,395)
            return res.json(new response(obj, responseMessage.LOGIN));
        } catch (error) {
            console.log(error)
            return next(error);
        }
    }

    /**
      * @swagger
      * /user/getProfile:
      *   get:
      *     tags:
      *       - USER
      *     description: getProfile
      *     produces:
      *       - application/json
      *     parameters:
      *       - name: token
      *         description: User token
      *         in: header
      *         required: true
      *     responses:
      *       200:
      *         description: Login successfully.
      *       402:
      *         description: Incorrect login credential provided.
      *       404:
      *         description: User not found.
      */
    async getProfile(req, res, next) {
        try {
            // console.log('get profile 427',)
            let userResult = await findUser({ _id: req.userId, userType: userType.USER, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            userResult = JSON.parse(JSON.stringify(userResult));
            delete userResult.password;
            delete userResult.otp;
            return res.json(new response(userResult, responseMessage.USER_DETAILS));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/editUserProfile:
     *   put:
     *     tags:
     *       - USER
     *     description: editUserProfile
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: firstName
     *         description: First name
     *         in: formData
     *         required: false
     *       - name: lastName
     *         description: Last name
     *         in: formData
     *         required: false
     *       - name: email
     *         description: email
     *         in: formData
     *         required: false
     *       - name: countryCode
     *         description: countryCode
     *         in: formData
     *         required: false
     *       - name: mobileNumber
     *         description: mobileNumber
     *         in: formData
     *         required: false
     *       - name: dateOfBirth
     *         description: dateOfBirth
     *         in: formData
     *         required: false
     *       - name: gender
     *         description: gender
     *         in: formData
     *         required: false
     *         enum: [MALE,FEMALE]
     *       - name: address
     *         description: address
     *         in: formData
     *         required: false
     *       - name: city
     *         description: city
     *         in: formData
     *         required: false
     *       - name: state
     *         description: state
     *         in: formData
     *         required: false
     *       - name: country
     *         description: country
     *         in: formData
     *         required: false
     *       - name: profilePic
     *         type: file
     *         in: formData
     *         description: Profile picture
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async editUserProfile(req, res, next) {
        console.log(req.body)
        const validationSchema = {
            firstName: Joi.string().optional(),
            lastName: Joi.string().optional(),
            email: Joi.string().optional(),
            countryCode: Joi.string().optional(),
            mobileNumber: Joi.string().optional(),
            dateOfBirth: Joi.string().optional(),
            gender: Joi.string().optional(),
            address: Joi.string().optional(),
            city: Joi.string().optional(),
            state: Joi.string().optional(),
            country: Joi.string().optional(),
            profilePic: Joi.string().optional(),
        };
        try {
            let validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, mobileNumber } = validatedBody;
            let userResult = await findUser({ _id: req.userId, userType: userType.USER, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let sameUserResult = await findUser({ $and: [{ $or: [{ email: email }, { mobileNumber: mobileNumber }] }, { _id: { $ne: userResult._id }, userType: userType.USER, status: { $ne: status.DELETE } }] });
            if (sameUserResult) {
                if (sameUserResult.email == email) {
                    throw apiError.conflict(responseMessage.EMAIL_EXIST);
                }
                else if (sameUserResult.mobileNumber == mobileNumber) {
                    throw apiError.conflict(responseMessage.MOBILE_EXIST);
                }
            }
            if (req.files.length != 0) {
                validatedBody.profilePic = await commonFunction.getImageUrl(req.files);
            }
            let updateResult = await updateUser({ _id: userResult._id }, { $set: validatedBody });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            delete updateResult.password;
            delete updateResult.otp;
            return res.json(new response(updateResult, responseMessage.PROFILE_UPDATED));
        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /user/changePassword:
     *   put:
     *     tags:
     *       - USER
     *     description: changePassword
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: oldPassword
     *         description: oldPassword
     *         in: formData
     *         required: true
     *       - name: password
     *         description: password
     *         in: formData
     *         required: true
     *       - name: confirmPassword
     *         description: confirmPassword
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Returns success message
     */
    async changePassword(req, res, next) {
        const validationSchema = {
            oldPassword: Joi.string().required(),
            password: Joi.string().required(),
            confirmPassword: Joi.string().required(),
        };
        try {
            const validatedBody = await Joi.validate(req.body, validationSchema);
            const { email, oldPassword, password, confirmPassword } = validatedBody;
            let userResult = await findUser({ _id: req.userId, userType: userType.USER, status: { $ne: status.DELETE } });
            if (!userResult) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            if (password != confirmPassword) {
                throw apiError.badRequest(responseMessage.PWD_CONFPWD_NOT_MATCH)
            }
            if (bcrypt.compareSync(oldPassword, userResult.password) == false) {
                throw apiError.invalid(responseMessage.PWD_NOT_MATCH);
            }
            let updateResult = await updateUserById({ _id: userResult._id }, { $set: { password: bcrypt.hashSync(password) } });
            updateResult = JSON.parse(JSON.stringify(updateResult));
            delete updateResult.password;
            delete updateResult.otp;
            return res.json(new response(updateResult, responseMessage.PWD_CHANGED));
        } catch (error) {
            return next(error);
        }
    }
}

export default new userController()
