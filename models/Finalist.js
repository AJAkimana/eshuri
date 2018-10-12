var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une Department est par exemple S2MCE pour le High school ou 3 rd Year in Universitites
*/
// Le schma de Department
var FinalistSchema = new Schema({
	school_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	class_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	student_id:{type: Schema.Types.ObjectId,required:true,unique:false},
	academic_year:{type:Number,required:true,unique:false},
}, { timestamps: { createdAt: 'createdAt' }});

FinalistSchema.pre('save', function (next) {
	next();
});

const FinalistDB = mongoose.model('Finalists', FinalistSchema);

module.exports = FinalistDB;