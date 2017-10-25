const Content =require('../../models/Content'),
      Unit =require('../../models/Unit'),
      Classe =require('../../models/Classe'),
      log_err=require('../manage/errorLogger');
      Course =require('../../models/Course');
const multer = require('multer'); 
const MB = 1024*1024;
const pdfMaxSize =2*MB; // 2 MB
/*
A nice collection, nice Job lionel
*/
exports.pageNew_Note = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send("back");
  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{    
    if(err) return log_err(err,true,req,res);
    else if(!unit_exists) return res.render("./lost",{msg:"Invalid data"})
    //Check if the course is yours

    Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
      if(err) return log_err(err,true,req,res);
      else if(!course_exists) 
        return res.render("./lost",{msg:"Invalid data"})
      else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
        return res.render("./lost",{msg:"This course is not yours"})
      return res.render('content/pdf_note/new_Note',{
        title:'Upload PDF',
        course_id:unit_exists.course_id,
        unit_name:unit_exists.title,
        unit_id:req.params.unit_id,
        pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),
        access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
      })
    })    
  })
}

exports.postNew_Note = (req,res,next)=>{
  req.assert('title', 'A title is required').notEmpty().len(1,30);
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  else if(!req.file) return res.render("./lost",{msg:"File upload has failed"})
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
            source_question:req.file.path,
            currentTerm:class_exists.currentTerm,
            academic_year:class_exists.academic_year,
            course_id:course_exists._id,
            school_id:course_exists.school_id,
            unit_id:unit_exists._id,
            owner_URN: req.user.URN,
            type: req.app.locals.type.PDF_Note,
          })
          .save((err)=>{
            if(err) return res.render("./lost",{msg:"Upload has failed"})
            return res.redirect("/courses/"+course_exists._id);
          })  
    })
    })
  })
}

exports.pageEdit_Notes = (req,res,next)=>{
  // we receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.PDF_Note},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    else if(String(req.user.URN) != String(content_exists.owner_URN))
        return res.status(400).send("This course is not yours");
    // helps me decode html encoded
    return res.render('content/pdf_note/edit_Note',{
      title:'Update note',
      content_id:content_exists._id,
      title: content_exists.title,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })    
}

/* When you are update a PDF note. will remove old one and set a new file path*/
exports.postUpdateNote = (req,res,next)=>{
  // we receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();  
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  else if(!req.file) return res.status(400).send("File was not uploaded");
  Content.findOne({_id:req.body.content_id,type:req.app.locals.type.PDF_Note},(err,contentToUpdate)=>{
    if(err) return log_err(err,false,req,res);
    else if(!contentToUpdate)  return res.status(400).send("Invalid data type");
    else if(String(req.user.URN) != String(contentToUpdate.owner_URN))
        return res.status(400).send("This course is not yours");

    var oldFilePath =contentToUpdate.source_question;

    contentToUpdate.source_question =req.file.path;
    // console.log(" I will save "+JSON.stringify(contentToUpdate))
    contentToUpdate.save((err)=>{
      // console.log("Saving "+err)
      if(err) return log_err(err,false,req,res);
        // ASYNCHRONOUSELY REMOVE FILE
      require("fs").unlink(oldFilePath,(err)=>{
        if(err) console.log(" FILE NOT DELETED !")
      });

      return res.redirect("/courses/"+contentToUpdate.course_id);
    })
  })    
}

exports.viewContent = (req,res,next)=>{
  // we receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.params.content_id,school_id:req.user.school_id}
    ,(err,content_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!content_exists)  return res.render("./lost",{msg:"Invalid data"});
    else if(!content_exists.isPublished && req.user.access_level > req.app.locals.access_level.TEACHER) 
      return res.render("./lost",{msg:"You are not allowed"});

    // helps me decode html encoded
    var page_path="";
    switch(content_exists.type){
      case req.app.locals.type.W_Note:page_path='content/written_note/view_w_note';break;
      case req.app.locals.type.PDF_Note: page_path='content/pdf_note/view_note';break;
      case req.app.locals.type.Uploaded_Assessment: page_path='content/uploaded/view_uploaded';break;
      case req.app.locals.type.Offline_Assessment: page_path='content/offline_test/page_marks';break;
      case req.app.locals.type.Video_link: page_path=content_exists.source_question;break;
      default:break;
    }
    if(page_path=="") return res.render("./lost",{msg:"Sorry this content doesn't exists"});
    else if(page_path == content_exists.source_question)
      return res.redirect(content_exists.source_question);
    return res.render(page_path,{
      title:content_exists.title.toUpperCase(),
      pdfUrl: content_exists.source_question,
      code_md: content_exists.source_question,//for written Note
      totalMarks:content_exists.marks, // FOR OFFLINE TEST
      pdfUrl: content_exists.source_question, // FOR UPLOADED
      pdf_name:content_exists.title, // FOR UPLOADED TEST
      course_id:content_exists.course_id,
      content_id:content_exists._id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })    
}

/* This Method is also used by Uploaded*/
exports.getPdf = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  console.log(" I am asking for "+JSON.stringify(req.params));
  Content.findOne({_id:req.params.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // Send the file    
    var link=content_exists.source_question;
    return res.sendFile(link);
  })
}

/* This Method is also used by Uploaded*/
exports.downloadPdf = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.params.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // Send the file    
    var link=content_exists.source_question;
    return res.download(link,content_exists.title+".pdf")    
  })
}

/* This Method is also used by Uploaded*/
exports.checkPDFName = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.params.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // Send the file    
    return res.send(content_exists.title+".pdf");
  })
}
