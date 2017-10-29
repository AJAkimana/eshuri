const University =require('../models/University'),
      Faculty =require('../models/Faculty'),
      User =require('../models/User'),
      log_err=require('./manage/errorLogger');

exports.postNewUniversity =(req,res,next)=>{
  req.assert('name', 'The name is required').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  new University({
  	name:req.body.name
  }).save((err)=>{
  	if(err) return log_err(err,false,req,res);
  	return res.end();
  })
}
exports.getUniv_JSON =(req,res,next)=>{
  University
  .find({},{__v:0})
  // .limit(100)
  // .sort({date:1})
  .exec(function(err, univ_list){
    if(err) return log_err(err,false,req,res);
    return res.json(univ_list);
  })	
}

exports.removeUniversity =(req,res,next)=>{
	// Supprimer un school 
  req.assert('univ_id', 'Invalid data').isMongoId();
  req.assert('confirmPass', 'Super admin password is required to do this action').notEmpty();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // console.log(" Pour le moment nimporte ki px supprimer le school")
  User.findOne({_id:req.user._id},(err,user_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!user_exists) return res.status(400).send("Invalid data");
    user_exists.comparePassword(req.body.confirmPass,req.user.email, (err, isMatch) => {
      if(err) return log_err(err,false,req,res);
      else if(!isMatch) return res.status(400).send("Password is incorrect");
      // Before removing the University check if there is any Faculty
      // console.log('terera Hanze------------------------0')
      Faculty.count({univ_id:req.body.univ_id},(err,number)=>{
        // console.log('terera Hanze------------------------'+number)
        if(err) return log_err(err,false,req,res);
        else if(number>0)
          return res.status(400).send('Please remove first all the faculties inside');
        // Sinon terera Hanze
        // console.log('terera Hanze------------------------')
        University
        .remove({_id:req.body.univ_id},function(err, ok){
          if(err) return log_err(err,false,req,res);
          return res.end(); // when OK
        })
      })
    })

  })
}