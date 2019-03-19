const fs=require('fs'),
      path=require('path'),
      async=require('async'),
      User=require('./models/User'),
      Classe=require('./models/Classe'),
      School=require('./models/School');
/**
 * Return a unique identifier with the given `len`.
 *
 * utils.uid(10);
 * // => "FDaS435D2z"
 *
 * @param {Number} len
 * @return {String}
 * @api private
 */
 /* Generate unique REGISTRATION NUMBER*/
exports.generate_URN = function(number){
	var len =4;
    var buf = []
        ,chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
        ,charlen = chars.length;

    for (var i = 0; i < len; ++i)  buf.push(chars[getRandomInt(0, charlen - 1)]);
    number = isNaN(number)? 1:number;
    var number_toString =String(number),sum=0;
    for (var i=0; i<number_toString.length;++i) sum+=Number(number_toString[i]);
    
    number_toString += String(sum%13); // You have to improve it 
    buf.push("-"+String(number_toString));
    return buf.join('');
};
exports.generate_CourseCode = function(name, number){
    var len =4;
    var buf = []
        ,chars = name
        ,charlen = chars.length;

    buf.push(name.substring(0, len));
    //for (var i = 0; i < len; ++i)  buf.push(chars[getRandomInt(0, charlen - 1)]);
    number = isNaN(number)? 1:number;
    //number = isNaN(number)? 1:number;
    var number_toString =String(number),sum=0;
    for (var i=0; i<number_toString.length;++i) sum+=Number(number_toString[i]);
    
    number_toString += String(sum%7); // You have to improve it 
    buf.push("-"+String(number_toString));
    return buf.join('');
};
exports.uid = function(len){
    var buf = []
        , chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
        , charlen = chars.length;
    for (var i = 0; i < len; ++i) {
        buf.push(chars[getRandomInt(0, charlen - 1)]);
    }

    return buf.join('');
};
exports.getConv_id = function(id_a,id_b){
    date_a= new Date( parseInt(id_a.toString().substring(0,8), 16 ) * 1000 ).getTime()
    date_b= new Date( parseInt(id_b.toString().substring(0,8), 16 ) * 1000 ).getTime()
    return date_a > date_b ? String(date_a+date_b):String(date_b+date_a);
};

// Return shortened course name

exports.getShort = (name, length)=>{
    var fWord = name.substr(0, length);
    var sWord = name.split(" ")[1];
    return sWord==null?fWord:fWord+' '+sWord.charAt(0);
}
/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */
// Get district 
/**
id: Province_ID or District_ID or Sector_ID
type: 1.Province, 2:District, 3:Sector
*/
exports.getLocalName = (id)=>{
  var filePath = path.join(__dirname,'./public/locals.json');
  var area_name="";
  fs.readFile(filePath, 'utf8', (err, json_data)=>{
    if(err) throw err;
    var object = JSON.parse(json_data)
    for(var i=0;i<object.provinces.length;i++){
      if(object.provinces[i].Province_ID==id){
        area_name=object.provinces[i].Province_NAME;
      }
    }
    // console.log('JSON: '+JSON.stringify(object.provinces));
  })
  return 'Akimana:'+area_name;
}
exports.listClasses=(req, userId, callBack)=>{
  var listClasses=[],allclasses=[],classes=[];
  var student = req.app.locals.access_level.STUDENT,
      teacher = req.app.locals.access_level.TEACHER,
      admin_teacher = req.app.locals.access_level.ADMIN_TEACHER,
      hMaster = req.app.locals.access_level.SA_SCHOOL;
  var parametters={},userparams={};
  User.findOne({_id:userId},(err, userExists)=>{
    if(err) return callBack("Invalid data");
    if(!userExists) return callBack("Unkown user");
    School.findOne({_id:userExists.school_id},(err, school)=>{
      if(err) return callBack("Invalid data");
      if(!school) return callBack("Unkown school");
      async.series([(listClassesCb)=>{
        if(userExists.access_level==student){
          var studentClasses = [];
          async.each(userExists.prev_classes, (current, cb)=>{
            var classId=current.class_id?current.class_id:current;
            var ay=current.academic_year?current.academic_year:null;
            studentClasses.push({class_id:classId,academic_year:ay});
            cb();
          }, (err)=>{
            if(err) listClassesCb(err);
            studentClasses.push({class_id:userExists.class_id,academic_year:null});
            listClasses = studentClasses;
            listClassesCb();
          });
        }
        else if(userExists.access_level==teacher||userExists.access_level==admin_teacher){
          var teacherClasses = [];
          Course.find().distinct("class_id",{teacher_list:userId}).lean().exec((err, class_courses)=>{
            if (err) return listClassesCb(err);
            async.eachSeries(class_courses, (this_class, classCb)=>{
              teacherClasses.push({class_id:this_class,academic_year:null});
              classCb(null);
            },(err)=>{
              if (err) return listClassesCb(err);
              listClasses = teacherClasses;
              return listClassesCb(null);
            });
          })
        }
        else return listClassesCb('You do not have permission view this user');
      },(treatClassesCb)=>{
        async.each(listClasses, (thisClass, callBack)=>{
          Classe.findOne({_id:thisClass.class_id},(err, class_details)=>{
            if (err) return callBack(err);
            if(userExists.access_level==student) parametters={class_id:thisClass.class_id};
            else if(userExists.access_level==teacher||
              userExists.access_level==admin_teacher) parametters={class_id:thisClass.class_id, teacher_list:userId};
            Course.count(parametters, (err, number)=>{
              if (err) return callBack(err);
              var theAy = thisClass.academic_year?thisClass.academic_year:class_details.academic_year;
              classes.push({class_id:thisClass.class_id,name:class_details.name,academic_year:theAy,number:number})
              return callBack(null);
            })
          })
        },(err)=>{
          if(err) return treatClassesCb(err);
          return treatClassesCb(null);
        })
      }],(err)=>{
        callBack(err, classes);
      })
    })
  })
}
exports.virtualAccessLevel = (req, levelCallBack)=>{
  var student = req.app.locals.access_level.STUDENT,
    admin = req.app.locals.access_level.ADMIN,
    teacher = req.app.locals.access_level.TEACHER,
    admin_teacher = req.app.locals.access_level.ADMIN_TEACHER;
  var userId = req.query.u||req.user._id;
  var queryAccLvl = 100;

  async.series([(treatAccessLevels)=>{
    if(req.user.access_level<=admin){
      if(!req.query.u&&!req.query.allow) return treatAccessLevels('Unknown data');
      User.findOne({_id:req.query.u},(err, user)=>{
        if(err) return treatAccessLevels('Service not available');
        else if(!user) return treatAccessLevels('Unknown user');
        else if(user.access_level<teacher) return treatAccessLevels('You do not have that privileges');
        queryAccLvl = user.access_level;
        return treatAccessLevels(null);
      })
    }else if(req.user.access_level===admin_teacher){
      if(req.query.u&&req.query.allow){
        User.findOne({_id:req.query.u},(err, user)=>{
          if(err) return treatAccessLevels('Service not available');
          else if(!user) return treatAccessLevels('Unknown user');
          else if(user.access_level<teacher) return treatAccessLevels('You do not have that privileges');
          var access = 100;
          if(user.access_level==student) access = student;
          else if(user.access_level==teacher||user.access_level==admin_teacher) access = teacher;
          queryAccLvl = access;
          return treatAccessLevels(null);
        })
      }else{
        queryAccLvl = teacher;
        return treatAccessLevels(null);
      }
    }else if(req.user.access_level==teacher){
      queryAccLvl = teacher;
      return treatAccessLevels(null);
    }else if(req.user.access_level==student){
      queryAccLvl = student;
      treatAccessLevels(null);
    }else return treatAccessLevels('You do not have that access');
  }],(err)=>{
    levelCallBack(err, queryAccLvl)
  })
}
exports.listCourses = (req, courseCallBack)=>{
  var student = req.app.locals.access_level.STUDENT,
      admin = req.app.locals.access_level.ADMIN,
      teacher = req.app.locals.access_level.TEACHER,
      admin_teacher = req.app.locals.access_level.ADMIN_TEACHER;
  var userId = req.query.u||req.user._id;

  Classe.findOne({_id:req.params.class_id},(err, classe)=>{
    if(err) courseCallBack('Service not available');
    if(!classe) courseCallBack('Unknown classe');
    
    var queryAccLvl = 100;
    var queries = {};
    async.series([(treatAccessLevels)=>{
      if(req.user.access_level<=admin){
        if(!req.query.u&&!req.query.allow) return treatAccessLevels('Unknown data');
        User.findOne({_id:req.query.u},(err, user)=>{
          if(err) return treatAccessLevels('Service not available');
          else if(!user) return treatAccessLevels('Unknown user');
          else if(user.access_level<teacher) return treatAccessLevels('You do not have that privileges');
          queryAccLvl = user.access_level;
          return treatAccessLevels(null);
        })
      }else if(req.user.access_level===admin_teacher){
        if(req.query.u&&req.query.allow){
          User.findOne({_id:req.query.u},(err, user)=>{
            if(err) return treatAccessLevels('Service not available');
            else if(!user) return treatAccessLevels('Unknown user');
            else if(user.access_level<teacher) return treatAccessLevels('You do not have that privileges');
            var access = 100;
            if(user.access_level==student) access = student;
            else if(user.access_level==teacher||user.access_level==admin_teacher) access = teacher;
            queryAccLvl = access;
            return treatAccessLevels(null);
          })
        }else{
          queryAccLvl = teacher;
          return treatAccessLevels(null);
        }
      }else if(req.user.access_level==teacher){
        queryAccLvl = teacher;
        return treatAccessLevels(null);
      }else if(req.user.access_level==student){
        queryAccLvl = student;
        treatAccessLevels(null);
      }else return treatAccessLevels('You do not have that access');
    }],(err)=>{
      if(err) courseCallBack(err);
      switch(queryAccLvl){
        case student:
          queries = {class_id:req.params.class_id};
          break;
        case teacher:
          queries = {class_id:req.params.class_id, teacher_list:userId};
          break;
        default: break;
      }
      if(!queries) courseCallBack('Service not available q');
      Course.find(queries, {_id:1,name:1,code:1}).sort({name:1}).exec((err, courses)=>{
        courseCallBack(err, courses);
      })
    })
  })
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}