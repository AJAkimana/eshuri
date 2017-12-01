
/**
 * API keys and Passport configuration.
 */
const passport = require('passport'),
      User =require('../models/User'),
      School =require('../models/School'),
      Notification= require('../models/Notification'),
      Department =require('../models/Department'),
      Token =require('../models/Token'),
      Util=require('../utils.js'),
      log_err=require('./manage/errorLogger');

exports.getPageSignIn = (req, res) => {
  if(req.isAuthenticated()) return res.redirect('/');
  res.render('user/signin',{
    title: 'Sign in to our platform',
    pic_id:'no_profile',
    csrf_token:res.locals.csrftoken
  });
};
exports.googleAuth = (req, res, next)=>{
  passport.authenticate('google', {
    scope:['profile', 'email']
  });
}
exports.googleCallback = (req, res, next)=>{
  passport.authenticate('google',{
    successRedirect:'/',
    failureRedirect:'/user.signin'
  }, (err, user, info)=>{
    if(err || !user) return res.status(400).send(info.msg);
    req.logIn(user, (err,newUser) => {
      if (err) return next(err);
      var hours = 3600000;
      var weeks = 7 * 24 * hours;    
      // Cookie expires after 1 week and 10 hours > REgister mornig expires night
      // first 9h du mat then expires the night
      console.log(' New USer   '+JSON.stringify(user))
      req.session.cookie.maxAge = 1 * weeks + 10*hours;
      var link =req.user.access_level==1 ? "/dashboard":"/home";
      if(req.user.access_level ==req.app.locals.access_level.HOD){
        School.find({department_id:req.user.department_id},(err,schools_managed)=>{
          if(err) return log_err(err,false,req,res);
          else if(!schools_managed) return res.status(400).send("Sorry, you do not have a school yet !");
          else if(!Array.isArray(schools_managed) || schools_managed.length==0)
            return res.status(400).send("Sorry, you do not have a school yet !");
          req.session.currentOption=schools_managed[0]._id;
          req.session.save();  
          return res.redirect(link);         
        })
      }
      else return res.redirect(link);     
    });
    console.log(' New USer '+JSON.stringify(req.session))
  })(req, res, next);
}
exports.fbCallback = (req, res, next)=>{
  passport.authenticate('facebook',{
    successRedirect:'/',
    failureRedirect:'/user.signin'
  }, (err, user, info)=>{
    if(err || !user) return res.status(400).send(info.msg);
    req.logIn(user, (err,newUser) => {
      if (err) return next(err);
      var hours = 3600000;
      var weeks = 7 * 24 * hours;    
      // Cookie expires after 1 week and 10 hours > REgister mornig expires night
      // first 9h du mat then expires the night
      console.log(' New USer   '+JSON.stringify(user))
      req.session.cookie.maxAge = 1 * weeks + 10*hours;
      var link =req.user.access_level==1 ? "/dashboard":"/home";
      if(req.user.access_level ==req.app.locals.access_level.HOD){
        School.find({department_id:req.user.department_id},(err,schools_managed)=>{
          if(err) return log_err(err,false,req,res);
          else if(!schools_managed) return res.status(400).send("Sorry, you do not have a school yet !");
          else if(!Array.isArray(schools_managed) || schools_managed.length==0)
            return res.status(400).send("Sorry, you do not have a school yet !");
          req.session.currentOption=schools_managed[0]._id;
          req.session.save();  
          return res.redirect(link);         
        })
      }
      else return res.redirect(link);     
    });
    console.log(' New USer '+JSON.stringify(req.session))
  })(req, res, next);
}
exports.postSignIn = (req, res, next) => {
  console.log('______________'+res.locals.csrftoken);
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  passport.authenticate('local.signin', (err, user, info)=>{
    if(err || !user) return res.status(400).send(info.msg);
    req.logIn(user, (err,newUser) => {
      if (err) return next(err);
      var hours = 3600000;
      var weeks = 7 * 24 * hours;    
      // Cookie expires after 1 week and 10 hours > REgister mornig expires night
      // first 9h du mat then expires the night
      console.log(' New USer '+JSON.stringify(newUser))
      req.session.cookie.maxAge = 1 * weeks + 10*hours;
      var link =req.user.access_level==1 ? "/dashboard":"/home";
      if(req.user.access_level ==req.app.locals.access_level.HOD){
        School.find({department_id:req.user.department_id},(err,schools_managed)=>{
          if(err) return log_err(err,false,req,res);
          else if(!schools_managed) return res.status(400).send("Sorry, you do not have a school yet !");
          else if(!Array.isArray(schools_managed) || schools_managed.length==0)
            return res.status(400).send("Sorry, you do not have a school yet !");
          req.session.currentOption=schools_managed[0]._id;
          req.session.save();  
          return res.send(link);         
        })
      }
      else return res.send(link);     
    });
    console.log(' New USer '+JSON.stringify(req.session))
  })(req, res, next);
};
exports.postOfflineSignIn = (req, res, next) => {
  // console.log('HE POSTED BODY '+JSON.stringify(req.body));
  // console.log('HE POSTED HEADERS '+JSON.stringify(req.headers));
  // console.log('HE POSTED PARAMS'+JSON.stringify(req.params));
  // console.log('HE POSTED QUERY'+JSON.stringify(req.query));

  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  
  const errors = req.validationErrors();
  // console.log('Yienze '+errors[0].msg);
  if (errors) return res.status(400).send(errors[0].msg);


  passport.authenticate('local.signin', (err, user, info)=>{
    if(err || !user) return res.status(400).send(info.msg);
    req.logIn(user, (err,newUser) => {
      if (err) return next(err);
      var hours = 3600000;
      var weeks = 7 * 24 * hours;    
      // Cookie expires after 1 week and 10 hours > REgister mornig expires night
      // first 9h du mat then expires the night
      console.log('OFFLINE USER '+JSON.stringify(req.session));
      return ;
      req.session.cookie.maxAge = 1 * weeks + 10*hours;
      var link =req.user.access_level==1 ? "/dashboard":"/home";
      if(req.user.access_level ==req.app.locals.access_level.HOD){
        School.find({department_id:req.user.department_id},(err,schools_managed)=>{
          if(err) return log_err(err,false,req,res);
          else if(!schools_managed) return res.status(400).send("Sorry, you do not have a school yet !");
          else if(!Array.isArray(schools_managed) || schools_managed.length==0)
            return res.status(400).send("Sorry, you do not have a school yet !");
          req.session.currentOption=schools_managed[0]._id;
          req.session.save();  
          return res.send(link);         
        })
      }
      else return res.send(link);     
    });
  })(req, res, next);
};

exports.getPageSignUp = (req, res) => {
  if(req.isAuthenticated() ) return res.redirect('/');// check if the guy is not already authenticated
  res.render('user/signup',{
    title: 'Sign up',
    csrf_token:res.locals.csrftoken
  });
};

exports.postSignUp = (req, res, next) => {
  if(req.isAuthenticated() ) return res.status(400).send('You are connected, first disconnect');// check if the guy is not already authenticated
  // In the case it is a derpartement
  // if(req.body.institution == 1){
  //   req.assert('option_id', 'Please choose an option').isMongoId();
  //   req.body.school_id =req.body.option_id; // On annule l autre au cas ou !!
  // }
  // else // in case a high school or primary
  // {
  //   req.assert('school_id', 'Select your school').isMongoId();
  //   req.body.option_id =undefined; // on annule l autre au cas ou
  // }
  // if(req.body.type ==2){// if You are a student you must select the class
  //   req.assert('class_id', 'Please choose a class in which you belong').isMongoId();
  // }
  
  req.assert('name', 'Please provide your full name').len(1,100).notEmpty();
  req.assert('email', 'The email you gave, is not valid').isEmail().len(1,100).notEmpty();
  req.assert('password', 'Choose a minimum length of 6 characters for the password').len(6,100);
  req.assert('password2', 'Passwords don\'t match').equals(req.body.password);
  req.assert('phone_number', 'Please a phone number is required').notEmpty();
  // req.assert('school_id', 'The school is invalid').isMongoId();
  req.assert('type', 'Choose what you are registering as (teacher ?, student?)').isIn([1,2,3]);
  req.assert('institution', 'Choose the type of the institution').isIn([1,2,3]);
  req.assert('gender', 'Give us your gender').isIn([1,2]); 
  
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // let s check if the school exists or not
  var etablissement_id=req.body.institution == 1? String(req.body.option_id):String(req.body.school_id);

  School.findOne({_id:etablissement_id},(err,schoolExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!schoolExists) return res.status(400).send(' Invalid data');
      // Generate an XCode
    // will generate a Unique registration number
    User.count((err,number)=>{
      if(err) return log_err(err,false,req,res);
      req.body.URN =Util.generate_URN(number);

      passport.authenticate('local.signup', (err, user, info)=>{
        if(err) return log_err(err,false,req,res);
        else if(!user) return res.status(400).send(info.msg);
        var token = Util.uid(req.app.locals.tokenLength);
        var newToken = new Token({
          value:req.body.email+token,
        })
        newToken.save((err)=>{
          if(err) return log_err(err,false,req,res);
          // Now i will send the mail
          var email_sender = require("./email_sender"); // the email file controller
          var infos ={
            email: req.body.email, // but other day its req.body.email
            token: token,
           };
           // send the mail
          email_sender
          .sendEmailValidation(infos)
          .then((info)=>{
            console.log(" MAIL OK SENT !!!")
          })
          .catch((error)=>{
            console.log(" MAIL NOT SENT !!!");
          })
        return res.end();
      })
      })(req, res, next);
    })  
  })
};
exports.logout = (req, res) => {
  req.session.destroy()
  req.logout();
  res.redirect('/user.signin');
};
exports.getPageUserSettings = (req,res)=>{
    res.render('user/settings', {
    title: 'Settings',
    user_id:req.user._id,
    username:req.user.name,
    email:req.user.email,
    URN: req.user.URN,
    phone:req.user.phone,
    access_level:req.user.access_level,
    pic_id:req.user._id,
    pic_name:req.user.name.replace('\'',"\\'"),
    access_lvl:req.user.access_level,
    csrf_token:res.locals.csrftoken
  });
}
exports.renewPassword = (req,res)=>{
  req.assert('oldPassword', 'Old password must be given !').notEmpty();
  req.assert('password', 'Choose a minimum length of 6 characters for the password').len(6,20);
  req.assert('password2', 'Passwords don\'t match').equals(req.body.password);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // console.log(" ==="+JSON.stringify(req.body))

  User.findOne({_id:req.user._id},(err,userExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!userExists){// If the pass is not correct 
        return res.status(400).send("User is unknown!");
    }
    else{
       userExists.comparePassword(req.body.oldPassword,req.user.email, (err, isMatch) => {
        if(err) return log_err(err,false,req,res);
        else if(!isMatch){// If the pass is not correct 
          return res.status(400).send("Password given is incorrect !");
        }
        new Notification({
          user_id:req.user._id,
          user_name:req.user.name,
          content: "Your password has been changed !",
          school_id:req.user.school_id,
          isAuto:false,            
        }).save((err)=>{
          if(err) console.log(" You have to log "+err)
        })
        // Now we must change the new pass
        userExists.password = req.body.password;
        userExists.save((err)=>{
          req.session.destroy();
          req.logout();
          return res.end();
        })
      });
     }
  })
}
exports.changeEmail = (req,res)=>{
  req.assert('oldEmail', 'The old password is not valid').isEmail().len(1,100).notEmpty();
  req.assert('email', 'The new email is not valid').isEmail().len(1,100).notEmpty();
  req.assert('password', 'Choose a minimum length of 6 characters for the password').len(6,20);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // console.log(" ==="+JSON.stringify(req.body))

  User.findOne({_id:req.user._id},(err,userExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!userExists){// If the pass is not correct 
        return res.status(400).send("User is unknown!");
    }
    else{
       userExists.comparePassword(req.body.password,req.body.oldEmail, (err, isMatch) => {
        if(err) return log_err(err,false,req,res);
        else if(!isMatch){// If the pass is not correct 
          return res.status(400).send("Old email or password given is incorrect !");
        }
        new Notification({
          user_id:req.user._id,
          user_name:req.user.name,
          content: "Your email has been changed",
          school_id:req.user.school_id,
          isAuto:false,            
        }).save((err)=>{
          if(err) console.log(" You have to log "+err)
        })
        // Now we must change the new pass
        userExists.email = req.body.email;
        userExists.password = req.body.password;
        userExists.save((err)=>{
          if(err) return res.status(500).send("Sorry! Service not available")
          req.session.destroy();
          req.logout();
          return res.end();
        })
      });
     }
  })
}
exports.postForgotPassword = (req,res,next)=>{
  req.assert('email_recover', 'Email address must be given ').isEmail().len(1,100);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  console.log(" I am testing "+req.body.email_recover)
  User.findOne({email:req.body.email_recover},(err,email_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!email_exists) return res.status(400).send("Sorry this email is not recognized");

    // ON cree un token de longueur X 
    var token = Util.uid(req.app.locals.tokenLength);
    var newToken = new Token({
      value:req.body.email_recover+token,
    })
    newToken.save((err)=>{
      if(err) return log_err(err,false,req,res);
      // Now i will send the mail
      var email_sender = require("./email_sender"); // the email file controller
      var infos ={
        email: req.body.email_recover, // but other day its req.body.email
        token: token,
       };
       // send the mail
      email_sender
      .send_password_reset_link(infos)
      .then((info)=>{
        console.log(" MAIL OK SENT !!!")
      })
      .catch((error)=>{
        console.log(" MAIL NOT SENT !!!"+err);
      })
      return res.end();
    })
  })
}
exports.postResendLink = (req,res,next)=>{
  req.assert('email_recover', 'Email address must be given ').isEmail().len(1,100);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({email:req.body.email_recover},(err,email_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!email_exists) return res.status(400).send("Sorry this email is not recognized");
    // ON cree un token de longueur X 
    var token = Util.uid(req.app.locals.tokenLength);
    var newToken = new Token({
      value:req.body.email_recover+token,
    });
    newToken.save((err)=>{
      if(err) return log_err(err,false,req,res);
      // Now i will send the mail
      var email_sender = require("./email_sender"); // the email file controller
      var infos ={
        email: req.body.email_recover, // but other day its req.body.email
        token: token,
       };
       // send the mail
      email_sender
      .sendEmailValidation(infos)
      .then((info)=>{
        console.log(" MAIL OK SENT !!!")
      })
      .catch((error)=>{
        console.log(" MAIL NOT SENT !!!"+err);
      })
      return res.end();
    })
  })
}

exports.getResetPasswordPage = (req,res,next)=>{
  var err_msg=" Invalid link";
  req.assert('m', err_msg).isEmail().len(1,100); // mail
  req.assert('t', err_msg).notEmpty(); // token
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // On verifie si ce token est encore valide
  Token.findOne({value:req.query.m+req.query.t},(err,token_exists)=>{
    if(err) return log_err(err,false,req,res);
    // if token not exists or token expired _> invalida link
    else if(!token_exists ) return res.status(400).send(err_msg);
    else if( (Date.now() - new Date(token_exists.created_at).getTime())/1000 > 3* 60 *60 )      
      return res.status(400).send("Your link has expired ");      
    else {
      return res.render('user/reset_password',{
        title: 'Set up a new Password',
        reset_token: req.query.t,
        reset_mail: req.query.m,
        // pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken
      });
    }
  })
}
exports.getValidateYourAccount = (req,res,next)=>{
  var err_msg=" Invalid link";
  req.assert('m', err_msg).isEmail().len(1,100); // mail
  req.assert('t', err_msg).notEmpty(); // token
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // On verifie si ce token est encore valide
  Token.findOne({value:req.query.m+req.query.t},(err,token_exists)=>{
    if(err)
      return log_err(err,true,req,res);
    // if token not exists or token expired _> invalida link
    else if(!token_exists) return res.status(400).send(err_msg);
    else if( (Date.now() - new Date(token_exists.created_at).getTime())/1000 > 3* 60 *60 )     
      return res.render("./lost",{
        msg:"Your link has expired, please try again",
        redirect_link:"/user.signin"
    }) 
    else {
      User.findOneAndUpdate({email:req.query.m},{$set:{isValidated:true}},(err,userExists)=>{
         if(err) return log_err(err,true,req,res);
          return res.render("./lost",{
            msg:"Congratulations, your account has been validated",
            redirect_link:"/user.signin",
            mood:"success",
          });
          new Notification({
            user_id:req.user._id,
            user_name:req.user.name,
            content: "Congratulations, your account is now validated",
            school_id:req.user.school_id,
            isAuto:false,            
          }).save((err)=>{
            if(err) console.log(" You have to log "+err)
          })
          token_exists.remove((err)=>{
            if(err) console.log("Service not available")
          })
      })          
    }

  })
}

exports.postResetPassword = (req,res,next)=>{
  req.assert('new_password', 'Choose a minimum length of 6 characters for the password').len(6,20);
  req.assert('new_password2', 'Passwords don\'t match').equals(req.body.new_password);
  req.assert('reset_token', 'Invalid data').notEmpty(); // token
  req.assert('reset_mail', 'Invalid data ').isEmail().len(1,100); // mail
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // Verify Mail
  User.findOne({email:req.body.reset_mail},(err,userExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!userExists) return res.status(400).send("Invalid data");
    // Verify TOKEN existence
    Token.findOne({value:req.body.reset_mail+req.body.reset_token},(err,tokenExists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!tokenExists) return res.status(400).send("Invalid data");
      // Verify TOKEN validity
      else if( (Date.now() - new Date(tokenExists.created_at).getTime())/1000 > 3* 60 *60 )      
        return res.status(400).send("Invalid data");
        // remove token
      tokenExists.remove((err)=>{
        if(err) return log_err(err,false,req,res);
        // UPDATE PASSWORD
        userExists.password = req.body.new_password;
        userExists.save((err)=>{
          if(err) return log_err(err,false,req,res);
          req.session.destroy()
          req.logout();
          return res.end();
        }) 
      })
      
    })    
  })
}
exports.get_IDUser = (req,res,next)=>{
  return res.json(req.user._id)
}
exports.changeProfile = (req,res,next)=>{
  const multer = require('multer'); 
  const MB = 1024*1024;
  const imgMaxSize =1*MB;
  var img_extension;
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      img_extension="."+file.originalname.split('.').pop();
      cb(null, process.env.PROFILE_PIC_PATH)
    },
    filename: function (req, file, cb) {
    cb(null, req.user._id+img_extension);
    }
  });
  var upload = multer({ 
    storage:storage,
    limits:{fileSize:imgMaxSize},
    fileFilter: (req, file, cb)=>{
      console.log(" File before saving"+JSON.stringify(file))
      if(!file.mimetype.startsWith("image/")) return cb("Sorry, only images are accepted")
      return cb(null, true);
    },
  })
  .single('profile_pic'); // the name of the file to be uploaded
  upload(req,res,(uploadErr)=>{
    if(uploadErr) return res.render("./lost",{msg:uploadErr});
    User.findOne({_id:req.user._id},(err,userExists)=>{
      if(err) return log_err(err,true,req,res);
      else if(!userExists) return res.render("./lost",{msg:"Invalid data"})
      var oldPic =userExists.profile_pic;
      
      userExists.profile_pic =req.user._id+img_extension;
      userExists.save((err)=>{
        if(err) return log_err(err,true,req,res);
        else if((oldPic != userExists.profile_pic)&& oldPic){
          var fileToDelete=process.env.PROFILE_PIC_PATH+"/"+userExists.profile_pic;
          require("fs").unlink(fileToDelete,(err)=>{
              if(err) console.log("===>>DELETION ERROR " + err);
          })
        }
        return res.redirect("back");
      })
    });
  })  
};
exports.getProfileUser = (req,res,next)=>{
  req.assert('user_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  var picture_location=process.env.PROFILE_PIC_PATH;
  if(errors) return res.sendFile(picture_location+"/default.png");
  
  var img_path;
  User.findOne({_id:req.params.user_id},(err,userExists)=>{
    // console.log(" i foud user ="+JSON.stringify(userExists))
    if(err){
      console.log("Error picture "+err);
      return res.sendFile(picture_location+"/default.png");
    }
    if(userExists)
      img_path =userExists.profile_pic;
    else  img_path ="default.png";
    // Send the file    
    
    var file_location=picture_location+"/"+img_path;
    var fs=require("fs");
    // console.log(" checkin for===>>>> "+file_location)
    fs.access(file_location, fs.constants.F_OK | fs.constants.R_O,(err)=>{
      if(err) {
        file_location=picture_location+"/default.png";
      }
      // console.log("I am sending "+file_location)
      return res.sendFile(file_location);  
    });   
  })
}

exports.enableUser =(req,res,next)=>{
  req.assert('user_id', 'Invalid data').isMongoId();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // Verify Mail
  User.findOne({_id:req.params.user_id},(err,userExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!userExists) return res.status(400).send("Invalid data");
    // To disable you must be a ADMIN or higher, and you will not disable a superior to you or yourself
    else if(req.user.access_level <= req.app.locals.access_level.ADMIN && 
      (userExists.access_level <= req.user.access_level.TEACHER|| userExists._id ==String(req.user._id)))
       return res.status(400).send("You are not permitted to do so");
    userExists.isEnabled =!userExists.isEnabled;
    userExists.save((err)=>{
      if(err) return log_err(err,false,req,res);
      return res.end();
    })
  })
}
