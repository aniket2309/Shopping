import Joi from "joi";
import _ from "lodash";
import config from "config";
import apiError from '../../../../helper/apiError';
import response from '../../../../../assets/response';
import responseMessage from '../../../../../assets/responseMessage';
import { shopServices } from '../../services/shopping';
const { createShopContent,
    findShopContent,
    updateShopContent,
    shopContentList } = shopServices;
import commonFunction from '../../../../helper/util';
import status, { DELETE } from '../../../../enums/status';
import staticModel from '../../../../models/shopping'
import { userServices } from '../../services/user';
const { checkUserExists, emailMobileExist, createUser, findUser, findAllUser, updateUser, updateUserById, paginateSearch, insertManyUser } = userServices;
import userType from "../../../../enums/userType";
import fs from 'file-system';


export class shopController {


    /**
     * @swagger
     * /shop/addShopContent:
     *   post:
     *     tags:
     *       - SHOP_CONTENT
     *     description: addShopContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: user token
     *         in: header
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Content add successfully.
     *       404:
     *         description: User not found || Data not found.
     *       409:
     *         description: Data already exits.
     *       501:
     *         description: Something went wrong!
     */
    async addShopContent(req, res, next) {
        const validationSchema = {
            title: Joi.string().optional(),
            description: Joi.string().optional()
        }
        try {
            const validateBody = await Joi.validate(req.body, validationSchema);
            const authCheck = await findUser({ _id: req.userId, status: status.ACTIVE });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }

            let checkShop = await findShopContent({ title: req.body.title });
            if (!checkShop) {
                const saveResult = await createShopContent(validateBody);
                return res.json(new response(saveResult, responseMessage.ADD_CONTENT));
            } else {
                throw apiError.conflict(responseMessage.ALREADY_EXITS);
            }


        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /shop/viewShopContent:
     *   get:
     *     tags:
     *       - SHOP_CONTENT
     *     description: viewShopContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: _id
     *         description: _id
     *         in: query
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async viewShopContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().required()
        }
        try {
            const validatedBody = await Joi.validate(req.query, validationSchema);
            const data = await findShopContent({ _id: validatedBody._id, status: status.ACTIVE });
            if (!data) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
                return res.json(new response(data, responseMessage.DATA_FOUND));
            }
        } catch (error) {
            return next(error);
        }
    }



    /**
     * @swagger
     * /shop/editShopContent:
     *   put:
     *     tags:
     *       - SHOP_CONTENT
     *     description: editShopContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: formData
     *         required: true
     *       - name: title
     *         description: title
     *         in: formData
     *         required: true
     *       - name: description
     *         description: description
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async editShopContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
            title: Joi.string().optional(),
            description: Joi.string().optional(),
        }
        try {
            const validateBody = await Joi.validate(req.body, validationSchema);
            const authCheck = await findUser({ _id: req.userId, status: status.ACTIVE });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let CheckStatic = await findShopContent({ _id: req.body._id });
            if (!CheckStatic) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
                let updateResult = await updateShopContent({ _id: req.body._id }, (validateBody))
                return res.json(new response(updateResult, responseMessage.UPDATE_SUCCESS));
            }


        } catch (error) {
            return next(error);
        }
    }

    /**
     * @swagger
     * /shop/deleteShopContent:
     *   put:
     *     tags:
     *       - SHOP_CONTENT
     *     description: deleteShopContent
     *     produces:
     *       - application/json
     *     parameters:
     *       - name: token
     *         description: token
     *         in: header
     *         required: true
     *       - name: _id
     *         description: _id
     *         in: formData
     *         required: true
     *     responses:
     *       200:
     *         description: Data found successfully.
     *       404:
     *         description: User not found || Data not found.
     *       501:
     *         description: Something went wrong!
     */
    async deleteShopContent(req, res, next) {
        const validationSchema = {
            _id: Joi.string().optional(),
        }
        try {
            const validateBody = await Joi.validate(req.body, validationSchema);
            const authCheck = await findUser({ _id: req.userId, status: status.ACTIVE });
            if (!authCheck) {
                throw apiError.notFound(responseMessage.USER_NOT_FOUND);
            }
            let CheckStatic = await findShopContent({ _id: req.body._id });
            if (!CheckStatic) {
                throw apiError.notFound(responseMessage.DATA_NOT_FOUND);
            } else {
                let updateResult = await updateShopContent({ _id: req.body._id }, { $set: { status:DELETE } });
                return res.json(new response(updateResult, responseMessage.UPDATE_SUCCESS));
            }


        } catch (error) {
            return next(error);
        }
    }


}


export default new shopController()
