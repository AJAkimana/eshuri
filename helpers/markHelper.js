const fs=require('fs'),
	path=require('path'),
	async=require('async'),
	User=require('../models/User'),
	Classe=require('../models/Classe'),
	Content=require('../models/Content'),
	Mark=require('../models/MARKS'),
	Course=require('../models/Course'),
	Util=require('../utils'),
	School=require('../models/School');

exports.classMark = (classInfo, classMarkCallback)=>{
	var classId = classInfo.class_id,
			ay = classInfo.academic_year,
			term = classInfo.term;
	var courses = [],courseMarks=[];
	async.series([(findClassCourses)=>{
		Course.find({class_id:classId},{_id:1,name:1},(err, coursesList)=>{
			if(err) return findClassCourses('Service not available');
			courses = coursesList;
			return findClassCourses(null);
		})
	},(eachCourse)=>{
		async.eachSeries(courses, (thisCourse, courseCb)=>{
			var min_p=0,max_p=0,avg_p=0,min=0,max=0,avg=0,total=0;
			async.series([(marksAggregate)=>{
				Mark.aggregate([{$match:{course_id:thisCourse._id, academic_year:ay,currentTerm:term}},
					{$group:{_id:null,min_p:{$min:'$percentage'},max_p:{$max:'$percentage'},avg_p:{$avg:'$percentage'},min:{$min:'$marks'},max:{$max:'$marks'},avg:{$avg:'$marks'}}}
				],(err, contentMarks)=>{
					if(err) return marksAggregate('Service not available');
					else if(!contentMarks[0]) return marksAggregate(null);

					console.log('Marks Percent:',contentMarks);
					min_p=contentMarks[0].min_p||0;
					max_p=contentMarks[0].max_p||0;
					avg_p=contentMarks[0].avg_p||0;
					min=contentMarks[0].min||0;
					max=contentMarks[0].max||0;
					avg=contentMarks[0].avg||0;
					return marksAggregate(null);
				})
			},(getMarksDetails)=>{
				Content.aggregate([{$match:{course_id:thisCourse._id, marks:{$ne:null},academic_year:ay,currentTerm:term}}, {$group:{_id:null,total:{$sum:'$marks'}}}],(err, tot_quota)=>{
					if(err) return getMarksDetails('Service not available');
					else if(!tot_quota[0]) return getMarksDetails(null);
					// console.log('Total quota:',tot_quota);
					total=tot_quota[0].total||0;
					return getMarksDetails(null);
				})
			}],(err)=>{
				if(err) return courseCb(err);

				courseMarks.push({_id:thisCourse._id,class_id:classId,name:thisCourse.name,min:min,max:max,avg:avg.toFixed(2),min_p:min_p.toFixed(2),max_p:max_p.toFixed(2),avg_p:avg_p.toFixed(2),total:total});
				// console.log('Params:',thisCourse)
				return courseCb(null);
			})	
		},(err)=>{
			if(err) return eachCourse(err);
			return eachCourse(null);
		})
	}],(err)=>{
		return classMarkCallback(err, courseMarks);
	})
}
exports.courseMark = (courseInfo, courseMarkCb)=>{
	var classId = courseInfo.class_id,
		courseId = courseInfo.course_id,
		ay = courseInfo.academic_year,
		term = courseInfo.term,
		student = courseInfo.student;
	var students = [],studentsMarks=[];
	
	async.series([(findCourseStudents)=>{
		Classe.findOne({_id:classId},(err, theClass)=>{
			if(err) return findCourseStudents('Service not available');
			var parametters;
			if(ay==theClass.academic_year) parametters={class_id:classId,access_level:student};
			else parametters={'prev_classes':{$elemMatch:{class_id:classId,academic_year:ay}}, access_level:student};

			User.find(parametters,{_id:1,name:1}).sort({name:1}).exec((err, studentsList)=>{
				if(err) return findCourseStudents('Service not available');
				students = studentsList;
				// console.log('Students:',students)
				// console.log('Paramsg:',courseInfo)
				return findCourseStudents(null);
			})
		})
	},(eachStudent)=>{
		async.eachSeries(students, (thisStudent, studentCb)=>{
			var marks=0,marks_pct=0,quota=0;
			Mark.find({student_id:thisStudent._id, course_id:courseId,academic_year:ay,currentTerm:term},(err,student_m)=>{
				if(err) studentCb('Service not available');
				async.eachSeries(student_m, (curr_m, student_mCB)=>{
					Content.findOne({_id:curr_m.content_id},(err, student_con)=>{
						if(err) return student_mCB('Service not available');
						marks += curr_m.marks||0;
						quota += student_con.marks||0;
						marks_pct += curr_m.percentage||0;
						return student_mCB(null)
					})
				},(err)=>{
					if(err) return studentCb(err);
					var marks_pct_= (marks_pct/student_m.length)||0;
					studentsMarks.push({_id:thisStudent._id,class_id:classId,name:thisStudent.name,marks:marks,percentage:marks_pct_.toFixed(2),quota:quota});
					// console.log('student:',thisStudent);
					return studentCb(null)
				})
			})
		},(err)=>{
			if(err) return eachStudent(err);
			return eachStudent(null);
		})
	}],(err)=>{
		return courseMarkCb(err, studentsMarks);
	})
}
exports.studentMark = (studentInfo, studentMarkCb)=>{
	var classId = studentInfo.class_id,
		studentId = studentInfo.student_id,
		ay = studentInfo.academic_year,
		term = studentInfo.term;
	var assessments = [],assemtsMarks=[];
	async.series([(getAssessments)=>{
		Content.find({class_id:classId, marks:{$ne:null},academic_year:ay,currentTerm:term},{_id:1,title:1,marks:1},(err, assmtsList)=>{
			if(err) return getAssessments('Service not available');
			assessments = assmtsList;
			console.log('Ass',assessments)
			return getAssessments(null);
		})
	},(eachAssmnt)=>{
		async.eachSeries(assessments, (thisAssmt, assmntCb)=>{
			Mark.findOne({content_id:thisAssmt._id, student_id:studentId},{marks:1},(err, assMark)=>{
				if(err) return assmntCb('Service is not available');
				assemtsMarks.push({title:thisAssmt.title,marks:assMark.marks,quota:thisAssmt.marks});
				return assmntCb(null);
			})
		},(err)=>{
			if(err) return eachAssmnt(err);
			return eachAssmnt(null);
		})
	}],(err)=>{
		return studentMarkCb(err, assemtsMarks);
	})
}

exports.schoolMark = (schoolInfo, schoolMarkCb)=>{
	var schoolId = schoolInfo.school_id,
		ay = schoolInfo.academic_year,
		term = schoolInfo.term;
	var classes = [], classesMarks = [];
	async.series([(getClasses)=>{
		Classe.find({school_id:schoolId},{_id:1,name:1}).sort({name:1}).exec((err, classesList)=>{
			if(err) return getClasses('Service not available');
			classes = classesList;

			return getClasses(null);
		})
	},(eachClass)=>{
		async.eachSeries(classes, (thisClasse, classeCb)=>{
			var min_p=0,max_p=0,avg_p=0,min=0,max=0,avg=0,total=0;
			async.series([(getClassMark)=>{
				Mark.aggregate([{$match:{class_id:thisClasse._id,academic_year:ay,currentTerm:term}},
					{$group:{_id:null,min_p:{$min:'$percentage'},max_p:{$max:'$percentage'},avg_p:{$avg:'$percentage'},min:{$min:'$marks'},max:{$max:'$marks'},avg:{$avg:'$marks'}}}
				],(err, classMarks)=>{
					if(err) return getClassMark('Service not available');
					else if(!classMarks[0]) return getClassMark(null);
					// console.log('Total mark->class:',classMarks);
					min_p=classMarks[0].min_p||0;
					max_p=classMarks[0].max_p||0;
					avg_p=classMarks[0].avg_p||0;
					min=classMarks[0].min||0;
					max=classMarks[0].max||0;
					avg=classMarks[0].avg||0;
					return getClassMark(null);
				})
			},(getTotalQuota)=>{
				Content.aggregate([{$match:{class_id:thisClasse._id, marks:{$ne:null},academic_year:ay,currentTerm:term}}, {$group:{_id:null,total:{$sum:'$marks'}}}],(err, tot_quota)=>{
					if(err) return getTotalQuota('Service not available');
					else if(!tot_quota[0]) return getTotalQuota(null);
					console.log('Total quota:',tot_quota);
					total=tot_quota[0].total||0;
					return getTotalQuota(null);
				})
			}],(err)=>{
				if(err) return classeCb(err);

				classesMarks.push({_id:thisClasse._id,name:thisClasse.name,min:min,max:max,avg:avg.toFixed(2),min_p:min_p.toFixed(2),max_p:max_p.toFixed(2),avg_p:avg_p.toFixed(2),total:total});
				return classeCb(null);
			})
		},(err)=>{
			if(err) return eachClass(err);
			return eachClass(null);
		})
	}],(err)=>{
		return schoolMarkCb(err, classesMarks);
	})
}
