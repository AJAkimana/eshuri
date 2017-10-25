var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une University est par exemple S2MCE pour le High school ou 3 rd Year in Universitites
*/
// Le schma de University
var UniversitySchema = new Schema({
	name:{type:String,required:true,maxlength:30,unique:false,lowercase:true,trim:true},
}, { timestamps: { createdAt: 'creation_time' }});

UniversitySchema.pre('save', function (next) {
	next();
});

const UniversityDB = mongoose.model('University', UniversitySchema);

module.exports = UniversityDB;