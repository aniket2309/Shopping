import Mongoose, { Schema, Types } from "mongoose";
import mongoosePaginate from "mongoose-paginate";
import mongooseAggregatePaginate from "mongoose-aggregate-paginate";
import userType from "../enums/userType";
import status from '../enums/status';
import bcrypt from 'bcryptjs';
import commonFunction from '../helper/util';

var userModel = new Schema(
  {
    firstName: {
      type: String
    },
    lastName: {
      type: String
    },
    userName: {
      type: String
    },
    email: {
      type: String
    },
    password: {
      type: String
    },
    countryCode: {
      type: String
    },
    mobileNumber: {
      type: String
    },
    dateOfBirth: {
      type: String
    },
    gender: {
      type: String,
      enum:['MALE','FEMALE']
    },
    address: {
      type: String
    },
    city: {
      type: String
    },
    state: {
      type: String
    },
    country: {
      type: String
    },
    profilePic: {
      type: String
    },
    otp: {
      type: Number
    },
    otpVerified: {
      type: Boolean,
      default: false
    },
    otpExpireTime: {
      type: Number
    },
    userType: {
      type: String,
      default: userType.USER
    },
    status: {
      type: String,
      default: status.ACTIVE
    }
  },
  { timestamps: true }
);
userModel.index({ location: "2dsphere" })
userModel.plugin(mongooseAggregatePaginate)
userModel.plugin(mongoosePaginate);
module.exports = Mongoose.model("user", userModel);

Mongoose.model("user", userModel).findOne({ userType: userType.ADMIN }, (err, result) => {
  if (err) {
    console.log("DEFAULT ADMIN ERROR", err);
  }
  else if (result) {
    console.log("Default Admin already exist.");
  }
  else {
    let obj = {
      userType: userType.ADMIN,
      firstName: "Rohith",
      lastName: "Matam",
      countryCode: "+91",
      mobileNumber: 9160336988,
      email: "cpp-rohith@mobiloitte.com",
      dateOfBirth: "19/08/1997",
      otpVerified: true,
      password: bcrypt.hashSync("Mobiloitte1"),
      address: "Pune, India"
    };
    Mongoose.model("user", userModel)(obj).save((err1, result1) => {
      if (err1) {
        console.log("DEFAULT ADMIN  creation ERROR", err1);
      } else {
        console.log("DEFAULT ADMIN Created", result1);
      }
    });
  }
});