const User = require('../models/User'),
      School = require('../models/School'),
      Application = require('../models/Application'),
      log_err = require('./manage/errorLogger'),
      emailSender = require('./email_sender'),
      Token =require('../models/Token'),
      Notification = require('../models/Notification'),
      Util=require('../utils.js'),
      fileMaxSize = 5*1024*1024,
      multer = require('multer');
exports.displayApplicationForm = (req, res, next)=>{
  return res.render('application/application_form', {
    title: "New application",
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    user: req.user,
    csrf_token: res.locals.csrftoken
  });
}

exports.postIDFile = (req, res, next)=>{
  req.assert('app_id', 'Invalid data,...').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // console.log('Whole params:'+JSON.stringify(req.params))
  var img_extension,
    filePath=process.env.ID_PATH;
  Application.find({user_id:req.user._id, _id:req.params.app_id},(err, app_exist)=>{
    if(err) return log_err(err, false, req, res);
    else if(!app_exist) return res.status(400).send('No application found');
    var fileName=req.user._id+'_id';
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        img_extension="."+file.originalname.split('.').pop();
        cb(null, filePath)
      },
      filename: function (req, file, cb) {
      cb(null, fileName+img_extension);
      }
    });
    var upload = multer({ 
      storage:storage,
      limits:{fileSize:fileMaxSize},
      fileFilter: (req, file, cb)=>{
        // console.log(" File before saving"+JSON.stringify(file))
        if(file.mimetype !=="application/pdf") return cb("Sorry, only PDF are accepted")
        return cb(null, true);
      },
    })
    .any();
    upload(req, res,(uploadErr)=>{
      if(uploadErr) return res.render("./lost",{msg:uploadErr});
      // console.log('File---'+req.files);
      User.findOne({_id:req.user._id},(err, user_details)=>{
        if(err) return log_err(err, false, req, res);
        else if(!user_details) return res.status(400).send('Unknown user');
        user_details.documents.id_card=fileName+img_extension;
        user_details.save((err)=>{
          if(err)return log_err(err, false, req, res);
          return res.end();
        })
      })
    })
  })
}
exports.postTranscriptFile = (req, res, next)=>{
  req.assert('app_id', 'Invalid data,...').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // console.log('Whole params:'+JSON.stringify(req.params))
  var img_extension,
    filePath=process.env.TRANSCRIPT_PATH;
  Application.find({user_id:req.user._id, _id:req.params.app_id},(err, app_exist)=>{
    if(err) return log_err(err, false, req, res);
    else if(!app_exist) return res.status(400).send('No application found');
    var fileName=req.user._id+'_trans';
    var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        img_extension="."+file.originalname.split('.').pop();
        cb(null, filePath)
      },
      filename: function (req, file, cb) {
      cb(null, fileName+img_extension);
      }
    });
    var upload = multer({ 
      storage:storage,
      limits:{fileSize:fileMaxSize},
      fileFilter: (req, file, cb)=>{
        // console.log(" File before saving"+JSON.stringify(file))
        if(file.mimetype !=="application/pdf") return cb("Sorry, only PDF are accepted")
        return cb(null, true);
      },
    })
    .any();
    upload(req, res,(uploadErr)=>{
      if(uploadErr) return res.render("./lost",{msg:uploadErr});
      User.findOne({_id:req.user._id},(err, user_details)=>{
        if(err) return log_err(err, false, req, res);
        else if(!user_details) return res.status(400).send('Unknown user');
        user_details.documents.transcipt=fileName+img_extension;
        user_details.save((err, userInserted)=>{
          if(err)return log_err(err, false, req, res);
          // console.log('----'+JSON.stringify(userInserted))
          return res.end();
        })
      })
    })
  })
}
exports.newAppSubmission = (req, res, next)=>{
  req.assert('names', 'Please provide your full name').len(4,100).notEmpty();
  req.assert('school_id', 'Invalid school').isMongoId();
  req.assert('email', 'The email you gave, is not valid').isEmail().len(1,100).notEmpty();
  req.assert('gender', 'Give us your gender').isIn([1,2]);
  req.assert('phone', 'Provide the phone number').notEmpty();
  req.assert('maritus', 'Provide your maritus status').isIn(['S','M','W','D']);
  if(req.body.guardian2_names){
    req.assert('guardian1_names', 'Please provide full name of 1st guardian').len(4,100).notEmpty();
    req.assert('guardian2_names', 'Please provide full name of 2nd guardian').len(4,100).notEmpty();
  }
  req.assert('province', 'Select your province').notEmpty();
  req.assert('year_o_s', 'Select Year of study').notEmpty();
  req.assert('district', 'Select your district').notEmpty();
  req.assert('sector', 'Select your sector').notEmpty();
  if(req.body.program) req.assert('program', 'Choose the program').notEmpty();
  req.assert('faculties', 'Choose program to attend').notEmpty();
  req.assert('prev_school', 'Please enter your previous school').notEmpty();
  req.assert('prev_option', 'Please enter your previous option/combination').notEmpty();
  req.assert('grade', 'Provide your grade').isFloat().notEmpty();
  req.assert('finance', 'Select your mode of finance').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  let checkUser = {
    user_id:req.user._id,
    school_id:req.body.school_id,
  }
  User.findOne({_id:req.user._id},(err,thisUser)=>{
    if(err) return log_err(err,false,req,res);
    else if(!thisUser) return res.status(400).send("User is unknown!");
    Application.findOne({user_id:req.user._id,school_id:req.body.school_id,}, (err, isExists)=>{
      if(err) return log_err(err,false,req,res);
      else if(isExists) return res.status(400).send("You've applied on this school");
      thisUser.marital_status = req.body.maritus
      thisUser.address.province = req.body.province
      thisUser.address.district = req.body.district
      thisUser.address.sector = req.body.sector
      thisUser.guardian.name = req.body.guardian1_names
      thisUser.guardian.phone = req.body.guardian1_phone
      thisUser.guardian.email = req.body.guardian1_email
      thisUser.past_info.prev_school = req.body.prev_school
      thisUser.past_info.prev_combination = req.body.prev_option
      thisUser.past_info.grade = req.body.grade
      thisUser.finance_category = req.body.finance
      thisUser.save((err)=>{
        if(err) return log_err(err,false,req,res);
        let newApplication = new Application({
          school_id:req.body.school_id,
          user_id:req.user._id,
          status:'P',
          year_o_s:req.body.year_o_s,
          program:req.body.program,
          faculty:req.body.faculties,
        });
        newApplication.save((err, thisApplication)=>{
          if(err) return log_err(err,false,req,res);
          // console.log('The inserted application:'+JSON.stringify(thisApplication))
          return res.json(thisApplication._id);
        })
      })
    })
  })
  // console.log('___________Body___'+JSON.stringify(req.body));
}
exports.viewApplicationPage = (req, res, next)=>{
  var accLvl = req.user.access_level;
  var student=req.app.locals.access_level.STUDENT;
  var guest=req.app.locals.access_level.GUEST;
  var admin=req.app.locals.access_level.ADMIN;
  var adminteacher=req.app.locals.access_level.ADMIN_TEACHER;
  if(accLvl==student||accLvl==guest){
    return res.render('application/application_view',{
      title:"Applications",
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    });
  }
  if(accLvl>=admin||accLvl<=adminteacher){
    School.findOne({_id:req.user.school_id},(err, schoolDetails)=>{
      if(err) return log_err(err,false,req,res);
      if(!schoolDetails) return res.status(400).send("School is unknown!");
        return res.render('application/view_application',{
        title:"Applications",
        school_name:schoolDetails.name,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      });
    });
  }
}
exports.viewApplication = (req,res,next)=>{
  var async = require('async');
  var applications = [],
      response=[];
  var accLvl = req.user.access_level;
  var student=req.app.locals.access_level.STUDENT,
      admin=req.app.locals.access_level.ADMIN,
      adminteacher=req.app.locals.access_level.ADMIN_TEACHER,
      guest=req.app.locals.access_level.GUEST;
  if (accLvl==admin || accLvl==adminteacher){
    Application.find({},{__v:0}).lean().exec((err, applications)=>{
      if(err) return log_err(err,false,req,res);
      async.eachSeries(applications, (thisApplication, callBack)=>{
        User.findOne({_id:thisApplication.user_id},(err, user_details)=>{
          if (err) return callBack(err);
          thisApplication.user_name=user_details.name;
          thisApplication.gender=user_details.gender;
          thisApplication.grade=user_details.past_info.grade;
          thisApplication.combination=user_details.past_info.prev_combination;
          callBack();
        })
      },(err)=>{
        if(err) return log_err(err,false,req,res);
        // console.log('---------'+JSON.stringify(applications))
        return res.json(applications);
      })
    })
  }
  else if(accLvl==student||accLvl==guest){
    User.findOne({_id:req.user._id}, (err, thisUser)=>{
      if(err) return log_err(err,false,req,res);
      else if(!thisUser) return res.status(400).send("User is unknown!");
      Application.find({user_id:thisUser._id}).lean().exec((err, applications)=>{
        if(err) return log_err(err,false,req,res);
        applications=applications
        async.eachSeries(applications, (thisApplication, Cb)=>{
          School.findOne({_id:thisApplication.school_id},(err, schoolDetails)=>{
            if(err) return Cb(err);
            thisApplication.school_name=schoolDetails.name;
            // thisApplication.user_info=thisUser;
            Cb();
          })
        },(err)=>{
          if(err) return log_err(err,false,req,res);
          response.push({applications:applications, user_info:thisUser})
          // applications.push({user_info:thisUser})
          // console.log('Applications: '+JSON.stringify(response));
          return res.json(response[0])
        })
      })
    })
  }
  else return res.end();
}
exports.changeApplicationStatus=(req, res, next)=>{
  req.assert('app_id', 'Invalid data').isMongoId();
  req.assert('status', 'Invalid data').isIn(['A','P','F','R']);
  if(req.body.status==='F'){
    req.assert('fill_info', 'Specify the missing information').notEmpty();
  }
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  if(req.body.status==='F') req.body.comment = req.body.fill_info;
  else req.body.comment = '';
  Application.findOne({_id:req.body.app_id},(err, applicationExists)=>{
    if(err) return log_err(err,false,req,res);
    if(!applicationExists) return res.render("./lost",{msg:"Invalid data"})
    applicationExists.status=req.body.status; 
    applicationExists.comment=req.body.comment;
    applicationExists.save((err)=>{
      if(err) return log_err(err,false,req,res);

      User.findOne({_id:applicationExists.user_id},(err, user_details)=>{
        if(err) return log_err(err,false,req,res);
        if(!user_details) return res.status(400).send("User is unknown!");
        var token = Util.uid(req.app.locals.tokenLength);
        var newToken = new Token({value:user_details.email+token});
        newToken.save((err)=>{
          if(err) return log_err(err,false,req,res);
          var infos={
            email:user_details.email,
            token:token,
            status:req.body.status,
            username:user_details.name,
            comment:req.body.comment,
            school_name:req.body.school_name,
          };
          emailSender.sendApplicationEmailStatus(infos).then((info)=>{
            console.log(" MAIL OK SENT !!!")
            // var message;
            // switch(req.body.status){
            //   case 'P': message='Your registration on '+infos.school_name.toUpperCase()+' is pended';break;
            //   case 'A': message='You are ADMITTED on '+infos.school_name.toUpperCase()+'. Visit https://eshuri.rw/ to continue registration';break;
            //   case 'F': message='Something is missing in your application on '+infos.school_name.toUpperCase()+': <b>'+infos.comment+'</b>';break;
            //   case 'R': message='Your registration on '+infos.school_name.toUpperCase()+' is <b>Rejected</b>';break;
            //   default: break;
            // }
            // new Notification({
            //   user_id:req.user._id,
            //   user_name:req.user.name,
            //   content:message,
            //   dest_id:user_details._id,
            //   isAuto:false,
            // }).save((err)=>{
            //   if(err) return log_err(err,false,req,res);
            // })
          }).catch((err)=>{
            console.log(" MAIL Not SENT !!!")
          });
          return res.end();
        })
      })
    })
  })
}
exports.getOneApplication = (req, res, next)=>{
  req.assert('app_id', 'Invalid data').isMongoId();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Application.findOne({_id:req.params.app_id}).lean().exec((err, applications)=>{
    if(err) return log_err(err,false,req,res);
    if(!applications) return res.status(400).send('Unknown application');
    User.findOne({_id:applications.user_id},{_id:0,password:0,URN:0,isValidated:0,isEnabled:0,course_retake:0,hasPaid:0,lastSeen:0,access_level:0,documents:0},(err, user_details)=>{
      if(err) return log_err(err,false,req,res);
      if(!user_details) return res.status(400).send('Unknown user');
      applications.user=user_details;
      // console.log('User details:'+JSON.stringify(applications))
      return res.json(applications)
    })
  })
}