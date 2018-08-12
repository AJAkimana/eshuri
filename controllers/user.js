
/**
 * API keys and Passport configuration.
 */
const passport = require('passport'),
      async = require('async'),
      User =require('../models/User'),
      School =require('../models/School'),
      Notification= require('../models/Notification'),
      Department =require('../models/Department'),
      Token =require('../models/Token'),
      Util=require('../utils.js'),
      Classe=require('../models/Classe'),
      Mark = require('../models/MARKS'),
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
      // console.log(' New USer   '+JSON.stringify(user))
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
  // console.log('______________'+res.locals.csrftoken);
  req.assert('email', 'Email is not valid').isEmail();
  req.assert('password', 'Password cannot be blank').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  passport.authenticate('local.signin', (err, user, info)=>{
    if(err || !user) return res.status(400).send(info.msg);
    console.log("after");
    req.logIn(user, (err,newUser) => {
      if (err) return next(err);
      var hours = 3600000;
      var weeks = 7 * 24 * hours;    
      // Cookie expires after 1 week and 10 hours > REgister mornig expires night
      // first 9h du mat then expires the night
      // console.log(' New USer '+JSON.stringify(user))
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
    // console.log(' New logIn------ '+JSON.stringify(req.logIn))
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
      // console.log('OFFLINE USER '+JSON.stringify(req.session));
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
exports.createSA = (req, res, next)=>{
  var newUser = new User({
    name:'Akimana Jean dAmour',
    email: 'a.k.imanaja17@gmail.com',
    URN: 'aja-3016',
    password: '$2a$10$uhZLxu3V40X0IVGBjKrbzOIb4TsM8qAVcanWvnMHVAAaqgYVDweLq',
    phone_number:'0783543016',
    access_level:1,
    gender:1,
    isEnabled:true,
  });

  newUser.save(function(err){
    if(err) return res.send('Somethis is wrong'+err)
    res.send('working')
  })
}
exports.postSignUp = (req, res, next) => {
  if(req.isAuthenticated() ) return res.status(400).send('You are connected, first disconnect');// check if the guy is not already authenticated
  // In the case it is a derpartement
  
  req.assert('name', 'Please provide your full name').len(1,100).notEmpty();
  req.assert('email', 'The email you gave, is not valid').isEmail().len(1,100).notEmpty();
  req.assert('password', 'Choose a minimum length of 6 characters for the password').len(6,100);
  req.assert('password2', 'Passwords don\'t match').equals(req.body.password);
  req.assert('phone_number', 'Please a phone number is required').notEmpty();
  // req.assert('school_id', 'The school is invalid').isMongoId();
  req.assert('type', 'Choose what you are registering as (teacher ?, student?, parent? or guest)').isIn([1,2,3,4]);
  if (req.body.type!=4){
    req.assert('institution', 'Choose the type of the institution').isIn([1,2,3]);
  }
  req.assert('gender', 'Give us your gender').isIn([1,2]); 
  if(req.body.institution == 1){
    req.assert('option_id', 'Please choose an option').isMongoId();
    req.body.school_id =req.body.option_id; // On annule l autre au cas ou !!
  }
  else // in case a high school or primary
  {
    req.assert('school_id', 'Select your school').isMongoId();
    req.body.option_id =undefined; // on annule l autre au cas ou
  }
  if(req.body.type ==2){// if You are a student you must select the class
    req.assert('class_id', 'Please choose a class in which you belong').isMongoId();
  }
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // let s check if the school exists or not
  var accountType = req.body.type;
  // If account is being created by a gust
  var userURN;
  var thisYear = new Date().getFullYear();
  var ay = Number(thisYear)-2000;
  if(accountType==4){ 
    User.count((err,number)=>{
      if(err) return log_err(err,false,req,res);
      userURN = Util.generate_URN(number);
      User.findOne({URN:userURN}, (err, user_urn)=>{
        if(err) return log_err(err,false,req,res);
        else if(user_urn) userURN = Util.generate_URN(number);

        req.body.URN = userURN;
        passport.authenticate('local.signup', (err, user, info)=>{
          if(err) return log_err(err,false,req,res);
          else if(!user) return res.status(400).send(info.msg);
          var token = Util.uid(req.app.locals.tokenLength);
          var newToken = new Token({value:req.body.email+token});
          newToken.save((err)=>{
            if(err) return log_err(err,false,req,res);
            var emailSender = require("./email_sender");
            var infos={email:req.body.email,token:token};
            emailSender.sendEmailValidation(infos).then((info)=>{
              console.log(" MAIL OK SENT !!!")
            }).catch((err)=>{
              console.log(" MAIL Not SENT !!!")
            });
            res.end();
          })
        })(req,res, next);
      })
    })
  }
  else{
    var etablissement_id=req.body.institution == 1? String(req.body.option_id):String(req.body.school_id);
    // Check if the class has marks
    Mark.find({class_id:req.body.class_id, academic_year:ay},(err,marksExists)=>{
      if(err) return log_err(err,false,req,res);
      if(marksExists.length&&accountType==2){ 
        return res.status(400).send("Sorry, School is not allowing registration. Please contact your school administrator!");
      }
      School.findOne({_id:etablissement_id},(err,schoolExists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!schoolExists) return res.status(400).send(' Invalid data');
          // Generate an XCode
        // will generate a Unique registration number
        User.count((err,number)=>{
          if(err) return log_err(err,false,req,res);
          userURN = Util.generate_URN(number);
          User.findOne({URN:userURN}, (err, user_urn)=>{
            if(err) return log_err(err,false,req,res);
            else if(user_urn) userURN = Util.generate_URN(number);

            req.body.URN = userURN;
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
      })
    })
  }
};
exports.getViewUserPage=(req,res,next)=>{
  return res.render('dashboard/view_users',{
    title:'Users',
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    csrf_token:res.locals.csrftoken, // always set this buddy
  })
}
exports.userList_JSON=(req,res,next)=>{
  var async = require('async');
  var users = [], list=[];
  var teacher = req.app.locals.access_level.TEACHER,
      admin = req.app.locals.access_level.ADMIN,
      adminteacher = req.app.locals.access_level.ADMIN_TEACHER,
      hod = req.app.locals.access_level.SA_SCHOOL;
  User.find({access_level:{$gt:req.app.locals.access_level.SUPERADMIN}}).sort({name:1}).lean().exec((err, users)=>{
    if(err) return log_err(err,false,req,res);
    async.eachSeries(users, (thisUser, userCb)=>{
      Classe.findOne({_id:thisUser.class_id},(err, thisUserClass)=>{
        if(err) return userCb(err);
        if(thisUserClass) thisUser.classe_name=thisUserClass.name;
        else if(!thisUserClass&&(thisUser.access_level==teacher||thisUser.access_level==admin||thisUser.access_level==adminteacher||thisUser.access_level==hod)) thisUser.classe_name="No class";
        else thisUser.classe_name="Not defined";
        return userCb(null);
      })
    }, (err)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(users)
    })
  })
}
exports.deleteCmply=(req, res,next)=>{
  req.assert('user_id', 'Invalid data').isMongoId();
  req.assert('password', 'Enter your password').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({email:req.user.email},(err, userExists)=>{
    if(err) return log_err(err, false, req, res);
    else if(!userExists) return res.status(400).send("System dont know you");
    userExists.comparePassword(req.body.password, req.user.email, (err, isMatch)=>{
      if(err) return log_err(err, false, req, res);
      else if(!isMatch) return res.status(400).send("Password given is incorrect !");
      User.findOne({_id:req.body.user_id},(err, userDetails)=>{
        if(err) return log_err(err, false, req, res);
        else if(!userDetails) return res.status(400).send("Unkown user");
        else if(userDetails.email===req.user.email) return res.status(400).send("Change your password using platform seting");
        else if(userDetails.access_level<=req.user.access_level) return res.status(400).send("User password has not reset");
        userDetails.remove((err)=>{
          if(err) return log_err(err, false, req, res);
          return res.end();
        });
      })
    })
  })
}
exports.resetUserPwd=(req,res,next)=>{
  req.assert('user_id', 'Invalid data').isMongoId();
  req.assert('password', 'Enter your password').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({email:req.user.email},(err, userExists)=>{
    if(err) return log_err(err, false, req, res);
    else if(!userExists) return res.status(400).send("System dont know you");
    userExists.comparePassword(req.body.password, req.user.email, (err, isMatch)=>{
      if(err) return log_err(err, false, req, res);
      else if(!isMatch) return res.status(400).send("Password given is incorrect !");
      User.findOne({_id:req.body.user_id},(err, userDetails)=>{
        if(err) return log_err(err, false, req, res);
        else if(!userDetails) return res.status(400).send("Unkown user");
        else if(userDetails.email===req.user.email) return res.status(400).send("Change your password using platform seting");
        else if(userDetails.access_level<=req.user.access_level) return res.status(400).send("User password has not reset");
        new Notification({
          user_id:req.body.user_id,
          user_name:userDetails.name,
          content: "Your password has reset to "+req.app.locals.defaultPwd+". Please change it as long as you access the platform",
          school_id:userDetails.school_id,
          isAuto:false,            
        }).save((err)=>{
          if(err) console.log(" You have to log "+err)
        })
        userDetails.email = userDetails.email;
        userDetails.password = req.app.locals.defaultPwd;
        userDetails.save((err)=>{
          if(err) return log_err(err, false, req, res);
          return res.end();
        });
      })
    })
  })
}
exports.viewPageUserDetails=(req,res,next)=>{
  req.assert('user_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg});
  var listClasses=[],allclasses=[],classes=[];
  var student = req.app.locals.access_level.STUDENT,
      teacher = req.app.locals.access_level.TEACHER,
      admin_teacher = req.app.locals.access_level.ADMIN_TEACHER,
      hMaster = req.app.locals.access_level.SA_SCHOOL;
  var parametters={},userparams={};
  // if(req.user.access_level===req.app.locals.access_level.SUPERADMIN) userparams={_id:req.params.user_id};
  // else
  User.findOne({_id:req.params.user_id,},(err, userExists)=>{
    if(err) return res.render("./lost",{msg:"Invalid data"});
    if(!userExists) return res.render("./lost",{msg:"Unkown student"});
    School.findOne({_id:userExists.school_id},(err, school)=>{
      if(err) return res.render("./lost",{msg:"Invalid data"});
      if(!school) return res.render("./lost",{msg:"Unkown school"});
      async.series([(listClassesCb)=>{
        if(userExists.access_level==student){
          listClasses=userExists.prev_classes;
          listClasses.push(userExists.class_id);
          return listClassesCb();
        }
        else if(userExists.access_level==teacher||userExists.access_level==admin_teacher){
          Course.find().distinct("class_id",{teacher_list:req.params.user_id},(err, class_courses)=>{
            if (err) return listClassesCb(err);
            listClasses=class_courses;
            return listClassesCb(null);
          })
        }
      },(treatClassesCb)=>{
        async.each(listClasses, (thisClass, callBack)=>{
          Classe.findOne({_id:thisClass},(err, class_details)=>{
            if (err) return callBack(err);
            if(userExists.access_level==student) parametters={class_id:thisClass};
            else if(userExists.access_level==teacher) parametters={class_id:thisClass, teacher_list:req.params.user_id};
            Course.count(parametters, (err, number)=>{
              if (err) return callBack(err);
              classes.push({class_id:thisClass,name:class_details.name,academic_year:class_details.academic_year,number:number})
              callBack();
            })
          })
        },(err)=>{
          if(err) return treatClassesCb(err);
          return treatClassesCb(null);
        })
      }],(err)=>{
        if(err) return res.render("./lost",{msg:"Service not available"});
        return res.render('dashboard/one_student_view',{
          title:userExists.name.toUpperCase(),
          school_id: req.user.school_id,
          school_name: school.name,
          username:userExists.name,
          userid:userExists._id,
          lastSeen:userExists.lastSeen,
          classes:classes,
          term_name: school.term_name,
          pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,student_class:req.user.class_id,
          csrf_token:res.locals.csrftoken, // always set this buddy
        })
      })
    })
  })
}
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
exports.changeTeacherEmail = (req, res)=>{
  req.assert('id', 'Invalid data').isMongoId();
  req.assert('old_email', 'The old email is not valid').isEmail().len(1,100).notEmpty();
  req.assert('new_email', 'The new email is not valid').isEmail().len(1,100).notEmpty();
  req.assert('teacher_pass', 'Choose a minimum length of 6 characters for the password').len(6,20);
  req.assert('admin_pass', 'Choose a minimum length of 6 characters for the password').len(6,20);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.admin_pass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch)   return res.status(400).send("Your password is incorrect");
      User.findOne({_id:req.body.id},(err,userExists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!userExists) return res.status(400).send("User is unknown!");
        userExists.comparePassword(req.body.teacher_pass,req.body.old_email, (err, isMatch) => {
          if(err) return log_err(err,false,req,res);
          else if(!isMatch) return res.status(400).send("Password given by teacher is incorrect!");
          User.findOne({email:req.body.new_email},(err, found)=>{
            if(err) return log_err(err,false,req,res);
            else if(found) return res.status(500).send("Sorry! Email exists")
            new Notification({
              user_id:req.body.id,
              user_name:userExists.name,
              content: req.user.name.toUpperCase()+" has changed your email",
              school_id:req.user.school_id,
              isAuto:false,            
            }).save((err)=>{
              if(err) console.log(" You have to log "+err)
            })
            userExists.email = req.body.new_email;
            userExists.password = req.body.teacher_pass;
            userExists.save((err)=>{
              if(err) return res.status(500).send("Sorry! Service not available")
              return res.end();
            });
          })
        })
      })
    })
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
        User.find({email:req.body.email},(err, found)=>{
          if(err) return log_err(err,false,req,res);
          else if(found) return res.status(500).send("Sorry! Email exists")
          else{
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
            });
          }
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
      email_sender.send_password_reset_link(infos).then((info)=>{
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
    if(err) return log_err(err,true,req,res);
    // if token not exists or token expired _> invalida link
    else if(!token_exists) return res.status(400).send(err_msg);
    else if( (Date.now() - new Date(token_exists.created_at).getTime())/1000 > 3* 60 *60 )     
      return res.render("./lost",{
        msg:"Your link has expired, please try again",
        redirect_link:"/user.signin"
    }) 
    else {
      User.findOne({email:req.query.m},(err,userExists)=>{
        if(err) return log_err(err,true,req,res);
        else if(!userExists) return log_err(err,true,req,res);
        userExists.isValidated = true;
        if(userExists.access_level===req.app.locals.access_level.GUEST) userExists.isEnabled=true;
        userExists.save((err)=>{
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
