var mongoose =require('mongoose');
var Schema =mongoose.Schema;
/*
Une classe est par exemple S2MCE pour le High school ou 3 rd Year in Universitites
*/
// Le schma de Classe
var ClasseSchema = new Schema({
	name:{type:String,required:true,maxlength:300,unique:false,lowercase:true,trim:true},
	level:{type:Number,required:true,min:1,unique:false},// NIveau d  la classe
	option:{type:String,required:false,unique:false,lowercase:true,trim:true},
	sub_level:{type:String,required:false,unique:false,lowercase:true,trim:true},
	currentTerm:{type:Number,required:true,unique:false},
	academic_year:{type:Number,required:false,unique:false},	
	class_teacher:{type:Schema.Types.ObjectId,required:false,unique:false},
	school_id:{type:Schema.Types.ObjectId,required:true,unique:false},
});

ClasseSchema.pre('save', function (next) {
	next();
});

const ClasseDB = mongoose.model('Classes', ClasseSchema);

module.exports = ClasseDB;