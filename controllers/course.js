const Course =require('../models/Course'),
      SchoolCourse = require('../models/SchoolCourse'),
      User =require('../models/User'),
      Unit =require('../models/Unit'),
      Classe =require('../models/Classe'),
      Content=require('../models/Content'),
      Marks=require('../models/MARKS'),
      School =require('../models/School'),
      ObjectID = require('mongodb').ObjectID,
      Util=require('../utils.js'),
      courseHelper=require('../helpers/courseHelper');
      log_err=require('./manage/errorLogger');
/*
A course is given by only one teacher and that teacher is set by the Admin of the School
*/
// return the initial page
exports.getPageOneCourse = function(req,res,next){
  req.assert('course_id', 'Invalid data').isMongoId();
  if(req.query.u||req.query.allow){
    req.assert('u', 'Invalid data').isMongoId();
    req.assert('allow', 'Invalid data a').equals('true');
  }
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg});

  var date = new Date();
  var year = parseInt(date.getFullYear())-2000;
  var async = require('async');
  var classe={},course={},school={},user={},userCourses=[],teacher_name,class_name;
  if(!req.query.ay||req.query.ay<17||req.query.ay>year) return res.render("./lost",{msg:"Invalid data"});

  async.series([(findCourse)=>{
    Course.findOne({_id:req.params.course_id}, (err, courseExists)=>{
      if(err) return findCourse("Invalid data");
      else if(!courseExists) return findCourse("This course is not recognized");
      req.params.class_id = courseExists.class_id;
      course = courseExists;
      return findCourse(null);
    })
  },(isAllowedToCourse)=>{
    Util.listCourses(req, (err, userCoursesList)=>{
      if(err) return isAllowedToCourse(err);
      var thisCourseIndex = userCoursesList.findIndex(x=>x._id==req.params.course_id);
      if(thisCourseIndex==-1) return isAllowedToCourse("You are not allow to access this course");
      return isAllowedToCourse(null);
    })
  },(findSchool)=>{
    School.findOne({_id:course.school_id},{term_name:1,name:1},(err, school_exists)=>{
      if(err) return findSchool("Invalid data");
      else if(!school_exists) return findSchool("School does not exists");
      school = school_exists;
      return findSchool(null);
    })
  },(findClasse)=>{
    Classe.findOne({_id:course.class_id},(err,classe_exists)=>{
      if(err) return findClasse('Service not available');
      else if(!classe_exists)  return findClasse('This class doesn\'t exists');
      classe = classe_exists;
      var first_letter=classe_exists.name.toLowerCase().charAt(0);
      class_name = first_letter==='s'?classe_exists.name:'s'+classe_exists.name;
      return findClasse(null);
    })
  },(findFirstTeacher)=>{
    User.findOne({_id:course.teacher_list[0]},{name:1},(err, teacher)=>{
      if(err) return findFirstTeacher("Invalid data");
      else if(!teacher) return findFirstTeacher("Course does not have teacher");

      teacher_name = teacher.name;
      return findFirstTeacher(null);
    })
  },(findUser)=>{
    if(req.query.u&&req.query.allow){
      User.findOne({_id:req.query.u},(err, userExists)=>{
        if(err) return findUser('Service not available');
        else if(!userExists) return findUser('This user doesn\'t exists');
        user = userExists;
        return findUser(null);
      })
    }
    else return findUser(null)
  }],(err)=>{
    if(err) return res.render("./lost",{msg:err});
    var subHeader = '';
    if(user.name){
      subHeader = user.name.replace('\'',"\\'");
      subHeader += '->'+class_name+'->'+course.name;
    }
    else subHeader = class_name+'->'+course.name;
    return res.render('course/display_course_content',{
      title:course.name.toUpperCase(),
      term_name:school.term_name,
      teacher_name:teacher_name,
      school_name:school.name,
      course_name :course.name,
      subhead:subHeader,
      visited_user:req.query.u||'',
      academic_year:req.query.ay,
      actual_term :classe.currentTerm,
      course_id:req.params.course_id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),
      access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    });
  })
}
exports.courseDashboardSummary = (req,res)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('academic_year', 'Invalid data').isInt();
  if(req.body.visited_user){
    req.assert('visited_user', 'Invalid data').isMongoId();
    req.query.u = req.body.visited_user;
    req.query.allow = true;
  }
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  courseHelper.contentsSummary(req, (err, contents)=>{
    if(err) return res.status(400).send(err);
    
    return res.json(contents);
  })
}
// Create a new course
exports.postNewCourse = function(req,res,next){
  req.assert('name', 'The name is required').notEmpty();
  req.assert('code', 'The code name of the course is required').notEmpty();
  req.assert('class_id', 'Choose a class').isMongoId();
  req.assert('teacher_id', 'Choose a teacher').isMongoId();
  req.assert('school_id', 'Invalid data').isMongoId();
  req.assert('courseTerm', 'Choose a term/semester').notEmpty();
  req.assert('weightOnReport', 'Choose course weight on the report').notEmpty();
  // req.assert('year', 'year is required').notEmpty();
  // req.assert('attendance_limit', 'attendance_limit is required').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //check if you are a school admin 
  else if(req.user.access_level > req.app.locals.access_level.ADMIN_TEACHER)
    return res.status(400).send("Sorry you are not authorized");
  //Check if the code is not already used
  Classe.findOne({_id:req.body.class_id},(err,classe_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!classe_exists)  return res.status(400).send("This class doesn't exists ");
    Course.checkCourseExists(req.body,(err,course_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(course_exists) return res.status(400).send("This course or code is already used");
      //if validation is okay
      //check the teacher 
      var devideQuota = Number(req.body.weightOnReport)/2;
      let nouveauCourse = new Course({
        name:req.body.name,
        code:req.body.code,
        class_id:req.body.class_id,
        school_id:req.body.school_id,
        teacher_list:[req.body.teacher_id],
        level:classe_exists.level,
        exam_quota:devideQuota,
        test_quota:devideQuota,
        // year:req.body.year,
        weightOnReport:req.body.weightOnReport,
        courseTerm:req.body.courseTerm,
        attendance_limit:0, // initially 0
      })
      nouveauCourse.save(function(err){
        if(err) return log_err(err,false,req,res);
        return res.end();     
      })
    }); 
  })   
}
// recuperer le contenu des course
exports.getCourses_JSON = function(req,res,next){ // R
  req.assert('school_id', 'Invalid data').isMongoId();
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  var async = require('async');
  Course
  .find({school_id:req.body.school_id,class_id:req.body.class_id},
    {__v:0,school_id:0,})
  // .limit(100)
  .sort({name:1})
  .lean()
  .exec((err, courses)=>{
    async.eachSeries(courses, (current, cB)=>{ 
      current.course_term=current.courseTerm==4?'Whole year':'Term '+current.courseTerm;
      cB(null);
    },(err)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(courses);
    })
  })
}
exports.getSchoolCourse_JSON = function(req,res,next){ // R
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  SchoolCourse
  .find({school_id:req.params.school_id},
    {__v:0,school_id:0,})
  // .limit(100)
  .sort({name:1})
  .exec(function(err, school_courses){

    if(err) return log_err(err,false,req,res);
    // console.log('School courses: ______________'+school_courses);
    return res.json(school_courses);
  })
}
// Supprimer un course 
exports.deleteCourse = function(req,res,next){ // D
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('confirm_pass', 'A password is required').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.confirm_pass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch) return res.status(400).send("Password incorrect");
      Course.findOne({_id:req.body.course_id},function(err, course_exists){
      if(err) return log_err(err,false,req,res);
      else if(!course_exists) return res.status(400).send("Invalid data");
      else if(String(req.user.school_id)!= String(course_exists.school_id))
        return res.status(400).send("Not authorized to do this");

      Unit.count({course_id:course_exists._id},(err,unitNumber)=>{
         if(err) return log_err(err,false,req,res);
         else if(unitNumber >0) return res.status(400).send("There are "+unitNumber
          +" units attached to this course, delete them first");

          course_exists.remove((err)=>{
            if(err)  return log_err(err,false,req,res);
            return res.end(); // when OK  
          })
      })  
    })
    })
  })    
}
exports.restructure = (req, res)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  var masterIndex = req.body.course_id;
  var async = require('async');
  Course.findOne({_id:masterIndex}, (err, courseRes)=>{
    if(err) return res.status(500).send('Service not available');
    else if(!courseRes) return res.status(404).send('Course not found');

    var listCoursesRes = [];
    var codeLen = courseRes.code.length;
    var courseCode = courseRes.code.substring(0,codeLen-4);
    var ayTerm = courseRes.code.substr(codeLen-3);
    if(isNaN(ayTerm)) return res.status(400).send('Course already structured');
    async.series([(findSimilarCourseName)=>{
      /**
       *  Find courses with the similar names in the same classe
       */
      Course.find({name:courseRes.name,class_id:courseRes.class_id},(err, courseList)=>{
        if(err) return findSimilarCourseName('Service not available');
        else if(courseList.length<2) return findSimilarCourseName('This course cannot be structured');
        listCoursesRes = courseList;
        return findSimilarCourseName(null);
      })
    },(treatCourseContent)=>{
      async.eachSeries(listCoursesRes, (currentCourse, courseCallBack)=>{
        async.parallel([(updateContents)=>{
          Content.update({course_id:currentCourse._id}, {$set:{course_id:masterIndex}}, {multi:true}, (err, done)=>{
            if (err) return updateContents('Content update error');
            console.log('Content Up:',done);
            return updateContents(null);
          })
        },(updateMarks)=>{
          Marks.update({course_id:currentCourse._id}, {$set:{course_id:masterIndex,course_name:courseRes.name}}, {multi:true}, (err, done)=>{
            if (err) return updateMarks('Marks update error');
            console.log('Mark Up:',done);
            return updateMarks(null);
          })
        },(updateUnits)=>{
          Unit.update({course_id:currentCourse._id}, {$set:{course_id:masterIndex}}, {multi:true}, (err, done)=>{
            if (err) return updateUnits('Unit update error');
            console.log('Unit Up:',done);
            return updateUnits(null);
          })
        }],(err)=>{
          if(err) return courseCallBack(err);
          return courseCallBack(null)
        })
      },(err)=>{
        if(err) return treatCourseContent(err);
        return treatCourseContent(null)
      })
    },(deleteRemainigCourses)=>{
      Course.remove({_id:{$ne:masterIndex},name:courseRes.name,class_id:courseRes.class_id},(err, deleted)=>{
        if(err) return deleteRemainigCourses('Course deletion error');
        console.log('Deleted:',deleted);
        return deleteRemainigCourses(null)
      })
    }],(err)=>{
      if(err) return res.status(500).send(err); //If error in async series return the error
      courseRes.code = courseCode;
      courseRes.courseTerm = 4;
      courseRes.save((err, ok)=>{
        if(err) return res.status(500).send('Service not available');
        return res.status(200).send('Successfully structured');
      })
    })
  })
}
exports.changeCourseName = (req, res, next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('class_id', 'Invalid data').isMongoId();
  req.assert('course_name', 'Enter course name please').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  
  Course.findOne({_id:req.body.course_id, class_id:req.body.class_id},(err, course_exists)=>{
    if (err) return log_err(err, false, req, res);
    else if(!course_exists) return res.status(400).send("Invalid data 1");
    course_exists.name = req.body.course_name;
    course_exists.code = req.body.code;

    Marks.update({course_id:req.body.course_id}, {$set:{course_name:req.body.course_name}}, {multi:true}, (err, done)=>{
      if (err) return log_err(err, false, req, res);
      course_exists.save((err, ok)=>{
        if (err) return log_err(err, false, req, res);
        return res.end();
      })
    })
  })
}
exports.affectTeacher_Course = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('teacher_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
    //check if you are a school admin 
  else if(req.user.access_level > req.app.locals.access_level.ADMIN_TEACHER)
    return res.status(400).send("Sorry you are not authorized");
  Course.findOne({_id:req.body.course_id},(err,course_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!course_exists) return res.status(400).send("Invalid data");
    else if(course_exists.teacher_list.indexOf(req.body.teacher_id) >=0){
      return res.end();
    }
    course_exists.update({$push:{teacher_list:req.body.teacher_id}},(err)=>{
      if(err) return log_err(err,false,req,res);
      return res.end();
    })
  })
}

exports.getPageEditQuota = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.render("./lost",{msg:errors[0].msg})
  Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
    if(err) return res.render("./lost",{msg:"Oops! Service not available"})
    else if(!course_exists) return res.render("./lost",{msg:"Sorry this course doesn't exists"});
    else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)// the course not yours
        return res.render("./lost",{msg:"Sorry, this course doesn't belong to you"})
    return res.render('course/edit_quota',{
      title:course_exists.name.toUpperCase()+" editing ...",
      course_id:req.params.course_id,
      course_name:course_exists.name,
      class_id:course_exists.class_id,
      course_weight:course_exists.weightOnReport,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })
};
exports.updateQuota =(req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('course_name', 'Invalid data').notEmpty();
  req.assert('classe_id', 'Invalid data').isMongoId();
  req.assert('test_quota', 'Test quota must be a number').isFloat();
  req.assert('exam_quota', 'Exam quota must be a number').isFloat();
  req.assert('course_weight', 'Course weight must be a number').isFloat();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  var async = require('async');
  var courses = [];
  if(Number(req.body.test_quota)+Number(req.body.exam_quota)!= Number(req.body.course_weight))
    return res.status(400).send("Course weight must be the sum of test and exam");
  async.series([(courseCb)=>{
    Course.find({class_id:req.body.classe_id,name:req.body.course_name,},(err, courses_list)=>{
      if(err) return courseCb(err);
      courses = courses_list;
      return courseCb();
    })
  },(treatCourse)=>{
    async.each(courses, (thisCourse, callBack)=>{
      Course.findOne({_id:thisCourse._id},(err, crs_details)=>{
        if(err) return callBack(err);
        crs_details.test_quota=req.body.test_quota,
        crs_details.exam_quota=req.body.exam_quota,
        crs_details.weightOnReport=req.body.course_weight
        crs_details.save((err)=>{
          if(err) return callBack(err);
          return callBack(null);
        })
      })
    },(err)=>{
      if(err) return treatCourse(err);
      return treatCourse(null);
    })
  }],(err)=>{
    if(err) return log_err(err,true,req,res);
    return res.end();
  })
}
exports.getListStudentsCourse = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
     if(err) return log_err(err,false,req,res);
     else if(!course_exists)
      return res.status(400).send("Invalid data");
     else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
      return res.status(400).send("Sorry this course doesn't belong to you");
    var async = require("async");
    var reponse={};
    async.parallel([
      (callback)=>{
        User
        .find({class_id: course_exists.class_id},
          {__v:0,email:0,password:0,profile_pic:0,gender:0,phone_number:0,
          class_id:0,school_id:0,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0})
        .exec((err, listUsers)=>{
          if(err) callback(err);
          reponse.class =listUsers;
          callback(null);
        })
      },
      (callback)=>{
        User
        .find({course_retake:course_exists._id},
          {__v:0,email:0,password:0,profile_pic:0,gender:0,phone_number:0,
          class_id:0,school_id:0,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0})
        .exec((err, listUsers)=>{
          if(err) callback(err);
          reponse.retaking =listUsers;
          callback(null);
        })
      },
      ],(err)=>{
        if(err) return log_err(err,false,req,res);
        return res.json(reponse);
      })
  })
}
exports.getPageStudentsOneCourse = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.render("./lost",{msg:errors[0].msg});
  Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!course_exists) return res.render("./lost",{msg:"Invalid data"});
    else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1) return res.render("./lost",{msg:"Sorry this course doesn't belong to you"});
    
    Classe.findOne({_id:course_exists.class_id},{currentTerm:1},(err, classe)=>{
      if(err) return log_err(err,true,req,res);
      else if(!classe) return res.render("./lost",{msg:"Invalid data"});
      return res.render('course/students_list',{
        title:course_exists.name.toUpperCase(),
        course_name :course_exists.name,
        actual_term :classe.currentTerm,
        course_id:req.params.course_id,
        pic_id:req.user._id,
        pic_name:req.user.name.replace('\'',"\\'")
        ,access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    })
  })
}
exports.setStudentRetake = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('URN', 'URN is invalid').notEmpty().len(1,20);
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  Course.findOne({_id:req.body.course_id},(err,course_exists)=>{
     if(err) return log_err(err,false,req,res);
     else if(!course_exists) return  res.status(400).send("Invalid data");
     else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
      return res.status(500).send("This course is not yours");
    User.findOne({URN:req.body.URN.trim().toLowerCase()},(err,user_exists)=>{
      console.log(" i found "+JSON.stringify(user_exists))
      if(err) return log_err(err,false,req,res);
      else if(!user_exists) return res.status(400).send("URN not recognized");
      else if(user_exists.course_retake.indexOf(req.body.course_id)>=0)
         return res.status(400).send("This student is already retaking the course");
      else if(String(user_exists.class_id) == String(course_exists.class_id))
        return res.status(400).send("This student is already following the course");
      else if(user_exists.access_level != req.app.locals.access_level.STUDENT)
         return res.status(400).send("This URN is not for a student");
      user_exists.update({$push:{course_retake:req.body.course_id}},(err)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })
    })
  })
}
exports.removeRetakeCourse = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('student_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg); 
  Course.findOne({_id:req.body.course_id},(err,course_exists)=>{
     if(err) return log_err(err,false,req,res);
     else if(!course_exists) return  res.status(400).send("Invalid data");
     else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
      return res.status(500).send("This course is not yours");
    User.findOne({_id:req.body.student_id},(err,user_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!user_exists) return res.status(400).send("User not recognized");
      var index =user_exists.course_retake.indexOf(req.body.course_id);
      if(index>-1)
        user_exists.course_retake.splice(index,1);
      user_exists.save((err)=>{
         if(err) return log_err(err,false,req,res);
         return res.end();
      })
   
    })
  });
}
exports.getPageMyMarks = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.render("./lost",{msg:errors[0].msg});

  Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!course_exists)  return res.render("./lost",{msg:"Invalid data"});
    else if(String(req.user.school_id) != String(course_exists.school_id))
      return res.render("./lost",{msg:"No chances to view this course"});
    Classe.findOne({_id:course_exists.class_id},{currentTerm:1,academic_year:1},(err, classe)=>{
      if(err) return log_err(err,true,req,res);
      else if(!classe)  return res.render("./lost",{msg:"Invalid data"});

      return res.render('course/students_marks',{
        title:course_exists.name.toUpperCase(),
        course_name :course_exists.name,
        actual_term :classe.currentTerm,
        course_id:req.params.course_id,
        pic_id:req.user._id,
        academic_year:classe.academic_year,
        pic_name:req.user.name.replace('\'',"\\'")
        ,access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    })
  })
}


// exports.getStudentPageMyMarks = (req,res,next)=>{
//   req.assert('course_id', 'Invalid data').isMongoId();
//   const errors = req.validationErrors();
//   if(errors) return res.render("./lost",{msg:errors[0].msg});

//   Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
//     if(err) return log_err(err,true,req,res);
//     else if(!course_exists)  return res.render("./lost",{msg:"Invalid data"});
//     else if(String(req.user.school_id) != String(course_exists.school_id))
//       return res.render("./lost",{msg:"No chances to view this course"});
//     return res.render('course/students_marks',{
//           title:course_exists.name.toUpperCase(),
//           course_name :course_exists.name,
//           actual_term :course_exists.currentTerm,
//           course_id:req.params.course_id,
//           pic_id:req.user._id,
//           pic_name:req.user.name.replace('\'',"\\'")
//           ,access_lvl:req.user.access_level,
//           csrf_token:res.locals.csrftoken, // always set this buddy
//       })
//   })

// }





exports.getMyMarks = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg)

  Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!course_exists)  return res.status(400).send("Invalid data")
    else if(String(req.user.school_id) != String(course_exists.school_id))
      return res.status(400).send("No chances for you to view this")
    else if(String(req.user.class_id)!= String(course_exists.class_id))
      return res.status(400).send("No chances for you to view this");

    Classe.findOne({_id: course_exists.class_id},(err,class_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!class_exists) return res.status(400).send('Invalid data');
      var currentYear =class_exists.academic_year;
      var reponses =[];
      Marks.find({student_id:req.user._id, course_id:course_exists._id,academic_year:currentYear},
      {isCorrected:0,school_id:0,class_id:0,level:0,uploaded_file:0, uploaded_text:0, uploaded_array:0,
        comment:0}
       ,(err,listContent)=>{
        if(err) return log_err(err,false,req,res);
        var async =require("async");
        async.each(listContent,(currentContent,cb_iteration)=>{
          Content.findOne({_id:currentContent.content_id},(err,content)=>{
            if(err) return cb_iteration(err);
            reponses.push({
              content_name:content.title,
              content_Total_marks:content.marks,
              content_type:currentContent.content_type,
              marks:currentContent.marks,
              percentage:currentContent.percentage,
              isCAT:currentContent.isCAT,
              isQuoted:currentContent.isQuoted
            });
            cb_iteration(null)
          })
        },(err)=>{
          if(err) return log_err(err,false,req,res);
          return res.json(reponses);
        })      
      })
    }) 
  })
}