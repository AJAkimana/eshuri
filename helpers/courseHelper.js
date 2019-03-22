const fs=require('fs'),
    path=require('path'),
    async=require('async'),
    User=require('../models/User'),
    Classe=require('../models/Classe'),
    Content=require('../models/Content'),
    Mark=require('../models/MARKS'),
    Util=require('../utils'),
    School=require('../models/School');
exports.contentsSummary = (req, contentCb)=>{
    var student = req.app.locals.access_level.STUDENT,
        admin = req.app.locals.access_level.ADMIN,
        teacher = req.app.locals.access_level.TEACHER,
        admin_teacher = req.app.locals.access_level.ADMIN_TEACHER;
    var accLvl = req.user.access_level;
    var userId = req.query.u||req.user._id;
    var contents = [], mixContents=[], marks_All=[], sum_ups={};
    var access_level;
    async.series([(findCourse)=>{
        Course.findOne({_id:req.body.course_id},(err, course)=>{
            if(err) return findCourse('Service not available');
            else if(!course) return findCourse('Course not found');
            return findCourse(null)
        })
    },(findContents)=>{
        async.series([(findAllContents)=>{
            Content.find({course_id:req.body.course_id,academic_year:req.body.academic_year},(err, the_contents)=>{
                if(err) return findAllContents('Service not available');
                mixContents = the_contents;
                return findAllContents(null);
            })
        },(arrangeContents)=>{
            var notes=0,assmts=0,quizes=0,videos=0;
            async.eachSeries(mixContents, (current, callBack)=>{
                switch(current.type){
                    case 1:
                    case 2: notes++; break;
                    case 3: quizes++; break;
                    case 4:
                    case 5:
                    case 6: assmts++; break;
                    case 7: videos++; break;
                    default: break;
                }
                return callBack(null);
            },(err)=>{
                if(err) return arrangeContents(err);
                if(notes||assmts||quizes||videos)
                    contents.push({type:'Notes',number:notes},{type:'Assessments',number:assmts},{type:'Quizes',number:quizes},{type:'Videos',number:videos});
                return arrangeContents(null);
            })
        }],(err)=>{
            if(err)return findContents(err);
            return findContents(null)
        })
    },(summingMarks)=>{
        var allAssessments=[];
        var totalMarks=0, totalOuts=0, n_assmts=0, done=0, undone=0, average=0;
        async.series([(getAssessments)=>{
            Content.find({course_id:req.body.course_id, marks:{$ne:null},academic_year:req.body.academic_year},{_id:1,marks:1},(err, assesments)=>{
                if(err) return getAssessments('Service not available');
                allAssessments = assesments;
                n_assmts = assesments.length;
                return getAssessments(null);
            })
        },(treatMarks)=>{
            Util.virtualAccessLevel(req, (err, a_level)=>{
                if(err) return treatMarks(err);
                else if(a_level==100) return treatMarks('Invalid access');
                access_level = a_level;
                if(a_level==student){
                    async.eachSeries(allAssessments, (current, marksCb)=>{
                        Mark.findOne({content_id:current._id,student_id:userId},{marks:1,percentage:1},(err, contentMarks)=>{
                            if(err) return marksCb('Service not available');
                            else if(!contentMarks){
                                undone++;
                                totalOuts += current.marks||0;
                                return marksCb(null);
                            }
                            done++;
                            totalMarks += contentMarks.marks;
                            totalOuts += current.marks||0;
                            return marksCb(null);
                        })
                    },(err)=>{
                        if(err) return treatMarks(err);
                        return treatMarks(null);
                    })
                }
                else if(a_level==teacher){
                    async.eachSeries(allAssessments, (current, marksCb)=>{
                        var studMarks = [];
                        Mark.aggregate([{$match:{content_id:current._id}},
                            {$group:{_id:null,mark_sum:{$sum:'$marks'},average:{$avg:'$percentage'}}}
                          ],(err, contentMarks)=>{
                            if(err) return marksCb('Service not available');
                            else if(!contentMarks[0]){
                                undone++;
                                return marksCb(null);
                            }
                            done++;
                            average += contentMarks[0].average||0;
                            totalOuts += current.marks||0;
                            return marksCb(null);
                        })
                    },(err)=>{
                        if(err) return treatMarks(err);
                        return treatMarks(null);
                    })
                }
                else return treatMarks('Service not available al');
            })
        }],(err)=>{
            if(err) return summingMarks(err);
            var avg = 0
            
            if(access_level==student) avg=(totalMarks/totalOuts)*100;
            if(access_level==teacher) avg = average?average/done:0;
            marks_All.push({marks:totalMarks,quota:totalOuts,assessments:n_assmts,done:done,undone:undone,average:avg.toFixed(2)});
            return summingMarks(null);
        })
    }],(err)=>{
        sum_ups.contents=contents;
        sum_ups.access_level=access_level
        sum_ups.marks=marks_All;
        return contentCb(err, sum_ups);
    })
}