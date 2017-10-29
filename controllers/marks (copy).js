const Content =require('../models/Content'),
	  Unit =require('../models/Unit'),
	  User =require('../models/User'),
	  Marks =require('../models/MARKS'),
	  School =require('../models/School'),
	  Course =require('../models/Course'),
	  log_err=require('./manage/errorLogger');

exports.getPageReport = function(req,res,next){

  School.findOne({_id:req.user.school_id},(err,school_exists)=>{
	if(err)return log_err(err,false,req,res);
	else if(!school_exists) return res.status(400).send("Invalid input");
	return res.render('me/report',{
		title:"Report",
		term_name:school_exists.term_name,
		pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
		csrf_token:res.locals.csrftoken, // always set this buddy
	})
  })
}
exports.getPageReportUniversity = function(req,res,next){
	req.assert('student_id', 'Invalid input').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	User.findOne({_id:req.params.student_id},(err,student_exists)=>{
		if(err) return log_err(err,false,req,res);
		else if(!student_exists) return res.status(400).send("Invalid input");
		School.findOne({_id:student_exists.school_id},(err,school_exists)=>{
			if(err)return log_err(err,false,req,res);
			else if(!school_exists) return res.status(400).send("Invalid input");
			if(req.session.student){
				return res.render('me/report2',{
					title:"Transcript",
					term_name:school_exists.term_name,
					student_name:student_exists.name,
					student_URN:student_exists.URN, 
					term_name:school_exists.term_name,    
					academic_year:new Date().getFullYear(),
					pic_id:req.user._id,pic_name:req.user.name,access_lvl:req.user.access_level,
					csrf_token:res.locals.csrftoken, // always set this buddy
				})
			}else{
				return res.render('me/report2',{
					title:"Transcript",
					term_name:school_exists.term_name,
					student_name:student_exists.name,
					student_URN:student_exists.URN, 
					term_name:school_exists.term_name,    
					academic_year:new Date().getFullYear(),
					pic_id:student_exists._id,pic_name:student_exists.name,access_lvl:student_exists.access_level,
					csrf_token:res.locals.csrftoken, // always set this buddy
				})
			}
		})
  })
}
exports.printableReport = (req,res)=>{
	res.render('me/printReport',{
		title:"General marks",
		school_id:req.user.school_id,
		pic_id:req.user._id,pic_name:req.user.name,access_lvl:req.user.access_level,
		csrf_token:res.locals.csrftoken, // always set this buddy
	});
	console.log("........................."+req.user.school_id)
}
exports.getListAcademicYears =function(req,res,next){
	if(req.session.student){
		Marks.find().distinct("academic_year",{student_id:req.session.student._id},
			(err,listYears)=>{
			if(err) return log_err(err,false,req,res);
			return res.json(listYears);
		})
	}else{
		Marks.find().distinct("academic_year",{student_id:req.user._id},
			(err,listYears)=>{
			if(err) return log_err(err,false,req,res);
			return res.json(listYears);
		})
	}
	
}
exports.getClassAcademicYears =function(req,res,next){
	req.assert('class_id', 'Please choose class').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	Marks.find({class_id:req.params.class_id}).distinct("academic_year",
		(err,listYears)=>{
		if(err) return log_err(err,false,req,res);
		return res.json(listYears);
	})
}
exports.getListTerms =function(req,res,next){
	req.assert('academic_year', 'Choose the academic year').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	if(req.session.student){
		Marks.find().distinct("currentTerm",{student_id:req.session.student._id,
			academic_year:req.params.academic_year},(err,listTerms)=>{
			if(err) return log_err(err,false,req,res);
			return res.json(listTerms);
		})

	}else{
		Marks.find().distinct("currentTerm",{student_id:req.user._id,
			academic_year:req.params.academic_year},(err,listTerms)=>{
			if(err) return log_err(err,false,req,res);
			return res.json(listTerms);
		})
	}
}
exports.getClassListTerms =function(req,res,next){
	req.assert('academic_year', 'Choose the academic year').isInt();
	req.assert('class_id', 'Choose a class').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	Marks.find().distinct("currentTerm",{class_id:req.body.class_id,
		academic_year:req.body.academic_year},(err,listTerms)=>{
		if(err) return log_err(err,false,req,res);
		return res.json(listTerms);
	})
}
exports.getClassMarks =function(req,res,next){
	req.assert('academic_year', 'Choose the academic year').isInt();
	if(req.body.term)
		req.assert('term', 'Choose the academic year').isInt();
	req.assert('class_id', 'Choose a class').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	var async = require("async");
	var studentsList=[],numOfTerms=[];
	var allMarks=[];
	allMarks.push({details:[]});
	async.series([
		(callback_preliminaries)=>{
			async.parallel([
				(callback_StudentList)=>{
					//Caution, if the user is in the class and doesn't submit,he/she won't be on the list
					Marks.find().distinct("student_id",
						{class_id:req.body.class_id,currentTerm:req.body.term,isQuoted:true,
							academic_year:req.body.academic_year},
						(err,abanyeshuriList)=>{
							 if(err) return callback_StudentList(err);
							 studentsList =abanyeshuriList;
							 console.log("1111111111111111111111111"+JSON.stringify(studentsList))
							 return callback_StudentList(null);

						})
				},
				(callback_NumofTerms)=>{
					School.find({_id:req.user.school_id},{},(err,school)=>{
						if(err) return callback_NumofTerms(err);
						numOfTerms=school[0].term_quantity
						// courseList =schoolInfo.;
						console.log("2222222222222222222222222: "+numOfTerms)
						 return callback_NumofTerms(null);
					})	
				},
			],(err)=>{
				//console.log("4444444444444"+JSON.stringify(studentsList))
				return callback_preliminaries(err);
			})	
		},
		(callback_finals)=>{
			var marksData=[];
			marksData.push({studentsList:[]});
			console.log("33333333333333")

			async.each(studentsList,(currentStudent,studentcb)=>{
				var studentData=[]
				studentData.push({termsList:[]})
				console.log("..............................1")
				//allMarks.studentsList.push(currentStudent)
				async.eachOfSeries(numOfTerms,(oneTerm,termcb)=>{
					var termData=[]
					termData.push({couseList:[]});
					//allmarks.studentsList[currentStudent].push(oneTerm)
					console.log("..............................2")
					Marks.find({class_id:req.body.class_id,currentTerm:oneTerm,isQuoted:true,
						academic_year:req.body.academic_year})
						.distinct('course_id').exec((err,distinctCourse)=>{
							if(err) return termcb("Service not available")
							async.each(distinctCourse,(currentCourse,coursecb)=>{
								//select and add test and exam marks with this course,term,student,yare
								var coursemarks=[],courseDetails=[];
								coursemarks.push({reportcourseweight:[]});
								console.log("..............................3")
								async.series([

									(callback_courseDetails)=>{
										Course.find({_id:currentCourse},(err,courseDetails)=>{
							 				if(err) return callback_courseDetails(err);
							 				courseDetails = courseDetails
							 				return callback_courseDetails(null);
							 			})
									},
									(callback_calculations)=>{
										async.parallel([
											(callback_distinctTests)=>{
												Marks.find({student_id:currentStudent,currentTerm:oneTerm,isQuoted:true,
													academic_year:req.body.academic_year,course_id:currentCourse,isCAT:true,})
													.distinct("content_id").exec((err,testList)=>{
													 if(err) return callback_distinctTests(err);
													 async.each(testList,(currenttestmark,testmarkcb)=>{
									 					stdTestMarks+=(currenttestmark.percentage*currenttestmark.marks)/100
									 					//used to divide 
									 					testSuperMarks=currenttestmark.marks

									 					return testmarkcb(null)
									 				},(err)=>{
									 					if(err) return callback_distinctTests(err);
									 					reportTestWeight=(courseDetails.test_quota*courseDetails.weightOnReport)/100
									 					coursemarks.reportcourseweight.push(reportTestWeight);
									 					stdTestMarks=(stdTestMarks*reportTestWeight)/testSuperMarks
									 					coursemarks.push(stdTestMarks);
									 					return callback_calculations()
									 				})
												})
											},
											(callback_distinctExams)=>{
												Marks.find({student_id:currentStudent,currentTerm:oneTerm,isQuoted:true,
														academic_year:req.body.academic_year,course_id:currentCourse,isCAT:false,})
														.distinct("content_id").exec((err,examList)=>{
														 if(err) return callback_distinctExams(err);
														 async.each(examList,(currentexammark,exammark)=>{
										 					stdExamMarks+=currentexammark.percentage*currentexammark.marks
										 					//used to divide 
										 					examSuperMarks=currentexammark.marks
										 					return exammark(null)
										 				},(err)=>{
										 					if(err) return callback_distinctExams(err);
										 					reportExamWeight=(courseDetails.exam_quota*courseDetails.weightOnReport)/100
										 					coursemarks.reportcourseweight.push(reportExamWeight);
										 					stdsExamMarks=(stdExamMarks*reportExamWeight)/examSuperMarks
										 					coursemarks.push(stdExamMarks)
										 					return callback_distinctExams()
										 				})
												})
											}
									 	],(err)=>{
									 		console.log("444444444444")
									 		return callback_calculations(err)
									 	})
									},
								],(err)=>{
									if(err) return coursecb(err);
									termData.couseList[currentCourse].push(coursemarks);
									console.log("55555555555555")
									return coursecb(null);
								})
								
							},(err)=>{
								if(err) return termcb(err)
									console.log("6666666666666666666")
								studentData.courseList[oneTerm].push(termData)
								return termcb(null)
							})
						//this is after selecting
					})

				},(err)=>{
					if(err) return studentcb(err); 
					marksData.termsList[currentStudent].push(studentData)
					console.log("777777777777777777")
					allMarks.details[0].push(marksData)
					return studentcb(null);
				})
			},(err)=>{
				if(err) return callback_finals(err)
					console.log("888888888888888")
				return callback_finals(null)
			})
		}
	],(err)=>{

		res.json(allMarks)

	})
}


exports.getReport_JSON =(req,res,next)=>{
	req.assert('currentTerm', 'Choose the term').isInt();
	req.assert('academic_year', 'Choose the academic year please').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);

	var currentAcademicYear=req.body.academic_year;
	var listCourses=[],listContent_id=[];
	var reportData =[];
	var theUser
	if(req.session.student){
		theUser=req.session.student
	}else{
		theUser=req.user
	}
	/* GET IN FIRST PLACE THE CONTENT LIST for this course,academic year and this student and this class*/
	var async = require("async");

	async.series([
		// 1.
		(callback_getCoursesList)=>{
			Course.find({class_id:theUser.class_id,currentTerm:req.body.currentTerm},
				{school_id:0,teacher_list:0,level:0,attendance_limit:0},
				(err,list_Courses)=>{
					if(err) return callback_getCoursesList(err);
					listCourses =list_Courses;
					console.warn("Courses =>"+JSON.stringify(listCourses))
					callback_getCoursesList(null);
				})
		},
		/* Now for each course compute for content inside*/
		// 2.
		(callback_TreatEachCourse)=>{
			// HEre i don t see why i have updated the term_num like this
			reportData.push({marks:[],total:[],term_num:req.params.currentCourse});
			async.each(listCourses,(currentCourse,cb_courses)=>{
				// for each course we get the test and the exams                
				var listCATs=[],listExams=[];
				async.series([                
					//first let s get the list of Tests and exams for the current course
					(callback_get_CAT_EXAM)=>{
						async.parallel([
							(callback__CAT)=>{
								Marks.find().distinct("content_id",
								{class_id:theUser.class_id,student_id:theUser._id,isQuoted:true,
									academic_year:currentAcademicYear,course_id:currentCourse._id,isCAT:true},
								(err,list_CAT)=>{
									 if(err) return callback__CAT(err);
									 listCATs =list_CAT;
									 console.log("LIST OF CATS "+JSON.stringify(listCATs))
									 return callback__CAT(null);
								})  
							},
							(callback__Exam)=>{
								Marks.find().distinct("content_id",
								{class_id:theUser.class_id,student_id:theUser._id,isQuoted:true,
									academic_year:currentAcademicYear,course_id:currentCourse._id,isCAT:false},
								(err,list_exams)=>{
									 if(err) return callback__Exam(err);
									 listExams =list_exams;
									 console.log(" LIST OF Exams "+JSON.stringify(listExams))
									 return callback__Exam(null);
								})  
							},
						],(err)=>{
							return callback_get_CAT_EXAM(err);
						})
					},
					// in second place now let's compute in paralle total for each course
					(callback_Marks)=>{
						//en parallele les cat et exams
						var studentCATMarks =0,studentExamMarks=0,totalCAT=0,totalExam=0;
						async.parallel([
							// i compute catMarks and totalMarks for this CAT and this student
							(callback_eachCAT)=>{
								async.each(listCATs,(oneCAT,callbackCAT)=>{
									Content.findOne({_id:oneCAT},(err,currentMark)=>{
										if(err) return callbackCAT(err);
										Marks.findOne({content_id:oneCAT,student_id:theUser._id}
											,(err,marksCAT)=>{
												if(err) return callbackCAT(err);
												var amanota =(marksCAT.percentage*currentMark.marks)/100;
												studentCATMarks+= amanota>0? amanota:0;
												totalCAT+= currentMark.marks>0?currentMark.marks:0;
												callbackCAT(null);
										})
									})
								},(err)=>{
									return callback_eachCAT(err);
								})
							},
							(callback_eachExam)=>{
							  async.each(listExams,(oneExam,callbackExam)=>{
									Content.findOne({_id:oneExam},(err,currentMark)=>{
										if(err) return callbackExam(err);
										Marks.findOne({content_id:oneExam,student_id:theUser._id}
											,(err,marksExam)=>{
												if(err) return callbackExam(err);
												var amanota =(marksExam.percentage*currentMark.marks)/100;
												studentExamMarks+= amanota>0? amanota:0;
												totalExam+= currentMark.marks>0?currentMark.marks:0;
												callbackExam(null);
										});
									})
								},(err)=>{
									return callback_eachExam(err);
								})  
							}
						],(err)=>{
							
							// name: , test: , exam: , test_quota , exam_quota
							var noteCat=studentCATMarks*100/totalCAT;
							var noteExam =studentExamMarks*100/totalExam;
							noteCat =noteCat>0?noteCat:0;
							noteExam =noteExam>0?noteExam:0;
							var totalCourse =(noteCat*currentCourse.test_quota/100)+(noteExam*currentCourse.exam_quota/100);
							console.log("  CAT marks "+studentCATMarks+"/"+totalCAT);
							console.log("  Exam marks "+studentExamMarks+"/"+totalExam);
							console.log(" TOTAL "+currentCourse.name+" "+totalCourse);
							reportData[0].marks.push({
										 name:currentCourse.name,
										 code:currentCourse.code
										,test:noteCat
										,exam:noteExam
										,total:totalCourse
										,test_quota:currentCourse.test_quota
										,exam_quota:currentCourse.exam_quota,
										// totalTest:totalCAT,
										// totalExam:totalExam
									})
							return callback_Marks(err);
						})
					}
				],(err)=>{
					return cb_courses(err);
				})               
					 
			},(err)=>{
				return callback_TreatEachCourse(err);
			})        
		}
	],(err)=>{
		if(err) return log_err(err,false,req,res);
		console.log("REPORTmarks =>>>>"+JSON.stringify(reportData.marks))
		console.log("REPORT total =>>>>"+JSON.stringify(reportData.total));
		console.log("REPORT =>>>>"+JSON.stringify(reportData));
		reportData[0].term_num =req.body.currentTerm;
		//console.log()
		return res.json(reportData)
	})
}
	exports.getFullReport_JSON =(req,res,next)=>{
	req.assert('currentTerm', 'Choose the term').isInt();
	req.assert('academic_year', 'Choose the academic year please').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);

	var currentAcademicYear=req.body.academic_year;
	var listCourses=[],listContent_id=[];
	var reportData =[];
	var theUser
	if(req.session.student){
		theUser=req.session.student
	}else{
		theUser=req.user
	}
	/* GET IN FIRST PLACE THE CONTENT LIST for this course,academic year and this student and this class*/
	var async = require("async");

	async.series([
		// 1.
		(callback_getCoursesList)=>{
			Course.find({class_id:theUser.class_id,currentTerm:req.body.currentTerm},
				{school_id:0,teacher_list:0,level:0,attendance_limit:0},
				(err,list_Courses)=>{
					if(err) return callback_getCoursesList(err);
					listCourses =list_Courses;
					console.warn("Courses =>"+JSON.stringify(listCourses))
					callback_getCoursesList(null);
				})
		},
		/* Now for each course compute for content inside*/
		// 2.
		(callback_TreatEachCourse)=>{
			// HEre i don t see why i have updated the term_num like this
			reportData.push({marks:[],total:[],term_num:req.params.currentCourse});
			async.each(listCourses,(currentCourse,cb_courses)=>{
				// for each course we get the test and the exams                
				var listCATs=[],listExams=[];
				async.series([                
					//first let s get the list of Tests and exams for the current course
					(callback_get_CAT_EXAM)=>{
						async.parallel([
							(callback__CAT)=>{
								Marks.find().distinct("content_id",
								{class_id:theUser.class_id,student_id:theUser._id,isQuoted:true,
									academic_year:currentAcademicYear,course_id:currentCourse._id,isCAT:true},
								(err,list_CAT)=>{
									 if(err) return callback__CAT(err);
									 listCATs =list_CAT;
									 console.log("LIST OF CATS "+JSON.stringify(listCATs))
									 return callback__CAT(null);
								})  
							},
							(callback__Exam)=>{
								Marks.find().distinct("content_id",
								{class_id:theUser.class_id,student_id:theUser._id,isQuoted:true,
									academic_year:currentAcademicYear,course_id:currentCourse._id,isCAT:false},
								(err,list_exams)=>{
									 if(err) return callback__Exam(err);
									 listExams =list_exams;
									 console.log(" LIST OF Exams "+JSON.stringify(listExams))
									 return callback__Exam(null);
								})  
							},
						],(err)=>{
							return callback_get_CAT_EXAM(err);
						})
					},
					// in second place now let's compute in paralle total for each course
					(callback_Marks)=>{
						//en parallele les cat et exams
						var studentCATMarks =0,studentExamMarks=0,totalCAT=0,totalExam=0;
						async.parallel([
							// i compute catMarks and totalMarks for this CAT and this student
							(callback_eachCAT)=>{
								async.each(listCATs,(oneCAT,callbackCAT)=>{
									Content.findOne({_id:oneCAT},(err,currentMark)=>{
										if(err) return callbackCAT(err);
										Marks.findOne({content_id:oneCAT,student_id:theUser._id}
											,(err,marksCAT)=>{
												if(err) return callbackCAT(err);
												var amanota =(marksCAT.percentage*currentMark.marks)/100;
												studentCATMarks+= amanota>0? amanota:0;
												totalCAT+= currentMark.marks>0?currentMark.marks:0;
												callbackCAT(null);
										})
									})
								},(err)=>{
									return callback_eachCAT(err);
								})
							},
							(callback_eachExam)=>{
							  async.each(listExams,(oneExam,callbackExam)=>{
									Content.findOne({_id:oneExam},(err,currentMark)=>{
										if(err) return callbackExam(err);
										Marks.findOne({content_id:oneExam,student_id:theUser._id}
											,(err,marksExam)=>{
												if(err) return callbackExam(err);
												var amanota =(marksExam.percentage*currentMark.marks)/100;
												studentExamMarks+= amanota>0? amanota:0;
												totalExam+= currentMark.marks>0?currentMark.marks:0;
												callbackExam(null);
										});
									})
								},(err)=>{
									return callback_eachExam(err);
								})  
							}
						],(err)=>{
							
							// name: , test: , exam: , test_quota , exam_quota
							var noteCat=studentCATMarks*100/totalCAT;
							var noteExam =studentExamMarks*100/totalExam;
							noteCat =noteCat>0?noteCat:0;
							noteExam =noteExam>0?noteExam:0;
							var totalCourse =(noteCat*currentCourse.test_quota/100)+(noteExam*currentCourse.exam_quota/100);
							console.log("  CAT marks "+studentCATMarks+"/"+totalCAT);
							console.log("  Exam marks "+studentExamMarks+"/"+totalExam);
							console.log(" TOTAL "+currentCourse.name+" "+totalCourse);
							reportData[0].marks.push({
										 name:currentCourse.name,
										 code:currentCourse.code
										,test:noteCat
										,exam:noteExam
										,total:totalCourse
										,test_quota:currentCourse.test_quota
										,exam_quota:currentCourse.exam_quota,
										// totalTest:totalCAT,
										// totalExam:totalExam
									})
							return callback_Marks(err);
						})
					}
				],(err)=>{
					return cb_courses(err);
				})               
					 
			},(err)=>{
				return callback_TreatEachCourse(err);
			})        
		}
	],(err)=>{
		if(err) return log_err(err,false,req,res);
		console.log("REPORTmarks =>>>>"+JSON.stringify(reportData.marks))
		console.log("REPORT total =>>>>"+JSON.stringify(reportData.total));
		console.log("REPORT =>>>>"+JSON.stringify(reportData));
		reportData[0].term_num =req.body.currentTerm;
		//console.log()
		return res.json(reportData)
	})

//     /*series of operations*/
//     var async = require("async");
//     
// /*

// 	db.getCollection('marks').aggregate([
//         {$match:{course_id:ObjectId("58b42528d1ab7a761da4ca2a"),student_id:ObjectId("58b425f4d1ab7a761da4ca30"),isCAT:false}},
//         {$group:{ _id:null,somme:{$sum:'$marks'}}}
//         ])
// */  

//     async.series([
//     	(callback_ListCourses)=>{
//     		Marks.find().distinct("course_id",
//     			{class_id:req.user.class_id,student_id:req.user._id,academic_year:currentAcademicYear}
//     			,(err,listCourse_id)=>{
//     				if(err) callback_ListCourses(err);
//     				console.log(" List courses ="+JSON.stringify(listCourse_id))
//     				CourseList=listCourse_id;
//     				callback_ListCourses(null);
//     			})
//     	},
//     	// treat each course
//     	(callback_EachCourse)=>{
//     		var totalTest,totalExam;
//     		//loop over list of courses
//     		async.eachSeries(CourseList, function(currentCourse_id, cb_Compute){
//     			// for each course compute TEST-sum and Exam-sum in parallel
//     			totalTest=0;
//     			totalExam=0
//     			console.log(" Course = "+currentCourse_id)
//     			async.parallel([
// 	    			(callback__Test)=>{
// 						Marks.aggregate([
// 							{$match:{course_id:currentCourse_id,student_id:req.user._id,isCAT:true}},
// 							{$group:{ _id:null,somme:{$sum:'$marks'}}}
// 						],(err,results)=>{
// 							if(err) callback__Test(err);
// 							console.log("Test SUM ="+JSON.stringify(results))
// 							totalTest=results.somme||0;
// 							callback__Test(null);
// 						}) 
// 					},
// 					(callback__Exam)=>{
// 						Marks.aggregate([
// 							{$match:{course_id:currentCourse_id,student_id:req.user._id,isCAT:false}},
// 							{$group:{ _id:null,somme:{$sum:'$marks'}}}
// 						],(err,results)=>{
// 							if(err) callback__Exam(err);
// 							console.log("Exam SUM ="+JSON.stringify(results))
// 							totalExam=results.somme||0;
// 							callback__Exam(null);
// 						}) 
// 					}
//     			],(err)=>{
//     				var note ={name:currentCourse_id,test:totalTest,total:totalExam}
//     				console.log("Adding "+JSON.stringify(note))
//     				notes.push(note);
//     				return cb_Compute(err);
//     			})
//     		}
//     		,(err)=>{
//     			return callback_EachCourse(err);
//     		})
//     	}
//     ],(err)=>{
//     	if(err) return log_err(err,false,req,res);
//     	console.log("===>"+JSON.stringify(notes));
//     	return res.json(notes);
//     })
  
}