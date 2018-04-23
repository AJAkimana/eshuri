const Content =require('../models/Content'),
	  Unit =require('../models/Unit'),
	  User =require('../models/User'),
	  Marks =require('../models/MARKS'),
	  School =require('../models/School'),
	  Classe =require('../models/Classe'),
	  Course =require('../models/Course'),
	  Util=require('../utils'),
	  fs=require('fs'),
      path=require('path'),
	  log_err=require('./manage/errorLogger');

exports.getPageReport = function(req,res,next){
	var accLvl = req.user.access_level,
		student=req.app.locals.access_level.STUDENT,
		admin=req.app.locals.access_level.ADMIN,
		adminteacher=req.app.locals.access_level.ADMIN_TEACHER;
		teacher=req.app.locals.access_level.TEACHER;

	//var thisUser='';

	School.findOne({_id:req.user.school_id},(err,school_exists)=>{
		if(err) return res.render("./lost",{msg:"Invalid data"});
		else if(!school_exists) return res.render("./lost",{msg:"Invalid data"})
		if(accLvl==student){
			return res.render('me/report2',{
				title:"Report",
				term_name:school_exists.term_name,
				pic_id:req.user._id,pic_name:req.user.name.replace('\'',"\\'"),access_lvl:req.user.access_level,
				csrf_token:res.locals.csrftoken, // always set this buddy
			});
		}
		if(accLvl<=teacher){
			Classe.findOne({school_id:school_exists._id, class_teacher:req.user._id}, (err, classinfo)=>{
				if(err) return res.render("./lost",{msg:"Invalid data"});
				else if(accLvl===teacher) {
					if(!classinfo) return res.render("./lost",{msg:"Sorry, It seems like you don't have any class as CLASSTEACHER. Please contact you admin to assign to it"});
				}
				var classId=classinfo?classinfo._id:null;
				return res.render('me/mark_report',{
					title:"General marks",
					school_id:req.user.school_id,
					school_name:school_exists.name,
					district:school_exists.district_name,
					teacher_class:classId,
					telephone:school_exists.contact.telephone,
					po_code:school_exists.contact.postal_code,
					school_pob:school_exists.contact.postal_code,
					pic_id:req.user._id,pic_name:req.user.name,access_lvl:req.user.access_level,
					csrf_token:res.locals.csrftoken, // always set this buddy
				});
			})
		}
	})
}
exports.getPageChart = function(req, res, next){
	return res.render('me/chart')
}
exports.getReportPageToTeacher=(req, res, next)=>{
	var accLvl = req.user.access_level;
	var teacher=req.app.locals.access_level.TEACHER;
	var adminteacher=req.app.locals.access_level.ADMIN_TEACHER;
	//var thisUser='';

	School.findOne({_id:req.user.school_id},(err,school_exists)=>{
		if(err)return log_err(err,false,req,res);
		else if(!school_exists) return res.render("./lost",{msg:"Invalid data"})
		Classe.findOne({school_id:school_exists._id,class_teacher:req.user._id},(err, thisClass)=>{
			if(err) return log_err(err,false,req,res);
			else if(!thisClass) return res.render("./lost",{msg:"Sorry, you are not CLASS TEACHER. Please contact admin!"});
			return 	res.render('me/class_report',{
			title:"General marks",
			classe:thisClass._id,
			school_id:req.user.school_id,
			school_name:school_exists.name,
			school_district:school_exists.district_name,
			school_phone:school_exists.contact.telephone,
			school_pob:school_exists.contact.postal_code,
			pic_id:req.user._id,pic_name:req.user.name,access_lvl:req.user.access_level,
			csrf_token:res.locals.csrftoken, // always set this buddy
		});
		})
	})
}
exports.getPageReportUniversity = function(req,res,next){
	req.assert('student_id', 'Invalid input').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.render("./lost",{msg:errors[0].msg});
	User.findOne({_id:req.user._id, access_level:req.app.locals.access_level.STUDENT},(err,student_exists)=>{
		if(err) return log_err(err,false,req,res);
		else if(!student_exists) return res.render("./lost",{msg:"Invalid data"});
		School.findOne({_id:student_exists.school_id},(err,school_exists)=>{
			if(err)return log_err(err,false,req,res);
			else if(!school_exists) return res.render("./lost",{msg:"Invalid data"});
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
					school_name:school_exists.name,
					district:school_exists.school_district,
					telephone:school_exists.contact.telephone,
					po_code:school_exists.contact.postal_code,
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
	school_id = req.user.school_id;
	var school_name, school_district, area_name;
	School.findOne({_id:school_id},{name:1,cover_photo:1,district_name:1},(err, school_exists)=>{
		if(err) return log_err(err,false,req,res);
    else if(!school_exists) return res.render("./lost",{msg:"This school was not recognized"});
	  return res.render('me/mark_report',{
			title:"General marks",
			school_id:req.user.school_id,
			school_name:school_exists.name,
			school_district:school_exists.district_name,
			pic_id:req.user._id,pic_name:req.user.name,access_lvl:req.user.access_level,
			csrf_token:res.locals.csrftoken, // always set this buddy
		});
	})
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
		else if(!listYears.length) return res.status(400).send("This class does not have enough contents");
		return res.json(listYears);
	})
}
exports.getListTerms =function(req,res,next){
	req.assert('academic_year', 'Choose the academic year').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	var accLvl=req.user.access_level;
	var teacher=req.app.locals.access_level.TEACHER;
	var adminteacher=req.app.locals.access_level.ADMIN_TEACHER;
	var parent=req.app.locals.access_level.PARENT;
	if(req.session.student)
		Marks.find().distinct("currentTerm",{student_id:req.session.student._id,
			academic_year:req.params.academic_year},(err,listTerms)=>{
			if(err) return log_err(err,false,req,res);
			return res.json(listTerms);
		})
	else if(accLvl==parent)
		Marks.find().distinct("currentTerm",{student_id:req.user._id,
			academic_year:req.params.academic_year},(err,listTerms)=>{
			if(err) return log_err(err,false,req,res);
			return res.json(listTerms);
		})
	else{
		Marks.find().distinct("currentTerm",{academic_year:req.params.academic_year},(err,listTerms)=>{
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
					Marks.distinct("student_id",
						{class_id:req.body.class_id,currentTerm:req.body.term,isQuoted:true,
							academic_year:req.body.academic_year},
						(err,abanyeshuriList)=>{
							 if(err) return callback_StudentList(err);
							 studentsList =abanyeshuriList;
							 //console.log("1111111111111111111111111"+JSON.stringify(studentsList))
							 return callback_StudentList(null);

						})
				},
				(callback_NumofTerms)=>{
					School.find({_id:req.user.school_id},{},(err,school)=>{
						if(err) return callback_NumofTerms(err);
						numOfTerms=school[0].term_quantity
						// courseList =schoolInfo.;
						//console.log("2222222222222222222222222: "+numOfTerms)
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
			//console.log("33333333333333")

			async.each(studentsList,(currentStudent,studentcb)=>{
				var studentData=[]
				studentData.push({termsList:[]})
				//console.log("..............................1")
				//allMarks.studentsList.push(currentStudent)
				async.eachOfSeries(numOfTerms,(oneTerm,termcb)=>{
					var termData=[]
					termData.push({couseList:[]});
					//allmarks.studentsList[currentStudent].push(oneTerm)
					// console.log("..............................2")
					Marks.find({class_id:req.body.class_id,currentTerm:oneTerm,isQuoted:true,
						academic_year:req.body.academic_year})
						.distinct('course_id').exec((err,distinctCourse)=>{
							if(err) return termcb("Service not available")
							async.each(distinctCourse,(currentCourse,coursecb)=>{
								//select and add test and exam marks with this course,term,student,yare
								var coursemarks=[],courseDetails=[];
								coursemarks.push({reportcourseweight:[]});
								// console.log("..............................3")
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
									 		//console.log("444444444444")
									 		return callback_calculations(err)
									 	})
									},
								],(err)=>{
									if(err) return coursecb(err);
									termData.couseList[currentCourse].push(coursemarks);
									//console.log("55555555555555")
									return coursecb(null);
								})
								
							},(err)=>{
								if(err) return termcb(err)
									//console.log("6666666666666666666")
								studentData.courseList[oneTerm].push(termData)
								return termcb(null)
							})
						//this is after selecting
					})

				},(err)=>{
					if(err) return studentcb(err); 
					marksData.termsList[currentStudent].push(studentData)
					//console.log("777777777777777777")
					allMarks.details[0].push(marksData)
					return studentcb(null);
				})
			},(err)=>{
				if(err) return callback_finals(err)
					//console.log("888888888888888")
				return callback_finals(null)
			})
		}
	],(err)=>{
		//console.warn("Courses =>"+JSON.stringify(allMarks))
		res.json(allMarks)

	})
}
exports.getEndTermMarks=(req,res,next)=>{
	req.assert('class_id', 'Invalid data').isMongoId();
	req.assert('academic_year', 'Invalid data').isInt();
	req.assert('term', 'Invalid data').isInt();

	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);

	var async = require("async");
	var students = [],marks = {}, mixed = [], ordered = [],objectMark = {}, parametters={};
	var outTextMarks=0, outExamMarks=0, outTotal=0;
	// Get class infomation
	Classe.findOne({_id:req.body.class_id},(err, classe_info)=>{
		if(err) return log_err(err,false,req,res);
		else if(!classe_info) return log_err(err,false,req,res);
		marks.classe_name = classe_info.name;
		marks.students = [];
		if(req.body.academic_year==classe_info.academic_year) parametters={class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT};
		else parametters={prev_classes:req.body.class_id, access_level:req.app.locals.access_level.STUDENT};
	//""""""""""""""""""//
	//"""""" STart """""//
	//""""""""""""""""""//
	// 1--Get all students
		async.series([(getClassStudents_Cb)=>{
			User.find(parametters, {_id:1,name:1,class_id:1, URN:1},(err, this_class_students)=>{
				if(err) return getClassStudents_Cb(err);
				students = this_class_students;
				return getClassStudents_Cb(null);
			})
		},(eachStudent_Cb=>{
	// 2--Get courses for every students
			async.each(students, (thisStudent, student_Cb)=>{
				var markCat=0,markExam=0,markCatOutOf=0,markExamOutOf=0;
				async.series([(getStudentCourses_Cb)=>{
					Course.find({class_id:req.body.class_id,currentTerm:req.body.term,name:{$ne:'conduite'}},(err,list_Courses)=>{
						if(err) return getStudentCourses_Cb(err);
						listCourses =list_Courses;
						getStudentCourses_Cb(null);
					})
				},(treatEachCoaurse_Cb)=>{
					async.each(listCourses, (thisCourse, course_Cb)=>{
						var listCATs=[],listExams=[];
	// 3-- Get quizzes and Exams for every courses
						async.series([(catAndExamContents_Cb)=>{
							async.parallel([(cat_Cb)=>{
								Marks.find().distinct("content_id",{class_id:req.body.class_id, student_id:thisStudent._id,isQuoted:true, academic_year:req.body.academic_year,course_id:thisCourse._id,isCAT:true},
								(err,list_CAT)=>{
									 if(err) return cat_Cb(err);
									 listCATs=list_CAT;
									 return cat_Cb(null);
								}) 
							},(exam_Cb)=>{
								Marks.find().distinct("content_id",{class_id:req.body.class_id, student_id:thisStudent._id,isQuoted:true, academic_year:req.body.academic_year,course_id:thisCourse._id,isCAT:false},
								(err,list_exams)=>{
									 if(err) return exam_Cb(err);
									 listExams=list_exams;
									 return exam_Cb(null);
								}) 
							}],(err)=>{
								if(err) return catAndExamContents_Cb(err);
								return catAndExamContents_Cb(null)
							})
						},(catAndExamMarks)=>{
							var studentCATMarks =0,studentExamMarks=0,totalCAT=0,totalExam=0;
							async.parallel([(catMarks_Cb)=>{
								async.each(listCATs, (thisCat, cat__Cb)=>{
									Content.findOne({_id:thisCat},(err,currentMark)=>{
										if(err) return cat__Cb(err);
										Marks.findOne({content_id:thisCat,student_id:thisStudent._id},(err,marksCAT)=>{
											if(err) return cat__Cb(err);
	//--- Calculate test marks from percent to actual marks ---//
											var amanota =(marksCAT.percentage*currentMark.marks)/100;
											studentCATMarks+= amanota>0? amanota:0;
											totalCAT+= currentMark.marks>0?currentMark.marks:0;
											cat__Cb(null);
										})
									})
								},(err)=>{
									if(err) return catMarks_Cb(err);
									return catMarks_Cb(null);
								})
							},(examMarks_Cb)=>{
								async.each(listExams, (thisExam, exam__Cb)=>{
									Content.findOne({_id:thisExam},(err,currentMark)=>{
										if(err) return exam__Cb(err);
										Marks.findOne({content_id:thisExam,student_id:thisStudent._id}
											,(err,marksExam)=>{
											if(err) return exam__Cb(err);
	//--- Calculate Exam marks from percent to actual marks ---//
											var amanota =(marksExam.percentage*currentMark.marks)/100;
											studentExamMarks+= amanota>0? amanota:0;
											totalExam+= currentMark.marks>0?currentMark.marks:0;
											exam__Cb(null);
										});
									})
								},(err)=>{
									return examMarks_Cb(null);
								})
							}],(err)=>{
								if(err) return catAndExamMarks(err);
	// 4--Sum up marks from tests and quizzes of every courses
								var testWeight = thisCourse.test_quota>0?thisCourse.test_quota:0;
								var examWeight = thisCourse.exam_quota>0?thisCourse.exam_quota:0;
								var courseWeight = !thisCourse.weightOnReport ? testWeight+examWeight : thisCourse.weightOnReport;

								var noteCat=(studentCATMarks*testWeight)/totalCAT;
								var noteExam =(studentExamMarks*examWeight)/totalExam;
								noteCat =noteCat>0?noteCat:0;
								noteExam =noteExam>0?noteExam:0;
								markCat += noteCat;
								markExam += noteExam;
								markCatOutOf += testWeight;
								markExamOutOf += examWeight;
								return catAndExamMarks(null);
							})
						}],(err)=>{
							if(err) return course_Cb(err);
							return course_Cb(null);
						})
					},(err)=>{
						if(err) return treatEachCoaurse_Cb(err);
						return treatEachCoaurse_Cb(null);
					})
				}],(err)=>{
					if(err) return student_Cb(err);
	// 5--Save every students marks into array
					var totalMarks = markCat + markExam;
					var totalQuota = markCatOutOf + markExamOutOf;
					var perctg = totalMarks*100/totalQuota;
					outTextMarks = markCatOutOf;
					outExamMarks = markExamOutOf;
					outTotal = totalQuota;
					mixed.push({name:thisStudent.name.toUpperCase(), id:thisStudent._id, urn:thisStudent.URN,test:markCat,exam:markExam,percent:perctg,total:totalMarks})
					return student_Cb(null)
				})
			},(err)=>{
				if(err) return eachStudent_Cb(err);
				return eachStudent_Cb(null)
			})
		})],(err)=>{
			if(err) return log_err(err,false,req,res);
			marks.students = mixed.sort(endTermPlaces) // Sort by 1 to n
			marks.test_q = outTextMarks; 
			marks.exam_q = outExamMarks;
			marks.total_q = outTotal;
			marks.term = req.body.term;
	// 6-- Return marks json
			// console.log(JSON.stringify(marks))
			return res.json(marks);
		})
	})
}
exports.getSumTermMarks = (req, res, next)=>{
	req.assert('class_id', 'Invalid data').isMongoId();
	req.assert('academic_year', 'Invalid data').isInt();
	req.assert('term', 'Invalid data').isInt();

	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);

	var async = require("async");
	var students = [],marks = {}, mixed = [], ordered = [],objectMark = {}, parametters={};
	var outTextMarks=0, outExamMarks=0, outTotal=0;
	var index_user, cat_exam, courseWeight;
	// Get class infomation
	Classe.findOne({_id:req.body.class_id},(err, classe_info)=>{
		if(err) return log_err(err,false,req,res);
		else if(!classe_info) return log_err(err,false,req,res);
		marks.classe_name = classe_info.name;
		marks.students = [];
		if(req.body.academic_year==classe_info.academic_year) parametters={class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT};
		else parametters={prev_classes:req.body.class_id, access_level:req.app.locals.access_level.STUDENT};
	//""""""""""""""""""//
	//"""""" STart """""//
	//""""""""""""""""""//
	// 1--Get all students
		async.series([(getClassStudents_Cb)=>{
			User.find(parametters, {_id:1,name:1,class_id:1, URN:1},(err, this_class_students)=>{
				if(err) return getClassStudents_Cb(err);
				students = this_class_students;
				return getClassStudents_Cb(null);
			})
		},(eachStudent_Cb=>{
			async.each(students, (thisStudent, student_Cb)=>{
				var markCat=0,markExam=0,markCatOutOf=0,markExamOutOf=0,echecs=0;
				mixed.push({name:thisStudent.name, urn:thisStudent.URN, courses:[]})
	// 2--Get courses for every students
				async.series([(getStudentCourses_Cb)=>{
					Course.find({class_id:req.body.class_id,currentTerm:req.body.term,name:{$ne:'conduite'}},(err,list_Courses)=>{
						if(err) return getStudentCourses_Cb(err);
						listCourses =list_Courses;
						getStudentCourses_Cb(null);
					})
				},(treatEachCoaurse_Cb)=>{
					var courseMrks=0, courseWgt=0, avg_marks=0;
					async.each(listCourses, (thisCourse, course_Cb)=>{
						var listCATs=[],listExams=[];
	// 3-- Get quizzes and Exams for every courses
						async.series([(catAndExamContents_Cb)=>{
							async.parallel([(cat_Cb)=>{
								Marks.find().distinct("content_id",{class_id:req.body.class_id, student_id:thisStudent._id,isQuoted:true, academic_year:req.body.academic_year,course_id:thisCourse._id,isCAT:true},
								(err,list_CAT)=>{
									 if(err) return cat_Cb(err);
									 listCATs=list_CAT;
									 return cat_Cb(null);
								}) 
							},(exam_Cb)=>{
								Marks.find().distinct("content_id",{class_id:req.body.class_id, student_id:thisStudent._id,isQuoted:true, academic_year:req.body.academic_year,course_id:thisCourse._id,isCAT:false},
								(err,list_exams)=>{
									 if(err) return exam_Cb(err);
									 listExams=list_exams;
									 return exam_Cb(null);
								}) 
							}],(err)=>{
								if(err) return catAndExamContents_Cb(err);
								return catAndExamContents_Cb(null)
							})
						},(catAndExamMarks)=>{
							var studentCATMarks =0,studentExamMarks=0,totalCAT=0,totalExam=0;
							async.parallel([(catMarks_Cb)=>{
								async.each(listCATs, (thisCat, cat__Cb)=>{
									Content.findOne({_id:thisCat},(err,currentMark)=>{
										if(err) return cat__Cb(err);
										Marks.findOne({content_id:thisCat,student_id:thisStudent._id},(err,marksCAT)=>{
											if(err) return cat__Cb(err);
	//--- Calculate test marks from percent to actual marks ---//
											var amanota =(marksCAT.percentage*currentMark.marks)/100;
											studentCATMarks+= amanota>0? amanota:0;
											totalCAT+= currentMark.marks>0?currentMark.marks:0;
											cat__Cb(null);
										})
									})
								},(err)=>{
									if(err) return catMarks_Cb(err);
									return catMarks_Cb(null);
								})
							},(examMarks_Cb)=>{
								async.each(listExams, (thisExam, exam__Cb)=>{
									Content.findOne({_id:thisExam},(err,currentMark)=>{
										if(err) return exam__Cb(err);
										Marks.findOne({content_id:thisExam,student_id:thisStudent._id}
											,(err,marksExam)=>{
											if(err) return exam__Cb(err);
	//--- Calculate Exam marks from percent to actual marks ---//
											var amanota =(marksExam.percentage*currentMark.marks)/100;
											studentExamMarks+= amanota>0? amanota:0;
											totalExam+= currentMark.marks>0?currentMark.marks:0;
											exam__Cb(null);
										});
									})
								},(err)=>{
									return examMarks_Cb(null);
								})
							}],(err)=>{
								if(err) return catAndExamMarks(err);
	// 4--Sum up marks from tests, quizzes and exams of every courses
								var testWeight = thisCourse.test_quota>0?thisCourse.test_quota:0;
								var examWeight = thisCourse.exam_quota>0?thisCourse.exam_quota:0;
								courseWeight = !thisCourse.weightOnReport ? testWeight+examWeight : thisCourse.weightOnReport;

								var noteCat=(studentCATMarks*testWeight)/totalCAT;
								var noteExam =(studentExamMarks*examWeight)/totalExam;
								noteCat =noteCat>0?noteCat:0;
								noteExam =noteExam>0?noteExam:0;
								cat_exam = noteCat+noteExam;
								markCat += noteCat;
								markExam += noteExam;
								markCatOutOf += testWeight;
								markExamOutOf += examWeight;

								index_user=mixed.findIndex(x=>x.urn==thisStudent.URN);
								mixed[index_user].courses.push({name:Util.getShort(thisCourse.name,3)+' /'+courseWeight,points:cat_exam,outof:courseWeight})
								courseMrks+=cat_exam;
								courseWgt+=courseWeight;

								return catAndExamMarks(null);
							})
						}],(err)=>{
							if(err) return course_Cb(err);
	// 5--Counting student fails
							if(cat_exam<(courseWeight/2)) echecs++;
							return course_Cb(null);
						})
					},(err)=>{
						if(err) return treatEachCoaurse_Cb(err);
						return treatEachCoaurse_Cb(null);
					})
				}],(err)=>{
					if(err) return student_Cb(err);
	// 6--Save every students marks into array
					var totalMarks = markCat + markExam;
					var totalQuota = markCatOutOf + markExamOutOf;
					var perctg = totalMarks*100/totalQuota;
					outTextMarks = markCatOutOf;
					outExamMarks = markExamOutOf;

					var marksTot = 'marks /'+totalQuota;
					mixed[index_user][marksTot]=totalMarks.toFixed(1);
					mixed[index_user].pct=perctg.toFixed(1);
					mixed[index_user].fails=echecs;

					return student_Cb(null)
				})
			},(err)=>{
				if(err) return eachStudent_Cb(err);
				return eachStudent_Cb(null)
			})
		})],(err)=>{
			if(err) return log_err(err,false,req,res);
			// Sort by 1 to n
			marks.students = mixed.sort(termPlaces);
			marks.test_q = outTextMarks; 
			marks.exam_q = outExamMarks;
			marks.total_q = outTotal;
			marks.term = req.body.term;
	// 7-- Return marks json
			console.log(JSON.stringify(marks))
			return res.json(marks);
		})
	})
}
exports.getMidTermMarks = (req, res, next)=>{
	req.assert('class_id', 'Invalid data').isMongoId();
	req.assert('academic_year', 'Invalid data').isInt();
	req.assert('term', 'Invalid data').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	var async = require("async");
	var students = [],marks = {}, mixed = [], ordered = [],objectMark = {}, parametters={}, stdt_courses=[];
	var outMarks = 0, total=0;
	var index_user, courseMark, courseWeight;

	Classe.findOne({_id:req.body.class_id},(err, classe_info)=>{
		if(err) return log_err(err,false,req,res);
		else if(!classe_info) return log_err(err,false,req,res);
		marks.classe_name = classe_info.name;
		marks.students = [];
		if(req.body.academic_year==classe_info.academic_year) parametters={class_id:req.body.class_id,access_level:req.app.locals.access_level.STUDENT};
		else parametters={prev_classes:req.body.class_id, access_level:req.app.locals.access_level.STUDENT}
		async.series([(callBack_getStudentList)=>{
			User.find(parametters, {_id:1,name:1,class_id:1, URN:1},(err, this_class_students)=>{
				if(err) return callBack_getStudentList(err);
				students = this_class_students;
				return callBack_getStudentList(null);
			})
		},(callBack_treatEachStudents)=>{
			async.each(students, (thisStudent, studentCb)=>{
				mixed.push({name:thisStudent.name, urn:thisStudent.URN, courses:[]})
				var listAssessmts = [],listCourses=[];
				var echecs=0;
				async.series([(Cb_getCourses)=>{
					Course.find({class_id:req.body.class_id, currentTerm:req.body.term, name:{$ne:'conduite'}},(err, clsCourses)=>{
						if(err) return Cb_getCourses(err);
						listCourses = clsCourses;
						return Cb_getCourses(null);
					})
				},(Cb_eachCourses)=>{
					var courseMrks=0, courseWgt=0, avg_marks=0;
					async.each(listCourses, (thisCourse, courseCb)=>{
						async.series([(Cb_getAssessments)=>{
							Marks.find().distinct("content_id", {class_id:req.body.class_id,course_id:thisCourse._id,student_id:thisStudent._id,isQuoted:true,academic_year:req.body.academic_year},(err, student_assmnts)=>{
								if(err) return Cb_getAssessments(err);
								listAssessmts = student_assmnts;
								return Cb_getAssessments(null);
							})
						},(Cb_getMarksFromAssmnts)=>{
							var totalAssmnts = 0, totalMarks = 0;
							async.each(listAssessmts, (thisList, list_callBack)=>{
								Content.findOne({_id:thisList}, (err, assmntMarks)=>{
									if(err) return list_callBack(err);
									Marks.findOne({content_id:thisList, student_id:thisStudent._id},(err, mark)=>{
										if(err) return list_callBack(err);
										var overMarks = (mark.percentage*assmntMarks.marks)/100;
										totalAssmnts += (overMarks>0)?overMarks:0;
										totalMarks += assmntMarks.marks>0?assmntMarks.marks:0;
										return list_callBack(null)
									})
								})
							},(err)=>{
								if(err) Cb_getMarksFromAssmnts(err);
								index_user=mixed.findIndex(x=>x.urn==thisStudent.URN);
								courseMark=totalAssmnts;
								courseWeight=totalMarks
								mixed[index_user].courses.push({name:Util.getShort(thisCourse.name,3)+' /'+totalMarks,points:totalAssmnts,outof:totalMarks})
								courseMrks+=totalAssmnts;
								courseWgt+=totalMarks
								return Cb_getMarksFromAssmnts(null);
							})
						}],(err)=>{
							if(err) courseCb(err)
							if(courseMark<(courseWeight/2)) echecs++;
							return courseCb(null);
						})
					},(err)=>{
						if(err) Cb_eachCourses(err)
						var pct = courseMrks*100/courseWgt;
						mixed[index_user].marks=courseMrks.toFixed(1);
						mixed[index_user].total=courseWgt;
						mixed[index_user].pct=pct.toFixed(1)+"%";
						mixed[index_user].fails=echecs
						// console.log('Marks:'+courseMrks+'/'+courseWgt)
						return Cb_eachCourses(null);
					})
				}],(err)=>{
					if(err) return studentCb(err)
					return studentCb(null);
				})
			},(err)=>{
				if(err) return callBack_treatEachStudents(err)
				return callBack_treatEachStudents(null)
			})
		}],(err)=>{
			if(err) return log_err(err,false,req,res);
			marks.students = mixed.sort(midTermPlaces)
			// console.log('Students:===>'+JSON.stringify(marks))
			return res.json(marks);
		})
	})
}
exports.getReport_JSON =(req,res,next)=>{
	req.assert('currentTerm', 'Choose the term').isInt();
	req.assert('academic_year', 'Choose the academic year please').isInt();
	var accLvl=req.user.access_level;
	var teacher=req.app.locals.access_level.TEACHER;
	var adminteacher=req.app.locals.access_level.ADMIN_TEACHER;
	var parent=req.app.locals.access_level.PARENT;
	var currentAcademicYear=req.body.academic_year;

	var listCourses=[],listContent_id=[];
	var reportData =[];
	var theUser, theStudent, theClass;
	if(req.session.student){
		theUser=req.session.student._id;
		theClass=req.session.student.class_id;
	}
	else if(accLvl==teacher||accLvl==adminteacher){
		req.assert('student', 'Invalid data').isMongoId();
		req.assert('class_id', 'Invalid data').isMongoId();
		// req.assert('place', 'Invalid data').isInt();
		theUser=req.body.student;
		theClass=req.body.class_id;
	}
	else{
		theUser=req.user._id;
		theClass=req.user.class_id;
	}
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	var async = require('async');
	/* GET IN FIRST PLACE THE CONTENT LIST for this course,academic year and this student and this class*/

	async.series([
		// 1.
		(callback_getCoursesList)=>{
			Course.find({class_id:theClass,currentTerm:req.body.currentTerm},
				{school_id:0,teacher_list:0,level:0,attendance_limit:0},
				(err,list_Courses)=>{
					if(err) return callback_getCoursesList(err);
					listCourses =list_Courses;
					//console.warn("Courses =>"+JSON.stringify(listCourses))
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
								{class_id:theClass,student_id:theUser,isQuoted:true,
									academic_year:currentAcademicYear,course_id:currentCourse._id,isCAT:true},
								(err,list_CAT)=>{
									 if(err) return callback__CAT(err);
									 listCATs =list_CAT;
									 //console.log("LIST OF CATS "+JSON.stringify(listCATs))
									 return callback__CAT(null);
								})  
							},
							(callback__Exam)=>{
								Marks.find().distinct("content_id",
								{class_id:theClass,student_id:theUser,isQuoted:true,
									academic_year:currentAcademicYear,course_id:currentCourse._id,isCAT:false},
								(err,list_exams)=>{
									 if(err) return callback__Exam(err);
									 listExams =list_exams;
									 //console.log(" LIST OF Exams "+JSON.stringify(listExams))
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
										Marks.findOne({content_id:oneCAT,student_id:theUser}
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
										Marks.findOne({content_id:oneExam,student_id:theUser}
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
							var testWeight = currentCourse.test_quota>0?currentCourse.test_quota:0;
							var examWeight = currentCourse.exam_quota>0?currentCourse.exam_quota:0;
							var courseWeight = !currentCourse.weightOnReport ? testWeight+examWeight : currentCourse.weightOnReport;

							var noteCat=(studentCATMarks*testWeight)/totalCAT;
							var noteExam =(studentExamMarks*examWeight)/totalExam;
							noteCat =noteCat>0?noteCat:0;
							noteExam =noteExam>0?noteExam:0;
							var totalCourse = noteCat + noteExam;
							var percent = (totalCourse*100)/courseWeight;
							// if(percent<50) return percent.underline();
							//console.log("  CAT marks "+studentCATMarks+"/"+totalCAT);
							//console.log("  Exam marks "+studentExamMarks+"/"+totalExam);
							//console.log(" TOTAL "+currentCourse.name+" "+totalCourse);
							reportData[0].marks.push({
										 name:currentCourse.name,
										 code:currentCourse.code,
										 test:noteCat,
										 exam:noteExam,
										 total:totalCourse,
										 percent:percent,
										 test_quota:currentCourse.test_quota,
										 exam_quota:currentCourse.exam_quota,
										 course_weight:currentCourse.weightOnReport,
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
		reportData[0].term_num =req.body.currentTerm;
		//console.log()
		// console.log('all Marks==>'+JSON.stringify(reportData))
		return res.json(reportData)
	})
}
exports.getFullReportOneStudent =(req,res,next)=>{
	//console.log(req.body.places)
	req.assert('class_id', 'Invalid data').isMongoId();
	req.assert('student_id', 'Invalid data').isMongoId();
	req.assert('academic_year', 'Choose the academic year please').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);

	var currentAcademicYear=req.body.academic_year, 
		thisClass = req.body.class_id, 
		thisStudent = req.body.student_id;
	var reportData = [];
		termLists = [];
		listStudents = [],
		listCourses = [], 
		listAssessments = [], 
		termOne = [], termTwo = [], termThree = [], 
		totals = [], termMarks = [];
	var totalQuizzes=0, totalExams=0, totalQuotes=0, totalQuizzT1=0,
		totalQuizzT2=0, totalQuizzT3=0, totalExamT1=0, totalExamT2=0,
		totalExamT3=0, courseTerm1Marks=0, courseTerm2Marks=0,
		courseTerm3Marks=0;

	var user_name='', classe_name='', user_urn='';
	var async = require("async");
	var Terms = [];
	var userDetails=[];
	User.findOne({_id:thisStudent}, {name:1,URN:1},(err, user_details)=>{
		if(err) return log_err(err, false, req, res);
		//userDetails.push({user:user_details});
		user_name=user_details.name;
		user_urn=user_details.URN;
	});
	Classe.findOne({_id:thisClass},{name:1,},(err, class_details)=>{
		if(err) return log_err(err, false, req, res);
		//userDetails.push({classe:class_details});
		classe_name=class_details.name;
	});
	async.series([(getTermLists)=>{
		//get term lists
		Marks.find().distinct("currentTerm", {school_id:req.user.school_id},(err, terms)=>{
			if (err) return getTermLists(err);
			termLists = terms;
			Terms.push({Terms:termLists})
			//console.warn("Terms -=> "+JSON.stringify(termLists));
			getTermLists(null);
		});
	},(coursesOfEveryTerm)=>{
		async.each(termLists, (thisTerm, termsCallback)=>{
			var listOfCourses = [];
			async.series([(callbackCourse)=>{
				Course.find({school_id:req.user.school_id,class_id:thisClass, currentTerm:thisTerm},{_id:1, name:1, code:1, currentTerm:1, test_quota:1, exam_quota:1, weightOnReport:1},(err, coursesList)=>{
					if(err) return callbackCourse(err);
					listOfCourses = coursesList;
					console.warn("Courses -=-=-=-=-=-=-=> "+JSON.stringify(listOfCourses));
					callbackCourse(null);
				});
			},(testAndExamOfEveryCourse)=>{

				async.each(listOfCourses, (thisCourse, coursesCallback)=>{
					var listTESTs=[];
					var listExams=[];
					async.series([(testAndExamCallback)=>{
						async.series([(testCallback)=>{
							Marks.find().distinct("content_id",{class_id:thisClass,student_id:thisStudent,isQuoted:true, academic_year:currentAcademicYear,course_id:thisCourse._id,isCAT:true},(err, testsList)=>{
								if(err) return testCallback(err);
								listTESTs = testsList;
								//console.warn("------Test in "+thisCourse.name+" in Term "+thisTerm+" -=-=-=-=-=-=-=> "+JSON.stringify(listTESTs));
								return testCallback(null);
							})
						},(examCallback)=>{
							Marks.find().distinct("content_id",{class_id:thisClass,student_id:thisStudent,isQuoted:true, academic_year:currentAcademicYear,course_id:thisCourse._id,isCAT:false},(err, examsList)=>{
								if(err) return examCallback(err);
								listExams = examsList;
								//console.warn("------Exam in "+thisCourse.name+" in Term "+thisTerm+" -+-+-+-+-+-+-> "+JSON.stringify(listExams));
								return examCallback(null);
							})
						}],(err)=>{
							return testAndExamCallback(err);
						})
					},(marksCallback)=>{
						var studentCATMarks =0,studentExamMarks=0,totalCAT=0,totalExam=0;

						async.series([(eachTestCallback)=>{
							async.each(listTESTs, (thisTest, thisTestCallback)=>{
								Content.findOne({_id:thisTest},(err,currentMark)=>{
									if(err) return thisTestCallback(err);
									Marks.findOne({content_id:thisTest,student_id:thisStudent},(err,marksCAT)=>{
										if(err) return thisTestCallback(err);
										var amanota =(marksCAT.percentage*currentMark.marks)/100;
										studentCATMarks+= amanota>0? amanota:0;
										totalCAT+= currentMark.marks>0?currentMark.marks:0;
										thisTestCallback(null);
									})
								})
							},(err)=>{
								eachTestCallback(err)
							})
						},(eachExamCallback)=>{
							async.each(listExams, (thisExam, thisExamCallback)=>{
								Content.findOne({_id:thisExam},(err,currentMark)=>{
									if(err) return thisExamCallback(err);
									Marks.findOne({content_id:thisExam,student_id:thisStudent},(err,marksEXAM)=>{
										if(err) return thisExamCallback(err);
										var amanota =(marksEXAM.percentage*currentMark.marks)/100;
										studentExamMarks+= amanota>0? amanota:0;
										totalExam+= currentMark.marks>0?currentMark.marks:0;
										thisExamCallback(null);
									})
								})
							},(err)=>{
								eachExamCallback(err);
							})
						}],(err)=>{
							var testWeight = thisCourse.test_quota;
							var examWeight = thisCourse.exam_quota;
							var courseWeight = !thisCourse.weightOnReport ? testWeight+examWeight : thisCourse.weightOnReport;

							var noteCat=(studentCATMarks*testWeight)/totalCAT;
							var noteExam =(studentExamMarks*examWeight)/totalExam;
							noteCat =noteCat>0?noteCat:0;
							noteExam =noteExam>0?noteExam:0;
							var totalCourse = noteCat + noteExam;

							termMarks.push({
								name:thisCourse.name,
								code:thisCourse.code,
								term:thisTerm,
								test:noteCat,
								exam:noteExam,
								total:totalCourse,
							})
							//console.log("  CAT marks "+studentCATMarks+"/"+totalCAT);
							//console.log("  Exam marks "+studentExamMarks+"/"+totalExam);
							//console.log(" TOTAL "+thisCourse.name+" in Term "+thisTerm+"=+=+=+---->"+totalCourse);
							if(thisTerm ==1){
								totalQuizzT1 += noteCat?noteCat:0;
								totalExamT1 += noteExam?noteExam:0;
								courseTerm1Marks += totalCourse?totalCourse:0;
								termOne.push({
								name:thisCourse.name, code:thisCourse.code, term:thisTerm, test:noteCat, exam:noteExam, total:totalCourse,test_q:thisCourse.test_quota, exam_q:thisCourse.exam_quota, course_q:thisCourse.weightOnReport,});
							}
							if(thisTerm==2){
								termTwo.push({
								name:thisCourse.name, code:thisCourse.code, term:thisTerm, test:noteCat, exam:noteExam, total:totalCourse,test_q:thisCourse.test_quota, exam_q:thisCourse.exam_quota, course_q:thisCourse.weightOnReport,});
							}
							if (thisTerm==3) {
								termThree.push({
								name:thisCourse.name, code:thisCourse.code, term:thisTerm, test:noteCat, exam:noteExam, total:totalCourse,test_q:thisCourse.test_quota, exam_q:thisCourse.exam_quota, course_q:thisCourse.weightOnReport,});
							}
							totalQuizzes += noteCat?noteCat:0;
							totalExams += noteExam?noteExam:0;
							totalQuotes += totalCourse?totalCourse:0;
							return marksCallback(err);
						})
					}],(err)=>{
						return coursesCallback(err);
					})
				},(err)=>{
					return testAndExamOfEveryCourse(err);
				})
			}],(err)=>{
				if(err) return log_err(err,false,req,res);
				return termsCallback(err)
			})
		},(err)=>{
			return coursesOfEveryTerm(err)
		})
	}],(err)=>{
		if(err) return log_err(err,false,req,res);
		//reportData.push({marks:termMarks})
		userDetails.push({uname:user_name, classe:classe_name, upic:thisStudent, uurn:user_urn});
		reportData.push({term1:termOne, term2:termTwo, term3:termThree, userInfo:userDetails})
		//console.log("REPORTmarks =>>>>"+JSON.stringify(reportData.marks))
		//console.log("REPORT total =>>>>"+JSON.stringify(reportData.total));
		//console.log("REPORT =>>>>"+JSON.stringify(reportData));
		//console.log('_________________-----_____________________________');
		return res.json(reportData)
	})
}
exports.getFullReportAllStudent=(req, res, next)=>{
	req.assert('class_id', 'Invalid data').isMongoId();
	req.assert('academic_year', 'Choose the academic year please').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	var currentAcademicYear=req.body.academic_year;
	var thisClass = req.body.class_id;
	var class_academy, parametters={};
	//*****************************************************************
		// All arrays variables
	//*****************************************************************
	var reportData = [],termLists = [],listStudents = [],listOfCourses=[],
		students = [],listCourses = [],listAssessments = [],
		termOne = [],termTwo = [],termThree = [],
		totals = [],studentMark=[],allMarksPackage = [],
		classDetails=[],alterms=[];
	//*****************************************************************
		// All arrays variables
	//*****************************************************************
	var async = require('async');
	Classe.findOne({_id:thisClass},{name:1,},(err, class_details)=>{
		if(err) return log_err(err, false, req, res);
		//userDetails.push({classe:class_details});
		classe_name=class_details.name;
		class_academy = class_details.academic_year;
		if(class_academy==currentAcademicYear) parametters={class_id:thisClass,access_level:req.app.locals.access_level.STUDENT};
		else parametters={prev_classes:thisClass, access_level:req.app.locals.access_level.STUDENT}
	});
	//++++++++++++++++++Validate mark for errors
	Marks.find().distinct("currentTerm", {class_id:thisClass, academic_year:currentAcademicYear},(err, allterms)=>{
		if(err) return log_err(err, false, req, res);
		alterms=allterms;
		//console.log('term quantity:'+alterms)
		if(alterms.length!=3) return res.status(400).send("This class does not have marks for all terms!");
		else
			allReportDatasMarks();
	})
	function allReportDatasMarks(){
		async.series([(getAllStudentsInClass)=>{
			User.find(parametters,{_id:1,name:1,class_id:1, URN:1},(error, student_list)=>{
				if(error) return log_err(error, false, req, res);
				listStudents = student_list;
				//console.warn("students -=> "+JSON.stringify(listStudents));
				getAllStudentsInClass(null);
			})
		},(treatEachStudent)=>{
			async.each(listStudents,(thisStudent, studentsCallback)=>{
				async.series([(getTermLists)=>{
					Marks.find().distinct("currentTerm", {school_id:req.user.school_id},(err, terms)=>{
						if (err) return getTermLists(err);
						termLists = terms;
						//Terms.push({Terms:termLists})
					//console.warn("Terms -=> "+JSON.stringify(termLists));
						getTermLists(null);
					});
				},(coursesOfEveryTerm)=>{
					async.each(termLists, (thisTerm, termsCallback)=>{
						async.series([(callbackCourse)=>{
							Course.find({school_id:req.user.school_id,class_id:thisClass, currentTerm:thisTerm,name:{$ne:'conduite'}},{_id:1, name:1, code:1, currentTerm:1, test_quota:1, exam_quota:1, weightOnReport:1},(err, coursesList)=>{
								if(err) return callbackCourse(err);
								listOfCourses = coursesList;
							//console.warn("Courses -=-=-=-=-=-=-=> "+JSON.stringify(listOfCourses));
								callbackCourse(null);
							});
						},(testAndExamOfEveryCourse)=>{
							// _________________list assessments in all courses_____________________________-
							async.each(listOfCourses, (thisCourse, coursesCallback)=>{
								var listTESTs = [], listExams = [];
								async.series([(testAndExamCallback)=>{
									async.series([(testCallback)=>{
										Marks.find().distinct("content_id",{class_id:thisClass,student_id:thisStudent._id,isQuoted:true, academic_year:currentAcademicYear,course_id:thisCourse._id,isCAT:true},(err, testsList)=>{
											if(err) return testCallback(err);
											listTESTs = testsList;
										//console.warn("------Test in "+thisCourse.name+" in Term "+thisTerm+" -=-=-=-=-=-=-=> "+JSON.stringify(listTESTs));
											return testCallback(null);
										})
									},(examCallback)=>{
										Marks.find().distinct("content_id",{class_id:thisClass,student_id:thisStudent._id,isQuoted:true, academic_year:currentAcademicYear,course_id:thisCourse._id,isCAT:false},(err, examsList)=>{
											if(err) return examCallback(err);
											listExams = examsList;
										//console.warn("------Exam in "+thisCourse.name+" in Term "+thisTerm+" -+-+-+-+-+-+-> "+JSON.stringify(listExams));
											return examCallback(null);
										})
									}],(err)=>{
										return testAndExamCallback(err);
									})
								},(marksCallback)=>{
									var studentCATMarks =0,studentExamMarks=0,totalCAT=0,totalExam=0;
									async.series([(eachTestCallback)=>{
										async.each(listTESTs, (thisTest, thisTestCallback)=>{
											Content.findOne({_id:thisTest},(err,currentMark)=>{
												if(err) return thisTestCallback(err);
												Marks.findOne({content_id:thisTest,student_id:thisStudent._id},(err,marksCAT)=>{
													if(err) return thisTestCallback(err);
													var amanota =(marksCAT.percentage*currentMark.marks)/100;
														studentCATMarks+= amanota>0? amanota:0;
														totalCAT+= currentMark.marks>0?currentMark.marks:0;
													thisTestCallback(null);
												})
											})
										},(err)=>{
											eachTestCallback(err)
										})
									},(eachExamCallback)=>{
										async.each(listExams, (thisExam, thisExamCallback)=>{
											Content.findOne({_id:thisExam},(err,currentMark)=>{
												if(err) return thisExamCallback(err);
												Marks.findOne({content_id:thisExam,student_id:thisStudent._id},(err,marksEXAM)=>{
													if(err) return thisExamCallback(err);
													var amanota =(marksEXAM.percentage*currentMark.marks)/100;
													studentExamMarks+= amanota>0? amanota:0;
													totalExam+= currentMark.marks>0?currentMark.marks:0;
													thisExamCallback(null);
												})
											})
										},(err)=>{
											eachExamCallback(err);
										})
									}],(err)=>{
										var testWeight = thisCourse.test_quota;
										var examWeight = thisCourse.exam_quota;
										var courseWeight = !thisCourse.weightOnReport ? testWeight+examWeight : thisCourse.weightOnReport;

										var noteCat=(studentCATMarks*testWeight)/totalCAT;
										var noteExam =(studentExamMarks*examWeight)/totalExam;
										noteCat =noteCat>0?noteCat:0;
										noteExam =noteExam>0?noteExam:0;
										var totalCourse = noteCat + noteExam;

										// Marks of all students in term 1
										allMarksPackage.push({name:thisStudent.name,urn:thisStudent._id,test_mark:noteCat,exam_mark:noteExam,total_mark:totalCourse,test_quota:thisCourse.test_quota,exam_quota:thisCourse.exam_quota,total_quota:thisCourse.weightOnReport, term:thisTerm});

										if(thisTerm==1){
											termOne.push({name:thisStudent.name,urn:thisStudent._id,test_mark:noteCat,exam_mark:noteExam,total_mark:totalCourse,total_quota:thisCourse.weightOnReport,});
										}
										
										if(thisTerm==2){
											termTwo.push({name:thisStudent.name,urn:thisStudent._id,test_mark:noteCat,exam_mark:noteExam,total_mark:totalCourse,total_quota:thisCourse.weightOnReport,});
										}
										
										if(thisTerm==3){
											termThree.push({name:thisStudent.name,urn:thisStudent._id,test_mark:noteCat,exam_mark:noteExam,total_mark:totalCourse,total_quota:thisCourse.weightOnReport,});
										}

									//console.log("  CAT marks "+studentCATMarks+"/"+totalCAT);
									//console.log("  Exam marks "+studentExamMarks+"/"+totalExam);
									//console.log(" TOTAL+++++++++++++++++ "+thisCourse.name+" in Term "+thisTerm+"=+=+=+---->"+totalCourse+'-------->'+thisStudent.name);

										return marksCallback(err);
									})
								}],(err)=>{
								//console.log("-----------------------"+thisCourse.name+"---------------------")
									return coursesCallback(err);
								})
							},(err)=>{
								return testAndExamOfEveryCourse(err);
							})
						}],(err)=>{
							if(err) return log_err(err,false,req,res);

						//console.log("------------------------Term "+thisTerm+"--------------------")
							return termsCallback(err)
							
						})
					},(err)=>{
						return coursesOfEveryTerm(err)
					})
				}],(err)=>{
				//console.log('========================'+thisStudent.name+'============================')
					return studentsCallback(err)
				})
			},(err)=>{
				return treatEachStudent(err)
			})
		}],(err)=>{
			if (err) return log_err(err, false, req, res);
			var term1data = termOne;
			var term2data = termTwo;
			var term3data = termThree;
			var termTdata = allMarksPackage;
			var term1_sum = [], term2_sum = [], term3_sum = [], termT_sum = [];
			term1data.forEach(function(marksObject) {
				var existing = term1_sum.filter(function(i) {
				return i.urn === marksObject.urn 
			 })[0];
				if (!existing)
					term1_sum.push(marksObject);
				else{
					existing.test_mark += marksObject.test_mark;
					existing.exam_mark += marksObject.exam_mark;
					existing.total_mark += marksObject.total_mark;
					existing.total_quota += marksObject.total_quota;
				}
			});
			term2data.forEach(function(marksObject) {
				var existing = term2_sum.filter(function(i) {
				return i.urn === marksObject.urn 
			 })[0];
				if (!existing)
					term2_sum.push(marksObject);
				else{
					existing.test_mark += marksObject.test_mark;
					existing.exam_mark += marksObject.exam_mark;
					existing.total_mark += marksObject.total_mark;
					existing.total_quota += marksObject.total_quota;
				}
			});
			term3data.forEach(function(marksObject) {
				var existing = term3_sum.filter(function(i) {
				return i.urn === marksObject.urn 
			 })[0];
				if (!existing)
					term3_sum.push(marksObject);
				else{
					existing.test_mark += marksObject.test_mark;
					existing.exam_mark += marksObject.exam_mark;
					existing.total_mark += marksObject.total_mark;
					existing.total_quota += marksObject.total_quota;
				}
			});
			termTdata.forEach(function(marksObject) {
				var existing = termT_sum.filter(function(i) {
				return i.urn === marksObject.urn 
			 })[0];
				if (!existing)
					termT_sum.push(marksObject);
				else{
					existing.test_mark += marksObject.test_mark;
					existing.exam_mark += marksObject.exam_mark;
					existing.total_mark += marksObject.total_mark;
					existing.total_quota += marksObject.total_quota;
				}
			});
			classDetails.push({name:classe_name, a_year:currentAcademicYear})
			var mark_t1_sort = term1_sum.sort(studentPlaces)
			var mark_t2_sort = term2_sum.sort(studentPlaces)
			var mark_t3_sort = term3_sum.sort(studentPlaces)
			var mark_tT_sort = termT_sum.sort(studentPlaces)
			reportData.push({term1:mark_t1_sort,term2:mark_t2_sort, term3:mark_t3_sort, total:mark_tT_sort, class_info:classDetails, courses:listOfCourses});
			//reportData.push({term1:termOne, term2:termTwo, term3:termThree})
			//console.log('-------------------------(__________)+++++++++++++++++++++++++++++++++++++');
			//console.log('Report:------->'+JSON.stringify(reportData))
			return res.json(reportData);
		})
	}
}
function studentPlaces(a, b) {
	return b.total_mark - a.total_mark;
}
function midTermPlaces(a, b) {
	return b.marks - a.marks;
}
function endTermPlaces(a, b) {
	return b.total - a.total;
}
function termPlaces(a, b) {
	return b.pct - a.pct;
}