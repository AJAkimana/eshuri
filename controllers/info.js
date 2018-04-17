
exports.getMainPage = function(req,res,next){
	return res.render('info/homepage',{
		title:'eShuri homepage',
    access_lvl:req.isAuthenticated()? req.user.access_level:null,
	})
}

exports.getWelcomePage =(req,res,next)=>{
  if(!req.isAuthenticated()) return res.redirect('/user.signin');
  var link ="";
  console.log('Access:'+req.user.access_level)
  switch(req.user.access_level){
    case req.app.locals.access_level.SUPERADMIN: link="/dashboard"; break;
    case req.app.locals.access_level.SA_SCHOOL: link="/dashboard.director";break;
    // those guys will be redirected to their dashboard
    case req.app.locals.access_level.HOD:
    case req.app.locals.access_level.ADMIN:
    case req.app.locals.access_level.ADMIN_TEACHER: link="/dashboard.classe/"+req.user.school_id;break;
    // Those guys wil be reidrected to the timeline
    case req.app.locals.access_level.TEACHER:
    case req.app.locals.access_level.STUDENT: link="/timeline";break;
    case req.app.locals.access_level.PARENT: link="/parent";break;
    case req.app.locals.access_level.GUEST: link="/application";break;
    default: break;
  }
  if(link!="") return res.redirect(link);
  return res.render("./lost",{msg:"Unknown user here"});
}
/*INFO CONTROLLERS */
exports.getPageAbout = function(req,res,next){
	return res.render('info/about',{
		title:'About me'
	})
}
exports.getTerms_Conditions = function(req,res){
	return res.render('info/termsConditions',{
		title:'About me'
	})
}
exports.getPage404 = (req, res,next) => {	
	 // console.log(" PAGE NOT EXISTS "+req.method+" @ "+req.path)
	 res.status(404).render('page404', {title: '404 Page' }); 
};
