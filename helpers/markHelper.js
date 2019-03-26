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
		Course.find({class_id:classId},(err, coursesList)=>{
			if(err) return findClassCourses('Service not available');
			courses = coursesList;
			return findClassCourses(null);
		})
	},(eachCourse)=>{
		async.eachSeries(courses, (thisCourse, courseCb)=>{
			var min_p=0,max_p=0,avg_p=0,min=0,max=0,avg=0,total=0;
			async.series([(marksAggregatePerc)=>{
				Mark.aggregate([{$match:{course_id:thisCourse._id, academic_year:ay,currentTerm:term}},
					{$group:{_id:null,min:{$min:'$percentage'},max:{$max:'$percentage'},avg:{$avg:'$percentage'}}}
				],(err, contentMarks)=>{
					if(err) return marksAggregatePerc('Service not available');
					else if(!contentMarks[0]) return marksAggregatePerc(null);

					// console.log('Marks Percent:',contentMarks);
					min_p=contentMarks[0].min||0;
					max_p=contentMarks[0].max||0;
					avg_p=contentMarks[0].avg||0;
					return marksAggregatePerc(null);
				})
			},(marksAggregateTot)=>{
				Mark.aggregate([{$match:{course_id:thisCourse._id, academic_year:ay,currentTerm:term}},
					{$group:{_id:null,min:{$min:'$marks'},max:{$max:'$marks'},avg:{$avg:'$marks'}}}
				],(err, contentMarksTot)=>{
					if(err) return marksAggregateTot('Service not available');
					else if(!contentMarksTot[0]) return marksAggregateTot(null);

					// console.log('Marts Total:',contentMarksTot);
					min=contentMarksTot[0].min||0;
					max=contentMarksTot[0].max||0;
					avg=contentMarksTot[0].avg||0;
					return marksAggregateTot(null);
				})
			},(getMarksDetails)=>{
				Content.aggregate([{$match:{course_id:thisCourse._id, marks:{$ne:null},academic_year:ay,currentTerm:term}},{$group:{_id:null,total:{$sum:'$marks'}}}],(err, tot_quota)=>{
					if(err) return getMarksDetails('Service not available');
					else if(!tot_quota[0]) return getMarksDetails(null);
					// console.log('Total quota:',tot_quota);
					total=tot_quota[0].total||0;
					return getMarksDetails(null);
				})
			}],(err)=>{
				if(err) return courseCb(err);

				courseMarks.push({_id:thisCourse._id,name:thisCourse.name,min:min,max:max,avg:avg.toFixed(2),min_p:min_p.toFixed(2),max_p:max_p.toFixed(2),avg_p:avg_p.toFixed(2),total:total});
				// console.log('Params:',thisCourse.name)
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

			User.find(parametters,(err, studentsList)=>{
				if(err) return findCourseStudents('Service not available');
				students = studentsList;
				return findCourseStudents(null);
			})
		})
	},(eachStudent)=>{
		async.eachSeries(students, (thisStudent, studentCb)=>{
			var marks=0,quota=0;
			async.series([(findMarks)=>{
				Mark.aggregate([{$match:{student_id:thisStudent._id,course_id:courseId,academic_year:ay,currentTerm:term}},
					{$group:{_id:null,marks:{$sum:'$marks'}}}
				],(err, marksSum)=>{
					if(err) return findMarks('Service not available');
					else if(!marksSum[0]) return findMarks(null);

					// console.log('Marts sum:',marksSum);
					marks=marksSum[0].marks||0;
					return findMarks(null);
				})
			},(findQuota)=>{
				Content.aggregate([{$match:{course_id:courseId, marks:{$ne:null},academic_year:ay,currentTerm:term}},{$group:{_id:null,total:{$sum:'$marks'}}}],(err, tot_quota)=>{
					if(err) return findQuota('Service not available');
					else if(!tot_quota[0]) return findQuota(null);
					// console.log('Total quota:',tot_quota);
					quota=tot_quota[0].total||0;
					return findQuota(null);
				})
			}],(err)=>{
				if(err) return studentCb(err);
				studentsMarks.push({_id:thisStudent._id,name:thisStudent.name,marks:marks,quota:quota});
				return studentCb(null);
			})
		},(err)=>{
			if(err) return eachStudent(err);
			return eachStudent(null);
		})
	}],(err)=>{
		return courseMarkCb(err, studentsMarks);
	})
}
