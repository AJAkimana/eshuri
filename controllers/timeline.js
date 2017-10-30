const Course =require('../models/Course'),
      User =require('../models/User'),
      Publication =require('../models/Publication'),
      Notification =require('../models/Notification'),
      Util =require("../utils"),
      Message =require('../models/Message'),
      School =require('../models/School'),
      log_err=require('./manage/errorLogger');

exports.pageTimeline = (req,res,next)=>{
  var now =Date.now();
  User.update({_id:req.user._id},{$set:{lastSeen:now}},(err,ok)=>{
    if(err) return log_err(err,true,req,res);
    var userId
    if(req.session.student){
      userId=req.session.student._id
    }else{
      userId=req.user._id
    }
    return res.render('timeline/home',{
      title:"eShuri Wall",
      lastSeen:now,
      userName:req.user.name,
      pic_id:req.user._id,
      pic_name:req.user.name.replace('\'',"\\'").replace('\'',"\\'"),
      access_lvl:req.user.access_level,
      school_id:req.user.school_id,
      maxPost:req.app.locals.MAXPOSTLENGTH,
      csrf_token:res.locals.csrftoken, 
      user_id:userId,
    })
  })
};

exports.createPost = (req,res,next)=>{
	req.assert('post'," Post is invalid").notEmpty();
	const errors = req.validationErrors();
    var postcat;
    if(req.user.access_level>=req.app.locals.access_level.STUDENT) postcat = 1;
    else{
      if(req.body.category) postcat = 1;
      else postcat = 2;
    }
  	if(errors) return ;
  	var tags =require('find-hashtags')(req.body.post);
  	req.body.post = req.body.post.replace(/(^|\s)(#[a-z\d-]+)/ig, "$1<a href='/timeline/tag/$2'>$2</a>");
  	new Publication({
  		user_id:req.user._id,
  		content:req.body.post,
  		class_id:req.body.class_id||null,
  		school_id:req.user.school_id,
      isAuto:false, // Here it is a post with will
      user_name:req.user.name,
      category:postcat,
  		tags:tags,
  	}).save((err)=>{
  		if(err) return log_err(err,false,req,res);
  		return res.end();
  	})
}
//
exports.addComment = (req,res,next)=>{
	req.assert('comment'," Post is invalid").notEmpty();
	req.assert('post_id',"Comment is invalid").isMongoId();
	const errors = req.validationErrors();
  	if(errors) return res.status(400).send(errors[0].msg);

  	Publication.findOneAndUpdate(
  		{_id:req.body.post_id},
  		{$push:{comments: {user_id:req.user._id,user_name:req.user.name,data:req.body.comment.trim(),time:Date.now()}
  			   }
  		},
  		{new:true}, 
  		// give back the updated doc
  		(err,doc)=>{
  		if(err) return log_err(err,false,req,res);
  		return res.json(doc.comments);
  	})
}
/* just get all the timeline for your class  or for all ON YOUR SCHOOL*/
exports.getAdminPosts = (req, res, next)=>{
  var accLvl = req.user.access_level;
  var school = req.user.school_id;
  Publication.find({school_id:school, category:2}).sort({time:-1}).exec(function(err, postList){
    if (err) console.log("Something went wrong");
    console.log(accLvl+" and "+school+" Working fine I guess: "+postList);
    return res.json(postList);
  })
}
exports.getTimeline =(req,res,next)=>{
  var gica = require("async");
  var notifs=[],publications=[],theUser,theClass;
  var postCategoty;
  if(req.user.access_level==5) {
    theUser = req.session.student._id
    theClass=req.session.student.class_id
  }
  else{
    theUser = req.user._id
    theClass=req.user.class_id
  }
  gica.parallel([
    (callback)=>{ 
    Publication.find({
        $and:[
          {$or:[{class_id: {$exists: true}},{class_id:theClass}]},
          {school_id:req.user.school_id, $or:[{category:null},{category:1}]}
        ]
      })
    .sort({time:-1})
    .limit(40)
      .exec((err,list_posts)=>{
        if(err) return callback(err);
        publications =list_posts;
        callback(null)
      })
    },
    (callback)=>{ 
    Notification.find({
        $and:[
          {$or:[
            // si class_id fo k class_id soit pas undefined !!!! but it does when undefined
            {$and:[{class_id: theClass},{class_id:{$ne:null}}]}
            ,// si dest_id fo k dest_id soit pas undefined
            {$and:[{dest_id:req.theUser},{dest_id:{$ne:null}}]}
            ,
            {$and:[{user_id:req.theUser},{user_id:{$ne:null}}]}
            ]},
          {school_id:req.user.school_id}
        ]
      })
    .sort({time:-1})
    .limit(30)
    .exec((err,list_notifs)=>{
      if(err) return callback(err);
      notifs =list_notifs;
      callback(null)
    })
    }
  ],(err)=>{
    if(err)  return log_err(err,false,req,res);
    var reponse={publications:publications, notifs:notifs}
    return res.json(reponse);
    })
}
exports.getMEssageFromOne = (req,res,next)=>{
  req.assert('from_id',"Comment is invalid").isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  Message.find({conv_id:Util.getConv_id(req.user._id,req.params.from_id)}
    ,(err,listCOnv)=>{
    if(err) return log_err(err,false,req,res);
    return res.json(listCOnv)
  })
} 
exports.addLike = (req,res,next)=>{
  req.assert('post_id',"Invalid data").isMongoId();
  const errors = req.validationErrors();
  if(errors) return res.status(400).send(errors[0].msg);
  Publication.findOne({_id:req.params.post_id},(err,postExists)=>{
    if(err) return log_err(err,false,req,res);
    else if(!postExists) return res.end();
    else if(postExists.likes.indexOf(req.user._id)==-1)
      postExists.update({$push:{likes:req.user._id}},(err,likeOk)=>{
        if (err)return log_err(err,false,req,res);
        return res.send({ok:true}); 
      })
    else{
       postExists.update({$pull:{likes:req.user._id}},(err,likeOk)=>{
        if (err)return log_err(err,false,req,res);
        return res.send({remove:true}); 
      })
    }
  })
}
