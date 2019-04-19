var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var FeesSchema = new Schema({
	school_id:{type:Schema.Types.ObjectId,required:true,unique:false},
    duration:{type:Number,required:true,unique:false},
    due_amount:{type:Number, required:true, unique:false},
    fee_type:{type:Number, required:true, unique:false},
    academic_year:{type:Number,required:false,unique:false},
    currentTerm:{type:Number,required:true, min:0,unique:false},
});
FeesSchema.pre('save', function(next) {
   next();
});

const FeesPayable = mongoose.model('Fees', FeesSchema);
module.exports = FeesPayable;