const Classe =require('../models/Classe'),
      Course =require("../models/Course"),
      User =require("../models/User"),
      School = require('../models/School'),
      Mark = require('../models/MARKS'),
      Notification=require("../models/Notification"),
      Content=require('../models/Content'),
      log_err=require('./manage/errorLogger'),
      Finalist=require('../models/Finalist'),
      Util=require('../utils.js'),
      ObjectID = require('mongodb').ObjectID,
      SchoolProgram=require('../models/SchoolProgram'); 
/*
Une classe est par exemple S2MCE pour le sHigh school ou 3 rd Year in Universitites
*/

// Create a new classe
exports.postNewClass =(req,res,next)=>{
  var classLevel=req.body.level;
  req.assert('school_id', 'Invalid data').notEmpty().isMongoId();
  req.assert('class_teacher', 'Invalid data').notEmpty().isMongoId();
  req.assert('level', 'A level must be a number').isInt();
  req.assert('name', 'A name is required').notEmpty();
  req.assert('currentTerm', 'Sorry, specifiy a term').isInt();
  // if(classLevel<=3) 
    // req.assert('sub_level', 'Select sub level eg.:A,B...').isIn(['a','b','c','d']).notEmpty();
  if(classLevel>3) req.assert('option', 'Select option').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // Test if shool exixts
  School.findOne({_id:req.body.school_id},(err,school)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school) return res.status(500).send("This school doesn't exists");
    else if(req.body.currentTerm > school.term_quantity)
      return res.status(400).send("Sorry term must be lower to "+school.term_quantity);
    //check if the class doens t exists
    Classe.findOne({name:req.body.name.trim().toLowerCase(),school_id:req.body.school_id},(err,classe_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(classe_exists) return res.status(400).send("This class is already registered");
      //Now we will create the class
      req.body.option=req.body.option===null?'':req.body.option;
      req.body.sub_level=req.body.sub_level?req.body.sub_level:'';
      // console.log('Body: '+JSON.stringify(req.body));
      var newClass = new Classe({
        school_id:req.body.school_id,
        level:req.body.level,
        name:req.body.name,
        academic_year:Number(new Date().getFullYear())-2000,
        class_teacher:req.body.class_teacher,
        currentTerm:req.body.currentTerm,
        option:req.body.option,
        sub_level:req.body.sub_level,
      });      
      newClass.save((err)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })
    })    
  });
}

// recuperer le contenu des classe
exports.getClasses_JSON = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  var access_lvl = String(req.user.access_level);
  var superadmin = String(req.app.locals.access_level.SUPERADMIN);
  var school_id;
  if(access_lvl===superadmin) school_id=req.params.school_id;
  else{
    if(String(req.params.school_id)!=String(req.user.school_id))return res.status(400).send("This is not your school")
    school_id=req.user.school_id
  }
  if (errors) return res.status(400).send(errors[0].msg);
  Classe.find({school_id:school_id},{__v:0}).sort({name:1}).lean().exec((err,classes)=>{
    if(err) return log_err(err,false,req,res);
    var listClasses=[];
    var async =require('async');
    async.each(classes,(currentClass,cb)=>{
      // For each class, i count the number of students
      User.count({class_id:currentClass._id},(err,num)=>{
        if(err) return cb(err);
        currentClass.students=num
        cb();
      })
    },(err)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(classes);  
    })
  })
}
exports.getPageOneClasse = (req,res,next)=>{
  req.assert('classe_id', 'Invalid data').isMongoId();
  
  if(req.query.u||req.query.allow){
    req.assert('u', 'Invalid datau').isMongoId();
    req.assert('allow', 'Invalid data a').equals('true');
  }
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg});

  var date = new Date();
  var year = parseInt(date.getFullYear())-2000;
  var async = require('async');
  var classe={},school={},user={},class_name;
  if(!req.query.ay||req.query.ay<17||req.query.ay>year) return res.render("./lost",{msg:"Invalid data"});

  let query=req.query.u&&req.query.allow?'?ay='+req.query.ay+'&u='+req.query.u+'&allow=true':'?ay='+req.query.ay;
  async.series([(findClasse)=>{
    Classe.findOne({_id:req.params.classe_id},(err,classe_exists)=>{
      if(err) return findClasse('Service not available');
      else if(!classe_exists)  return findClasse('This class doesn\'t exists');
      classe = classe_exists;
      var first_letter=classe_exists.name.toLowerCase().charAt(0);
      class_name = first_letter==='s'?classe_exists.name:'s'+classe_exists.name;
      return findClasse(null);
    })
  },(findSchool)=>{
    School.findOne({_id:classe.school_id},(err,school_exists)=>{
      if(err) return findSchool('Service not available');
      else if(!school_exists)  return findSchool('This school doesn\'t exists');
      school = school_exists;
      return findSchool(null);
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
    var subHeader = user.name?user.name.replace('\'',"\\'")+'->'+class_name.toUpperCase():class_name.toUpperCase();
    return res.render('school/one_class_view',{
      title:class_name.toUpperCase(),
      school_id:classe.school_id,
      school_name:school.name,
      academic_year:req.query.ay,
      userid:req.query.u||'',
      subhead:subHeader,
      term_name:school.term_name,
      term_quantity:school.term_quantity,
      class_id:req.params.classe_id,
      query:query,
      currentTerm:classe.currentTerm,
      pic_id:req.user._id, access_lvl:req.user.access_level, pic_name:req.user.name.replace('\'',"\\'"),
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })
}
exports.getClassCourses = (req, res, next)=>{
  req.assert('class_id', 'Invalid data').isMongoId();
  if(req.query.u&&req.query.allow){
    req.assert('u', 'Invalid data u').isMongoId();
    req.assert('allow', 'Invalid data a').equals('true');
  }
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  Util.listCourses(req, (err, courses)=>{
    if(err) return res.status(400).send(err);
    if(!courses) return res.status(400).send('No courses listed');
    return res.json(courses);
  })
}
exports.getClasseToRepeat=(req,res,next)=>{
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var parametters = {};
  Classe.findOne({_id:req.params.class_id},(err, class_exists)=>{
    if(err) return log_err(err,false,req,res);
    if(!class_exists) return res.status(400).send("Unkown class");
    var level_class = Number(class_exists.level);
    if(class_exists.level>3) parametters = {level:level_class, school_id:req.user.school_id, option:class_exists.option};
    else parametters = {level:level_class, school_id:req.user.school_id, $or:[{option:null},{option:''}]};
    Classe.find(parametters, (err, classes)=>{
      if(err) return log_err(err,false,req,res);
      // console.log('LEVEL: '+next_class+' Classes:'+JSON.stringify(nextClasses))
      return res.json(classes);
    })
  })
}
exports.getNextClasses = (req, res, next)=>{
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var parametters = {};
  Classe.findOne({_id:req.params.class_id},(err, class_exists)=>{
    if(err) return log_err(err,false,req,res);
    if(!class_exists) return res.status(400).send("Unkown class");
    var next_class = Number(class_exists.level)+1;
    if(class_exists.level>3) parametters = {level:next_class, school_id:req.user.school_id, option:class_exists.option};
    else if(class_exists.level==3) parametters = {level:next_class, school_id:req.user.school_id};
    else parametters = {level:next_class, school_id:req.user.school_id, $or:[{option:null},{option:''}]};
    Classe.find(parametters, (err, nextClasses)=>{
      if(err) return log_err(err,false,req,res);
      // console.log('LEVEL: '+next_class+' Classes:'+JSON.stringify(nextClasses))
      return res.json(nextClasses);
    })
  })
}
exports.setStudentToRepeat = (req,res,next)=>{
  req.assert('class_id', 'Invalid data').isMongoId();
  req.assert('student_id', 'Invalid data').isMongoId();
  req.assert('level', 'Invalid data').isIn([1,2,3,4,5,6]);
  req.assert('new_class', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var new_class = req.body.new_class;
  var level = req.body.level;
  School.findOne({_id:req.user.school_id},(err, school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("This school doesn't exists ");
    Classe.findOne({_id:new_class,school_id:school_exists._id}, (err, class_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!class_exists)  return log_err(err,false,req,res);
      else if(class_exists.level!=level) return res.status(400).send("Invalid repeating class");
      User.findOne({_id:req.body.student_id,school_id:school_exists._id,class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT},(err, student_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!student_exists) return res.status(400).send("Unkown student");
        student_exists.class_id = class_exists._id;
        student_exists.prev_classes.push({class_id:req.body.class_id,academic_year:class_exists.academic_year});
        student_exists.save((err, done)=>{
          if(err) return log_err(err,false,req,res);
          // Save for user notification
          new Notification({
            user_id:req.user._id,
            user_name:req.user.name,
            content:req.user.name+" has changed your class to S"+class_exists.name+". Keep it up, I know can make it. SUCCESS!!!",
            school_id:school_exists._id,
            class_id:class_exists._id,
            dest_id:student_exists._id,
            isAuto:false
          }).save((err)=>{
            if(err) return log_err(err,false,req,res);
            res.end();
          })
        })
      })
    })
  })
}
exports.getToNextClass = (req,res,next)=>{
  req.assert('class_id', 'Invalid data').isMongoId();
  req.assert('student_id', 'Invalid data').isMongoId();
  req.assert('level', 'Invalid data').isIn([1,2,3,4,5,6]);
  if(req.body.new_class!=="fin") req.assert('new_class', 'Invalid data new class').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var new_class = req.body.new_class;
  var level = req.body.level,
      next_level = Number(level)+1,
      finalist = Number(level)==3||Number(level)==6?true:false;
  // Check if user is allowed to be finalist
  // if(new_class=="fin"&&()) 
  School.findOne({_id:req.user.school_id},(err, school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("This school doesn't exists ");
    if(new_class!=="fin"){
      Classe.findOne({_id:new_class,school_id:school_exists._id}, (err, class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists)  return log_err(err,false,req,res);
        else if(class_exists.level!=next_level) return res.status(400).send("Invalid next class");
        User.findOne({_id:req.body.student_id,school_id:school_exists._id,class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT},(err, student_exists)=>{
          if(err) return log_err(err,false,req,res);
          else if(!student_exists) return res.status(400).send("Unkown student");
          student_exists.class_id = class_exists._id;
          student_exists.prev_classes.push({class_id:req.body.class_id,academic_year:class_exists.academic_year});
          student_exists.save((err, done)=>{
            if(err) return log_err(err,false,req,res);
            // Save for user notification
            new Notification({
              user_id:req.user._id,
              user_name:req.user.name,
              content:req.user.name+" has changed your class to S"+class_exists.name+". You are welcome into next level. SUCCESS!!!",
              school_id:school_exists._id,
              class_id:class_exists._id,
              dest_id:student_exists._id,
              isAuto:false
            }).save((err)=>{
              if(err) return log_err(err,false,req,res);
              res.end();
            })
          })
        })
      })
    }
    else{
      // if(!finalist) return res.status(400).send("This student must not be a finalist");
      User.findOne({_id:req.body.student_id,school_id:school_exists._id,class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT},(err, student_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!student_exists) return res.status(400).send("Unkown student");
        student_exists.class_id = null;
        student_exists.prev_classes.push({class_id:req.body.class_id,academic_year:req.body.academic_year});
        student_exists.save((err, done)=>{
          if(err) return log_err(err,false,req,res);
          new Finalist({
            school_id:school_exists._id,
            class_id:req.body.class_id,
            student_id:student_exists._id,
            academic_year:req.body.academic_year,
          }).save((err)=>{
            if(err) return log_err(err,false,req,res);
            // Save for user notification
            new Notification({
              user_id:req.user._id,
              user_name:req.user.name,
              content:"You are finalist at "+school_exists.name.toUpperCase()+". SUCCESS!!!",
              school_id:school_exists._id,
              // class_id:class_exists._id,
              dest_id:student_exists._id,
              isAuto:false
            }).save((err)=>{
              if(err) return log_err(err,false,req,res);
              res.end();
            })
          })
        })
      })
    }
  })
}
exports.returnToPreviousClass = (req,res,next)=>{
  req.assert('student_id', 'Invalid data st').isMongoId();
  // req.assert('level', 'Invalid data lv').isIn([1,2,3,4,5,6]);
  req.assert('new_class', 'Invalid data new class').isMongoId();
  if(req.body.class_id) req.assert('class_id', 'Invalid data cl').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var new_class = req.body.new_class;
  var async=require('async');
  var parametters = {}
  if(req.body.class_id) parametters={_id:req.body.student_id,school_id:req.user.school_id,class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT};
  else parametters={_id:req.body.student_id,school_id:req.user.school_id,class_id:null,access_level:req.app.locals.access_level.STUDENT}

  School.findOne({_id:req.user.school_id},(err, school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("This school doesn't exists ");
    Classe.findOne({_id:new_class,school_id:school_exists._id}, (err, class_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!class_exists)  return log_err(err,false,req,res);

      User.findOne(parametters,(err, student_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!student_exists) return res.status(400).send("Unkown student");
        var prevClassIndex = student_exists.prev_classes[0]['class_id']!==undefined?student_exists.prev_classes.findIndex(x=>x.class_id==new_class):student_exists.prev_classes.indexOf(new_class);
        // console.log('Prev class:',student_exists.prev_classes[0]['class_id'])
        if(prevClassIndex===-1){
          return res.status(400).send("Service isn't available");
        }
        var newClasses = [];
        async.each(student_exists.prev_classes, (thisClasse, callBack)=>{
          if(thisClasse.class_id!=new_class) newClasses.push({class_id:new_class,academic_year:class_exists.academic_year});
          return callBack(null);
        },(err)=>{
          if(err) return log_err(err,false,req,res);
          student_exists.class_id = class_exists._id;
          student_exists.prev_classes = newClasses;
          student_exists.save((err)=>{
            if(err) return log_err(err,false,req,res);
            if(!req.body.class_id){
              Finalist.findOne({student_id:req.body.student_id},(err, finalist)=>{
                if(err) return log_err(err,false,req,res);
                finalist.remove((err)=>{
                  if(err) return log_err(err,false,req,res);
                  return res.end();
                })
              })
            } else return res.end();
          })
        })
      })
    })
  })
}
exports.setAcYearOfRepeat = (req,res)=>{
  req.assert('class_id', 'Invalid data1').isMongoId();
  req.assert('student_id', 'Invalid data2').isMongoId();
  req.assert('classes', 'Invalid data3').isArray(); // not sure
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  var async = require('async');
  User.findOne({_id:req.body.student_id,class_id:req.body.class_id},(err, student)=>{
    if(err) return res.status(400).send('Service not available');
    if(!student) return res.status(400).send('User does not exist');
    
    var studentClasses = [];
    async.eachSeries(req.body.classes, (current, callBack)=>{
      if(!current.class_id) return callBack('Invalid data 4');
      else if(!current.academic_year) return callBack('Set academic year');
      else if(current.academic_year>19||current.academic_year<17){
        return callBack('Set Invalid academic year');
      }
      studentClasses.push({class_id:current.class_id,academic_year:current.academic_year});

      callBack(null);
    },(err)=>{
      if(err) return res.status(400).send(err);

      student.prev_classes = studentClasses;
      student.save((err, ok)=>{
        if(err) log_err(err,false,req,res);
        return res.end();
      })
    })
  })
}
exports.getClasses_JSON_For_Report = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // else if(String(req.body.school_id)==String(req.user.school_id))
  //   return res.status(400).send("This is not your school")
  Classe.find({school_id:req.params.school_id},{__v:0})
  .sort({name:1})
  .exec((err,classes)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(classes);
  })
}

exports.getClasses_JSONConfirm = (req,res,next)=>{
  req.assert('school_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // else if(String(req.body.school_id)==String(req.user.school_id))
  //   return res.status(400).send("This is not your school")
  Classe.find({school_id:req.params.school_id},{__v:0})
  .sort({name:1})
  .exec((err,classes)=>{
    if(err) return log_err(err,false,req,res);
    var listClasses=[];
    var async =require('async');
    async.each(classes,(currentClass,cb)=>{
      // For each class, i count the number of students
      User.count({class_id:currentClass._id,isEnabled:false,access_level:req.app.locals.access_level.STUDENT},(err,num)=>{
        if(err) return cb(err);
        listClasses.push({_id:currentClass._id, name:currentClass.name,level:currentClass.level,currentTerm:currentClass.currentTerm,academic_year:currentClass.academic_year,
          students:num});
        cb();
      })

    },(err)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(listClasses);  
    })
  })
}
// Modifier un class
exports.editClasse = (req, res, next)=>{
  var classLevel=req.body.level;
  req.assert('classe_id', 'Invalid data').isMongoId().notEmpty();
  req.assert('name', 'A name is required').notEmpty();
  req.assert('level', 'Type valid level').notEmpty().isIn([1,2,3,4,5,6]);
  if(classLevel<=3) 
    req.assert('sub_level', 'Specifiy sub level eg.:A,B...').isIn(['a','b','c','d']).notEmpty();
  else req.assert('option', 'Specifiy option').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //Chech if class name if exit in that school
  // req.body.name=req.body.name.toLowerCase();
  req.body.option=req.body.option?req.body.option.trim().toLowerCase():'';
  req.body.sub_level=req.body.sub_level?req.body.sub_level.trim().toLowerCase():'';
  SchoolProgram.findOne({school_id:req.user.school_id,abbreviation:req.body.option},(err, name_exist)=>{
    if(err) return log_err(err,false,req,res);
    if(!name_exist&&(classLevel>3)) return res.status(400).send("Name not match any school program");
    //Check if the new name will not conflict to the other name
    Classe.findOne({school_id:req.user.school_id,name:req.body.name.trim().toLowerCase()},(err, class_exist)=>{
      if(err) return log_err(err,false,req,res);
      console.log('class exist: '+JSON.stringify(class_exist))
      if(class_exist && class_exist._id!=req.body.classe_id) return res.status(400).send("There class with the same informations");
      //Find that class and update it
      Classe.findOne({school_id:req.user.school_id,_id:req.body.classe_id},(err, this_classe)=>{
        if(err) return log_err(err,false,req,res);
        if(!this_classe) return res.status(400).send("Unkown class");
        this_classe.name=req.body.name;
        this_classe.level=req.body.level;
        this_classe.option=req.body.option;
        this_classe.sub_level=req.body.sub_level;
        this_classe.save((err, ok)=>{
          if(err) return log_err(err,false,req,res);
          return res.end();
        })
      })
    })
  })
}
// Supprimer un classe 
exports.removeClasse = function(req,res,next){ // D
  req.assert('classe_id', 'Invalid data').isMongoId();
  req.assert('confirmPass', 'Super admin password is required to do this action').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // il faut verifier si y apas de cours 
  var async =require('async');
  var course_number=0,user_number=0;
  // il faut verifier si y a pas de people inside..
  async.parallel([
    (cb)=>{
      Course.count({class_id:req.body.classe_id},(err,num)=>{
        if(err) return cb(err);
        course_number = num;
        cb();
      })
    },
    (cb)=>{
      User.count({class_id:req.body.classe_id},(err,num)=>{
        if(err) return cb(err);
        user_number = num;
        cb();
      })
    }
    ],(err)=>{
      if(err) return res.status(400).send(err);
      else if(user_number>0)
      return res.status(400).send('There is still '+user_number+' users in this class,<br> Remove them first');
      else if(course_number>0)
      return res.status(400).send('There is still '+course_number+' courses in this class,<br> Remove them first');
      Classe
        .remove({_id:req.body.classe_id},function(err, classes){
          if(err) return log_err(err,false,req,res);
          return res.end(); // when OK
      })
  });   
}
exports.updateSettings =function(req,res,next){ // D
  // console.log(' DATA is '+JSON.stringify(req.body));
  req.assert('academic_year', 'Invalid academic year').isInt();
  req.assert('currentTerm', 'Invalid term').isInt();
  req.assert('class_id', 'Invalid class').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  School.findOne({_id:req.user.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("School not recognized");
    else if(req.body.currentTerm> school_exists.term_quantity)
       return res.status(400).send("Invalid data");
    Classe.findOne({_id:req.body.class_id,school_id:req.user.school_id},(err,class_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!class_exists) return res.status(400).send("Invalid data");
      else if(req.body.academic_year<=2000) return res.status(400).send("Invalid academic year");

      class_exists.academic_year =Number(req.body.academic_year)-2000;
      class_exists.currentTerm =req.body.currentTerm;
      class_exists.save((err)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })
    })
  }) 
}
exports.setClassTeacher =function(req,res,next){ // D
  // console.log(' DATA is '+JSON.stringify(req.body));
  req.assert('teacher_id', 'Invalid data').isMongoId();
  req.assert('class_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var allClasses=[],selectedClasses=[],nsClasses=[];
  var newClass='';
  var async = require('async');
  School.findOne({_id:req.user.school_id},(err,school_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!school_exists)  return res.status(400).send("School not recognized");
    Classe.findOne({school_id:req.user.school_id, class_teacher:req.body.teacher_id},(err, isClassTeacher)=>{
      if(err) return log_err(err,false,req,res);
      if(isClassTeacher) return res.status(400).send("Sorry this teacher is class teacher in another class");
      Classe.findOne({_id:req.body.class_id,school_id:school_exists._id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send("Invalid data");
        //else if(class_exists.class_teacher) return res.status(400).send("Invalid data");
        class_exists.class_teacher =req.body.teacher_id;
        class_exists.save((err)=>{
          if(err) return log_err(err,false,req,res);
          return res.end();
        })
      })
    })
  }) 
}