const mongoose = require('mongoose');

const failedMailSchema = new mongoose.Schema({
  content: { type: String, required:true, unique: false },
  error: { type: String, required:true},
}, { timestamps: { createdAt: 'created_at' }});

failedMailSchema.pre('save', function (next) {
  next();
});

const failedMail = mongoose.model('FailedMail', failedMailSchema);
module.exports = failedMail;
