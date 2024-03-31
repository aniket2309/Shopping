import config from "config";
import Joi from "joi";
import jwt from 'jsonwebtoken';
import twilio from 'twilio';
import Sender from 'aws-sms-send';


import nodemailer from 'nodemailer';
import cloudinary from 'cloudinary';
//import stackingModel from "../models/stackingModel"
import status from "../enums/status"
import userType from "../enums/userType"

import userModel from "../models/user"
cloudinary.config({
  cloud_name: config.get('cloudinary.cloud_name'),
  api_key: config.get('cloudinary.api_key'),
  api_secret: config.get('cloudinary.api_secret')
});

// const accountSid = config.get('twilio.accountSid');
// const authToken = config.get('twilio.authToken');
// const client = require('twilio')(accountSid, authToken);
//import qrcode from 'qrcode';

module.exports = {


  getOTP() {
    var otp = Math.floor(1000 + Math.random() * 9000);
    return otp;
  },


  sendSms: (number, otp) => {
    sender.sendSms(`Your otp is ${otp}`, config.get('AWS.smsSecret'), false, number)
      .then(function (response) {
        console.log(response);
        return response;
      })
      .catch(function (err) {
        return err;
      })

  },
  sendSmsPromise: async (number, body) => {
    let send = await sender.sendSms(body, config.get('AWS.smsSecret'), false, number)
    return send

  },
  getToken: async (payload) => {
    var token = await jwt.sign(payload, config.get('jwtsecret'), { expiresIn: "24h" })
    return token;
  },

  sendMail: async (to, name, link) => {
    let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>Please click on the following link <a href="${config.get('hostAddress')}${link}">
                  Set a new password now
                </a>
                    If you did not request this, please ignore this email and your password will remain unchanged.
                </p> 
                  <p>
                      Thanks<br>
                  </p>
              </div>`

    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.user'),
        "pass": config.get('nodemailer.pass')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: 'Reset Link',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  getImageUrl: async (files) => {
    var result = await cloudinary.v2.uploader.upload(files[0].path);
    return result.secure_url;
  },

  genBase64: async (data) => {
    return await qrcode.toDataURL(data);
  },

  getSecureUrl: async (base64) => {
    var result = await cloudinary.v2.uploader.upload(base64);
    return result.secure_url;
  },

  sendEmailOtp: async (to, firstName, otp) => {
    let html = `<!DOCTYPE html>
    <html lang="en">
    
    <head>
        <title></title>
    </head>
    
    <body>
        <div class="card" style=" box-shadow: 0 4px 8px 0 rgba(0,0,0,0.2);
        transition: 0.3s;
        width: 100%; margin: auto; min-height:15em;margin-top: 25px;">
            <div class="main" style="background-image: url('');">
                <div class="main-container" style="text-align: center;">
                    <h1 style="padding-top: 30px;"> <strong>Warriors Investments</strong></h1>
                    <!-- <img  src="https://res.cloudinary.com/mobiloitte-testing1/image/upload/v1638252186/xekr1m6n5ar96nii7wrj.png" style="width: 30%;" alt="logo"> -->
                    
                    <div style="width: 90%;margin: auto; text-align: left;">
                        <h4 style="color: #1f1f20; margin-bottom: 0px;"><strong>HI ${firstName}</strong></h4><br><br>
                        <p style="color: #5b5858;font-size: 18px;margin-top: 0px;">Your Email One Time Password  ${otp} to Log in your Warriors Investments account . The OTP is valid for ${config.get('OTP_TIME_MINUTE')} minutes</p>
                        <p style="color: #5b5858;font-size: 18px;">This OTP will be used to verify the device you are logging in form . For account safety , do not share your OTP with others.</p>
                        <p style="color: #5b5858;font-size: 18px;">Regards,<br>Team Warriors Investments.</p>
    
    
                        <!-- <p><strong style="color: #596BD3;">Email :</strong> <strong>tanveer12@mailinator.com</strong>
                            <p>Upon sign-in in, you will be able to access other sevices.</p> -->
                    </div>
                    <!-- <div style="width: 90%;margin: auto; text-align: center;">
     <hr>
    <h4 style="color: #596BD3"><strong>IMPORTANT</strong></h4>
    <p style="color: #5b5858;font-size: 18px;">Please do not reply to this email</p>
    
                    </div> -->
                </div>
    
            </div>
        </div>
     
    </body>
    
    </html>`

    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.user'),
        "pass": config.get('nodemailer.pass')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: 'Verification Mail',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },

  sendEmailCreadential: (email, password, callback) => {
    var sub = `Your creadential is  email:- ${email} and password:- ${password} .`
    let transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        "user": config.get('nodemailer.user'),
        "pass": config.get('nodemailer.pass')
        // "user": "customerservice@ejobbing.com",
        // "pass": "Thrive123"

      }
    });
    var mailOptions = {
      from: '<do_not_reply@gmail.com>',
      to: email,
      subject: 'creadential for login',
      text: sub,
      // html: html
    };
    transporter.sendMail(mailOptions, function (error, info) {
      // console.log(error, info)
      if (error) {
        callback(error, null)
      } else {
        callback(null, info.response)
      }
    });
  },

  sendPushMail: async (email, subject, body) => {
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.user'),
        "pass": config.get('nodemailer.pass')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: subject,
      text: body
    };
    return await transporter.sendMail(mailOptions)
  },


  sendSmsTwilio: async (mobileNumber, otp) => {
    var result = await client.messages.create({
      body: `Your OTP is ${otp}`,
      to: mobileNumber,
      from: config.get('twilio.number')

    })
    console.log("136", result)
    return result;
  },

  uploadImage(image) {
    return new Promise((resolve, reject) => {
      cloudinary.uploader.upload(image, function (error, result) {
        console.log(result);
        if (error) {
          reject(error);
        }
        else {
          resolve(result.url)
        }
      });
    })
  },

  makeReferral() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
  },

  generateOrder() {
    var result = '';
    var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    var charactersLength = characters.length;
    for (var i = 0; i < 10; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "ORD-" + result;
  },


  async commissionGive(referralCode, package1, amount) {
    let result = []
    let referId = []
    referId[0] = [referralCode]
    let percentile = await percentileModel.findOne({ package: package1 })
    for (let i = 0; i < 10; i++) {
      let findreferer = await userModel.findOne({ referralCode: referId[i], status: status.ACTIVE })
      if (!findreferer) {
        break;
      }
      let amountInc = amount * percentile.percentile[i] / 100

      let update = await userModel.findOneAndUpdate({ _id: checkStack._id }, { $inc: { commission: amountInc } }, {})
      result.push(update)
      if (!findreferer.referedByCode) {
        break;
      }
      else {
        referId.push(findreferer.referedByCode)
        continue
      }
    }
    return result
  },
  async commissionGive2(referralCode, package1, amount) {
    let result = []
    let referId = []
    referId[0] = [referralCode]
    let percentile = await percentileModel.findOne({ package: package1 })
    console.log("zizge8d-----------------8n", percentile)

    // let findAdmin = await user.findOne({ status:status.ACTIVE})
    // console.log("zizge8d8???????????????n", findAdmin)
    for (let i = 0; i < 10; i++) {
      if (referId[i] == null) {
        console.log("gyzuwdqvgwbeyuzn")
        break;
      }
      let stackCheck = await stackingModel.findOne({ referedByCode: referId[i], package: package1 })
      if (!stackCheck) {
        break;
      }

      let amountInc = amount * percentile.percentile[i] / 100;
      console.log(amountInc)
      // let adminUpdate = await user.findOneAndUpdate({ _id: findAdmin._id }, { $inc: { adminUsableAmount: -amountInc } }, { new: true })
      let update = await userModel.findByIdAndUpdate({ _id: stackCheck.userId }, { $inc: { pendingReferralAmount: amountInc } }, { new: true })
      result.push(update)
      referId.push(stackCheck.referedByCode)
    }
    return result
  },

  paginationFunction: (result, page, limit) => {
    let endIndex = page * limit;
    let startIndex = (page - 1) * limit;
    var resultArray = {}

    resultArray.page = page
    resultArray.limit = limit
    resultArray.remainingItems = result.length - endIndex

    if (result.length - endIndex < 0) {
      resultArray.remainingItems = 0

    }
    resultArray.count = result.length
    resultArray.results = result.slice(startIndex, endIndex)
    return resultArray
  },

  sendMailNotification: async (to, name, message) => {
    let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>"${message}>
                
                </a>

                </p> 
                <p>
                    Thanks<br>
                </p>
            </div>`

    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.user'),
        "pass": config.get('nodemailer.pass')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: to,
      subject: 'Notification',
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },
  pushNotification: (deviceToken, title, body, data2, callback) => {
    console.log(deviceToken);
    var serverKey = 'AAAAzXSYiRk:APA91bGra6YCzDO-L-9skhQXIYondnDZIURMdgP354PDyZ1NzDy2SyeImDvDV14362kOQx0gLN9GttfaNE3v-GsSMQiqp4phZAL9AmAPcN7MQ0U98ZDvzWw7qkmnB2HP02Xc8K_ObuG8';
    var fcm = new FCM(serverKey);
    var message = {
      to: deviceToken, // required fill with device token or topics
      "content_available": true,
      notification: {
        title: title,
        body: body
      },
      data: data2
    };
    //callback style
    fcm.send(message, function (err, response) {
      if (err) {
        console.log(">>>>>>>>>>", err)
        callback(err, null)
      } else {
        console.log(">>>>>>>>>response", response)
        callback(null, response)
      }
    });

  },

  generateSku(brand, item, color, size) {
    var gen = brand.substring(0, 3) + "-" + item.substring(0, 3) + "-" + color.substring(0, 3) + "-" + size.substring(0, 6);
    return gen;
  },

  couponCode: async () => {
    function makeid(length) {
      var result = '';
      var characters = '0123456789abcdefghij0123456789klmnopqrst0123456789uvwxyzAB0123456789CDEFGHIJKL0123456789MNOPQRSTU0123456789VWXYZ0123456789';
      for (var i = length; i > 0; --i) result += characters[Math.floor(Math.random() * characters.length)];
      return result;
    }
    var alph = makeid(8)
    return alph
  },
  generateOrder() {
    var result = '';
    var characters = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    var charactersLength = characters.length;
    for (var i = 0; i < 6; i++) {
      result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return "ORD-" + result;
  },
  sendMailtoClient: async (to, name, amount, ordstatus, createdDate, orderId, subject) => {
    if (ordstatus == "DELIVERED") {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>Your order has been Delivered. Based on your recent delivery experience, Hope you like shopping with us .
      </a>Oder Details :-
          oderId:-${orderId}
          BookingDate:-${createdDate}
          Total Recived Rs. ${amount} 
      </p> 
        <p>
            Thanks<br>
            Best Regards<br>
            Team Warriors Investments
        </p>
    </div>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.user'),
          "pass": config.get('nodemailer.pass')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: subject,
        html: html
      };
      return await transporter.sendMail(mailOptions)
    } else if (ordstatus == "DISPATCHED") {
      let html = `<div style="font-size:15px">
                <p>Hello ${name},</p>
                <p>Your order of orderId # ${orderId}  dated ${createdDate} has been dispatched .
                  We know you are excited to get your hands on them. you can track your order below. 
                </a>
                    Total payable Rs. ${amount} 
                </p>  
                  <p>
                      Thanks<br>
                      Best Regards<br>
                      Team Warriors Investments
                  </p>
              </div>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.user'),
          "pass": config.get('nodemailer.pass')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: subject,
        html: html
      };
      return await transporter.sendMail(mailOptions)
    } else {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>You have cancelled your orderId ${orderId} that you have booked on Date:- ${createdDate}.
        Thanks for using our services ,You will get your refund within 15 days . 
      </a>
          Total payable Rs. ${amount} 
      </p> 
        <p>
        Thanks<br>
        Best Regards<br>
        Team Warriors Investments
        </p>
    </div>`
      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.user'),
          "pass": config.get('nodemailer.pass')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: subject,
        html: html
      };
      return await transporter.sendMail(mailOptions)
    }


  },
  sendMailtoExpert: async (to, name, amount, ordstatus) => {
    if (ordstatus == "DELIVERED") {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>you have Delivery the order to user.
      </a>
          Total Recived Rs. ${amount} 
      </p> 
        <p>
            Thanks<br>
        </p>
    </div>`

      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.user'),
          "pass": config.get('nodemailer.pass')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: 'Reset Link',
        html: html
      };
      return await transporter.sendMail(mailOptions)
    } else {
      let html = `<div style="font-size:15px">
      <p>Hello ${name},</p>
      <p>you have pick a order for Delivery to user.
      </a>
          Total Recived Rs. ${amount} 
      </p> 
        <p>
            Thanks<br>
        </p>
    </div>`

      var transporter = nodemailer.createTransport({
        service: config.get('nodemailer.service'),
        auth: {
          "user": config.get('nodemailer.user'),
          "pass": config.get('nodemailer.pass')

        },

      });
      var mailOptions = {
        from: "<do_not_reply@gmail.com>",
        to: to,
        subject: 'Reset Link',
        html: html
      };
      return await transporter.sendMail(mailOptions)
    }
  },
  sendPushSms: async (number, body) => {
    console.log("=====>number", number, "====>body", body)
    let send = await sender.sendSms(String(body), config.get('AWS.smsSecret'), false, String(number))
    return send

  },
  sendMailforEdit: async (message, email, subject) => {
    let html = `<!DOCTYPE HTML PUBLIC "-//W3C//DTD XHTML 1.0 Transitional //EN" "http://www.w3.org/TR/xhtml1/DTD/xhtml1-transitional.dtd">
    <html xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
    <head>
    <!--[if gte mso 9]>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
    <![endif]-->
      <meta http-equiv="Content-Type" content="text/html; charset=UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <meta name="x-apple-disable-message-reformatting">
      <!--[if !mso]><!--><meta http-equiv="X-UA-Compatible" content="IE=edge"><!--<![endif]-->
      <title></title>
      
        <style type="text/css">
          table, td { color: #000000; } @media only screen and (min-width: 670px) {
      .u-row {
        width: 650px !important;
      }
      .u-row .u-col {
        vertical-align: top;
      }
    
      .u-row .u-col-100 {
        width: 650px !important;
      }
    
    }
    
    @media (max-width: 670px) {
      .u-row-container {
        max-width: 100% !important;
        padding-left: 0px !important;
        padding-right: 0px !important;
      }
      .u-row .u-col {
        min-width: 320px !important;
        max-width: 100% !important;
        display: block !important;
      }
      .u-row {
        width: calc(100% - 40px) !important;
      }
      .u-col {
        width: 100% !important;
      }
      .u-col > div {
        margin: 0 auto;
      }
    }
    body {
      margin: 0;
      padding: 0;
    }
    
    table,
    tr,
    td {
      vertical-align: top;
      border-collapse: collapse;
    }
    
    p {
      margin: 0;
    }
    
    .ie-container table,
    .mso-container table {
      table-layout: fixed;
    }
    
    * {
      line-height: inherit;
    }
    
    a[x-apple-data-detectors='true'] {
      color: inherit !important;
      text-decoration: none !important;
    }
    
    </style>
      
      
    
    <!--[if !mso]><!--><link href="https://fonts.googleapis.com/css?family=Montserrat:400,700&display=swap" rel="stylesheet" type="text/css"><!--<![endif]-->
    
    </head>
    
    <body class="clean-body u_body" style="margin: 0;padding: 0;-webkit-text-size-adjust: 100%;background-color: #ffffff;color: #000000">
      <!--[if IE]><div class="ie-container"><![endif]-->
      <!--[if mso]><div class="mso-container"><![endif]-->
      <table style="border-collapse: collapse;table-layout: fixed;border-spacing: 0;mso-table-lspace: 0pt;mso-table-rspace: 0pt;vertical-align: top;min-width: 320px;Margin: 0 auto;background-color: #ffffff;width:100%" cellpadding="0" cellspacing="0">
      <tbody>
      <tr style="vertical-align: top">
        <td style="word-break: break-word;border-collapse: collapse !important;vertical-align: top">
        <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td align="center" style="background-color: #ffffff;"><![endif]-->
        
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #dff1ff;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #dff1ff;"><![endif]-->
          
    <!--[if (mso)|(IE)]><td align="center" width="650" style="background-color: #ffffff;width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="background-color: #ffffff;width: 100% !important;">
      <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:13px 0px 15px;font-family:'Montserrat',sans-serif;" align="left">
            
    <table width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="padding-right: 0px;padding-left: 0px;" align="center">
          
          <img align="center" border="0" src="https://res.cloudinary.com/mobiloitte-testing1/image/upload/v1639768948/hsbw8pj4ffaxfetmfvut.jpg" alt="Image" title="Image" style="outline: none;text-decoration: none;-ms-interpolation-mode: bicubic;clear: both;display: inline-block !important;border: none;height: auto;float: none;width: 54%;max-width: 351px;" width="351"/>
          
        </td>
      </tr>
    </table>
    
          </td>
        </tr>
      </tbody>
    </table>
    
      <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    
    
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #f3fbfd;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #f3fbfd;"><![endif]-->
          
    <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
      <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:40px 10px 10px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #1b262c; line-height: 140%; text-align: center; word-wrap: break-word;">
        <p style="font-size: 14px; line-height: 140%;"><strong><span style="font-size: 24px; line-height: 33.6px;">${subject}</span></strong></p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:10px 50px 20px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #1b262c; line-height: 140%; text-align: left; word-wrap: break-word;">
        <p style="font-size: 14px; line-height: 140%;">${message}</p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    
      <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    
    
    
    <div class="u-row-container" style="padding: 0px;background-color: transparent">
      <div class="u-row" style="Margin: 0 auto;min-width: 320px;max-width: 650px;overflow-wrap: break-word;word-wrap: break-word;word-break: break-word;background-color: #151418;">
        <div style="border-collapse: collapse;display: table;width: 100%;background-color: transparent;">
          <!--[if (mso)|(IE)]><table width="100%" cellpadding="0" cellspacing="0" border="0"><tr><td style="padding: 0px;background-color: transparent;" align="center"><table cellpadding="0" cellspacing="0" border="0" style="width:650px;"><tr style="background-color: #151418;"><![endif]-->
          
    <!--[if (mso)|(IE)]><td align="center" width="650" style="width: 650px;padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;" valign="top"><![endif]-->
    <div class="u-col u-col-100" style="max-width: 320px;min-width: 650px;display: table-cell;vertical-align: top;">
      <div style="width: 100% !important;">
      <!--[if (!mso)&(!IE)]><!--><div style="padding: 0px;border-top: 0px solid transparent;border-left: 0px solid transparent;border-right: 0px solid transparent;border-bottom: 0px solid transparent;"><!--<![endif]-->
      
    <table style="font-family:'Montserrat',sans-serif;" role="presentation" cellpadding="0" cellspacing="0" width="100%" border="0">
      <tbody>
        <tr>
          <td style="overflow-wrap:break-word;word-break:break-word;padding:18px;font-family:'Montserrat',sans-serif;" align="left">
            
      <div style="color: #ffffff; line-height: 140%; text-align: center; word-wrap: break-word;">
        <p dir="rtl" style="font-size: 14px; line-height: 140%;"><span style="font-size: 14px; line-height: 19.6px;">Copyright @ 2022 Warriors Investments | All RIghts Reserved</span></p>
      </div>
    
          </td>
        </tr>
      </tbody>
    </table>
    
      <!--[if (!mso)&(!IE)]><!--></div><!--<![endif]-->
      </div>
    </div>
    <!--[if (mso)|(IE)]></td><![endif]-->
          <!--[if (mso)|(IE)]></tr></table></td></tr></table><![endif]-->
        </div>
      </div>
    </div>
    
    
        <!--[if (mso)|(IE)]></td></tr></table><![endif]-->
        </td>
      </tr>
      </tbody>
      </table>
      <!--[if mso]></div><![endif]-->
      <!--[if IE]></div><![endif]-->
    </body>
    
    </html>`
    var transporter = nodemailer.createTransport({
      service: config.get('nodemailer.service'),
      auth: {
        "user": config.get('nodemailer.user'),
        "pass": config.get('nodemailer.pass')

      },

    });
    var mailOptions = {
      from: "<do_not_reply@gmail.com>",
      to: email,
      subject: subject,
      html: html
    };
    return await transporter.sendMail(mailOptions)
  },
  sendSmsPromise: async (number, body) => {
    let send = await sender.sendSms(body, config.get('AWS.smsSecret'), false, number)
    return send

  },

}
