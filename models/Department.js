var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une Department est par exemple S2MCE pour le High school ou 3 rd Year in Universitites
*/
// Le schma de Department
var DepartmentSchema = new Schema({
	name:{type:String,required:true,maxlength:30,unique:false,lowercase:true,trim:true},
	fac_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	// admin_mail hsa been added
	admin_mail:{type:String,required :false, match: /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:.[a-zA-Z0-9-]+)*$/ ,unique:false,lowercase:true,trim:true},
	univ_id:{type: Schema.Types.ObjectId,required:true,unique:false},
}, { timestamps: { createdAt: 'creation_time' }});

DepartmentSchema.pre('save', function (next) {
	const Department = this;
	Department.name = Department.name.trim().toLowerCase();
	next();
});

const DepartmentDB = mongoose.model('Department', DepartmentSchema);

module.exports = DepartmentDB;