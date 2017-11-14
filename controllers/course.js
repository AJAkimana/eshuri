const Course =require('../models/Course'),
      SchoolCourse = require('../models/SchoolCourse'),
      User =require('../models/User'),
      Unit =require('../models/Unit'),
      Classe =require('../models/Classe'),
      Content=require('../models/Content'),
      Marks=require('../models/MARKS'),
      School =require('../models/School'),
      log_err=require('./manage/errorLogger');
/*
A course is given by only one teacher and that teacher is set by the Admin of the School
*/
// return the initial page
exports.getPageOneCourse = function(req,res,next){
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.render("./lost",{msg:"Invalid data"})
  var response ={},temoin=false;
  // Check if the course exists
  Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!course_exists) return res.render("./lost",{msg:"This course is not recognized"})
      // if he is a student and it is not your class or your are not retaking it !!
    
    else if(req.user.access_level == req.app.locals.access_level.STUDENT){
      temoin =true;
      if(String(course_exists.class_id)!= String(req.user.class_id) && 
        req.user.course_retake.indexOf(String(course_exists._id))==-1)
        return res.render("./lost",{msg:"You don't have the right to view this course"});
    }
    else if(req.user.access_level == req.app.locals.access_level.TEACHER){
      temoin =true;
      if(course_exists.teacher_list.indexOf(String(req.user._id))==-1)
        return res.render("./lost",{msg:"This course doesn't belong to you"});
    }
    //si ce nest pas klk un ki a un droit d acces pas infrie a celui d un teacher et sur la meme ecole donc pas ACCPTER
    else if((req.user.access_level <= req.app.locals.access_level.TEACHER)){
      temoin =true;
      if(String(req.user.school_id)!= String(course_exists.school_id))
       return res.render("./lost",{msg:"You are not authorized"});
    }
    if(!temoin) // cad si il n est ni teacher ni student ni inferieur.. then just reject
     return res.render("./lost",{msg:"You are not authorized to view this content"}); 
    //Get the school Info
    School.findOne({_id:course_exists.school_id},(err,school_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!school_exists) return res.render("./lost",{msg:"This school was not recognized"})
      //Get Teacher's informations the first course
      User.findOne({_id:course_exists.teacher_list[0]}, (err,teacher_exists)=>{ //no pbm here
        if(err) return log_err(err,true,req,res);
        else if(!teacher_exists) return res.render("./lost",{msg:"Invalid data"});
        return res.render('course/display_course_content',{
          title:course_exists.name.toUpperCase(),
          term_name:school_exists.term_name,
          teacher_name:teacher_exists.name,
          school_name:school_exists.name,
          course_name :course_exists.name,
          actual_term :course_exists.currentTerm,
          course_id:req.params.course_id,
          pic_id:req.user._id,
          pic_name:req.user.name.replace('\'',"\\'"),
          access_lvl:req.user.access_level,
          csrf_token:res.locals.csrftoken, // always set this buddy
        })
      })
    })
  })
}
// Create a new course
exports.postNewCourse = function(req,res,next){
  req.assert('name', 'The name is required').notEmpty();
  req.assert('code', 'The code name of the course is required').notEmpty();
  req.assert('class_id', 'Choose a class').isMongoId();
  req.assert('teacher_id', 'Choose a teacher').isMongoId();
  req.assert('school_id', 'Invalid data').isMongoId();
  req.assert('currentTerm', 'Choose a term/semester').notEmpty();
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
        currentTerm:req.body.currentTerm,
        attendance_limit:0, // initially 0
      })
      nouveauCourse.save(function(err){
        if(err) return log_err(err,false,req,res);
        return res.end();     
      })
    }); 
  })   
}
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
// recuperer le contenu des course
exports.getCourses_JSON = function(req,res,next){ // R
  req.assert('school_id', 'Invalid data').isMongoId();
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  Course
  .find({school_id:req.body.school_id,class_id:req.body.class_id},
    {__v:0,school_id:0,})
  // .limit(100)
  .sort({name:1})
  .exec(function(err, courses){

    if(err) return log_err(err,false,req,res);
    return res.json(courses);
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
    console.log('School courses: ______________'+school_courses);
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
exports.changeCourseName = (req, res, next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('class_id', 'Invalid data').isMongoId();
  req.assert('course_name', 'Enter course name please').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  Course.findOne({_id:req.body.course_id, class_id:req.body.class_id},(err, course_exists)=>{
    if (err) return log_err(err, false, req, res);
    else if(String(course_exists.name)==String(req.body.course_name)) return res.status(400).send("Class does not allowed 2 courses with same names");
    else if(!course_exists) return res.status(400).send("Invalid data");
    else if(String(req.user.school_id)!= String(course_exists.school_id)) return res.status(400).send("Not authorized to do this");
      console.log(String(req.user.school_id)+' and '+String(course_exists.school_id))

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
    if(err) return log_err(err,true,req,res);
    else if(!course_exists) return res.render("./lost",{msg:"Sorry this course doesn't exists"});
    else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)// the course not yours
        return res.render("./lost",{msg:"Sorry, this course doesn't belong to you"})
    return res.render('course/edit_quota',{
      title:course_exists.name.toUpperCase()+" editing ...",
      course_id:req.params.course_id,
      course_name:course_exists.name,
      course_weight:course_exists.weightOnReport,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })
};
exports.updateQuota =(req,res,next)=>{
  var maxWeight = req.body.test_quota + req.body.exam_quota;
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('test_quota', 'Test quota must be a number').isFloat();
  req.assert('exam_quota', 'Exam quota must be a number').isFloat();
  req.assert('course_weight', 'Course weight must be a number').isFloat();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  else if(Number(req.body.test_quota)+Number(req.body.exam_quota)!= Number(req.body.course_weight))
    return res.status(400).send("Course weight must be the sum of test and exam");
   Course.findOne({_id:req.body.course_id},(err,course_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!course_exists) return res.render("./lost",{msg:"Sorry this course doesn't exists"});
    else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1) return res.render("./lost",{msg:"Sorry, this course doesn't belong to you"});
    course_exists.test_quota=req.body.test_quota;
    course_exists.exam_quota=req.body.exam_quota;
    course_exists.weightOnReport=req.body.course_weight;
    course_exists.save((err)=>{
      if(err) return log_err(err,false,req,res);
      var reponse = {
        test_quota:course_exists.test_quota,
        exam_quota:course_exists.exam_quota,
        course_weight:course_exists.weightOnReport,
      };
      return res.json(reponse);  
    })
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
     else if(!course_exists)
      return res.render("./lost",{msg:"Invalid data"});
     else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
      return res.render("./lost",{msg:"Sorry this course doesn't belong to you"});
     return res.render('course/students_list',{
          title:course_exists.name.toUpperCase(),
          course_name :course_exists.name,
          actual_term :course_exists.currentTerm,
          course_id:req.params.course_id,
          pic_id:req.user._id,
          pic_name:req.user.name.replace('\'',"\\'")
          ,access_lvl:req.user.access_level,
          csrf_token:res.locals.csrftoken, // always set this buddy
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
    return res.render('course/students_marks',{
          title:course_exists.name.toUpperCase(),
          course_name :course_exists.name,
          actual_term :course_exists.currentTerm,
          course_id:req.params.course_id,
          pic_id:req.user._id,
          pic_name:req.user.name.replace('\'',"\\'")
          ,access_lvl:req.user.access_level,
          csrf_token:res.locals.csrftoken, // always set this buddy
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