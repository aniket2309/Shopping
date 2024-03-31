
import userModel from "../../../models/user";
import status from '../../../enums/status';
import userType from "../../../enums/userType";


const userServices = {
  userCheck: async (userId) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { $or: [{ email: userId }, { mobileNumber: userId }] }] }
    return await userModel.findOne(query);
  },

  checkUserExists: async (email,javaUID) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { $or: [{ email: email },{ javaUID: javaUID }] }] }
    return await userModel.findOne(query);
  },
  emailMobileExist: async (email, mobileNumber) => {
    let query = { $and: [{ status: { $ne: status.DELETE }, userType: { $in: [userType.ADMIN, userType.SUBADMIN] } }, { $or: [{ email: email }, { mobileNumber: mobileNumber }] }] }
    return await userModel.findOne(query);
  },

  emailMobileExist: async (mobileNumber, email, id) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { _id: { $ne: id } }, { $or: [{ email: email }, { mobileNumber: mobileNumber }] }] }
    return await userModel.findOne(query);
  },

  checkSocialLogin: async (socialId, socialType) => {
    return await userModel.findOne({ socialId: socialId, socialType: socialType });
  },

  createUser: async (insertObj) => {
    return await userModel.create(insertObj);
  },

  findUser: async (query) => {
    return await userModel.findOne(query);
  },
  findCount: async (query) => {
    return await userModel.count(query);
  },

  updateUser: async (query, updateObj) => {
    return await userModel.findOneAndUpdate(query, updateObj, { new: true });
  },

  updateUserById: async (query, updateObj) => {
    return await userModel.findByIdAndUpdate(query, updateObj, { new: true });
  },

  insertManyUser: async (obj) => {
    return await userModel.insertMany(obj);
  },
  createAddress: async (validatedBody) => {
    return await userModel(validatedBody).save()
  },
  editEmailMobileExist: async (email, mobileNumber, userId) => {
    let query = { $and: [{ status: { $ne: status.DELETE } }, { _id: { $ne: userId } }, { $or: [{ email: email }, { mobileNumber: mobileNumber }] }] }
    return await userModel.findOne(query);
  },



  paginateSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: userType.USER };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
    };
    return await userModel.paginate(query, options);
  },
  subAdminPaginateSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: userType.SUBADMIN };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
    };
    return await userModel.paginate(query, options);
  },
  agentPaginateSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: userType.AGENT };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
      populate: { path: "vehicleType" }
    };
    return await userModel.paginate(query, options);
  },
  expertPaginateSearch: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: userType.EXPERT };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 },
      populate: { path: "trade" }
    };
    return await userModel.paginate(query, options);
  },
  paginateSearchAll: async (validatedBody) => {
    let query = { status: { $ne: status.DELETE }, userType: { $nin: [userType.ADMIN, userType.SUBADMIN] } };
    const { search, fromDate, toDate, page, limit } = validatedBody;
    if (search) {
      query.$or = [
        { firstName: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
        { mobileNumber: { $regex: search, $options: 'i' } },
      ]
    }
    if (fromDate && !toDate) {
      query.createdAt = { $gte: fromDate };
    }
    if (!fromDate && toDate) {
      query.createdAt = { $lte: toDate };
    }
    if (fromDate && toDate) {
      query.$and = [
        { createdAt: { $gte: fromDate } },
        { createdAt: { $lte: toDate } },
      ]
    }
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
    };
    return await userModel.paginate(query, options);
  },
 async userWithAggregation(validateBody) {
    let data = []
    if (validateBody.type=="AGENT") {
      data.push({
        "$geoNear": {
          "near": {
            "type": "Point",
            "coordinates": [parseFloat(validateBody.lat), parseFloat(validateBody.lng)]
          },
          "spherical": true,
          "distanceField": "distance",
          // "distanceMultiplier": 0.000621371,
          "maxDistance": 20,
        }
      }, {
        $match: {
          "status": status.ACTIVE
        }
      }, {
        $lookup:
        {
          from: 'service',
          localField:"trade",
          foriegnField:"_id",
          as: 'tradeDetails',
        }
      },{
        $match:{
          "trade":{$in:validateBody.serviceId}
        }
      })
    }
    else{
      data.push({
        "$geoNear": {
          "near": {
            "type": "Point",
            "coordinates": [parseFloat(validateBody.lat), parseFloat(validateBody.lng)]
          },
          "spherical": true,
          "distanceField": "distance",
          // "distanceMultiplier": 0.000621371,
          "maxDistance": 20,
        }
      }, {
        $match: {
          "status": status.ACTIVE
        }
      }, {
        $lookup:
        {
          from: 'vehicle',
          localField:"vehicleType",
          foriegnField:"_id",
          as: 'vehicleDetails',
        }
      })
    }
    let aggregate=userModel.aggregate(data)
    let options = {
      page: parseInt(page) || 1,
      limit: parseInt(limit) || 15,
      sort: { createdAt: -1 }
  };
    return await userModel.aggregatePaginate(aggregate,options)
  }
}

module.exports = { userServices };