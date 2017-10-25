const Faculty =require('../models/Faculty'),
      Department =require('../models/Department'),
      User =require('../models/User'),
      log_err=require('./manage/errorLogger');

exports.postNewFaculty =(req,res,next)=>{
  req.assert('name', 'The name is required').notEmpty();
  req.assert('univ_id', 'Data is invalid').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  new Faculty({
  	name:req.body.name,
    univ_id:req.body.univ_id,
  }).save((err)=>{
  	if(err) return log_err(err,false,req,res);
  	return res.end();
  })
}
exports.getFac_JSON =(req,res,next)=>{
  req.assert('univ_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Faculty
  .find({univ_id:req.body.univ_id},{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, fac_list){
    if(err) return log_err(err,false,req,res);
    return res.json(fac_list);
  })	
}

exports.removeFaculty =(req,res,next)=>{
	// Supprimer un school 
  req.assert('fac_id', 'Invalid data').isMongoId();
  req.assert('confirmPass', 'Super admin password is required to do this action').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.confirmPass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch) return res.status(400).send("Password is incorrect");
  // Check if ther is any depart inside
      Department.count({fac_id:req.body.fac_id},(err,number)=>{
      if(err) return log_err(err,false,req,res);
      else if(number>0)
        return res.status(400).send('Please remove first all the departments inside');
        Faculty
          .remove({_id:req.body.fac_id},function(err, ok){
            if(err) return log_err(err,false,req,res);
            return res.end(); // when OK
          })
      });
    })
  })  
  
}