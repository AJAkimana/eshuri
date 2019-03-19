const fs=require('fs'),
    path=require('path'),
    async=require('async'),
    User=require('../models/User'),
    Classe=require('../models/Classe'),
    Content=require('../models/Content'),
    School=require('../models/School');
exports.contentsSummary = (req, contentCb)=>{
    var student = req.app.locals.access_level.STUDENT,
        admin = req.app.locals.access_level.ADMIN,
        teacher = req.app.locals.access_level.TEACHER,
        admin_teacher = req.app.locals.access_level.ADMIN_TEACHER;
    var userId = req.query.u||req.user._id;
    var contents = [], mixContents=[];
    async.series([(findCourse)=>{
        Course.findOne({_id:req.body.course_id},(err, course)=>{
            if(err) return findCourse(err);
            else if(!course) return findCourse('Course not found');
            return findCourse(null)
        })
    },(findContents)=>{
        async.series([(findAllContents)=>{
            Content.find({course_id:req.body.course_id},(err, the_contents)=>{
                if(err) return findAllContents(err);
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
                contents.push({type:'Notes',number:notes},{type:'Assessments',number:assmts},{type:'Quizes',number:quizes},{type:'Videos',number:videos});
                return arrangeContents(null);
            })
        }],(err)=>{
            if(err)return findContents(err);
            return findContents(null)
        })
    }],(err)=>{
       return contentCb(err, contents)
    })
}