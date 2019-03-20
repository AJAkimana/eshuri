const Content =require('../../models/Content'),
      Unit =require('../../models/Unit'),
      Notification =require('../../models/Notification'),
      Classe =require('../../models/Classe'),
      Marks =require('../../models/MARKS'),
      log_err=require('../manage/errorLogger');
      Course =require('../../models/Course');

exports.pageNew_WrittenNote = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('ay', 'Invalid data').isInt();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send("back");
  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{    
    if(err) return res.render("./lost",{msg:errors[0].msg})
    else if(!unit_exists) return res.render("./lost",{msg:"Invalid data"})
    //Check if the course is yours

    Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
      if(err) return res.redirect("back");
      else if(!course_exists) return res.render("./lost",{msg:"Invalid data"});
      else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
        return res.render("./lost",{msg:"This course is not yours"});
      Classe.findOne({_id:course_exists.class_id},(err, class_exists)=>{
        if(err) return res.redirect("back");
        else if(!class_exists) return res.render("./lost",{msg:"Invalid data"});
        else if(req.query.ay!=class_exists.academic_year) return res.render("./lost",{msg:"You cannot add content in past"});

        return res.render('content/written_note/new_W_note',{
          title:'Written course',
          course_id:unit_exists.course_id,
          unit_name:unit_exists.title,
          unit_id:req.params.unit_id,
          academic_year:req.query.ay,
          pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
          csrf_token:res.locals.csrftoken, // always set this buddy
        })
      })
    })    
  })
}
exports.postNew_WrittenNote = (req,res,next)=>{
  req.assert('title', 'A title is required').notEmpty();
  req.assert('code_md', 'A note cannot be empty').notEmpty();
  // req.assert('html', 'Invalid data').notEmpty();
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //Get th course_id
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
      // Now let s save it in the Content Collection

      Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send('Invalid data');
        new Content({
          title:req.body.title,
          source_question:req.body.code_md,
          currentTerm:class_exists.currentTerm,
          academic_year:class_exists.academic_year,
          course_id:course_exists._id,
          school_id:course_exists.school_id,
          unit_id:unit_exists._id,
          owner_URN: req.user.URN,
          type: req.app.locals.type.W_Note,
        })
        .save((err)=>{
          //console.log(err);
          if(err) return log_err(err,false,req,res);
          return res.send(course_exists._id);
        })
      })
        
    })
  })
}

exports.get_Content_JSON = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  //req.assert('type', 'Invalid data').isIn([1,2,3,4,5,6,7]);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // I want to fetch all corresponding 
  if(req.user.access_level >= req.app.locals.access_level.STUDENT){
    Content
    .find({unit_id:req.body.unit_id,school_id:req.user.school_id,isPublished:true},
      {__v:0,source_question:0,course_id:0,school_id:0,unit_id:0,owner_URN:0,answers:0,time:0,academic_year:0})
    .sort({upload_time:1})
    .exec((err,content_list)=>{
      if(err) return log_err(err,false,req,res);
      return res.json(content_list); 
    })
  }
  else{
    Content
      .find({unit_id:req.body.unit_id,school_id:req.user.school_id,},
        {__v:0,source_question:0,course_id:0,school_id:0,unit_id:0,owner_URN:0,answers:0,time:0,academic_year:0})
      .sort({upload_time:1})
      .exec((err,content_list)=>{
        if(err) return log_err(err,false,req,res);
        // console.log('contents:'+JSON.stringify(content_list))
        return res.json(content_list); 
      })
  }
  
}
exports.setPublish = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('content_id', 'Invalid data').isMongoId();
  //req.assert('type', 'Invalid data').isIn([1,2,3,4,5,6,7]);
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // I want to fetch all corresponding 
  Content.findOne({unit_id:req.body.unit_id,_id:req.body.content_id
  },(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists) return res.status(400).send("Invalid data");
    else if(String(content_exists.owner_URN) !=String(req.user.URN))
     return res.status(400).send("This course doesn't belong to you"+req.user.URN);
    content_exists.isPublished =!content_exists.isPublished;
    Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{
       if(err) return log_err(err,false,req,res);
      else if(!content_exists) return res.status(400).send("Invalid data");
      content_exists.save((err,ok)=>{
      if(err) return log_err(err,false,req,res);
      else if(content_exists.isPublished){
        new Notification({
          user_id:req.user._id,
          user_name:req.user.name,
          content: req.user.name+" has published a new content "+content_exists.title+" in "+course_exists.name,
          class_id:req.user.class_id,
          school_id:req.user.school_id,
          isAuto:false, 
          
        }).save((err)=>{
          if(err) return log_err(err,false,req,res);
        })
      }
      return res.end();
     })
    })
  })
}
exports.setCAT = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // I want to fetch all corresponding 
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists) return res.status(400).send("Invalid data");
    // else if(String(content_exists.owner_URN) !=String(req.user.URN))
    //  return res.status(400).send("This is not your course ;)");
    content_exists.isCAT =!content_exists.isCAT;    
    // Update first the MARKS before CONTENT
    Marks.update({content_id:req.body.content_id},{$set:{isCAT:content_exists.isCAT}},{multi:true},
      (err,marks_exists)=>{
      if(err) return log_err(err,false,req,res);
      content_exists.save((err,ok)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })      
    })
  })
}
exports.set_Quoted = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // I want to fetch all corresponding 
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists) return res.status(400).send("Invalid data");
    else if(String(content_exists.owner_URN) !=String(req.user.URN))
     return res.status(400).send("This is not your course ;)");
    content_exists.isQuoted =!content_exists.isQuoted;
    // Update first the MARKS before CONTENT
    Marks.update({content_id:req.body.content_id},{$set:{isQuoted:content_exists.isQuoted}},{multi:true},
      (err,marks_exists)=>{
      if(err) return log_err(err,false,req,res);
      content_exists.save((err,ok)=>{
        if(err) return log_err(err,false,req,res);
        return res.end();
      })      
    })
  })
}


exports.pageEdit_WNotes = (req,res,next)=>{
  // we receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.W_Note},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    else if(String(req.user.URN) != String(content_exists.owner_URN))
      return res.status(400).send("This course is not yours");
    // helps me decode html encoded
    return res.render('content/written_note/edit_W_note',{
      title:'Edit written note',
      code_md: content_exists.source_question,
      course_id:content_exists.course_id,
      content_id:content_exists._id,
      title: content_exists.title,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })    
}

exports.postUpdateW_Note = (req,res,next)=>{
  // we receive content_id in params
  req.assert('code_md', 'A note cannot be empty').notEmpty();
  req.assert('html', 'Invalid data').notEmpty();
  req.assert('content_id', 'Invalid data').isMongoId();  
  req.assert('course_id', 'Invalid data').isMongoId();  
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  Content.findOne({_id:req.body.content_id,type:req.app.locals.type.W_Note}
    ,(err,contentToUpdate)=>{
    if(err) return log_err(err,false,req,res);
    else if(!contentToUpdate)  return res.status(400).send("Invalid data");
    else if(String(req.user.URN) != String(contentToUpdate.owner_URN))
        return res.status(400).send("This course is not yours");
      
    contentToUpdate.source_question =req.body.code_md;
    contentToUpdate.html =require('escape-html')(req.body.html);
    contentToUpdate.save((err)=>{
      if(err) return log_err(err,false,req,res);
      return res.send(req.body.course_id);
    })
  })    
}
// Supprimer un content 
exports.removeContent = function(req,res,next){ // D
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!course_exists) return res.status(400).send("Invalid data");
      else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
        return res.status(400).send("The course's content is not yours");
      Marks.remove({content_id:content_exists._id},(err)=>{
        if(err) return log_err(err,false,req,res);
        content_exists.remove((err)=>{
          if(err) return log_err(err,false,req,res);
          else if(content_exists && content_exists.type ==req.app.locals.type.Uploaded_Assessment){
            //here i will remove the file also
            require("fs").unlink(content_exists.source_question,(err)=>{
              if(err) return log_err(err,false,req,res);
            });
          }
          else return res.end();
        })        
      })  
    })
  })
}
exports.getListContentPerCourse = (req,res,next)=>{
  req.assert('course_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // I want to fetch all corresponding 
  var async =require("async");
  var content_List=[],course_quota={};
  Course.findOne({_id:req.params.course_id},(err, course)=>{
    if(err) return res.status(400).send("Invalid data");
    if(!course) return res.status(400).send("Invalid data");
    Classe.findOne({_id:course.class_id},(err, classe)=>{
      if(err) return res.status(400).send("Invalid data");
      if(!classe) return res.status(400).send("Invalid data");
      async.series([
              //first compute the content marks
        (callback_1)=>{
          async.parallel([
            (callback)=>{
              Content
              .find({course_id:req.params.course_id,academic_year:classe.academic_year,type:{$gte:3,$lte:6}},
                {source_question:0,course_id:0,school_id:0,unit_id:0,owner_URN:0,answers:0,time:0,isPublished:0,updatedAt:0,q_solution:0,q_info:0
                })
              .sort({isQuoted:-1})
              .exec((err,content_list)=>{
                if(err) callback(err);
                content_List = content_list;
                callback(null);
              }) 
            },
            (callback)=>{
              Course.findOne({_id:req.params.course_id},(err,course_exists)=>{
                if(err) callback(err);
                else if(!course_exists) callback("The course doesn't exists ")
                course_quota.test =course_exists.test_quota;
                course_quota.exam =course_exists.exam_quota;
                course_quota.courseWeight =course_exists.weightOnReport;
                callback(null);
              })
            }
          ],(err)=>{
            return callback_1(err);        
         })
        },
        //second parallel computation
        (callback_2)=>{
          async.each(content_List,(currentContent,callback_parallel)=>{
            Marks.aggregate([
              {$match:{content_id:currentContent._id}},
              {$group:{ _id:null,average:{$avg:'$percentage'}}}
            ],(err,results)=>{
              if(err) callback_parallel(err);
              // console.log("Exam AVG ="+JSON.stringify(results))
              currentContent.__v = results.length>0? Number(results[0].average):0;
              //console.log("CONTENT ="+JSON.stringify(currentContent.avg))
              callback_parallel(null);
            })
          },(err)=>{
            return callback_2(err);
          })
        },
      ],(err)=>{
        if(err) return res.status(500).send(" Sorry, a problem occured");
        return res.json({list:content_List,course_quota:course_quota});
      })
    })
  }) 
}

