
import shopModel from "../../../models/shopping";


const shopServices = {

    createShopContent: async (insertObj) => {
        return await shopModel.create(insertObj);
    },

    findShopContent: async (query) => {
        return await shopModel.findOne(query);
    },

    updateShopContent: async (query, updateObj) => {
        return await shopModel.findOneAndUpdate(query, updateObj, { new: true });
    },

    shopContentList: async () => {
        return await shopModel.find({});
    },

}

module.exports = { shopServices };