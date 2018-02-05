const Unit =require('../models/Unit'),
      Course =require('../models/Course'),
      Notification =require("../models/Notification"),
      Content =require('../models/Content'),
      log_err=require('./manage/errorLogger');
/*
Quizzes, tests, assessments and assignements belongs to a Unit
*/

// Create a new unit
exports.postNewUnit = function(req,res,next){
  req.assert('title', 'A title is required').notEmpty();
  req.assert('description', 'A small description is required').notEmpty().len(1,140);
  req.assert('course_id', 'Required data not given').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //First check if the course exists
  Course.findOne({_id:req.body.course_id},(err,course_exists)=>{
    var isNotYourCourse =course_exists.teacher_list.indexOf(String(req.user._id))==-1?true:false
    if(err) return log_err(err,false,req,res);
    else if(!course_exists) return res.status(400).send("This course is not recognized !");
    // Check if This unit name is already registered   
    else if(String(req.user.school_id)!=String(course_exists.school_id))
      return res.status(400).send("Sorry, you are not authorized");
    else if(isNotYourCourse)
      return res.status(400).send("This course is not yours");
    Unit.checkExistence(req.body,(err,unit_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(unit_exists) return res.status(400).send("This unit name is already taken");
      // Otherwise we save the course
      let nouveauUnit = new Unit({
        title:req.body.title,
        description:req.body.description,
        course_id:req.body.course_id,
      })
      nouveauUnit.save(function(err){
        if(err) return log_err(err,false,req,res);
        new Notification({
          user_id:req.user._id,
          user_name:req.user.name,
          content: req.user.name+" has added a new unit "+req.body.title+" in "+course_exists.name+
          ":=>"+req.body.description,
          class_id:req.user.class_id||null,
          school_id:req.user.school_id,
          isAuto:false,             
        }).save((err)=>{
          if(err) console.log(" You have to log "+err)
        })
        return res.end();          
      })
    })
  })
}
// recuperer le contenu des unit
exports.getUnit_JSON = function(req,res,next){ // R
  req.assert('course_id', 'Invalid data').isMongoId();
  req.assert('academic_year','Invalid data').isInt();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  Unit
  .find({course_id:req.body.course_id},{__v:0,description:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, units){
    if(err) return log_err(err,false,req,res);
    // console.log(" --->"+JSON.stringify(units));
    return res.json(units);
  })
}
// Supprimer un unit 
exports.removeUnit = function(req,res,next){ // D
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors)  return res.status(400).send(errors[0].msg);
  Content.count({unit_id:req.body.unit_id},(err,num)=>{
    if(err) return log_err(err,false,req,res);
    else if(num >0)
      return res.status(400).send("There is "+num+" contents in this unit, delete them first");
    Unit
    .remove({_id:req.body.unit_id},function(err, units){
      if(err) return log_err(err,false,req,res);
      return res.end(); // when OK
    })
  })
  
}
