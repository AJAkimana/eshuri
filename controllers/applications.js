const multer = require('multer');
const User = require('../models/User'),
      School = require('../models/School'),
      Application = require('../models/Application'),
      log_err = require('./manage/errorLogger'),
      emailSender = require('./email_sender'),
      Token =require('../models/Token'),
      Util=require('../utils.js');

exports.getApplicationPage = (req, res, next) => {
  var now = Date.now();
  req.flash('applicationKindConfirm', 'You are applying as a new user. For existing users click here');
  return res.render('application/new_application', {
    title: "New application",
    last_change: now,
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    csrf_token: res.locals.csrftoken
  });
};
exports.displayApplicationForm = (req, res, next)=>{
  return res.render('application/application_form', {
    title: "New application",
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    user: req.user,
    csrf_token: res.locals.csrftoken
  });
}

exports.displayApplication = (req, res, next) => {
  var now = Date.now();
  console.log(req.user)
  Application.find({
    applicant_id: req.user._id,
  }, (err, application_exists) => {
    if (err) {
      console.log("===========Error===========");
      console.log(err);
      return log_err(err, false, req, res);
    } else {
      console.log("===========Exists===========");
      console.log(application_exists);

      var numberOfApplications = application_exists.length

      console.log(application_exists)
      return res.render('applications/view_application', {
        title: "eShuri Applications",
        last_change: now,
        user: req.user,
        applications: application_exists,
        access_lvl: req.user.access_level,
        access: req.user.access_level,
        csrf_token: res.locals.csrftoken
          //school: school
      })
    }
  });
};

exports.newUserApplication = (req, res, next) => {
  var now = Date.now();
  console.log(req.body);
  School.findOne({
    _id: req.body.selected_school_id
  }, (err, selectedSchool) => {
    if (err)
      return log_err(err, false, req, res);
    else if (!selectedSchool)
      return res.status(400).json("Invalid input");
    req.flash('startingApplicationAt', 'You are starting a new application at ' + selectedSchool.name);
    return res.render('applications/new_application', {
      title: "eShuri New Application",
      last_change: now,
      user: req.user,
      access_lvl: req.user.access_level,
      school_id: req.user.school_id,
      school: selectedSchool,
      access: req.user.access_level,
      csrf_token: res.locals.csrftoken
    });
  });
};

exports.createApplication = (req, res, next) => {
  var now = Date.now();
  return res.render('applications/new_application', {
    title: "eShuri New Application",
    last_change: now,
    user: req.user,
    access_lvl: req.user.access_level,
    school_id: req.user.school_id,
    access: req.user.access_level,
    csrf_token: res.locals.csrftoken
  })
};

exports.newApplication = (req, res, next) => {
  /*TODO: Check whether next can be applied for following process*/
  Application.findOne({
    applicant_id: req.user._id,
    school_id: req.user.school_id,
    year: req.body.year,
  }, (err, application_exists) => {
    if (err) {
      console.log(err)
      return log_err(err, false, req, res);
    } else if (application_exists) {
      return res.status(400).json({
        status: 'exist',
        message: "This application is already sent, are you sure you want to send another one"
      });
    }
    req.body.applicant_id = req.user._id
    req.body.user_school_id = req.user.school_id
    req.body.status = "pending"
    let newApplication = new Application(req.body);
    let saveApplication = newApplication.save(function(err) {
      if (err)
        return res.status(500).send(err['message'].split(":").pop());
      console.log('Application saved')
    });
    return res.status(200).send(newApplication)
  });
};
exports.postAttachedFiles = (req, res, next)=>{
  console.log('___________files___'+JSON.stringify(req.files.file));
  var file_storage = process.env.DIPLOMA_PATH;
  var storage = multer.diskStorage({
      destination: function (req, file, cb) {
        console.log('Saving '+file_storage+"<br/>  with path ="+req.path)
        console.log('---'+file_storage)
      cb(null, file_storage)
      },
      filename: function (req, file, cb) {
      cb(null, Date.now()+"."+file.originalname.split('.').pop());
      }
    });
    var upload = multer({ 
      storage:storage,
      // limits:{fileSize:pdfMaxSize},
      fileFilter: (req, file, cb)=>{
        console.log(" File before saving"+JSON.stringify(file));
        if(file.mimetype !=="application/pdf") return cb("Sorry, only pdf format is accepted")
        return cb(null, true);
      },
    })
    .fields([{name:'file[0]',maxCount:1}, {name:'file[1]',maxCount:1}, {name:'file[2]',maxCount:1}]); // the name of the file to be uploaded
    upload(req,res,(uploadErr)=>{
      if(uploadErr) return res.render("./lost",{msg:uploadErr});
      // return next();
    })
  // var fs = require('fs');
  // var file = req.files.file;
  // fs.writeFile(process.env.DIPLOMA_PATH, file, function (err) {
  //   if (err) return console.warn('Errors: '+err);
  //   console.log("The file: " + file.name + " was saved to " + file.path);
  // });
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
        if(err){
          console.log("Errors user: " + JSON.stringify(err));
          return log_err(err,false,req,res);
        }
        let newApplication = new Application({
          school_id:req.body.school_id,
          user_id:req.user._id,
          status:'P',
          year_o_s:req.body.year_o_s,
          program:req.body.program,
          faculty:req.body.faculties,
        });
        newApplication.save((err)=>{
          if(err){
            console.log("Errors: " + JSON.stringify(err));
            return log_err(err,false,req,res);
          }
          res.end();
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
        console.log('---------'+JSON.stringify(applications))
        return res.json(applications);
      })
    })
  }
  if(accLvl==student||accLvl==guest){
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
          console.log('Applications: '+JSON.stringify(response));
          return res.json(response[0])
        })
      })
    })
  }
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
    User.findOne({_id:applications.user_id},{},(err, user_details)=>{
      if(err) return log_err(err,false,req,res);
      if(!user_details) return res.status(400).send('Unknown user');
      applications.user=user_details;
      console.log('User details:'+JSON.stringify(applications))
      return res.json(applications)
    })
  })
}
exports.processUploads = (req, res, next) => {
  console.log(req.body)
    // File uploads
  const multer = require('multer');
  const MB = 1024 * 1024;
  const imgMaxSize = 10 * MB;
  var img_extension;
  var storage = multer.diskStorage({
    destination: function(req, file, cb) {
      console.log(file)
      img_extension = "." + file.originalname.split('.').pop();
      cb(null, process.env.APPLICATION_FILE)
    },
    filename: function(req, file, cb) {
      var now = new Date().getTime();
      cb(null, req.user._id + now + img_extension);
    }
  });
  var upload = multer({
      storage: storage,
      limits: {
        fileSize: imgMaxSize
      },
      fileFilter: (req, file, cb) => {
        console.log(" File before saving" + JSON.stringify(file))
        console.log(file)
          /*if (!file.mimetype.startsWith("image/") || !file.mimetype.startsWith("application/"))
            return cb("Sorry, only images and documents are allowed")*/
        return cb(null, true);
      },
    })
    .any()
    // .single('formly_4_upload_reg_files_0');
  upload(req, res, (uploadErr) => {
    if (uploadErr) return res.render("./lost", {
      msg: uploadErr
    });
    Application.findOne({
      _id: req.body.reg_id
    }, (err, applicationExists) => {
      if (err) {
        return log_err(err, true, req, res);
      } else if (!applicationExists) {
        return res.render("./lost", {
          msg: "Invalid data"
        })
      }
      filesToSave = [];
      req.files.forEach(extractUploadedFiles);

      function extractUploadedFiles(item, index) {
        for (var key in item) {
          if (item[key] == item["filename"]) {
            filesToSave.push(item['filename']);
          }
        }
      }
      console.log("==================");
      console.log(filesToSave)
      console.log("==================");
      applicationExists.school_name = req.body.school_name
      applicationExists.school_id = req.body.school_id
      applicationExists.file = filesToSave;
      applicationExists.save((err) => {
        if (err)
          return res.status(500).send(err['message'].split(":").pop());
        // return log_err(err, true, req, res);
        // Send an email to the school admin
        var infos = {
          name: applicationExists.title + " " + applicationExists.firstname + " " + applicationExists.lastname,
          school: req.body.school_name,
          email: applicationExists.email
        };
        console.log(infos);
        /*TODO: Email displaying email sent but not receiving email*/
        /*TODO: Generate an application unique id*/
        email_sender
          .sendApplicationReceivedMail(infos)
          .then((info) => {
            console.log(" THE EMAIL IS SENT !!!")
          })
          .catch((error) => {
            console.log(error);
            console.log(" EMAIL NOT SENT, SORRY !!!" + err);
          })
        req.flash('reg_is_successful', 'Application submitted successfuly, the response should not take more than 24 hours');
        return res.status(200).redirect("/applications");
      });
    });
  });
}

// Schools Api
exports.getSchools = (req, res, next) => {
  School.find({}, (err, schools) => {
    if (err) return log_err(err, false, req, res);
    else if (!schools) return res.status(400).json("Invalid input");
    console.log(schools);
    return res.status(200).json(schools);
  });
};

exports.existingApplication = (req, res, next) => {
  req.body.applicant_id = req.user._id
  req.body.school_id = req.user.school_id
  let newApplication = new Application(req.body);
  newApplication.save(function(err) {
    if (err)
      return res.status(500).send(err['message'].split(":").pop());
    return res.end();
  });
};