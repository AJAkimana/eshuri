const Classe =require('../models/Classe'),
      Course =require("../models/Course"),
      User =require("../models/User"),
      School = require('../models/School'),
      log_err=require('./manage/errorLogger'); 
/*
Une classe est par exemple S2MCE pour le sHigh school ou 3 rd Year in Universitites
*/

// Create a new classe
exports.postNewClass =(req,res,next)=>{
  req.assert('school_id', 'Invalid data').notEmpty().isMongoId();
  req.assert('level', 'A level must be a number').isInt();
  req.assert('name', 'A name is required').notEmpty();
  req.assert('currentTerm', 'Sorry, specifiy a term').isInt();
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
      var newClass = new Classe({
        school_id:req.body.school_id,
        level:req.body.level,
        name:req.body.name,
        academic_year:Number(new Date().getFullYear())-2000,
        currentTerm:req.body.currentTerm,
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
  if (errors) return res.status(400).send(errors[0].msg);
  // else if(String(req.body.school_id)==String(req.user.school_id))
  //   return res.status(400).send("This is not your school")
  Classe.find({school_id:req.params.school_id},{__v:0})
  .sort({name:-1})
  .exec((err,classes)=>{
    if(err) return log_err(err,false,req,res);
    var listClasses=[];
    var async =require('async');
    async.each(classes,(currentClass,cb)=>{
      // For each class, i count the number of students
      User.count({class_id:currentClass._id},(err,num)=>{

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