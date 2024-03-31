import Express from "express";
import controller from "./controller";
import auth from "../../../../helper/auth";
import upload from '../../../../helper/uploadHandler';


export default Express.Router()

    .patch('/verifyOTP', controller.verifyOTP)
    .patch('/resendOTP', controller.resendOTP)
    .patch('/forgotPassword', controller.forgotPassword)
    .patch('/resetPassword', controller.resetPassword)
    .post('/userLogin', controller.userLogin)

    .use(upload.uploadFile)
    .post('/userSignup', controller.userSignup)

    .use(auth.verifyToken)
    .get('/getProfile', controller.getProfile)
    .put('/editUserProfile', controller.editUserProfile)
    .put('/changePassword', controller.changePassword)