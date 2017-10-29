const log_err=require('./manage/errorLogger'),
      User = require('../models/User'),
      Parenting=require('../models/Parenting');

exports.getParentPage = (req,res,next)=>{
    res.render('info/parent',{
    title: 'Parenting page',
    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
    csrf_token:res.locals.csrftoken,
  });
}

exports.postRequestChild=(req,res,next)=>{
  req.assert('student_urn', 'Invalid data').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //Check if student exists
  User
  .findOne({URN:req.body.student_urn.toLowerCase()},(err,childExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!childExists) return res.status(400).send('Sorry, this URN is not recognized');
    else if(childExists.URN.toLowerCase() == req.user.URN.toLowerCase())
      return res.status(400).send('Please enter a valid URN of a student');
    else if(childExists.access_level!=4)
      return res.status(400).send('This is not a student account')
   // Check if  you are not already following this guy
   Parenting.findOne({parent_URN:req.user.URN.toLowerCase(),student_URN:childExists.URN.toLowerCase()}
    ,(err,columnExists)=>{
      console.log('columnExists ='+columnExists)
      if(err) return log_err(err,false,req,res);
      else if(columnExists) return res.status(400).send('You have already requested this student');
      //Now i just save it in the Parenting Table
      new Parenting({
        parent_URN:req.user.URN,
        student_URN:childExists.URN,
        school_id:childExists.school_id,
       }).save((err)=>{
          if(err) return log_err(err,false,req,res);
          return res.end();
       })
    })
   
   
  })
}

exports.getListChild = (req,res,next)=>{
  Parenting.find({parent_URN:req.user.URN.toLowerCase()},(err,childrenList)=>{
    if(err) return log_err(err,false,req,res);

    allData={}
    allData.childrenList=childrenList
    if(req.session.student) allData.currentStudent_URN=req.session.student.URN
    return res.json(allData);
  })
}


exports.removeFromChild = (req,res,next)=>{
  req.assert('student_URN', 'Invalid data').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Parenting.remove({parent_URN:req.user.URN.toLowerCase()
    ,student_URN:req.params.student_URN.toLowerCase()}
    ,(err,okay)=>{
    if(err) return log_err(err,false,req,res);
    req.session.student=[];
    return res.end();
  })
}
exports.getListParents = (req,res,next) =>{
  Parenting.find({student_URN:req.user.URN.toLowerCase()},(err,parentsList)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(parentsList);
  })
}
exports.removeFromParents = (req,res,next)=>{
  req.assert('parent_URN', 'Invalid data').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Parenting.remove({student_URN:req.user.URN.toLowerCase()
    ,parent_URN:req.params.parent_URN.toLowerCase()}
    ,(err,okay)=>{
    if(err) return log_err(err,false,req,res);
    return res.end();
  })
}
exports.modifyAccessOnParent = (req,res,next)=>{
  req.assert('parent_URN', 'Invalid data').notEmpty();
  req.assert('theAction','Invalid action').isInt();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  Parenting.update({student_URN:req.user.URN.toLowerCase()
    ,parent_URN:req.body.parent_URN.toLowerCase()},
    {allowed:req.body.theAction},(err,okay)=>{
    if(err) return log_err(err,false,req,res);
    return res.end();
  })
}
exports.parentSetStudent = (req,res,next)=>{
  req.assert('student_URN', 'Invalid data').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  if(req.session.student){
    console.log("zzzzzzzzzzzzzzzzzzzzzzzzzzzzzz sent urn: "+req.body.student_URN)
    console.log("vvvvvvvvvvvvvvvvvvvvvvvvvvv session urn: "+req.session.student.URN)
    if(req.session.student.URN==req.body.student_URN){
      req.session.student="";
      return res.end();
    }else{
      User.findOne({URN:req.body.student_URN},(err,StudentInfo)=>{
        if(err) return log_err(err,false,req,res);
        if(!StudentInfo) return res.status(400).send("Student doesn't exist")
        req.session.student=StudentInfo;
        return res.end();
      })
    }
  }else{
    User.findOne({URN:req.body.student_URN},(err,StudentInfo)=>{
      if(err) return log_err(err,false,req,res);
      if(!StudentInfo) return res.status(400).send("Student doesn't exist")
      req.session.student=StudentInfo;
      return res.end();
    })
  }    
}
exports.parentGetStudentReport = (req,res,next)=>{
  if(!req.session.student) return res.redirect("back")
    res.redirect('/report/'+req.session.student._id)
}