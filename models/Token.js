const mongoose = require('mongoose');

const tokenSchema = new mongoose.Schema({
  value: { type: String, required:true, unique: false },// email+token
}, { timestamps: { createdAt: 'created_at' }});

tokenSchema.pre('save', function (next) {
  const token = this
  next();
});

const token = mongoose.model('Token', tokenSchema);
module.exports = token;
