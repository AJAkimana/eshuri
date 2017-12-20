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
exports.sendApplicationEmailStatus=(infos)=>{
  var status = '';
  switch(infos.status){
    case 'P': status='Your registration on '+infos.school_name.toUpperCase()+' is pended';break;
    case 'A': status='You are <b>ADMITTED</b> on '+infos.school_name.toUpperCase()+'. Visit https://eshuri.rw/ to continue registration';break;
    case 'F': status='Something is missing in your application on '+infos.school_name.toUpperCase()+': <hr><b>'+infos.comment+'</b><hr>';break;
    case 'R': status='Your registration on '+infos.school_name.toUpperCase()+' is <b>Rejected</b>';break;
    default: break;
  }
  let promise = new Promise((resolve, reject)=>{
    var email ={
      from: process.env.APP_EMAIL,
      to: infos.email,
      subject: 'eShuri application status',
      html:'<html> Hello <b>'+infos.username+'</b><br>'+status+
      '<hr>'+
      '<h3>eShuri platform</h3>'+
      '<p>eShuri digital contents can be used to motivate students, improve conceptual understanding and retention of key topics'+ 
          ' eShuri carries innovative features that will help high-schools and universities in their daily activities by offering </p>'+
      '</html>',
    };
    client.sendMail(email, (err, info)=>{
      if(err){
        new FailedMail({
          content: email.html,
          error:err,
        }).save((err)=>{
          if(err) reject(err);
          resolve(null);
        })
      }
      resolve(null);
    })
  });
  return promise;
}
/*
 This function is used to resend failed messages stored in the message DB
*/
exports.check_failed_mails = function(){
   // Ici on fera la requete dans la DB
}