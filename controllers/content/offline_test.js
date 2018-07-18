const Content =require('../../models/Content'),
	  Marks =require('../../models/MARKS'),
	  Unit =require('../../models/Unit'),
	  User =require('../../models/User'),
    Classe =require('../../models/Classe'),
    Notification=require("../../models/Notification"),
	  School =require('../../models/School'),
    log_err=require('../manage/errorLogger');
	  Course =require('../../models/Course');

exports.pageNewOfflineTest = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{    
	if(err) return res.redirect("back");
	else if(!unit_exists) return res.render("./lost",{msg:"Unit doesn't exists"})
	//Check if the course is yours
	Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
	  if(err) return log_err(err,true,req,res);
	  else if(!course_exists ) return res.render("./lost",{msg:"Invalid data"})
    else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
      return res.render("./lost",{msg:"This course doesn'y belong to you"})
    Classe.findOne({_id:course_exists.class_id},(err, class_info)=>{
      if(err) return res.render("./lost",{msg:"Invalid data"});
      if(!class_info) return res.render("./lost",{msg:"Invalid data"});
      return res.render('content/offline_test/new_offline',{
        title:'Offline test',
        unit_name:unit_exists.title,
        course_id:course_exists._id,
        unit_id:req.params.unit_id,
        academic_year:class_info.academic_year,
        pic_id:req.user._id,
        access_lvl:req.user.access_level,
        csrf_token:res.locals.csrftoken, // always set this buddy
        })
      })
    })
  })
}

exports.addOfflineTest = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('title', 'Title is not valid').notEmpty().len(1,140);
  req.assert('marks', 'Invalid data').isFloat();
  req.assert('isexam', 'Select assessment type').notEmpty();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Unit.findOne({_id:req.body.unit_id},(err,unit_exists)=>{    
	if(err) return log_err(err,false,req,res);
	else if(!unit_exists) return res.status(400).send("Invalid input")
	//Check if the course is yours
	Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
	  if(err) return log_err(err,false,req,res);
	  else if(!course_exists) 
		  return res.status(400).send("Sorry you are not allowed");
    else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
      return res.status(400).send("This course is not yours");
    Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
      if(err) return log_err(err,false,req,res);
      else if(!class_exists) return res.status(400).send('Invalid data');
        var isexam=req.body.isexam=="cat"?true:false;
        new Content({
          title:req.body.title,
          marks:req.body.marks,
          source_question:"-",
          course_id:course_exists._id,
          school_id:course_exists.school_id,
          unit_id:req.body.unit_id,
          owner_URN:req.user.URN,
          type:req.app.locals.type.Offline_Assessment,
          currentTerm:class_exists.currentTerm,
          academic_year:class_exists.academic_year,
          isCAT:isexam,
        }).save((err)=>{
          if(err) return log_err(err,false,req,res);
          return res.end();
       })
    });

	})
  })
}

exports.pageEditOfflineTest = (req,res,next)=>{
  // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Offline_Assessment},
  	(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // We receive 
    return res.render('content/offline_test/edit_offline',{
      title:'Update offline test',
      title_offline:content_exists.title,
      content_id:content_exists._id,
      course_id:content_exists.course_id,
	  marks:content_exists.marks,
	  unit_id:content_exists.unit_id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })    
}
exports.updateOfflineTest = (req,res,next)=>{
  // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  req.assert('title', 'Title is not valid').notEmpty().len(1,140);
  req.assert('marks', 'Invalid data').isFloat();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // here precise the type 
  Content.findOne({_id:req.body.content_id,type:req.app.locals.type.Offline_Assessment},
  	(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // We receive 
    content_exists.title=req.body.title,
    content_exists.marks =req.body.marks,
    content_exists.save((err)=>{
    	if(err) return log_err(err,false,req,res);
    	return res.end();
    })
  })    
}
// exports.pageMarksOffline = (req,res,next)=>{
//   req.assert('content_id', 'Invalid data').isMongoId();
//   const errors = req.validationErrors();
//   if (errors) return res.status(400).send(errors[0].msg);
//   // here precise the type 
//   Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Offline_Assessment},
//   	(err,content_exists)=>{
//     if(err) return log_err(err,false,req,res);
//     else if(!content_exists)  return res.status(400).send("Invalid data");
//     return res.render('content/offline_test/page_marks',{
// 		title:'Offline test',
// 		totalMarks:content_exists.marks,
// 		content_id:content_exists._id,
// 		course_id:content_exists.course_id,
// 		unit_id:content_exists.unit_id,
// 		pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
//     csrf_token:res.locals.csrftoken, 
// 	  })
//   })
// }
exports.getPageOfflineStudents = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
 
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!content_exists) return res.status(400).send("Invalid input");
  	// get the class_id in the course
  	Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{
  		if(err) return log_err(err,false,req,res);
  		else if(!course_exists) return res.status(400).send("Invalid input course");
  		// List of users  in the  class_id	
  		var async =require("async");
  		Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send('Invalid data');
        var academic_year =class_exists.academic_year;
        var studentsAlready =[],completeList =[];
        async.parallel([
           /* GET ALL THE STUDENTS IN THE CLASS_ID or RETAKING THE COURSE*/
          (callback)=>{
            User.find({
                  $and:[
                    {$or:[{class_id:course_exists.class_id},{course_retake:course_exists._id}]},
                    {access_level:req.app.locals.access_level.STUDENT}
                  ]
                },
              {__v:0,email:0,password:0,gender:0,phone_number:0,class_id:0,school_id:0,
                access_level:0,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0}
              ,(err,listStudents)=>{
              if(err) return callback("Service not available");
              completeList = listStudents;
              // console.log(" I have list "+JSON.stringify(listStudents))
              return callback(null);
            }).sort({name:1})
          },
          (callback)=>{ // ONLY FOR TH ACADEMIC YEAR
            Marks.find({content_id:req.body.content_id,class_id:course_exists.class_id,
              academic_year:academic_year},
              {isCorrected:0,content_type:0,teacher_id:0,
                school_id:0,class_id:0,uploaded_file:0,uploaded_text:0,
                uploaded_array:0,comment:0},
              (err,list2)=>{
                if(err) return callback("Service not available");
                studentsAlready = list2;
                // console.log("BUT ----_______________"+JSON.stringify(list2))
                return callback(null);
            })
          },
        ],(err)=>{
          if(err) return log_err(err,false,req,res);
          var reponse ={};
          reponse.allStudents =completeList;
          reponse.studentsAlready =studentsAlready;
          //console.log(" i am sending "+JSON.stringify(studentsAlready));
          return res.json(reponse);
        })
      })
  	})
  })
}
exports.setMarksStudent = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  req.assert('students', 'Invalid marks').isArray();

  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  var async = require('async');
  console.log('==>Students:'+JSON.stringify(req.body.students))
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!content_exists) return res.status(400).send("Invalid input");
  	Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{
  		if(err) return log_err(err,false,req,res);
  		else if(!course_exists)  return res.status(400).send("Invalid input here");
      Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
        if(err) return log_err(err,false,req,res);
        else if(!class_exists) return res.status(400).send('Invalid data');
        var currentAccademic_year= class_exists.academic_year;
        async.eachSeries(req.body.students, (thisStudent, studentCb)=>{
          async.series([(checkValidationCb)=>{
            if(!thisStudent.marks) return checkValidationCb(thisStudent.name.toUpperCase()+" has no marks");
            else if(thisStudent.marks > content_exists.marks) return checkValidationCb("Marks for "+thisStudent.name.toUpperCase()+" are greater than total");
            else if(thisStudent.marks < 0) return checkValidationCb("Marks for "+thisStudent.name.toUpperCase()+" are less than total");
            console.log("---"+JSON.stringify(thisStudent))
            return checkValidationCb(null);
          }],(err)=>{
            if(err) return studentCb(err);
            User.findOne({_id:thisStudent.id, access_level:req.app.locals.access_level.STUDENT},(err,user_exists)=>{
              if(err) return studentCb(err);
              else if(!user_exists) return studentCb("The user doesn't exists");
              Marks.findOneAndUpdate({
                student_id:thisStudent.id,
                content_id:content_exists._id,
                academic_year:currentAccademic_year
              },{
                isCorrected:true,
                content_type:req.app.locals.type.Offline_Assessment,
                content_id:content_exists._id,
                teacher_id:course_exists.teacher_list[0],
                student_id:thisStudent.id,
                student_URN:user_exists.URN,
                marks: thisStudent.marks, // la note k il a eu
                percentage:Number(thisStudent.marks)*100/content_exists.marks,// here is the percentage
                school_id:content_exists.school_id,
                class_id:course_exists.class_id,
                course_id:content_exists.course_id,
                course_name:course_exists.name,
                level: course_exists.level,
                isCAT:content_exists.isCAT,
                isQuoted:content_exists.isQuoted,
                currentTerm: content_exists.currentTerm,
                comment:thisStudent.comment||null,
              },{upsert:true}, // if not exists then create it
              (err,doc)=>{
                if(err) return studentCb(thisStudent.name+": ==>SService not available 12 "+err);
                new Notification({
                  user_id:req.user._id,
                  user_name:req.user.name,
                  content: "Teacher "+req.user.name+" has updated your marks "+" in "+content_exists.title+":=>"+req.body.student_marks+"/"+content_exists.marks,
                  school_id:class_exists.school_id,
                  dest_id:thisStudent.id,
                  isAuto:false,             
                }).save((err)=>{
                  if(err) return studentCb("Service not available 13");
                  return studentCb(null);
                })
              })
            })
          })
        },(err)=>{
        if(err) return res.status(400).send(err);
        return res.end();
      })
  	})
  })
})
}

exports.undoMarksStudent = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  req.assert('student_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!content_exists) return res.status(400).send("Invalid input");
    // else if(req.user.URN != content_exists.owner_URN)
    //   return res.status(400).send("This is not your course");
  	// now remove it 
  	Marks.remove({content_id:req.body.content_id,student_id:req.body.student_id},
  		(err,ok)=>{
  			if(err) return log_err(err,false,req,res);
  			return res.end();
  	})

  })
}
exports.setSpecialMarks = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  // res.send(" Here will send you the page .. aho wediting ama nota yabanyeshure ubanje kuyabona a l example de OFFLINE")
  Content.findOne({_id: req.params.content_id},(err,content_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!content_exists) return res.render("./lost",{msg:"Invalid data"});
    else if(content_exists.type <3)
      return res.render("./lost",{msg:"You cannot do this"});

    return res.render('content/specialMarks',{
      title:'Give manual marks',
      content_name:content_exists.title,
      course_id:content_exists.course_id,
      content_id:content_exists._id,
      totalMarks:content_exists.marks,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
      csrf_token:res.locals.csrftoken, // always set this buddy
   })
  })
}