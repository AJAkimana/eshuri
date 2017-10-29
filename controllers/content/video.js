const Content =require('../../models/Content'),
      Unit =require('../../models/Unit'),
      Classe =require('../../models/Classe'),
      log_err=require('../manage/errorLogger');
      Course =require('../../models/Course');

exports.pageNewVideo = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send("back");
  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{    
    if(err) return log_err(err,true,req,res);
    else if(!unit_exists) return res.render("./lost",{msg:"Invalid data"})
    //Check if the course is yours
    Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
      if(err) return log_err(err,true,req,res);
      else if(!course_exists) return res.render("./lost",{msg:"Invalid data"})
      else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
        return res.render("./lost",{msg:"This course is not yours"})

      return res.render('content/video/new_Video',{
        title:'Video link',
        course_id:unit_exists.course_id,
        unit_name:unit_exists.title,
        unit_id:req.params.unit_id,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      });
    })    
  })
}

exports.postNew_Video = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('link', 'A URL of the video is required').isURL();
  req.assert('title', 'A title is required with max 100 characters').len(1,100);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Unit.findOne({_id:req.body.unit_id},(err,unit_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!unit_exists) return res.status(400).send(" This unit is not recognized");
    // Now get the school_id
    Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!course_exists) return res.status(400).send(" This course is not recognized");
      //Check that you have the right to upload it
      else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
        return res.status(400).send("Sorry, this course is not yours");

      Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send('Invalid data');
        new Content({
          title:req.body.title,
          source_question:req.body.link,
          course_id:course_exists._id,
          school_id:course_exists.school_id,
          unit_id:unit_exists._id,
          owner_URN: req.user.URN,
          type: req.app.locals.type.Video_link,
          currentTerm:class_exists.currentTerm,
          academic_year:class_exists.academic_year,
        })
        .save((err)=>{
          if(err) return log_err(err,false,req,res);
          return res.end()
        })
      })
        
    })
  })
}