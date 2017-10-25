var FailedMail =require('../models/FailedMail');
var nodemailer = require('nodemailer');
var sgTransport = require('nodemailer-sendgrid-transport');

var options = {
  auth: {
    api_key: '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'
  }
}
var client = nodemailer.createTransport(sgTransport(options));

exports.send_password_reset_link = function(infos){
   return new Promise(function(resolve,reject)
   {
      // Prepare the link
      var link =process.env.appLink+"/password.reset?m="+infos.email+"&t="+infos.token
      var email = {
        from: process.env.APP_EMAIL,
        to:  infos.email,
        subject: "Password reset link",
        text: "<html>Please reset your password by clicking  <strong><a href=\""+link+"\"> link</a></strong></html>",
        html: "<html>Please reset your password by clicking  <strong><a href=\""+link+"\"> link</a></strong></html>"
      };

      client.sendMail(email, function(err, info){
          if (err ){
            new FailedMail({
               content:email.html,
               error:err,
            }).save((err)=>{
               if(err) reject(err);//     .catch()
               resolve(null); //          .then()
            })
          }
          resolve(null);  
      });
   })
}
exports.sendEmailValidation = function(infos){
   return new Promise(function(resolve,reject)
   {
      //Prepare the link
      var link =process.env.appLink+"/email.validation?m="+infos.email+"&t="+infos.token
      var email = {
        from: process.env.APP_EMAIL,
        to:  infos.email,
        subject: "Validate your acount",
        text: "<html>Please validate your account by clicking <strong><a href=\""+link+"\"> link</a></strong></html>",
        html: "<html>Please validate your account by clicking <strong><a href=\""+link+"\"> link</a></strong></html>"
      };

      client.sendMail(email, function(err, info){
          if (err ){
            new FailedMail({
               content:email.html,
               error:err,
            }).save((err)=>{
               if(err) reject(err);//     .catch()
               resolve(null); //          .then()
            })
          }
          resolve(null);  
      });
   })
}
/*
 This function is used to resend failed messages stored in the message DB
*/
exports.check_failed_mails = function(){
   // Ici on fera la requete dans la DB
}