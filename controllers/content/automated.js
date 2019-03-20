const Content =require('../../models/Content'),
	  Unit =require('../../models/Unit'),
	  Notification=require("../../models/Notification"),
	  Marks =require('../../models/MARKS'),
	  Classe =require('../../models/Classe'),
	  Course =require('../../models/Course'),
	  log_err=require('../manage/errorLogger');

exports.pageNewAutomated = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  //req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return log_err(errors,true,req,res);  

  Unit.findOne({_id:req.params.unit_id},(err,unit_exists)=>{    
		if(err) return log_err(err,true,req,res);
		else if(!unit_exists) return res.render("./lost",{msg:"Invalid data"})
		//Check if the course is yours

		Course.findOne({_id:unit_exists.course_id},(err,course_exists)=>{
			if(err) return log_err(err,true,req,res);
			else if(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1) 
			return res.render("./lost",{msg:"Sorry this course is not yours"})
			else if(!course_exists)
				return res.render("./lost",{msg:"Invalid data"});
			return res.render('content/automated/new_Automated',{
			title:'Automated assessment',
			unit_name:unit_exists.title,
			course_id:course_exists._id,
			academic_year:unit_exists.academic_year,
			unit_id:req.params.unit_id,
			pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
			csrf_token:res.locals.csrftoken, // always set this buddy
			})
		})
  })
}
/* We receive a post of unit_id and Q and title deadline */
exports.postNew_Automated = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data1').isMongoId();
  req.assert('title', 'A title is required').notEmpty().len(1,30);
  // req.assert('deadline', 'You must select a deadline').isDate();
  req.assert('Q', 'Invalid data2').isArray(); // not sure
  
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
	  var async = require("async");
	  var num =0,totalMarks =0,q_info=[],q_solutions=[];// correct  choices
	  async.eachSeries(req.body.Q, function(currentItem, cb){  
		num++;
		var item={};
		item.c=[];// all choices
		var num_Answers=0;
		async.series([
			(c_back)=>{ // Check informations
				currentItem.t=currentItem.t.trim().toLowerCase();
				if(!currentItem.t) 
					return c_back("A title is required for Q _"+num)
				else if(typeof currentItem.m != "number"||currentItem.m <= 0) 
					return c_back("Marks are required for Q _"+num)
				else if(isNaN(currentItem.p) || currentItem.p > currentItem.m)
					return c_back("Penalty must be less than current mark Q _"+num);
				else if(!Array.isArray(currentItem.c))
					return c_back("There is no choices for Q _"+num);
				c_back(null);
			},(c_back)=>{// now let's check choices. 
				if(currentItem.c.length < 2) return c_back(" At least 2 choices for Q _"+num)    		
				var solutions =[];
				async.eachSeries(currentItem.c,function(choice,cb_2){
					choice.a =choice.a.trim().toLowerCase();
					if(item.c.indexOf(choice.a)!=-1)
						return cb_2("Duplicated choices for Q _"+num);
					else if(!choice.a ||choice.a.length >100) 
						return cb_2("Choice is invalid for Q _"+num);
					else if(choice.b==true){
						solutions.push(choice.a);
						num_Answers++;
					}
					item.c.push(choice.a);
					return cb_2(null);
				},(err)=>{
					q_solutions.push(solutions);
					if(num_Answers==0) return c_back("No answer selected at Q _"+num)
					return c_back(err);
				});  
			},
		],
		(err)=>{ 
		// Fin d' une question
			//We will append the DATA to FINALObject
			item.t=currentItem.t; // TITLE of QUestion
			item.m=Number(currentItem.m) ||0; // MARKS
			item.p=Number(currentItem.p)||0; // PENALTIES per wrong answer
			q_info.push(item); // the questions and all info about
			totalMarks += item.m; 
			return cb(err);
		})
	  }, 
	  (err)=>{ /* END OF LOOPING ALL Q array*/
	  	// console.log("End of all questions and err="+err);
		if(err)  return res.status(400).send(err);
		 // We will save in the DB now the result 
		 /*content*/
		Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
		 	if(err) return log_err(err,false,req,res);
		 	else if(!class_exists) return res.status(400).send('Invalid data');
		 	new Content({
			 	title:req.body.title,
				source_question:"-", // nothing is stored in it
				q_info:q_info, 
				q_solution:q_solutions,
				time:req.body.deadline,
				marks:totalMarks,
				currentTerm:class_exists.currentTerm,
				academic_year:class_exists.academic_year,
				course_id:course_exists._id,
				school_id:course_exists.school_id,
				unit_id:unit_exists._id,
				owner_URN: req.user.URN,
				type: req.app.locals.type.Auto_Assessment,
				setNoCheating:req.body.setNoCheating
			 }).save((err)=>{
			 	if(err) return log_err(err,false,req,res);
			 	return res.end();
			 });
		})		 
	  });
	})
  })
}
exports.postUpdate_Automated = (req,res,next)=>{
  req.assert('unit_id', 'Invalid data').isMongoId();
  req.assert('content_id', 'Invalid data').isMongoId();
  req.assert('title', 'A title is required').notEmpty().len(1,30);
  // req.assert('deadline', 'You must select a deadline').isDate();
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
	  var num =0,totalMarks =0,q_info=[],q_solutions=[];// correct  choices
	  async.eachSeries(req.body.Q, function(currentItem, cb){  
		num++;
		var item={};
		item.c=[];// all choices
		var num_Answers=0;
		async.series([
			(c_back)=>{ // Check informations
				currentItem.t=currentItem.t.trim().toLowerCase();
				if(!currentItem.t) 
					return c_back("A title is required for Q _"+num)
				else if(typeof currentItem.m != "number"||currentItem.m <= 0) 
					return c_back("Marks are required for Q _"+num)
				else if(isNaN(currentItem.p) || currentItem.p > currentItem.m)
					return c_back("Penalty must be less than current mark Q _"+num);
				else if(!Array.isArray(currentItem.c))
					return c_back("There is no choices for Q _"+num);
				c_back(null);
			},
			(c_back)=>{// now let's check choices. 
				if(currentItem.c.length < 2) return c_back(" At least 2 choices for Q _"+num)    		
				var solutions =[];
				async.eachSeries(currentItem.c,function(choice,cb_2){
					choice.a =choice.a.trim().toLowerCase();
					if(item.c.indexOf(choice.a)!=-1)
						return cb_2("Duplicated choices for Q _"+num);
					else if(!choice.a ||choice.a.length >100) 
						return cb_2("Choice is invalid for Q _"+num);
					else if(choice.b==true){
						solutions.push(choice.a);
						num_Answers++;
					}
					item.c.push(choice.a);
					return cb_2(null);
				},(err)=>{
					q_solutions.push(solutions);
					if(num_Answers==0) return c_back("No answer selected at Q _"+num)
					return c_back(err);
				});  
			},
		],
		(err)=>{ 
		// Fin d' une question
			//We will append the DATA to FINALObject
			item.t=currentItem.t; // TITLE of QUestion
			item.m=Number(currentItem.m) ||0; // MARKS
			item.p=Number(currentItem.p)||0; // PENALTIES per wrong answer
			q_info.push(item); // the questions and all info about
			totalMarks += item.m;
			return cb(err);
		})
	  }, 
	  (err)=>{ /* END OF LOOPING ALL Q array*/
		if(err)  return res.status(400).send(err);
		 // We will save in the DB now the result 
		 /*content*/
		 // console.log(JSON.stringify(q_info));
		 // console.log(JSON.stringify(q_solutions));
		 content_exists.q_info=q_info;
		 content_exists.q_solution =q_solutions;
		 content_exists.marks =totalMarks;
		 content_exists.title =req.body.title;
		 content_exists.time = req.body.deadline;
		 content_exists.currentTerm = course_exists.currentTerm;
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
exports.pageEdit_Automated = (req,res,next)=>{
  // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Auto_Assessment},(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");

    Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{
    	if(err) return log_err(err,false,req,res);
		else if(!content_exists)  return res.status(400).send("Invalid data"); 
		// We receive (answers [ items[ p, m, t ,a ,c], ])
	    return res.render('content/automated/edit_Automated',{
	      title:'Update automated test',
	      // test_name:content_exists.title,
	      content_id:content_exists._id,
		  course_id:content_exists.course_id,
		  unit_id:content_exists.unit_id,
	      pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
		  csrf_token:res.locals.csrftoken, // always set this buddy
	    })   	
    })	    
  })    
}
exports.pageGET_Automated = (req,res,next)=>{
  // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);	
   // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Auto_Assessment,
  	school_id:req.user.school_id
  },(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // We receive (answers [ items[ p, m, t ,a ,c], ])
    // We must send back Marks, TITLE, Q ([t,m,c{},p])
    var async = require("async");
    // FOr each Question
    var Q =[],item={};
    async.eachSeries(content_exists.q_info, function(currentQuestion, cb){  
    	// this is a question with like {"c":["12","3432","34324"],"t":"c es tkoi 1+1 ?","m":122,"p":1},
    	item.t =currentQuestion.t;
		item.m =currentQuestion.m;
    	item.p =currentQuestion.p; // the penalty
    	item.c=[]; // init the object then continue
    	var count =0;
    	async.eachSeries(currentQuestion.c,(currentChoice,cb_choice)=>{
    		item.c[count] ={};
    		item.c[count].a =currentChoice;
	    	//check if the kestion is in the answers
	    	item.c[count].b=content_exists.q_solution.indexOf(currentChoice)!=-1?true:false;	
	    	count++;
	    	cb_choice(null);
    	},(err)=>{
    		if(err) return cb(err);
    		// console.log(" Current Question=> "+JSON.stringify(item));
	    	Q.push(item);
	    	// console.log(" Array is => "+JSON.stringify(Q));
	    	item={};
	    	cb(null);
    	})
    },(err)=>{
    	if(err) return log_err(err,false,req,res);
    	console.log(" I will send DATE ="+JSON.stringify(new Date(content_exists.time).getTime()));
    	var reponse ={};
    	reponse.Q = Q;
    	reponse.deadline=new Date(content_exists.time);
    	reponse.title =content_exists.title;
    	reponse.setNoCheating =content_exists.setNoCheating;
    	return res.json(reponse);
    })
  })     
}

exports.pageDO_Automated = (req,res,next)=>{
  req.assert('content_id', 'Invalid data').isMongoId();  
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);
  else if(!req.user.hasPaid && req.user.access_level ==req.app.locals.access_level.STUDENT)
		return res.render("./lost",{msg:"Sorry you have not paid "})
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Auto_Assessment}
  	,(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists) return res.render("./lost",{msg:"Invalid data"})
    else if(new Date().getTime() > content_exists.time)
	    return res.render("./lost",{msg:"Deadline is already reached"})
		else if(!req.user.hasPaid)
			return res.render("./lost",{msg:"Sorry, you  cannot view this ! Pay first"})
    // here let s end the page to the user
    return res.render('content/automated/examination_page',{
		title:'Automated assessment',
		course_id:content_exists.course_id,
		content_id:content_exists._id,
		unit_id:req.params.unit_id,
		academic_year:content_exists.academic_year,
		pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
		csrf_token:res.locals.csrftoken, // always set this buddy
	  })
  })
}
/* DONT DELETE this metho it is not a duplicate of pageGET_Automated 
   because it does not send asnwers back
*/
exports.getQuestions = (req,res,next)=>{
   // We receive content_id in params
  req.assert('content_id', 'Invalid data').isMongoId();
  const errors = req.validationErrors();
  if (errors) return res.status(400).send(errors[0].msg);	
  else if(!req.user.hasPaid&& req.user.access_level ==req.app.locals.access_level.STUDENT)
	return res.status(400).send("Sorry you have not paid");
   // here precise the type 
  Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Auto_Assessment,
  	school_id:req.user.school_id
  },(err,content_exists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!content_exists)  return res.status(400).send("Invalid data");
    // We receive (answers [ items[ p, m, t ,a ,c], ])
    // We must send back Marks, TITLE, Q ([t,m,c{},p])
    var async = require("async");
    // FOr each Question
    var Q =[],item={};
    async.eachSeries(content_exists.q_info, function(currentQuestion, cb){  
    	// this is a question with like {"c":["12","3432","34324"],"t":"c es tkoi 1+1 ?","m":122,"p":1},
    	item.t =currentQuestion.t;
		item.m =currentQuestion.m;
    	item.p =currentQuestion.p; // the penalty
    	item.c=[]; // init the object then continue
    	var count =0;
    	async.eachSeries(currentQuestion.c,(currentChoice,cb_choice)=>{
    		item.c[count] ={};
    		item.c[count].a =currentChoice;
	    	//check if the kestion is in the answers
	    	item.c[count].b=false; // ALWAYS FALSE !!!
	    	count++;
	    	cb_choice(null);
    	},(err)=>{
    		if(err) return cb(err);
    		// console.log(" Current Question=> "+JSON.stringify(item));
	    	Q.push(item);
	    	// console.log(" Array is => "+JSON.stringify(Q));
	    	item={};
	    	cb(null);
    	})
    },(err)=>{
    	if(err) return log_err(err,false,req,res);
    	// console.log(" I will send DATE ="+JSON.stringify(new Date(content_exists.time).getTime()));
    	var reponse ={};
    	reponse.Q = Q;
    	reponse.deadline=new Date(content_exists.time);
    	reponse.title =content_exists.title;
    	reponse.marks =content_exists.marks;
      	return res.json(reponse);
    })
  })
}
exports.postAnswers = (req,res,next)=>{
	req.assert('content_id', 'Invalid data').isMongoId();
	req.assert("studentChoices","Answers are not valid").isArray();
	const errors = req.validationErrors();
  	if (errors) return res.status(400).send(errors[0].msg);
  	else if(req.user.access_level != req.app.locals.access_level.STUDENT)
  		return res.status(400).send("Sorry you are not a student");
  	else if(!req.user.hasPaid && req.user.access_level ==req.app.locals.access_level.STUDENT)
		return res.status(400).send("Sorry you have not paid");
  	Content.findOne({_id:req.params.content_id,type:req.app.locals.type.Auto_Assessment,
  		school_id:req.user.school_id
  	},(err,content_exists)=>{
  		// console.log(" we arer here......"+JSON.stringify(req.app.locals))
	    if(err) return log_err(err,false,req,res);
	    else if(!content_exists) return res.status(400).send("This content does not exists");
	    // Checking if deadline is not over !!
	    else if(new Date() > content_exists.time) 
	    	return res.status(400).send("Sorry the deadline was reached !");
	    // checking if type is Auto assessmnet 
	    else if(content_exists.type !=req.app.locals.type.Auto_Assessment)	    	
	    	return res.status(400).send("Invalid data");    
	 
	    else if(req.user.access_level!= req.app.locals.access_level.STUDENT){
	    	return res.status(400).send("Sorry you are not a student"); 
	    }
	    //CHecking if array is valid
	    else if(req.body.studentChoices.length != content_exists.q_solution.length)
	    	return res.status(400).send("Sorry the answers are not valid!");
	    //Correcting answers with penalty
	    //Iterate over studentChoices array
	    // console.log(" we arer here")
	    var async=require("async"),count=0,finalMarks=content_exists.marks;
	    console.log(" TOTAL MRKS ="+finalMarks)
	    async.eachSeries(req.body.studentChoices, function(currentListChoice, cb){
	    	if(!Array.isArray(currentListChoice)) return cb("Invalid choices");
	    	// iterate over the choices in each kestion 
	    	var num_wrong=0;
	    	// console.log(" CURRENT GIVEN CHOICES ="+JSON.stringify(currentListChoice))
	    	// console.log(" CURRENT ANSWERS CHOICES ="+JSON.stringify(content_exists.q_solution[count]))
	    	// console.log(" PENALTy ="+JSON.stringify(content_exists.q_info[count].p))
	    	async.eachSeries(currentListChoice,(currentChoice,cb_correction)=>{
	    		// if one choice is false, then just stop he has failed	   
	    		// console.log(" Check if  "+JSON.stringify(currentChoice)+" exists in "
	    			// +JSON.stringify(content_exists.q_solution[count]));
	    		if(content_exists.q_solution[count].indexOf(currentChoice) ==-1){
	    			num_wrong++;
	    			// console.log(" DON't exists");	    			
	    			return cb_correction(null);
	    		}
	    		return cb_correction(null);
	    	},(err)=>{
	    		if(err) return cb(err);
	    		//let s check if he has failed by providing less or more answers than attendu
	    		else if(num_wrong >0 || currentListChoice.length != content_exists.q_solution[count].length){
	    			// remove penalty and marks
	    			// console.log("Before "+finalMarks);
	    			finalMarks -= content_exists.q_info[count].p;
	    			finalMarks -= content_exists.q_info[count].m;
	    			// console.log("Now "+finalMarks);
	    		}
	    		// console.log(" finalMarks ="+finalMarks)
	    		count++;
	    		return cb(null);
	    	});// fin async correction
	    },(err)=>{
	    	if(err) return res.status(400).send(err);
	    	finalMarks = finalMarks>0? finalMarks:0;
	    	Course.findOne({_id:content_exists.course_id},(err,course_exists)=>{
	    		if(err) return log_err(err,false,req,res);
	    		else if(!course_exists) return res.status(400).send("The course doesn't exists");
	    		Classe.findOne({_id:course_exists.class_id},(err,class_exists)=>{
				  if(err) return log_err(err,false,req,res);
				  else if(!class_exists) return res.status(400).send('Invalid data');
				//Verify if answer exists
		    		var currentAccademic_year= class_exists.academic_year; // save like 17
		    		Marks.findOne(
		    			{student_id:req.user._id,content_id:content_exists._id,academic_year:currentAccademic_year}
		    			,(err,marks_exists)=>{
		    			if(err) return log_err(err,false,req,res);
		    			else if(marks_exists)
		    				return res.status(400).send("Sorry, you submit only once ");
		    			new Marks({
		    				isCorrected:true,
				    		content_type:req.app.locals.type.Auto_Assessment,
				    		content_id:content_exists._id,
				    		teacher_id:course_exists.teacher_list[0],
				    		student_id:req.user._id,
				    		student_URN:req.user.URN,
				    		marks: finalMarks, // la note k il a eu
				    		percentage:finalMarks*100/content_exists.marks,// here is the percentage
				    		school_id:req.user.school_id,
				    		class_id:course_exists.class_id,
				    		course_id:content_exists.course_id,
				    		course_name:course_exists.name,
				    		level: course_exists.level,
				    		// uploaded_file:"",
				    		// uploaded_text:"",
				    		uploaded_array:req.body.studentChoices,
				    		currentTerm: class_exists.currentTerm,
				    		academic_year:class_exists.academic_year,
				    		comment:req.body.comment||null,
		    			}).save((err)=>{
		    				if(err) return log_err(err,false,req,res);
		    				new Notification({
					            user_id:req.user._id,
					            user_name:req.user.name,
					            content: "Marks for the automated assessment "
					            +content_exists.title
					            +" in "+course_exists.name+
					            ":=>"+finalMarks+"/"+content_exists.marks,
					            // class_id:req.user.class_id||null,
					            school_id:req.user.school_id,
					            dest_id:req.user._id,
					            isAuto:false,             
					          }).save((err)=>{
					            if(err) console.log(" You have to log "+err)
					          })
			    			return res.json(finalMarks);
		    			})
		    		})
				})	
	    	})
	    })
	});
}
