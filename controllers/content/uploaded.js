const Content =require('../../models/Content'),
      Marks =require('../../models/MARKS'),
      Notification=require("../../models/Notification"),
      Unit =require('../../models/Unit'),
      Classe =require('../../models/Classe'),
      log_err=require('../manage/errorLogger');
      Course =require('../../models/Course');

/*
A nice collection, nice Job lionel
*/
exports.pageNew_Uploaded = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.redirect("back");
  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{   
    if(err) return res.redirect("back");
    else if(!unit_exists) return res.redirect("back");
    //Check if the course is yours

    Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
      console.log(" We have "+JSON.stringify(course_exists))
      if(err) return res.redirect("back");
      else if(!course_exists) 
        return res.status(400).send("Sorry this is not your course");
      else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
        return res.status(400).send("This is not your course");
      return res.render('content/uploaded/new_Uploaded',{
        title:'Upload an assessement',
        course_id:unit_exists.course_id,
        unit_name:unit_exists.title,
        unit_id:req.params.unit_id,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    })
  })
}


exports.postNew_Uploaded = (req,res,next)=>{
  req.assert('title', 'A title is required').notEmpty().len(1,30);
  req.assert('marks', 'Invalid data').isFloat();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  else if(!req.file) return res.status(400).send("File upload failed");
  else if(req.body.marks <=0) return res.status(400).send("Marks must be >0");
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
      console.log(" File is "+JSON.stringify(req.file))
      Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send('Invalid data');
        new Content({
          title:req.body.title,
          source_question:req.file.path,
          currentTerm:class_exists.currentTerm,
          academic_year:class_exists.academic_year,
          course_id:course_exists._id,
          school_id:course_exists.school_id,
          unit_id:unit_exists._id,
          owner_URN: req.user.URN,
          marks:req.body.marks,
          type: req.app.locals.type.Uploaded_Assessment,
        })
        .save((err)=>{
          if(err) return res.redirect("back")
          return res.redirect("/courses/"+course_exists._id);
        })
      })
        
    })
  })
}

exports.do_Uploaded = (req,res,next)=>{
  // we receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  else if(!req.user.hasPaid && req.user.access_level == req.app.locals.access_level.STUDENT)
    return res.render("./lost",{msg:"Sorry, but you have not paid"})
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Uploaded_Assessment},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");

    return res.render('content/uploaded/do_uploaded',{
      title:'Answer uploaded',
      pdfUrl: content_exists.source_question,
      pdf_name:content_exists.title,
      course_id:content_exists.course_id,
      content_id:content_exists._id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })    
};
exports.uploadAnswer = (req,res,next)=>{
  req.assert('content_id', 'Invalid input').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  else if(!req.user.hasPaid && req.user.access_level ==req.app.locals.access_level.STUDENT)
    return res.status(400).send("Sorry you have not paid");
  else if(!req.file) return res.status(400).send("File upload failed");

  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists) return res.status(400).send(" This unit is not recognized");    
    // Now get the school_id
    var class_id =req.user.class_id;
    Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{      
      if(err) return log_err(err,false,req,res);
      else if(!course_exists) return res.status(400).send(" This course is not recognized");
      //Check that you have the right to upload it
      else if(String(class_id)!= String(course_exists.class_id)){
        // console.log(" COMPARE "+(req.user.class_id !== course_exists.class_id ))
        return res.status(400).send("Only this class is not yours ");
      }
      //if you are not a student
      else if(req.user.access_level !=req.app.locals.access_level.STUDENT)
        return res.status(400).send("Sorry, Only for student !");
        //Test if the file was already existing 
      Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send('Invalid data');
        var currentAccademic_year= class_exists.academic_year;
        Marks.findOne(
              {student_id:req.user._id,content_id:content_exists._id,academic_year:currentAccademic_year}
              ,(err,marks_exists)=>{
          if(err) return log_err(err,false,req,res);
          else if(marks_exists)
            return res.status(400).send("Sorry, you submit only once ");
          new Marks({
            isCorrected:false,
            content_type:req.app.locals.type.Uploaded_Assessment,
            content_id:content_exists._id,
            teacher_id:course_exists.teacher_list[0],
            student_id:req.user._id,
            student_URN:req.user.URN,
            marks: 0, // la note k il a eu
            percentage:0,// here is the percentage
            school_id:req.user.school_id,
            class_id:course_exists.class_id,
            course_id:content_exists.course_id,
            uploaded_file:req.file.path,
            course_name:course_exists.name,
            level: course_exists.level,
            // uploaded_text:"",
            // uploaded_array:req.body.studentAnswers,
            currentTerm: content_exists.currentTerm,
            comment: req.body.comment|| null,
          }).save((err)=>{
            if(err) return log_err(err,false,req,res);
            return res.redirect("/courses/"+course_exists._id);
          })            
        })  
      })
            
    })
  }) 
}
exports.getPageViewAnswer = function(req,res,next){
  req.assert('marks_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Marks.findOne({_id:req.params.marks_id},(err,marks_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!marks_exists) return res.status(400).send("Invalid input");
    Content.findOne({_id:marks_exists.content_id},(err,content_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!content_exists) return res.status(400).send("Invalid input");
      // if is ok now send the page
      return res.render('content/uploaded/view_answer',{
        title:'Answers from student',
        student_URN:marks_exists.student_URN,
        updatedAt:content_exists.updatedAt,
        upload_time:content_exists.upload_time,
        course_id:marks_exists.course_id,
        content_id:marks_exists.content_id,
        marks_id:marks_exists._id,
        totalMarks:content_exists.marks|| "not defined",
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      });
    })
    
  })
}

exports.readAnswerUploadedPDF = (req,res,next)=>{
  req.assert('marks_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  console.log(" I am asking for "+JSON.stringify(req.params))
  Marks.findOne({_id:req.params.marks_id},(err,marks_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!marks_exists)  return res.status(400).send("Invalid data");
    // Send the file    
    var link=marks_exists.uploaded_file;
    return res.sendFile(link);
  })
}

exports.setMarksToStudent = (req,res,next)=>{
  req.assert('marks_id', 'Invalid data').isMongoId();
  req.assert('marks_given', 'These marks are not valid').isFloat();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Marks.findOne({_id:req.params.marks_id},(err,marks_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!marks_exists) return res.status(500).send("Invalid input");
    Content.findOne({_id:marks_exists.content_id},(err,content_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!content_exists) 
        return res.status(400).send("Invalid input");
      else if(content_exists.marks < req.body.marks_given)
        return res.status(400).send("Given marks are superior total");
      else if(String(content_exists.owner_URN) != String(req.user.URN) || req.user.access_level!= req.app.locals.access_level.TEACHER)
        return res.status(400).send("Sorry, this is not your course"+req.user.URN);

      marks_exists.marks =Number(req.body.marks_given);
      marks_exists.percentage =(Number(req.body.marks_given)*100/content_exists.marks).toFixed(2);
      marks_exists.isCorrected =true;
      marks_exists.save((err)=>{
        if(err) return log_err(err,false,req,res);
        new Notification({
          user_id:req.user._id,
          user_name:req.user.name,
          content: "Teacher "+req.user.name+" has updated your marks to "
          +content_exists.title
          +" in "+content_exists.title+
          ":=>"+marks_exists.marks+"/"+content_exists.marks,
          // class_id:req.user.class_id||null,
          school_id:req.user.school_id,
          dest_id:marks_exists.student_id,
          isAuto:false,             
        }).save((err)=>{
          if(err) console.log(" You have to log "+err)
        })
        return res.end();
      })
    
  })

  })
}

