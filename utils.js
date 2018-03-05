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
    var firstWord = name.substr(0, length);
    var secondWord = name.split(" ")[1];
    return secondWord==null?firstWord:firstWord+' '+secondWord.charAt(0);
}
/**
 * Return a random int, used by `utils.uid()`
 *
 * @param {Number} min
 * @param {Number} max
 * @return {Number}
 * @api private
 */

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
}