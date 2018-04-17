const ErrorLog = require('../../models/ErrorLog'),
	  twitter_bot=require('./twitter_bot');
var errorExcuse='The service is not available';

module.exports = function(err,isPage,req,res) {
	if(!isPage) res.status(500).send(errorExcuse);
	else res.render("./lost",{msg:errorExcuse});
	
	new ErrorLog({
		error:err,
		user_info:req.user||'Not Connected',
		route:req.path,
		method:req.method,
		request:[{body:req.body},{query:req.query},{params:req.params},{session:req.session}],
	}).save((err)=>{
		
		if(err) twitter_bot('Not inserting into DB.'+err);
		else twitter_bot('Check error log @eshuri.rw');
	});

}