const Department =require('../models/Department'),
      School =require('../models/School'),
      User =require('../models/User'),
      log_err=require('./manage/errorLogger');

exports.postNewDepartment =(req,res,next)=>{
  req.assert('name', 'The name is required').notEmpty();
  req.assert('univ_id', 'Data is invalid').isMongoId();
  req.assert('fac_id', 'Data is invalid').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  new Department({
  	name:req.body.name,
    fac_id:req.body.fac_id,
    univ_id:req.body.univ_id,
  }).save((err)=>{
  	if(err) return log_err(err,false,req,res);
  	return res.end();
  })
}
exports.getDepartment_JSON =(req,res,next)=>{
  req.assert('fac_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Department
  .find({fac_id:req.body.fac_id},{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, fac_list){
    if(err) return log_err(err,false,req,res);
    return res.json(fac_list);
  })	
}

exports.removeDepartment =(req,res,next)=>{
	// Supprimer un school 
  req.assert('department_id', 'Invalid data').isMongoId();
  req.assert('confirmPass', 'Super admin password is required to do this action').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.confirmPass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch) return res.status(400).send("Password is incorrect");
      // Here check if there is any Option(school) inside
       School.count({department_id:req.body.department_id},(err,number)=>{
          if(err) return log_err(err,false,req,res);
          else if(number>0) return res.status(400).send('Please remove first all the options inside');
          Department
            .remove({_id:req.body.department_id},function(err, ok){
              if(err) return log_err(err,false,req,res);
              return res.end(); // when OK
            })
        })
    })
  })          
}
exports.getPageChooseOption =(req,res,next)=>{
  req.assert('department_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  
  Department.findOne({_id:req.user.department_id},(err,depart_exists)=>{
  if(err)return log_err(err,false,req,res);
  else if(!depart_exists) return res.status(400).send("Invalid input");
  
  return res.render('dashboard/choose_option',{
    title:"Choose your option",
    department_id:depart_exists._id,
    pic_id:req.user._id,
    pic_name:req.user.name.replace('\'',"\\'"),
    access_lvl:req.user.access_level,
    csrf_token:res.locals.csrftoken, // always set this buddy
  })
  })
}

exports.setNewOption =(req,res,next)=>{
  req.assert('option_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  School.findOne({_id:req.params.option_id,department_id:req.user.department_id},(err,option_exists)=>{
    if(err)return log_err(err,false,req,res);
    else if(!option_exists) return res.status(400).send("Invalid input");
    // sinon we change now the currentOption
    req.session.currentOption=option_exists._id;
    req.session.save(); 
    return res.end();
  })
}