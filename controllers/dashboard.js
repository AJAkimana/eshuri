const School = require('../models/School'),
      Classe = require('../models/Classe'),
      Course = require('../models/Course'),
      Content =require('../models/Content'),
      Library = require('../models/Library'),
      Marks =require('../models/MARKS'),
      University = require('../models/University'),
      Faculty = require('../models/Faculty'),
      Department =require('../models/Department'),
      Unit = require('../models/Unit'),
      Class = require('../models/Classe'),
      SchoolCourse = require('../models/SchoolCourse'),
      SchoolProgram = require('../models/SchoolProgram'),
      Util=require('../utils.js'),
      User = require('../models/User'),
      Finalist = require('../models/Finalist'),
      async=require('async'),
      ErrorLog=require('../models/ErrorLog'),
      log_err=require('./manage/errorLogger');

// return the initial page
exports.getPageSchools = function(req,res,next){
  return res.render('dashboard/add_school',{
    title:'Dashboard',
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    csrftokensrf_token:res.locals.csrftoken, // always set this buddy
  })
};
exports.getSchoolRedirection = (req, res, next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg});

  var superAdmin = req.app.locals.access_level.SUPERADMIN;
  var hod = req.app.locals.access_level.HOD;
  var accLvl = req.user.access_level;

  // if(accLvl != hod || accLvl != superAdmin) return res.redirect("back");
  var school_id = req.params.school_id;
  var async = require('async');
  var accLvl = req.user.access_level;
  var student = req.app.locals.access_level.STUDENT,
      admin = req.app.locals.access_level.ADMIN,
      teacher = req.app.locals.access_level.TEACHER,
      admin_teacher = req.app.locals.access_level.ADMIN_TEACHER;
  var students_male,students_fem,admins_male,admins_fem,teachers_male,teachers_fem,courses,programs,classes_ol,classes_al;
  var response={};
  School.findOne({_id:school_id},(err, school_exists)=>{
    if(err) return res.render("./lost",{msg:"Invalid data"});
    if(!school_exists) return res.render("./lost",{msg:"Unkown school"});
    async.parallel([(studentMaleCb)=>{
      User.count({school_id:school_id,isEnabled:true,access_level:student,gender:1},(err, students)=>{
        if(err) studentMaleCb(err);
        response.students_male=students;
        studentMaleCb();
      })
    },(studentFemCb)=>{
      User.count({school_id:school_id,isEnabled:true,access_level:student,gender:2},(err, students)=>{
        if(err) studentFemCb(err);
        response.students_fem=students;
        studentFemCb();
      })
    },(adminMaleCb)=>{
      User.count({school_id:school_id,isEnabled:true,access_level:{$lte:req.app.locals.access_level.ADMIN_TEACHER},gender:1},(err, admins)=>{
        if(err) adminMaleCb(err);
        response.admins_male=admins;
        adminMaleCb();
      })
    },(adminFemCb)=>{
      User.count({school_id:school_id,isEnabled:true,access_level:{$lte:req.app.locals.access_level.ADMIN_TEACHER},gender:2},(err, admins)=>{
        if(err) adminFemCb(err);
        response.admins_fem=admins;
        adminFemCb();
      })
    },(teacherMaleCb)=>{
      User.count({school_id:school_id,isEnabled:true,access_level:teacher,gender:1},(err, teachers)=>{
        if(err) teacherMaleCb(err);
        response.teachers_male=teachers;
        teacherMaleCb();
      })
    },(teacherFemaleCb)=>{
      User.count({school_id:school_id,isEnabled:true,access_level:teacher,gender:2},(err, teachers)=>{
        if(err) teacherFemaleCb(err);
        response.teachers_fem=teachers;
        teacherFemaleCb();
      })
    },(coursesCb)=>{
      SchoolCourse.count({school_id:school_id},(err, courses)=>{
        if(err) coursesCb(err)
        response.courses=courses;
        coursesCb();
      })
    },(programsCb)=>{
      SchoolProgram.count({school_id:school_id},(err, programs)=>{
        if(err) programsCb(err)
        response.programs=programs;
        programsCb();
      })
    },(OlevelCb)=>{
      Class.count({school_id:school_id, $or:[{option:{$exists:false}},{option:""}]},(err, ol_levels)=>{
        if(err) OlevelCb(err);
        response.classes_ol=ol_levels;
        OlevelCb();
      })
    },(AlevelCb)=>{
      Class.count({school_id:school_id, option:{$exists:true,$ne:""}},(err, a_levels)=>{
        if(err) AlevelCb(err);
        response.classes_al=a_levels;
        AlevelCb();
      })
    },(finalistCb)=>{
      Finalist.count({school_id:school_id},(err, finalits)=>{
        if(err) finalistCb(err);
        response.finalists=finalits;
        finalistCb();
      })
    }],(err)=>{
      if(err) return res.render('/lost', {msg:'Service not available'});
      return res.render('dashboard/director_dashboard',{
        title:'Dashboard',
        info:response,
        school_id:school_id,
        school_name:school_exists.name.toUpperCase(),
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),
        access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    })
  })
}
exports.getDashboardPage=(req,res,next)=>{
  var superAdmin = req.app.locals.access_level.SUPERADMIN;
      school_dir = req.app.locals.access_level.SA_SCHOOL;
      accLvl = req.user.access_level;
  if(accLvl == school_dir) return res.redirect('/school.dashboard.home/'+req.user.school_id);
  else return res.redirect("back");
}
//__________________________________________used to delete KWIZERA email__________________
exports.Ssg3nSAwdtAztx79dLGb=(req, res, next)=>{
  return res.render('dashboard/Ssg3nSAwdtAztx79dLGb',{
    title:'Dashboard',
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    csrf_token:res.locals.csrftoken, // always set this buddy
  })
}
exports.Ssg3nSAwdtAztx79dLGbPost=(req,res,next)=>{
  var school_id="595647b43e5ea452049f2aa4";
  var class_id="595cb10d83bef46aa6cc31be";
  var course_id="59ddc55849ff9ec922ad4de1";
  Course.find({class_id:class_id},(err, allterms)=>{
    if(err) return log_err(err, false, req, res);
    //alterms=allterms;
    return res.json(allterms);
    //console.log('term quantity:'+alterms.length)
    //if(alterms.length!=3) return res.status(400).send("This class does not have marks for all terms!");
  })
  // Library.find({school_id:school_id},(err, allBooks)=>{
  //   if (err) return log_err(err,false,req,res);
  //   return res.json(allBooks);
  // })
}
exports.getAllConts=(req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:"Invalid data"})
  Content.find({course_id:req.body.course_id},(err, contents)=>{
    if (err) return log_err(err,false,req,res);
    return res.json(contents);
  })
}
exports.Ssg3nSAwdtAztx79dLGbDelete=(req,res,next)=>{
  var userid = req.body.user_id;
  Library.findOne({_id:userid},(err, user)=>{
    if (err) return log_err(err,false,req,res);
    require("fs").unlink(user.bookName,(err)=>{
      if(err) return console.log(" FILE NOT DELETED !")
      Library.remove({_id:userid}, (err, ok)=>{
        if (err) return log_err(err,false,req,res);
        return res.end()
      })
    })
  })
}
exports.Ssg3nSAwdtAztx79dLGbUpdate=(req,res,next)=>{
  req.assert('content', 'Invalid data').isMongoId();
  req.assert('term', 'Term invalid').isInt();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:"Invalid data"})
  var content = req.body.content;
  var this_term=req.body.term;
  Content.updateMany({_id:content},{$set:{currentTerm:this_term}},(err, contets)=>{
    if (err) return log_err(err,false,req,res);
    Marks.updateMany({content_id:content},{$set:{currentTerm:this_term}},(err, ok)=>{
      if (err) return log_err(err,false,req,res);
      res.end();
    })
  })
  // User.findOne({_id:userid},(err, user)=>{
  //   if (err) return log_err(err,false,req,res);
  //   user.isEnabled=true;
  //   user.save({_id:userid}, (err, ok)=>{
  //     if (err) return log_err(err,false,req,res);
  //     return res.end()
  //   })
  // })
}
//______________________________________+__________________________________________________
exports.getHomePageDashboard = function(req,res,next){
  var link ="";
  switch(req.user.access_level){
    case req.app.locals.access_level.SUPERADMIN: break;
    case req.app.locals.access_level.HOD:
    case req.app.locals.access_level.SA_SCHOOL: 
    case req.app.locals.access_level.ADMIN_TEACHER:
    case req.app.locals.access_level.ADMIN: link="/dashboard.classe/"+req.user.school_id;break;
    default: break;
  }
  if(link!="") return res.redirect(link);

  return res.render('dashboard/general',{
    title:'Dashboard',
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    csrf_token:res.locals.csrftoken, // always set this buddy
  })
};
//
exports.getPageUniversities = function(req,res,next){
  return res.render('dashboard/add_university',{
    title:'Universities',
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
csrf_token:res.locals.csrftoken, // always set this buddy
  })
};

exports.getPageFaculties = function(req,res,next){
  // Check if the univ_id
  req.assert('univ_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:"Invalid data"})

  University.findOne({_id:req.params.univ_id},(err,univ_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!univ_exists) return res.render("./lost",{msg:"University not recognized"})
    return res.render('dashboard/add_faculty',{
      title:'Faculties',
      univ_name:univ_exists.name,
      univ_id:univ_exists._id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};
exports.getPageConfirmAccounts = function(req,res,next){
  //You must be the admin of the school to do it.
  School.findOne({_id:req.user.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.render("./lost",{msg:"Your school is not recognized"})
    return res.render('dashboard/confirm_accounts',{
      title:'Accounts confirmations',
      school_name:school_exists.name,
      term_name:school_exists.term_name,
      school_id:school_exists._id,
      level_student:req.app.locals.access_level.STUDENT,
      level_teacher:req.app.locals.access_level.TEACHER,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};

exports.getPageDepartments = function(req,res,next){
  // Check if the fac_id
  req.assert('fac_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})

  Faculty.findOne({_id:req.params.fac_id},(err,fac_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!fac_exists) return res.render("./lost",{msg:"Faculty not recognized"})
    return res.render('dashboard/add_department',{
      title:'Departments',
      fac_id:req.params.fac_id,
      fac_name:fac_exists.name,
      pic_id:req.user._id,
      univ_id:fac_exists.univ_id,      
      access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};
exports.getPageOptions = function(req,res,next){
  // Check if the fac_id
  req.assert('department_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})

  Department.findOne({_id:req.params.department_id},(err,department_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!department_exists) return res.render("./lost",{msg:"Department not recognized"})
    return res.render('dashboard/add_option',{
      title:'Options',
      department_id:req.params.department_id,
      department_name:department_exists.name,
      pic_id:req.user._id,
      univ_id:department_exists.univ_id,      
      access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};
exports.getPageTeachers = function(req,res,next){
  // Check if the school_id
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})

  School.findOne({_id:req.params.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.render("./lost",{msg:"School not recognized"})
    return res.render('dashboard/view_teacher',{
      title:'Teachers',
      school_name:school_exists.name,
      school_id:req.params.school_id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};
exports.getPageAdmins = function(req,res,next){
  // Check if the school_id
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})

  School.findOne({_id:req.params.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.render("./lost",{msg:"School not recognized"})
    return res.render('dashboard/add_admin',{
      title:'Adminsitrators',
      school_id:req.params.school_id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};
exports.getPageStudents = function(req,res,next){
  // Check if the school_id
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  Classe.findOne({_id:req.params.class_id},(err,class_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!class_exists) return res.render("./lost",{msg:"This class is not recognized"})
    School.findOne({_id:class_exists.school_id},(err, school_exists)=>{
      if(err) return log_err(err,true,req,res);
      else if(!school_exists) return res.render("./lost",{msg:"School not recognized"});
      return res.render('dashboard/view_student',{
        title:'Students',
        class_id:req.params.class_id,
        level:class_exists.level,
        classe_name:class_exists.name,
        academic_year:class_exists.academic_year,
        school_id:school_exists._id,
        term_name:school_exists.term_name,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    })
  })  
};

exports.studentSetPaid = (req,res,next)=>{
  req.assert('student_id', 'Invalid user').isMongoId();
  req.assert('hasPaid', 'Invalid user').isBoolean();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg)
  User.findOneAndUpdate(
    {_id:req.body.student_id,access_level:req.app.locals.access_level.STUDENT},
    {$set:{hasPaid:req.body.hasPaid}},
    {new:true},
    (err,userOk)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(userOk.hasPaid);
  })

}
exports.postNewAdmin = (req,res,next)=>{
  req.assert('email', 'Student\'s email is required').isEmail();
  req.assert('school_id', 'Data is invalid').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  School.findOne({_id:req.body.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.status(400).send(" This school is not recognized");
    // We test if this email is not yet used on this SCHOOL
    User.findOne({email:req.body.email,school_id:req.body.school_id},(err,user_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(user_exists) return res.status(400).send("Sorry this email is already on your school");
      // Comme le user existe deja alors 
      user_exists.access_level =2;
      user_exists.save((err)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })
    })
     
  })
}
// return the dashboard page
exports.getPageUpdateSchool = function(req,res,next){
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  School.findOne({_id:req.params.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.status(400).send('Sorry invalid data');
    return res.render('dashboard/add_classe',{
      title:'Classes',
      term_quantity:school_exists.term_quantity,
      school_id:req.params.school_id,
      term_name:school_exists.term_name,
      department_id:req.user.access_level==req.app.locals.access_level.HOD?req.user.department_id:null,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })  
};

exports.getPageClasse = (req,res,next)=>{
  req.assert('classe_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})

  var async = require("async");
  var teachers,myClass={},mySchool={};
  var go_back=false;
  async.series([
    (callback)=>{
      Classe.findOne({_id:req.params.classe_id},(err,class_exists)=>{
        if(err) callback(err);
        else if(!class_exists){go_back=true;callback()    }
        else{
          myClass=class_exists;
          callback();
        }
      })
    },
    (callback2)=>{
        School.findOne({_id:myClass.school_id},(err,school_exists)=>{
           if(err) callback2(err);
           else if(!school_exists){
             go_back=true;
             callback2();
            }
            else{
              mySchool=school_exists;
              callback2();
            }
        })
    },
    ],(err)=>{
      if(err) return log_err(err,true,req,res);
      else if(go_back) return res.redirect("back");
      return res.render('dashboard/add_course',{
        title:'Courses',
        classe_id:req.params.classe_id,
        school_id:myClass.school_id, // send the school_id
        classe_name: myClass.name,
        institution: mySchool.institution,
        academic_year:myClass.academic_year,
        currentTerm:myClass.currentTerm,

        school_name:mySchool.name,
        term_name:mySchool.term_name,
        term_quantity:mySchool.term_quantity,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    });  
}
exports.getPageRegisterCourse = (req,res)=>{
  var npgs = [];
  School.findOne({_id:req.params.school_id},(err, school_exists)=>{
    if (err) return log_err(err, true, req, res);
    //console.log('my n pages: '+req.app.locals.per_pages)
    npgs=req.app.locals.per_pages;
    return res.render('dashboard/register_course',{
      title:'Register courses',
      school_id:school_exists._id, // send the school_id
      school_name:school_exists.name,
      term_name:school_exists.term_name,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      n_pages:npgs,
      csrf_token:res.locals.csrftoken, // always set this buddy
    });
  }) 
}
exports.getDirectorStats=(req,res,next)=>{
  var async = require('async');
  var accLvl = req.user.access_level;
  var student = req.app.locals.access_level.STUDENT,
      admin = req.app.locals.access_level.ADMIN,
      teacher = req.app.locals.access_level.TEACHER,
      admin_teacher = req.app.locals.access_level.ADMIN_TEACHER;
  var students_male,students_fem,admins_male,admins_fem,teachers_male,teachers_fem,courses,programs,classes_ol,classes_al;
  var response={};

  async.parallel([(studentMaleCb)=>{
    User.count({school_id:req.user.school_id,isEnabled:true,access_level:student,gender:1},(err, students)=>{
      if(err) studentMaleCb(err);
      response.students_male=students;
      studentMaleCb();
    })
  },(studentFemCb)=>{
    User.count({school_id:req.user.school_id,isEnabled:true,access_level:student,gender:2},(err, students)=>{
      if(err) studentFemCb(err);
      response.students_fem=students;
      studentFemCb();
    })
  },(adminMaleCb)=>{
    User.count({school_id:req.user.school_id,isEnabled:true,$or:[{access_level:admin},{access_level:admin_teacher}],gender:1},(err, admins)=>{
      if(err) adminMaleCb(err);
      response.admins_male=admins;
      adminMaleCb();
    })
  },(adminFemCb)=>{
    User.count({school_id:req.user.school_id,isEnabled:true,$or:[{access_level:admin},{access_level:admin_teacher}],gender:2},(err, admins)=>{
      if(err) adminFemCb(err);
      response.admins_fem=admins;
      adminFemCb();
    })
  },(teacherMaleCb)=>{
    User.count({school_id:req.user.school_id,isEnabled:true,access_level:teacher,gender:1},(err, teachers)=>{
      if(err) teacherMaleCb(err);
      response.teachers_male=teachers;
      teacherMaleCb();
    })
  },(teacherFemaleCb)=>{
    User.count({school_id:req.user.school_id,isEnabled:true,access_level:teacher,gender:2},(err, teachers)=>{
      if(err) teacherFemaleCb(err);
      response.teachers_fem=teachers;
      teacherFemaleCb();
    })
  },(coursesCb)=>{
    SchoolCourse.count({school_id:req.user.school_id},(err, courses)=>{
      if(err) coursesCb(err)
      response.courses=courses;
      coursesCb();
    })
  },(programsCb)=>{
    SchoolProgram.count({school_id:req.user.school_id},(err, programs)=>{
      if(err) programsCb(err)
      response.programs=programs;
      programsCb();
    })
  },(OlevelCb)=>{
    Class.count({school_id:req.user.school_id, $or:[{option:null},{option:''}]},(err, ol_levels)=>{
      if(err) OlevelCb(err);
      response.classes_ol=ol_levels;
      OlevelCb();
    })
  },(AlevelCb)=>{
    Class.count({school_id:req.user.school_id, option:{$ne:null}},(err, a_levels)=>{
      if(err) AlevelCb(err);
      response.classes_al=a_levels;
      AlevelCb();
    })
  }],(err)=>{
    if(err) return log_err(err,false,req,res);
    console.log('Apis:'+JSON.stringify(response));
  })
}
exports.getPageDashboardStats =(req,res)=>{
  var async = require("async");
  var classes,users,courses,schools,univs,faculties,units,errors_num;
  async.parallel([
    (cb)=>{// GET THE COUNT - CLASSES
      Classe.count((err,quantity)=>{
        if(err) cb(err);
        classes = quantity;
        cb()
      })
    },
    (cb)=>{// GET THE COUNT - USERS
      User.count((err,quantity)=>{
        if(err) cb(err);
        users = quantity;
        cb();
      })
    },
    (cb)=>{// GET THE COUNT - Courses
      Course.count((err,quantity)=>{
        if(err) cb(err);
        courses = quantity;
        cb();
      })
    },
    (cb)=>{ // GET THE NUMBER SCHOOLS
      School.count({department_id:{$exists:false}},(err,quantity)=>{
        if(err) cb(err);
        schools = quantity;
        cb();
      })
    },
    (cb)=>{ // GET THE NUMBER UNIVERSITIES
      University.count((err,quantity)=>{
        if(err) cb(err);
        univs = quantity;
        cb();
      })
    },
    (cb)=>{ // GET THE FACULTIES COUNT
      Faculty.count((err,quantity)=>{
        if(err) cb(err);
        faculties = quantity;
        cb();
      })
    },
    (cb)=>{ // calculate number of units
      Unit.count((err,quantity)=>{
        if(err) cb(err);
        units = quantity;
        cb();
      })
    },
    (cb)=>{ // Calculate number of new accounts to validate
      User.count({school_id:req.user.school_id,isEnabled:false},(err,quantity)=>{
        if(err) cb(err);
        accounts_to_validate = quantity;
        cb();
      })
    },   
    (cb)=>{ // 
      ErrorLog.count({},(err,quantity)=>{
        if(err) cb(err);
        errors_num = quantity;
        cb();
      })
    },    
    ],(err)=>{
    if(err) return log_err(err,false,req,res);
    return res.send({
      univs:univs,
      faculties:faculties,
      schools:schools,
      classes:classes,
      courses:courses,
      units:units,
      users:users,
      errors_num:errors_num,
      toValidate:accounts_to_validate,
    })
  });
}
exports.getAvailableUniversities = (req,res,next)=>{
  University.find({},{__v:0},(err,list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(list);
  })
};
exports.getAccountsValidate_JSON =(req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  // req.assert('limit', 'Invalid data').isInt();
  const errors = req.validationErrors();
  if (errors) return log_err(errors,false,req,res);

  // User.find({school_id:req.body.school_id,isEnabled:false,isValidated:true},{__v:0,password:0,school_id:0,isValidated:0})
  User.find({school_id:req.body.school_id,isEnabled:false},{__v:0,password:0,school_id:0,isValidated:0})
  // .limit(req.body.limit)
  .exec((err,list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(list);
  })
}
exports.getAvailableFaculties = (req,res,next)=>{
  req.assert('univ_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(500).send(errors[0].msg);

  Faculty.find({univ_id:req.params.univ_id},{__v:0},(err,list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(list);
  })
};

exports.getAvailableDepartments = (req,res,next)=>{
  req.assert('faculty_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(500).send(errors[0].msg);

  Department.find({fac_id:req.params.faculty_id},{__v:0},(err,list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(list);
  })
};

exports.getAvailableOptions = (req,res,next)=>{
  req.assert('department_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(500).send(errors[0].msg);

  School.find({department_id:req.params.department_id,institution:1}
    ,{__v:0},(err,list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(list);
  })
};
exports.getAvailableClasses = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(500).send(errors[0].msg);

  Classe.find({school_id:req.params.school_id},{__v:0},(err,list)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(list);
  })
};

exports.confirmTeacherAccount = function(req,res,next){
  req.assert("teacher_id","Invalid data").isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(500).send(errors[0].msg);

  User.update({_id:req.body.teacher_id,school_id:req.user.school_id,},{$set:{isEnabled:true}},(err,ok)=>{
    if(err) return log_err(err,false,req,res);
    return res.end();
  })
}
exports.confirmStudentAccount = function(req,res,next){
  req.assert("student_id","Invalid data").isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(500).send(errors[0].msg);
  User.update(
    {_id:req.body.student_id,school_id:req.user.school_id,access_level:req.app.locals.access_level.STUDENT},
    {$set:{isEnabled:true}},(err,ok)=>{
    if(err) return log_err(err,false,req,res);
    return res.end();
  })  
}