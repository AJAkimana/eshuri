const School =require('../models/School'),
      User =require('../models/User'),
      SchoolCourse = require('../models/SchoolCourse'),
      SchoolProgram = require('../models/SchoolProgram'),
      Unit =require('../models/Unit'),
      Course =require('../models/Course'),
      Department =require('../models/Department'),
      Content=require('../models/Content'),
      Marks =require('../models/MARKS'),
      Classe =require('../models/Classe'),
      log_err=require('./manage/errorLogger'),
      async = require('async');;
/*
Collection of schools that are registered
*/
// return the initial page
function checkArray(array, attr, value){
  for (var i=0;i<array.length;i++){
    if(array[i][attr]===value){
      return true;
    }
    else return false
  }
}
exports.getPageSchool = function(req,res,next){
  return res.redirect("/school/"+req.user.school_id);
}
exports.homepageSchool = function(req,res,next){ 
  req.assert('id_school', 'Invalid Data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  School.findOne({_id:req.params.id_school},(err,school)=>{
    if(err) return log_err(err,true,req,res);
    else if(!school) return res.render("./lost",{msg:"Invalid data"})
    else if(String(school._id)!= String(req.user.school_id))
      return res.render("./lost",{msg:"This is not your place"})
    // Mnt on va alors lui donner la HOMEPAGE DE CHAQUE SCHOOL
    return res.render('school/view_classes',{
      title:school.name,
      school_id: school._id,
      school_name: school.name,
      term_name: school.term_name,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,student_class:req.user.class_id,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })
};
exports.postSchoolCourse = function(req, res, next){
  req.assert('name', 'The name is required').notEmpty();
  req.assert('school_id', 'Invalid data').isMongoId();
  // req.assert('year', 'year is required').notEmpty();
  // req.assert('attendance_limit', 'attendance_limit is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //check if you are a school admin 
  else if(req.user.access_level > req.app.locals.access_level.ADMIN_TEACHER)
    return res.status(400).send("Sorry you are not authorized");
  //Check if the code is not already used
  School.findOne({_id:req.body.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("This school doesn't exists ");

    SchoolCourse.checkCourseExists(req.body,(err,school_course_exists)=>{
      if (err) return log_err(err,false,req,res);
      else if(school_course_exists) return res.status(400).send("This course is registered");
      let nouveauCourse = new SchoolCourse({
        name:req.body.name,
        school_id:req.body.school_id,
      });
      nouveauCourse.save(function(err){
        if (err) return log_err(err,false,req,res);
        return res.end();
      });
    }); 
  });   
}

exports.deleteSchoolCourse = (req, res, next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();

  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);

  SchoolCourse.findOne({_id:req.body.course_id},function(err, course_exists){
    if(err) return log_err(err,false,req,res);
    else if(!course_exists) return res.status(400).send("Invalid data");
    else if(String(req.user.school_id)!= String(course_exists.school_id))
      return res.status(400).send("Not authorized to do this");

    course_exists.remove((err)=>{
      if(err)  return log_err(err,false,req,res);
      res.end();
    });
  })
}
exports.postSchoolProgram = function(req, res, next){
  req.assert('abbreviation', 'The abbreviation is required');
  req.assert('name', 'The name is required').notEmpty();
  req.assert('school_id', 'Invalid data').isMongoId();
  // req.assert('year', 'year is required').notEmpty();
  // req.assert('attendance_limit', 'attendance_limit is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //check if you are a school admin 
  else if(req.user.access_level > req.app.locals.access_level.ADMIN_TEACHER)
    return res.status(400).send("Sorry you are not authorized");
  //Check if the code is not already used
  School.findOne({_id:req.body.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("This school doesn't exists ");

    SchoolProgram.checkProgramExists(req.body,(err,school_program_exists)=>{
      if (err) return log_err(err,false,req,res);
      else if(school_program_exists) return res.status(400).send("This program is registered");
      let nouveauProgram = new SchoolProgram({
        name:req.body.name,
        school_id:req.body.school_id,
        abbreviation:req.body.abbreviation
      });
      nouveauProgram.save(function(err){
        if (err) return log_err(err,false,req,res);
        return res.end();
      });
    }); 
  });   
}
exports.deleteSchoolProgram = (req, res, next)=>{
  req.assert('program_id', 'Invalid data').isMongoId();

  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);

  SchoolProgram.findOne({_id:req.body.program_id},function(err, program_exists){
    if(err) return log_err(err,false,req,res);
    else if(!program_exists) return res.status(400).send("Invalid data");
    else if(String(req.user.school_id)!= String(program_exists.school_id))
      return res.status(400).send("Not authorized to do this"); //Check if you deleting the program of your school

    program_exists.remove((err)=>{
      if(err)  return log_err(err,false,req,res);
      res.end();
    });
  })
}
exports.getSchoolProgram_JSON = function(req,res,next){ // R
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  SchoolProgram
  .find({school_id:req.params.school_id},
    {__v:0,school_id:0,})
  // .limit(100)
  .sort({name:1})
  .exec(function(err, school_programs){

    if(err) return log_err(err,false,req,res);
    return res.json(school_programs);
  })
}
exports.getSchoolCourseAndProgram_JSON = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  var reponse={};
  var async = require('async');
  async.parallel([
    (callback)=>{
      SchoolProgram.find({school_id:req.params.school_id},{__v:0,school_id:0,}).sort({name:1}).exec((err, school_programs)=>{
        if(err) callback(err);
        reponse.programs =school_programs;
        callback(null);
      })
    },
    (callback)=>{
      SchoolCourse.find({school_id:req.params.school_id},{__v:0,school_id:0,}).sort({name:1}).exec((err, school_courses)=>{
        if(err) callback(err);
        reponse.courses =school_courses;
        callback(null);
      })
    },
    ],(err)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(reponse);
    })
}
exports.getSettingSchoolPage = function(req,res,next){ 
  req.assert('school_id', 'Invalid Data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  School.findOne({_id:req.params.school_id},(err,school)=>{
    if(err) return log_err(err,true,req,res);
    else if(!school) return res.render("./lost",{msg:"Invalid data"})
    // Mnt on va alors lui donner la HOMEPAGE DE CHAQUE SCHOOL
    return res.render('dashboard/school_setting',{
        title:school.name,
        school_id: school._id,
        school_name: school.name,
        school_profile: school.cover_photo,
        school_po_box: school.contact.postal_code,
        school_phone: school.contact.telephone,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
  })
};
exports.getSchoolProfile = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  var picture_location=process.env.SCHOOL_PIC_PATH;
  if(errors) return res.sendFile(picture_location+"/schoo_default.jpg");
  
  var img_path;
  School.findOne({_id:req.params.school_id},(err,schoolExists)=>{
    // console.log(" i foud user ="+JSON.stringify(userExists))
    if(err){
      console.log("Error picture "+err);
      return res.sendFile(picture_location+"/schoo_default.jpg");
    }
    if(schoolExists)
      img_path =schoolExists.cover_photo;
    else  img_path ="schoo_default.jpg";
    // Send the file    
    
    var file_location=picture_location+"/"+img_path;
    var fs=require("fs");
    // console.log(" checkin for===>>>> "+file_location)
    fs.access(file_location, fs.constants.F_OK | fs.constants.R_O,(err)=>{
      if(err) {
        file_location=picture_location+"/schoo_default.jpg";
      }
      // console.log("I am sending "+file_location)
      return res.sendFile(file_location);  
    });   
  })
}
exports.displayProfile = function(req, res, next) {
  School.findOne({_id:req.user.school_id},(err,school)=>{
    if(err) return log_err(err,true,req,res);
    else if(!school) return res.render("./lost",{msg:"Invalid data"})
    return res.render('profile/create_profile', {
      title: 'Create Profile',
      access_lvl: req.user.access_level,
      email: req.user.email,
      school_id: req.user.school_id,
      school: school,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken,
    });
  })
}
exports.createSchoolProfile = function(req, res, next) {
  req.assert('school_fees', 'Amount must a number and not empty').notEmpty().isFloat();
  req.assert('school_years', 'Years of studies must be 1 to 6').isIn([1,2,3,4,5,6]);// Must be a number
  req.assert('school_desc','A small description is required').notEmpty();
  req.assert('school_curr', 'Select curriculum').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  School.findOne({_id: req.user.school_id}, (err, schoolExists) => {
    if(err) return log_err(err,true,req,res);
    else if(!schoolExists) return res.render("./lost",{msg:"Invalid data"})
    // var a=req.body.school_addr;
    schoolExists.average_school_fees = req.body.school_fees;
    schoolExists.years = req.body.school_years;
    schoolExists.combinations = req.body.school_faculties;
    schoolExists.description = req.body.school_desc;
    schoolExists.curriculum = req.body.school_curr;
    schoolExists.additional_information = req.body.school_info;
    schoolExists.stories.success_stories = req.body.school_stor;
    schoolExists.stories.icons = req.body.school_peop;
    schoolExists.other_programs = req.body.school_prog;
    schoolExists.contact.website = req.body.school_site
    schoolExists.contact.address = req.body.school_addr;
    schoolExists.contact.postal_code = req.body.school_code;
    schoolExists.student_requirements = req.body.school_requ;
    
    // schoolExists.$push({success_stories:req.body.school_stor, icons:req.body.school_peop})
    schoolExists.save((err)=>{
      if(err){
        console.log('My errors: '+JSON.stringify(err));
        return log_err(err,true,req,res);
      }
      return res.end();
    })
  });
}
exports.changeSchoolProfile = (req,res,next)=>{
  const multer = require('multer'); 
  const MB = 1024*1024;
  const imgMaxSize =1*MB;
  var img_extension;
  var img_name;
  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      img_extension="."+file.originalname.split('.').pop();
      img_name=require('mongodb').ObjectID();
      cb(null, process.env.SCHOOL_PIC_PATH)
    },
    filename: function (req, file, cb) {
      cb(null, img_name+img_extension);
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
  .single('school_pic'); // the name of the file to be uploaded
  upload(req,res,(uploadErr)=>{
    if(uploadErr) return res.render("./lost",{msg:uploadErr});
    //console.log("File name:"+img_name+img_extension+"___File path: "+process.env.SCHOOL_PIC_PATH)
    
    School.findOne({_id:req.body.school_id},(err,schoolExists)=>{
      if(err) return log_err(err,true,req,res);
      else if(!schoolExists) return res.render("./lost",{msg:"Invalid data"})
      var oldPic =schoolExists.cover_photo;
      
      schoolExists.cover_photo=img_name+img_extension;
      schoolExists.save((err)=>{
        if(err) return log_err(err,true,req,res);
        else if((oldPic != schoolExists.cover_photo)&& oldPic){
          var fileToDelete=process.env.SCHOOL_PIC_PATH+"/"+oldPic;
          require("fs").unlink(fileToDelete,(err)=>{
              if(err) console.log("===>>DELETION ERROR " + err);
              console.log("===>>Success AKIMANA ");
          })
        }
        return res.redirect("back");
      })
    });
  })
};
exports.addSchoolInfo = (req, res, next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  req.assert('phone', 'Enter phone number').notEmpty();
  req.assert('po_box', 'Enter P.O Box').notEmpty();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  School.findOne({_id:req.body.school_id},(err, schoolExists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!schoolExists) return res.render("./lost",{msg:"Invalid data"})
    schoolExists.contact.telephone=req.body.phone;
    schoolExists.contact.postal_code=req.body.po_box;
    schoolExists.save((err)=>{
      if (err) log_err(err,true,req,res);
      return res.end();
    })
  })
}
// Create a new school
exports.postNewSchool = function(req,res,next){
  req.assert('name', 'The name is required').notEmpty();
  req.assert('term_name', 'Choose parts name ').isIn(['S','T']);
  req.assert('term_quantity', 'Choose valid parts number').isInt({ min: 1, max:10 }); // Must be a number
  req.assert('description','A small description is required').notEmpty();
  req.assert('district_name', 'District is required').notEmpty();
  req.assert('retake_marks', 'Marks after retaking are required').isFloat({min:0,max:100});
  req.assert('category', 'Category is required').isIn([1,2,3]);
  req.assert('genderness', 'Gender category is required').isIn([1,2,3]);
  req.assert('partnership', 'Partnership is required').isIn([1,2,3]);
  req.assert('institution', 'Choose the institution').isIn([1,2,3,4]);
  // req.assert('isInternational', 'This entity is international').isBoolean();
  // req.assert('faculty_id', 'This entity is international').notEmpty();  not necessary here

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  
  // Just to be sure, in case it is a university
  if(req.body.department_id) req.body.institution =1;

  //check existence of the course
  School.checkSchoolExists(req.body,(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(school_exists) return res.status(400).send("This name is already taken");
    let nouveauSchool = new School({
      name:req.body.name,
      cover_photo:req.body.cover_photo|| "http://www.debaterwanda.org/wp-content/uploads/2014/02/schools_lndc.png",//"../imgs/image_placeholder.jpg",
      description:req.body.description,
      district_name:req.body.district_name,
      term_quantity:req.body.term_quantity, // This one is a must : ex: 3 or 4
      term_name:req.body.term_name, // This one is a must xample S or T
      // admin_mail:req.body.admin_mail,
      retake_marks:req.body.retake_marks,
      category:req.body.category,
      genderness:req.body.genderness,
      partnership:req.body.partnership,
      institution:req.body.institution,
      isInternational:req.body.isInternational,
      department_id:req.body.department_id,// I always put the fac id eve if it is not a Unversity
    })
    nouveauSchool.save(function(err){
      if(err)  return log_err(err,false,req,res);
      //console.log("I saved "+JSON.stringify(nouveauSchool))
      return res.end();
    })
  })
}
// recuperer la liste des schools not departments
exports.getSchool_JSON = function(req,res,next){ // R
  School
  .find({institution:{$gt:1} },{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, schools){
    if(err) return log_err(err,false,req,res);
    //console.log(" sending back "+JSON.stringify(schools))
    return res.json(schools);
  })
}
exports.getSchool_BySearch = (req, res, next)=>{
  School.find({name:/req.params.name/},{__v:0}).exec((err, schools)=>{
    if(err) return log_err(err,false,req,res);
    console.log(" sending back "+JSON.stringify(schools))
    return res.json(schools);
  })
}
// recuperer la liste des schools with number of USERS
exports.getSchool_DashboardJSON = function(req,res,next){ // R
  School
  .find({institution:{$gt:1} },{__v:0}).lean()
  .exec(function(err, schools){
    if(err) return log_err(err,false,req,res);
    var async =require('async');
    async.eachSeries(schools,(oneSchool,cb)=>{
      User.count({school_id:oneSchool._id},(err,num)=>{
        if(err) return cb(err);
        oneSchool.numUsers =num;
        cb();
      })
    },(err)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(schools);
    })    
  })
}
// recuperer la liste des  departments only
exports.getDepartments_JSON = function(req,res,next){ // R
  School
  .find({institution:1},{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, departments){
    if(err) return log_err(err,false,req,res);
    return res.json(departments);
  })
}
// recuperer le contenu des school
exports.getDepartment_JSON = function(req,res,next){ 
  req.assert('fac_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  School
  .find({faculty_id:req.body.fac_id,institution:1},{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, schools){
    if(err) return log_err(err,false,req,res);
    return res.json(schools);
  })
}
// recuperer le contenu des school
exports.getOptions_JSON = function(req,res,next){ 
  req.assert('department_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  School
  .find({department_id:req.params.department_id,institution:1},{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, schools){
    if(err) return log_err(err,false,req,res);
    // console.log("I am rendering "+JSON.stringify(schools))
    return res.json(schools);
  })
}
// Supprimer un school 
exports.removeSchool = function(req,res,next){ 
  req.assert('school_id', 'Invalid data').isMongoId();
  req.assert('confirmPass', 'Super admin password is required to do this action').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.confirmPass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch)   return res.status(400).send("Password is incorrect");
      //before delete check existence
      School.findOne({_id:req.body.school_id},(err,school_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!school_exists) return res.status(400).send("Invalid data");
         var gica = require("async");
         // BEFORE DELETEING A SCHOOL I CHECK IF THERE IS NO 
         // USER, UNIT , CONTENT AND COURSES, classes
         var num_courses =0, num_units =0, num_users=0, num_contents=0,num_classes=0; 
         gica.parallel([
          (callback)=>{// del courses
            Course.count({school_id:req.body.school_id},(err,num)=>{
              num_courses=num;
              callback(err);
            })
          },
          (callback)=>{
            Classe.count({school_id:req.body.school_id},(err,num)=>{
              num_classes=num;
              callback(err);
            })
          },
          (callback)=>{
            Unit.count({school_id:req.body.school_id},(err,num)=>{
              num_units=num;
              callback(err);
            })
          },
          (callback)=>{
            Content.count({school_id:req.body.school_id},(err,num)=>{
              num_contents=num;
              callback(err);
            })
          },
          (callback)=>{
            User.count({school_id:req.body.school_id},(err,num)=>{
              num_users=num;
              callback(err);
            })
          }

         ],(err)=>{
            if(err) return log_err(err,false,req,res);
            else if(num_classes>0) return res.status(400).send('There is '+num_classes+' classes in this school <br/> Delete them first');
            else if(num_units>0) return res.status(400).send('There is '+num_units+' units in this school <br/> Delete them first');
            else if(num_courses>0) return res.status(400).send('There is '+num_courses+' courses in this school <br/> Delete them first');
            else if(num_contents>0) return res.status(400).send('There is '+num_contents+' content in this school <br/> Delete them first');
            else if(num_users>0) return res.status(400).send('There is '+num_users+' users in this school <br/> Delete them first');
             //if all is okay 
            school_exists.remove((err)=>{
              if(err) return res.status(500).send("Deletion failed but all school's content deleted"); 
              return res.end();
            })
          })
      })
    })
  })
}
// dissocuate the teacher form a course

exports.dissociateTeacher = function(req,res,next){ 
  req.assert('teacher_id', 'Invalid data').isMongoId();
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Course.findOne({_id:req.body.course_id},(err,courseExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!courseExists) return res.status(400).send('Data is not valid');
    var newTeacherList =[];
    var async= require('async');    
    async.each(courseExists.teacher_list,(currentTeacher,cb)=>{
      if(currentTeacher != req.body.teacher_id) newTeacherList.push(currentTeacher);
      return cb(null);
    },(err)=>{
      if(err) return res.status(400).send(err);
      
      courseExists.teacher_list =newTeacherList;
      courseExists.save((err)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })
    })
  })
}

// Supprimer un teacher 
exports.removeTeacher = function(req,res,next){ 
  req.assert('teacher_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({_id:req.body.teacher_id},(err,teacher_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!teacher_exists)  return res.status(400).send("Invalid data");
    else if(String(req.user.school_id)!=String(teacher_exists.school_id))   
      return res.status(400).send("This is not your school");
    // DELETE THE TEACHER FROM HIS SCHOOL by nulling his school_id
    // console.log('I removed his ID =='+JSON.stringify(teacher_exists));
    teacher_exists.school_id =null;
    teacher_exists.save((err)=>{
      if(err) return log_err(err,false,req,res);
      return res.end(); // When OK
    })
  })
}

exports.removeStudent = function(req,res,next){ 
  req.assert('student_id', 'Invalid data').isMongoId();
  req.assert('confirmPass', 'Password to confirm is necessary').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // first we check if your password is correct
  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.confirmPass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch)   return res.status(400).send("Password is incorrect");
      
      // IF your pass is correct, then search the STUDENT and delete HIM
      User.findOne({_id:req.body.student_id,access_level:req.app.locals.access_level.STUDENT},(err,studentExists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!studentExists) return res.status(400).send('Invalid data');
        // We delete also his PROFIL PIC
        var profile_pic = process.env.PROFILE_PIC_PATH+"/"+studentExists.profile_pic;
        var hasProfilPic =studentExists.profile_pic;
        studentExists.remove((err)=>{
          if(err) return log_err(err,false,req,res);
          if(hasProfilPic)
          require('fs').unlink(profile_pic,function(err){
            //console.log('File '+profile_pic+'deleted with err'+err);
          });
          return res.end();
        })  
      })
    })
  })
}
exports.editStudent = (req, res, next)=>{
  req.assert('student_id', 'Invalid data').isMongoId();
  req.assert('new_name', 'Enter name please').notEmpty();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);

  User.findOne({_id:req.user._id},(err, user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");

    User.findOne({_id:req.body.student_id,access_level:req.app.locals.access_level.STUDENT},(err, studentExists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!studentExists) return res.status(400).send('Invalid data');

      studentExists.name = req.body.new_name;
      studentExists.save((err, done)=>{
      if(err) return log_err(err,false,req,res);
      return res.end();
      })
    })
  })
}
exports.getUserClasses = (req, res, next)=>{
  req.assert('school_id', 'Invalid Data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var listClasses=[], allclasses=[],coursesClasses=[],classes=[];
  var response={};
  var ac_year;
  var access_lvl = req.user.access_level;
  var student = req.app.locals.access_level.STUDENT,
      teacher = req.app.locals.access_level.TEACHER?req.app.locals.access_level.STUDENT:req.app.locals.access_level.ADMIN_TEACHER,
      hMaster = req.app.locals.access_level.SA_SCHOOL;
  var parametters = {};
  // response.classes=[];
  // console.log('Users:'+JSON.stringify(req.user));
  School.findOne({_id:req.params.school_id},(err, school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.status(400).send("Unkown school");
    else if(String(school_exists._id)!=String(req.user.school_id)) return res.status(400).send("This is not your school:"+school_exists._id+" AND "+req.user.school_id);
    if(access_lvl==student){
      async.series([(firstClass)=>{
        Classe.findOne({_id:req.user.class_id, school_id:req.user.school_id},(err, studentclass_details)=>{
          if(err) return firstClass(err);
          //ac_year=studentclass.academic_year;
          listClasses.push({class_id:studentclass_details._id,name:studentclass_details.name,academic_year:studentclass_details.academic_year});
          firstClass(null);
        })
      },(cssCallback)=>{
        async.each(req.user.prev_classes, (thisClass, classCallBack)=>{
          // listClasses.push(thisClass);
          Classe.findOne({_id:thisClass, school_id:req.user.school_id},(err, prev_class_details)=>{
            if(err) classCallBack(err);
            Marks.findOne({student_id:req.user._id,class_id:prev_class_details._id},(err,a_year)=>{
              if(err) classCallBack(err)
              // console.log('Aaaaa:'+a_year)
              if(a_year!=null) listClasses.push({class_id:thisClass,name:prev_class_details.name,academic_year:a_year.academic_year});
              classCallBack(null);
            })
          })
        },(err)=>{
          if(err) return cssCallback(err);
          // allclasses=listClasses
          // console.log('asdasd'+JSON.stringify(listClasses))
          console.log('dsdsfsdfsdfsdfs')
          // append every class number of courses
          async.eachSeries(listClasses, (thisClass, callBack)=>{
            parametters = {class_id:thisClass.class_id};
            Course.count(parametters,(err, number)=>{
              if (err) return callBack(err);
              thisClass.number=number;
              callBack();
            })
          },(err)=>{
            if(err) return log_err(err,false,req,res);
            // console.log('Classes:'+JSON.stringify(listClasses))
            // if everything are in place return data to front
            return res.json(listClasses)
          })
        })
      }])
    }
    else{
      Course.find().distinct("class_id",{school_id:school_exists._id, teacher_list:req.user._id},(err, class_courses)=>{
        if (err) return log_err(err,false,req,res);
        async.each(class_courses, (thisList, listCallback)=>{
          listClasses.push(thisList);
          listCallback(null);
        },(err)=>{
          if (err) return log_err(err,false,req,res);
          allclasses=listClasses;
          // console.log('Courses:'+allclasses)
          async.eachSeries(allclasses, (thisClass, callBack)=>{
            Classe.findOne({_id:thisClass},(err, class_details)=>{
              if (err) return callBack(err);
              classes.push({class_id:thisClass,name:class_details.name,academic_year:class_details.academic_year})
              callBack();
            })
          },(err)=>{
            if(err) return log_err(err,false,req,res);
            // append every class number of courses
            async.eachSeries(classes, (thisClass, callBack)=>{
              if(access_lvl == student) parametters = {class_id:thisClass.class_id};
              else parametters = {class_id:thisClass.class_id, teacher_list:req.user._id}
              Course.count(parametters,(err, number)=>{
                if (err) return callBack(err);
                thisClass.number=number;
                callBack();
              })
            },(err)=>{
              if(err) return log_err(err,false,req,res);
              // console.log('Classes:'+JSON.stringify(classes))
              // if everything are in place return data to front
              return res.json(classes)
            })
          })
        })
      })
    }
  })
}
  // Marks.find().distinct("class_id", {school_id:req.user.school_id, student_id:req.user._id},(err, markClasses)=>{
  //   if (err) return log_err(err,false,req,res);
  //   listClasses=markClasses;
  //   Classe.findOne({school_id:req.user.school_id, $or:[{_id:req.user.class_id},{class_teacher:req.user._id}]},{_id:1},(err, user_class)=>{
  //     if (err) return log_err(err,false,req,res);
  //     if(user_class)
  //       if(listClasses.indexOf(String(user_class._id))==-1)listClasses.push(user_class._id);
  //     Course.find().distinct("class_id",{school_id:req.user.school_id, teacher_list:req.user._id},(err, class_courses)=>{
  //       if (err) return log_err(err,false,req,res);
  //       coursesClasses=class_courses;
  //       // Check every class in the courses
  //       async.eachSeries(coursesClasses, (thisList, listCallback)=>{
  //         // console.log('-------'+listClasses)
  //         if(listClasses.indexOf(String(thisList))==-1){
  //           listClasses.push(thisList)
  //         }
  //         listCallback();
  //       },(err)=>{
  //         if(err) return log_err(err,false,req,res);
  //         if(listClasses.length==0) return res.status(400).send("No classes of yours found contact your administrator");
  //         //Append to every id class info
  //         async.eachSeries(listClasses, (thisClass, callBack)=>{
  //           Classe.findOne({_id:thisClass},(err, class_details)=>{
  //             if (err) return callBack(err);
  //             classes.push({class_id:thisClass,name:class_details.name})
  //             callBack();
  //           })
  //         },(err)=>{
  //           if(err) return log_err(err,false,req,res);
  //           // append every class number of courses
  //           async.eachSeries(classes, (thisClass, callBack)=>{
  //             if(access_lvl == student) parametters = {class_id:thisClass.class_id};
  //             else parametters = {class_id:thisClass.class_id, teacher_list:req.user._id}
  //             Course.count(parametters,(err, number)=>{
  //               if (err) return callBack(err);
  //               thisClass.number=number;
  //               callBack();
  //             })
  //           },(err)=>{
  //             if(err) return log_err(err,false,req,res);
  //             // if everything are in place return data to front
  //             return res.json(classes)
  //           })
  //         })
  //       })
  //     })
  //   })
  // });
exports.getSchoolData = (req,res,next)=>{
  //Get the term_name and term_quantity
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);

  var response={};
  var theData=[]
  theData.push({list:[]})
  School.findOne({_id:req.params.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.status(400).send("School not found");
    response.term_name = school_exists.term_name;
    response.term_quantity = school_exists.term_quantity;
    response.name = school_exists.name;
    theData.push({infos:{}})
    theData[1].infos.term_name=school_exists.term_name
    theData[1].infos.term_quantity=school_exists.term_quantity
    theData[1].infos.name=school_exists.name
    // theData.push({term_name:school_exists.term_name});
    // theData.push({term_quantity:school_exists.term_quantity})
    // theData.push({name:school_exists.name})
      var async = require('async');
      async.parallel([
        (cb)=>{
          User.count({school_id:req.params.school_id,isEnabled:false})
          .exec((err,number)=>{
            if(err) cb(err);
            theData[0].list.push({type:'New accounts to confirm',number:number,url:'/dashboard.accounts.validation',icon:'verified_user'})
            response.unConfirmed=number;
            cb(null);
          })
        },
        // classes are not needed
        (cb2)=>{
          Classe.find({school_id:req.params.school_id},{school_id:0,__v:0})
            .sort({name:1}).exec((err,classe_list)=>{
              if(err) return cb2(err);
              theData.push({classes:classe_list});
              response.classes =classe_list;
              cb2(null);
            })
        },
        (cb3)=>{
          User.count({school_id:req.params.school_id,access_level:req.app.locals.access_level.TEACHER},(err,num_teachers)=>{
            if(err) return cb3(err);
            theData[0].list.push({type:'Teachers',number:num_teachers,url:'/dashboard.teachers/'+req.user.school_id,icon:'person'})
            response.teachers =num_teachers
            cb3(null);
          })
        },
        (cb4)=>{
          User.count({school_id:req.params.school_id,access_level:{$lte:req.app.locals.access_level.ADMIN_TEACHER}},(err,num_admins)=>{
            if(err) return cb4(err);
            theData[0].list.push({type:'Administrators',number:num_admins,url:'/dashboard.admins/'+req.user.school_id,icon:'supervisor_account'})
            response.admins =num_admins;
            cb4(null);
          })
        },
        (cb5)=>{
          User.count({school_id:req.params.school_id,access_level:req.app.locals.access_level.STUDENT},(err,num_students)=>{
            if(err) return cb5(err);
            theData[0].list.push({type:'Students',number:num_students,url:'/',icon:'person'})
            response.num_students =num_students;
            cb5(null);
          })
        },
        (cb6)=>{
          SchoolCourse.count({school_id:req.params.school_id},(err,num_school_courses)=>{
            if(err) return cb6(err);
            theData[0].list.push({type:'Courses',number:num_school_courses,url:'/dashboard.register.course/'+req.user.school_id,icon:'class'})
            response.school_courses =num_school_courses;
            cb6(null);
          })
        },
        (cb7)=>{
          SchoolProgram.count({school_id:req.params.school_id},(err,num_school_programs)=>{
            if(err) return cb7(err);
            theData[0].list.push({type:'Programs',number:num_school_programs,url:'/dashboard.register.course/'+req.user.school_id,icon:'class'})
            response.school_programs =num_school_programs;
            cb7(null);
          })
        }
        ],(err)=>{
          if(err) return log_err(err,false,req,res);;
          return res.json(theData);
        })
  })
}

exports.getCoursesList = (req,res,next)=>{
  // Je checke si existe
  req.assert('class_id', 'Invalid data').isMongoId();
  req.assert('currentTerm', 'Invalid data').notEmpty();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);

  Course.find({class_id:req.body.class_id,currentTerm:req.body.currentTerm},
    (err,courses_list)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(courses_list); 
  })
}
exports.getAdminsList = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  User.find({school_id:req.body.school_id,access_level:{$lte:req.app.locals.access_level.ADMIN_TEACHER}},
    {__v:0,password:0,gender:0,phone_number:0,
      class_id:0,school_id:0,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0},
    (err,admins_list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(admins_list);
  })
}

exports.getTeachersList = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  User.find({school_id:req.params.school_id, $or:[
    {access_level:req.app.locals.access_level.TEACHER},
    {access_level:req.app.locals.access_level.ADMIN_TEACHER}
    ]},
  {__v:0,password:0,gender:0,class_id:0,school_id:0,isValidated:0,upload_time:0,updatedAt:0})
  .sort({name:1})
  .exec((err,teachers_list)=>{
    if(err) return log_err(err,false,req,res);
    //console.log("Teachers: "+teachers_list);
    return res.json(teachers_list);
  })
}

exports.getStudentsList = (req,res,next)=>{
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  User.find({class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT},
  {__v:0,password:0,gender:0,isValidated:0,upload_time:0,updatedAt:0}).sort({name:1}).exec((err,students_list)=>{
    if(err) return log_err(err,false,req,res);
    //console.log('STUD LIS'+req.body.class_id);
    return res.json(students_list);
  })
}
// For demonstration purpose
exports.getUsersSchool = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  if(req.user.access_level==5){
    User.find({school_id:req.params.school_id,access_level:3,_id:{$ne:req.user._id},isEnabled:true},
      {__v:0,email:0,password:0,gender:0,phone_number:0,class_id:0,school_id:0
        ,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0}
      ,(err,usersList)=>{
      if(err) return log_err(err,false,req,res);

      return res.json(usersList);
    })
  }else{
    User.find({school_id:req.params.school_id,_id:{$ne:req.user._id},isEnabled:true},
      {__v:0,email:0,password:0,gender:0,phone_number:0,class_id:0,school_id:0
        ,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0}
      ,(err,usersList)=>{
      if(err) return log_err(err,false,req,res);

      return res.json(usersList);
    })
  }

}
exports.getTeacherAndAdminSchool = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  User.find({
    school_id:req.params.school_id,
    access_level:{$lte:req.app.locals.access_level.TEACHER},
    _id:{$ne:req.user._id},
    isEnabled:true
  },
    {__v:0,email:0,password:0,gender:0,phone_number:0,class_id:0,school_id:0
      ,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0}
    ,(err,AdminTeachersList)=>{
    if(err) return log_err(err,false,req,res);
    //console.log("Admin and teachers:"+AdminTeachersList)
    return res.json(AdminTeachersList);
  })
}


exports.setTeacherAsAdmin = function(req,res,next){
  req.assert('teacher_id', 'Invalid data').isMongoId();
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  // select from teachers where 
  User.findOne({school_id:req.body.school_id,access_level:req.app.locals.access_level.TEACHER,_id:req.body.teacher_id},(err,teacher_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!teacher_exists) 
      return res.status(400).send(" This email doesn't match an existing teacher");
    teacher_exists.access_level = req.app.locals.access_level.ADMIN_TEACHER;
    teacher_exists.save((err)=>{
      if(err) return log_err(err,false,req,res);
      return res.end();  
    })
    
  })
}
exports.setAdminAsTeacher = function(req,res,next){
  req.assert('admin_id', 'Invalid data').isMongoId();
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  else if(String(req.body.admin_id)==String(req.user._id))
    return res.status(400).send("You cannot remove yourself");

  // select from admins where 
  User.findOne({school_id:req.body.school_id,$or:[{access_level:req.app.locals.access_level.ADMIN}, {access_level:req.app.locals.access_level.ADMIN_TEACHER}],_id:req.body.admin_id},(err,admin_exists)=>{
    // console.log(' i got '+JSON.stringify(admin_exists));
    if(err) return log_err(err,false,req,res);
    else if(!admin_exists) 
      return res.status(400).send(" This email doesn't match an existing administrator");
    else if(admin_exists.access_level <= req.user.access_level)
       return res.status(400).send(" You cannot move this person");
    admin_exists.access_level = req.app.locals.access_level.TEACHER;
    admin_exists.save((err)=>{
      if(err) return log_err(err,false,req,res);
      return res.end();  
    })
    
  })
}
exports.updateSuperAdmin = (req,res,next)=>{
  req.assert('admin_mail', 'An email is required').isEmail();
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  else if(req.body.admin_mail == req.user.email)
    return res.status(400).send("You cannot change yourself! ;)");
  else if(String(req.user.access_level)!= req.app.locals.access_level.SUPERADMIN)
    return res.status(400).send("You are not allowed");

  School.findOne({_id:req.body.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)
        return res.status(400).send("Invalid data");
    // if it is a OPTION , we set the admin via DEPARTMENT
    else if(school_exists.institution < 2)  return res.status(400).send("This is not the way to do it");
    User.findOne({email:req.body.admin_mail},(err,user_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!user_exists)
          return res.status(400).send("This email is not yet registered");
        user_exists.access_level =req.app.locals.access_level.SA_SCHOOL;
        user_exists.isEnabled =true;
        user_exists.isValidated=true;
        user_exists.school_id =req.body.school_id;
        user_exists.save((err)=>{          
          school_exists.admin_mail =req.body.admin_mail;
          school_exists.save((err)=>{
            if(err) return log_err(err,false,req,res);
            return res.end();  
          })          
        })
      })
  })
    
}

/* This function helps change the HOD of a groups odf schools /OPtions
  The Old HOD must be returnbed back to his Teacher Level./
  I suggest first bring back the old HOD ..
*/
exports.setHeadOfDepartment = (req,res,next)=>{
  req.assert('admin_mail', 'An email is required').isEmail();
  req.assert('department_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  else if(req.body.admin_mail == req.user.email)
    return res.status(400).send("You cannot change yourself! ;)");
  else if(String(req.user.access_level)!= req.app.locals.access_level.SUPERADMIN)
    return res.status(400).send("You are not allowed");
  // Avant de setHOD verifie si cet email est deja associe a un compte.
  // Si y a un depart ki a deja cet email comme admin.
  Department.find({admin_mail:req.body.admin_mail},(err,departList)=>{
    if(err) return log_err(err,false,req,res);
    else if(departList.length >0 )
       return res.status(400).send("This email is already used in Department "+departList[0].name);
     // now et get the DEPART in kestion
    Department.findOne({_id:req.body.department_id},(err,depart_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!depart_exists)  return res.status(400).send("Department not recognized");
      // I save the oldHOD so that i set him back as a teacher
      var oldHOD_mail =depart_exists.admin_mail;

      User.findOne({email:req.body.admin_mail},(err,user_exists)=>{
          if(err) return log_err(err,false,req,res);
          else if(!user_exists) return res.status(400).send("This email is not yet registered");
          else if(user_exists.access_level < req.user.access_level)
            return res.status(400).send("Impossible to use this email"+req.user.access_level);
          user_exists.access_level =req.app.locals.access_level.HOD;
          user_exists.isEnabled =true;
          user_exists.isValidated=true;
          user_exists.department_id =req.body.department_id;
          user_exists.save((err)=>{          
            // Now each school in department will have admin_mail like you
            School.update({department_id:req.body.department_id},{$set:{admin_mail:req.body.admin_mail}},{multi:true},(err,allSchooUpdated)=>{
               if(err) return log_err(err,false,req,res);
               depart_exists.admin_mail =req.body.admin_mail;
               depart_exists.save((err)=>{
                  if(err) return log_err(err,false,req,res);
                  // Now i am going to set back to teacher the old HOD
                  // Here you ave to notice that depart has already updated his admin_mail / ! \
                  User.findOne({email:oldHOD_mail},(err,user_exists)=>{
                    // console.log('USER is '+JSON.stringify(user_exists));
                    if(err) return log_err(err,false,req,res);
                    else if(user_exists){
                      user_exists.access_level =req.app.locals.access_level.TEACHER;
                      // console.log(' THE USER EXISTS '+user_exists.access_level);
                      user_exists.save((err)=>{
                        if(err) return log_err(err,false,req,res);
                        return res.end();      
                      }) 
                    }
                    else return res.end();
                  })
               });
            })
          })

        })
    })

  })
}
