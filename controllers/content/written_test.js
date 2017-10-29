
const Content =require('../../models/Content'),
	  Marks =require('../../models/MARKS'),
	  Unit =require('../../models/Unit'),
	  Notification =require("../../models/Notification"),
	  School =require('../../models/School'),
	  Classe =require('../../models/Classe'),
	  log_err=require('../manage/errorLogger');
	  Course =require('../../models/Course');

exports.pageNewWritten = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.render("./lost",{msg:errors[0].msg})
  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{    
	if(err) return log_err(err,true,req,res);
	else if(!unit_exists) return res.render("./lost",{msg:"Invalid data"})
	//Check if the course is yours

	Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
	  if(err) return log_err(err,true,req,res);
	  else if(!course_exists ) 
		return res.render("./lost",{msg:"Invalid data"});
	  else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)
	  	return res.render("./lost",{msg:"This is not your course"});

	  return res.render('content/written_test/new_Written',{
		title:'Written assessment',
		unit_name:unit_exists.title,
		course_id:course_exists._id,
		unit_id:req.params.unit_id,
		pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
		csrf_token:res.locals.csrftoken, // always set this buddy
	  })
	})
  })
}
/* We receive a post of unit_id and Q and title deadline */
exports.postNew_Written = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('title', 'A title is required').notEmpty().len(1,30);
  req.assert('deadline', 'You must select a deadline').isDate();
  req.assert('Q', 'Invalid data').isArray(); // not sure
  
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

	  // Validation before usage;
	  // We will loop over Q
	  var async = require("async"),totalMarks=0;
	  async.eachSeries(req.body.Q, function(currentItem, cb){  
	  	// Checking title
	  	currentItem.t=currentItem.t.trim().toLowerCase();
		if(!currentItem.t) return cb("A title is required for Q _"+num)
		//Checking marks
		else if(typeof currentItem.m!="number"||currentItem.m <= 0) 
			return cb("Marks are required for Q _"+num);
		totalMarks+=currentItem.m;
		return cb(null);
	  }, 
	  (err)=>{ 
		if(err)  return res.status(400).send(err);
		 // We will save in the DB now the result 
		 console.log(" I am savin "+JSON.stringify(req.body.Q))
		 Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
		  if(err) return log_err(err,false,req,res);
		  else if(!class_exists) return res.status(400).send('Invalid data');
		  new Content({
			 	title:req.body.title,
				source_question:"-", // nothing is stored in it
				q_info:req.body.Q, 
				q_solution:[],
				time:req.body.deadline,
				marks:totalMarks,
				currentTerm:class_exists.currentTerm,
				academic_year:class_exists.academic_year,
				course_id:course_exists._id,
				school_id:course_exists.school_id,
				unit_id:unit_exists._id,
				owner_URN: req.user.URN,
				type: req.app.locals.type.Written_Assessment,
				setNoCheating:req.body.setNoCheating,
			 }).save((err)=>{
			 	if(err) return log_err(err,false,req,res);
			 	return res.end();
			 });
		})
		 		 
	  });
	})
  })
}
exports.pageEdit_Written = (req,res,next)=>{
  // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Written_Assessment},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // We receive (answers [ items[ p, m, t ,a ,c], ])
    return res.render('content/written_test/edit_Written',{
      title:'Update written test',
      // test_name:content_exists.title,
      content_id:content_exists._id,
	  course_id:content_exists.course_id,
	  unit_id:content_exists.unit_id,
      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
csrf_token:res.locals.csrftoken, // always set this buddy
    })
  })    
}
exports.pageGET_Written = (req,res,next)=>{
  // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);	
   // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Written_Assessment},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // Send back data
    var reponse ={};
	reponse.Q = content_exists.q_info;
	reponse.deadline=new Date(content_exists.time);
	reponse.title =content_exists.title;
	reponse.setNoCheating=content_exists.setNoCheating;
	return res.json(reponse);
  }) ;    
}
exports.postUpdate_Written = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('content_id', 'Invalid data').isMongoId();
  req.assert('title', 'A title is required').notEmpty().len(1,30);
  req.assert('deadline', 'You must select a deadline').isDate();
  req.assert('Q', 'Invalid data').isArray(); // not sure
  
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  //Get th course_id
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!content_exists) return res.status(400).send("Invalid content");
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
	  // Validation before usage;
	  // We will loop over Q
	  var async = require("async");
	  var totalMarks=0;// correct  choices
	  async.eachSeries(req.body.Q, function(currentItem, cb){  
	  	currentItem.t=currentItem.t.trim().toLowerCase();
		if(!currentItem.t) return cb("A title is required for Q _"+num)
		//Checking marks
		else if(typeof currentItem.m!="number"||currentItem.m <= 0) 
			return cb("Marks are required for Q _"+num);
		totalMarks+=currentItem.m;
		return cb(null);
	  }, 
	  (err)=>{
		if(err)  return res.status(400).send(err);
		 // We will save in the DB now the result 	
		 content_exists.q_info=req.body.Q;
		 content_exists.marks =totalMarks;
		 content_exists.title =req.body.title;
		 content_exists.time = req.body.deadline;
		 content_exists.setNoCheating=req.body.setNoCheating,
		 content_exists.save((err)=>{
		 	if(err) return log_err(err,false,req,res);
		 	return res.end();
		 });		 
	  });
	})
  })
 })
}
exports.pageDO_Written = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();  
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  else if(!req.user.hasPaid && req.user.access_level ==req.app.locals.access_level.STUDENT)
	return res.render("./lost",{msg:"Sorry you have not paid"});
	var content={},course ={},classe={},marks={},currentAccademic_year,alreadyDone;
	var async =require('async');
	async.series([
		(cb1)=>{
			Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Written_Assessment}
				,(err,content_exists)=>{
			    if(err) return log_err(err,false,req,res);
			    else if(!content_exists)  return res.render("./lost",{msg:"Invalid data"})
			    else if(new Date().getTime() > content_exists.deadline)  
			    	return res.render("./lost",{msg:"Sorry the deadline is already reached"})
			    content=content_exists;
			    cb1();
			})
		},
		(cb2)=>{
			Course.findOne({_id:content.course_id},(err,course_exists)=>{
	    		if(err) return log_err(err,false,req,res);
	    		else if(!course_exists) return cb2("Course not recognized");   
	    		course =course_exists;
	    		cb2();
	    	})
		},
		(cb3)=>{
			Classe.findOne({_id:course.class_id},(err,class_exists)=>{
			  if(err) return log_err(err,false,req,res);
			  else if(!class_exists) return cb3('Invalid data');
			  currentAccademic_year= class_exists.academic_year;
			  cb3();
			});
		},
		(cb4)=>{
			Marks.findOne({student_id:req.user._id,content_id:content._id,academic_year:currentAccademic_year}
		    	,(err,marks_exists)=>{
    			if(err) return log_err(err,false,req,res);
    			// else if(marks_exists) return cb4("Sorry, you have already submitted only once ");
    			alreadyDone=marks_exists? true:false;
    			cb4();
    		})
		},
	],(err)=>{
		if(err) return res.render("./lost",{msg:err});
		return res.render('content/written_test/do_page',{
			title:'Written assessment',
			alreadyDone:alreadyDone,
			course_id:content.course_id,
			content_id:content._id,
			unit_id:req.params.unit_id,
			pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
			csrf_token:res.locals.csrftoken, // always set this buddy
		})
	})	    
}

exports.postAnswers = (req,res,next)=>{
	req.assert('content_id', 'Invalid data').isMongoId();
	req.assert("studentAnswers","Answers are not valid").isArray();
	const errors = req.validationErrors();
  	if (errors) return res.status(400).send(errors[0].msg);
  	else if(!req.user.hasPaid && req.user.access_level ==req.app.locals.access_level.STUDENT)
		return res.status(400).send("Sorry, but you have not paid");
	var async =require('async');
	var content={},course ={},classe={},marks={},currentAccademic_year;
	async.series([
		(cb1)=>{
			Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Written_Assessment},(err,content_exists)=>{
			    if(err) return log_err(err,false,req,res);
			    else if(!content_exists)  return cb1("This content does not exists");
			    // Checking if deadline is not over !!
			    else if(new Date() > content_exists.time)
			    	return cb1("Sorry the deadline was reached !");
			    // checking if type is Written assessmnet 
			    else if(content_exists.type !=req.app.locals.type.Written_Assessment)
			    	return cb1("Invalid data");    
			    //Save into DB.
			    else if(req.user.access_level != req.app.locals.access_level.STUDENT)
			    	return cb1("Sorry you are not a student");   
			    content=content_exists;
			    cb1();
			})
		},
		(cb2)=>{
			Course.findOne({_id:content.course_id},(err,course_exists)=>{
	    		if(err) return log_err(err,false,req,res);
	    		else if(!course_exists) return cb2("Course not recognized");   
	    		course =course_exists;
	    		cb2();
	    	})
		},
		(cb3)=>{
			Classe.findOne({_id:course.class_id},(err,class_exists)=>{
			  if(err) return log_err(err,false,req,res);
			  else if(!class_exists) return cb3('Invalid data');
			  currentAccademic_year= class_exists.academic_year;
			  cb3();
			});
		},
		(cb4)=>{
			Marks.findOne({student_id:req.user._id,content_id:content._id,academic_year:currentAccademic_year}
		    	,(err,marks_exists)=>{
    			if(err) return log_err(err,false,req,res);
    			else if(marks_exists)	return cb4("Sorry, you submit only once ");
    			cb4();
    		})
		},
	],(err)=>{
		// now after all those checkings
		if(err) return res.status(400).send(err);
    	new Marks({
			isCorrected:false,
    		content_type:req.app.locals.type.Written_Assessment,
    		content_id:content._id,
    		teacher_id:course.teacher_list[0],
    		student_id:req.user._id,
    		student_URN:req.user.URN,
    		marks: 0, // la note k il a eu
    		percentage:0,// here is the percentage
    		school_id:req.user.school_id,
    		class_id:course.class_id,
    		course_id:content.course_id,
    		course_name:course.name,
    		level: course.level,
    		academic_year:currentAccademic_year,
    		uploaded_array:req.body.studentAnswers,
    		currentTerm: content.currentTerm,
    		comment:req.body.comment|| null,
		}).save((err)=>{
			if(err) return log_err(err,false,req,res);
			return res.end();
		})
	})
}
exports.getPageListAnswers = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);

  Content.findOne({_id:req.params.content_id},(err,content_exists)=>{
    if(err) return log_err(err,true,req,res);
    else if(!content_exists) return res.render("./lost",{msg:"Invalid data"})
  	Unit.findOne({_id:content_exists.unit_id},(err,unit_exists)=>{    
		if(err) return log_err(err,true,req,res);
		else if(!unit_exists) return res.render("./lost",{msg:"Invalid data"})
		//Check if the course is yours
		Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
		  if(err)  return log_err(err,true,req,res);
		  else if(!course_exists) return res.render("./lost",{msg:"Invalid data"})
		  //Check that you have the right to upload it
		  else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1 && 
		  	(req.user.access_level >= req.app.locals.access_level.TEACHER))
			 return res.render("./lost",{msg:"Sorry, this course is not yours"})
		  School.findOne({_id:course_exists.school_id},(err,school_exists)=>{
		  	if(err) return log_err(err,true,req,res);
		  	else if(!school_exists) return res.render("./lost",{msg:"Invalid data"})
		  	// if is ok now send the page
		  	var folder="";
		  	switch(content_exists.type){
		  		case 3: folder="automated/list_answers";break;
		  		case 4: folder="written_test/list_answers";break;
		  		case 5: folder="uploaded/list_answers";break;
		  		case 6: folder="offline_test/page_marks";break;
		  		default:break;
		  	}
		  	if(folder=="")	return res.render("./lost",{msg:"Invalid data"})
			return res.render('content/'+folder,{				
			    title:'List of answers',
			    course_name:course_exists.name,
			    course_id:content_exists.course_id,
			    totalMarks:content_exists.marks,
			    actual_term:school_exists.currentTerm,
			    term_name:school_exists.term_name,
			    unit_name:unit_exists.title,
			    content_id:content_exists._id,
			    actual_term:course_exists.currentTerm,
			    test_name:content_exists.title,
			    pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
				csrf_token:res.locals.csrftoken, // always set this buddy
			  })
		  })	
		})
    })
  })
}
/* this method will be called by all assessment types*/
exports.getJSON_Answers = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.params.content_id},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists) return res.status(400).send("Invalid data");
    else if ((String(content_exists.owner_URN) != String(req.user.URN))&&
    	(req.user.access_level >= req.app.locals.access_level.TEACHER))
    	return res.status(400).send("Sorry, but this course is not yours");
  	Marks.find({content_id:req.params.content_id},
  		{__v:0,content_type:0,teacher_id:0,school_id:0,course_id:0,class_id:0,currentTerm:0,academic_year:0})
  	.sort({updatedAt:1})
  	.exec((err,list_answers)=>{
  		if(err) return log_err(err,false,req,res);
  		return res.json(list_answers);
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
	  	var folder="";
	  	switch(content_exists.type){
	  		case 3: folder="automated";break;
	  		case 4: folder="written_test";break;
	  		case 5: folder="uploaded";break;
	  		default:break;
	  	}
	  	if(folder=="") return res.status(400).send("This value is not available");
  		return res.render('content/'+folder+'/view_answer',{
			title:'Answers from student',
			student_URN:marks_exists.student_URN,
			updatedAt:content_exists.updatedAt,
			upload_time:content_exists.upload_time,
			course_id:marks_exists.course_id,
			content_id:marks_exists.content_id,
			marks_id:marks_exists._id,
			pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
			csrf_token:res.locals.csrftoken, // always set this buddy
		});
  	})
  	
  })
}

exports.getJSONViewAnswer = function(req,res,next){
  req.assert('marks_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Marks.findOne({_id:req.params.marks_id},(err,marks_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!marks_exists) return res.status(500).send("Invalid input");
  	var reponse={};
  	reponse.Answers =marks_exists.uploaded_array;
  	Content.findOne({_id:marks_exists.content_id},(err,content_exists)=>{
  		if(err) return log_err(err,false,req,res);
  		else if(!content_exists) return res.status(500).send("Invalid input");
  		if(!Array.isArray(content_exists.q_info))return res.status(500).send("Internal error, test is not available");
  		//sinon
  		reponse.Q =content_exists.q_info;
  		reponse.title =content_exists.title;
  		reponse.total =content_exists.marks;
  		return res.json(reponse);
  	})
  })
}
exports.setMarksToStudent = (req,res,next)=>{
  req.assert('marks_id', 'Invalid data').isMongoId();
  req.assert('marksObtained', 'This marks is invalid').isArray();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Marks.findOne({_id:req.params.marks_id},(err,marks_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!marks_exists) return res.status(500).send("Invalid input");
  	Content.findOne({_id:marks_exists.content_id},(err,content_exists)=>{
		if(err) return log_err(err,false,req,res);
		else if(!content_exists) return res.status(500).send("Invalid input");
		// let s check if marks are not over total MArks
  		var async=require("async"),count=0,totalMarks=0,count2=0;
  		async.eachSeries(content_exists.q_info,(currentQuestion,cb)=>{
  			//currentQuestion contains [m, t]
  			if(req.body.marksObtained[count2] > currentQuestion.m)
  				return cb("Marks are not valid for question_"+Number(count+1))
  			totalMarks+=Number(req.body.marksObtained[count2]);
  			count2++;
  			cb(null);
  		},(err)=>{
  			if(err) return res.status(400).send(err);
  			//sinon
	  		marks_exists.marks =Number(totalMarks);
			marks_exists.percentage =(Number(totalMarks)*100/content_exists.marks).toFixed(2);
			marks_exists.isCorrected =true;
			console.log(" I am seeking "+content_exists.class_id)
			Classe.findOne({_id:marks_exists.class_id},(err,class_exists)=>{
				if(err) return log_err(err,false,req,res);
				else if(!class_exists) return res.status(400).send("Sorry, invalid data");
				marks_exists.level =class_exists.level;
				marks_exists.save((err)=>{
					if(err) return log_err(err,false,req,res);
					new Notification({
			            user_id:req.user._id,
			            user_name:req.user.name,
			            content: req.user.name+" has updated marks for "+content_exists.title
			            +" :=> "+totalMarks+" /"+content_exists.marks,
			            // class_id:req.user.class_id||null,
			            dest_id:marks_exists.student_id,
			            school_id:req.user.school_id,
			            isAuto:false,             
			          }).save((err)=>{
			            if(err) console.log(" You have to log "+err)
			          })
					return res.end();
				})
			})
  		})
		
	})

  })
}
exports.updateTotalMarks = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();
  req.assert('new_total', 'New value is not accepted').isFloat({ min:0 });
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  Content.findOne({_id:req.body.content_id},(err,content_exists)=>{
  	if(err) return log_err(err,false,req,res);
  	else if(!content_exists) return res.status(400).send("Invalid data");
  	else if(content_exists.owner_URN != String(req.user.URN))
  		return res.status(400).send("Sorry, this operation is for the owner of this content");
  	content_exists.marks =req.body.new_total
  	content_exists.save((err)=>{
  		if(err) return log_err(err,false,req,res);
  		return res.end();
  	})
  })
}
