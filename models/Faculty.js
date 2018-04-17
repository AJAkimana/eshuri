var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une Faculty est par exemple S2MCE pour le High school ou 3 rd Year in Universitites
*/
// Le schma de Faculty
var FacultySchema = new Schema({
	name:{type:String,required:true,maxlength:30,unique:false,lowercase:true,trim:true},
	univ_id:{type: Schema.Types.ObjectId,required:true,unique:false},
}, { timestamps: { createdAt: 'creation_time' }});

FacultySchema.pre('save', function (next) {
	const Faculty = this;
	Faculty.name = Faculty.name.trim().toLowerCase();
	next();
});

const FacultyDB = mongoose.model('Faculty', FacultySchema);

module.exports = FacultyDB;