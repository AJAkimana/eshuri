const fs=require('fs'),
      path=require('path'),
      async=require('async'),
      User=require('./models/User'),
      Classe=require('./models/Classe');
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
  User.findOne({_id:userId}, (err,user)=>{
    if(err) return callBack(err);
    if(!user) return callBack('No user found');

    var classeIDs = [];
    if(user.access_level===req.app.locals.access_level.STUDENT){
      async.eachSeries(user.prev_classes, (current, classCb)=>{
        classeIDs.push(current.class_id);
        classCb(null);
      },(err)=>{
        if(err) return callBack(err);
        classeIDs.push(user.class_id);
        async(classeIDs, (currentClass, classCb)=>{
          Classe.findOne({_id:currentClass,school_id:user.school_id},{_id:1,name:1},(err, the_class)=>{
            if(err) return classCb(err);
            var nCourses = 0;
            Course.count({class_id:currentClass},(err,nCourses)=>{
              if(err) return classCb(err)
              nCourses = nCourses;

              classCb(null);
            })
          })
        })
      })
    }
    callBack(err, classes)
  })
}
function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}