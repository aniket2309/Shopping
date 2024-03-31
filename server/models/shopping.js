import Mongoose, { Schema } from "mongoose";
import status from '../enums/status';

const options = {
    collection: "shop",
    timestamps: true
};

const schemaDefination = new Schema(
    {
        title: {
            type: String
        },
        description: {
            type: String
        },
        status: {
            type: String, default: status.ACTIVE
        }
    },
    options
);

module.exports = Mongoose.model("shop", schemaDefination);
