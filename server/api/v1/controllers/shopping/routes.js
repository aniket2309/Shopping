import Express from "express";
import controller from "./controller";
import auth from '../../../../helper/auth'
import upload from '../../../../helper/uploadHandler';


export default Express.Router()
    .get('/viewShopContent', controller.viewShopContent)
    .use(auth.verifyToken)
    .post('/addShopContent', controller.addShopContent)
    .put('/editShopContent', controller.editShopContent)
    .put('/deleteShopContent', controller.deleteShopContent)

