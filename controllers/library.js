const Library = require('../models/Library'),
	  log_err=require('./manage/errorLogger');



exports.getLibraryViewPage = (req,res,next)=>{
	res.render('library/viewBook',{
      title:"Library",
      userName:req.user.name,
      pic_id:req.user._id,
      pic_name:req.user.name.replace('\'',"\\'").replace('\'',"\\'"),
      access_lvl:req.user.access_level,
      school_id:req.user.school_id,
      csrf_token:res.locals.csrftoken, 
    })
};
exports.postLibraryFile= (req,res,next)=>{
	req.assert('type', 'Sorry type is Invalid').isInt();
	if(req.body.level)
		req.assert('level', 'Given level is Invalid').isInt();
	const errors = req.validationErrors();
	if (errors) return res.render("./lost",{msg:errors[0].msg})
	Library.find({title:req.body.title,school_id:req.user.school_id},(err,bookExists)=>{
		if(err){
			require("fs").unlink(req.file.path,(err)=>{
			});
			return log_err(err,false,req,res);
		} 
		else if(bookExists!=""){
			require("fs").unlink(req.file.path,(err)=>{
			});
			return res.render("./lost",{msg:"Sorry the title exists"})
		}
		new Library({
			title:req.body.title,
			author:req.body.author,
			description:req.body.description,
			image:"",
			bookName:req.file.path,
			type:req.body.type,
			level:req.body.level,
			school_id:req.user.school_id,
		}).save((err)=>{
			if(err) 
				return log_err(err,false,req,res);
			return res.redirect("back");
		})

	})
}
exports.getLevelList = (req,res,next) =>{
	Library.find().distinct("level",{school_id:req.user.school_id},(err,levelList)=>{
		if(err) return log_err(err,false,req,res);
		return res.send(levelList);
	})
}
exports.getLibraryBookList= (req,res,next)=>{
	req.assert('school_id', 'Invalid data').isMongoId();
	if(req.body.level)
		req.assert('level', 'Given level is Invalid').isInt();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	if(req.body.level){
		Library.find({school_id:req.body.school_id,level:req.body.level},(err,libraryList)=>{
			if(err) return log_err(err,false,req,res);
			else if(!libraryList) return res.status(400).send("This category is empty!");
			return res.send(libraryList);	
		})	
	}
	else{
		Library.find({school_id:req.body.school_id},(err,libraryList)=>{
			if(err) return res.status(500).send("Sorry! Service not available")
			else if(!libraryList) return res.status(400).send("This category is empty!");
			return res.send(libraryList);
		})
	}

}
exports.getPdfFile = (req,res)=>{
	req.assert('bookId', 'Invalid data').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	Library.findById(req.params.bookId,(err,bookDetails)=>{
		return res.sendFile(bookDetails.bookName);
	})
	
}
exports.updateBookInfo = (req,res)=>{

	req.assert('_id', 'Invalid data').isMongoId();
	req.assert('type', 'Sorry type is Invalid').isInt();
	if(req.body.level)
		req.assert('level', 'Given level is Invalid').isInt();
	const errors = req.validationErrors();
	if(errors) return res.status(400).send(errors[0].msg);
	Library.findByIdAndUpdate(req.body._id,{
		title:req.body.title,
		author:req.body.author,
		description:req.body.description,
		level:req.body.level,
	},function(err,response){
		if(err)	return res.status(500).send('Sorry! Service not available');
		return res.end();
		});
}
exports.updatePhoto = (req,res,next)=>{
	// console.log("++++++++++++++"+ JSON.stringify(req.body.book_id))
	// console.log("_______________" + req.user.school_id)
	// req.assert('book_id', 'Invalid data 1').isMongoId();
	// const errors = req.validationErrors();
	// if(errors) return res.render("./lost",{msg:errors[0].msg});
	  const multer = require('multer'); 
	  const MB = 1024*1024;
	  const imgMaxSize =1*MB;
	  var img_extension;
	  var newBookPhoto = require('mongodb').ObjectID()
	  var storage = multer.diskStorage({
    destination: function (req, file, cb) {
      img_extension="."+file.originalname.split('.').pop();
      console.log("55555555555555555"+ img_extension)
      cb(null, process.env.LIBRARY_PICTURE)
    },
    filename: function (req, file, cb) {
    	
    cb(null, newBookPhoto+img_extension);
    }
  });
  var upload = multer({
    storage:storage,
    limits:{fileSize:imgMaxSize},
    fileFilter: (req, file, cb)=>{
      console.log(" File before saving"+JSON.stringify(file))
      if(!file.mimetype.startsWith("image/")) return cb("Sorry, only images are accepted")
      return cb(null, true);
    },
  })
  .single('bookPic'); // the name of the file to be uploaded
  upload(req,res,(uploadErr)=>{
    if(uploadErr) return res.render("./lost",{msg:uploadErr});
    Library.findOne({_id:req.body.book_id,school_id:req.user.school_id},(err,bookExists)=>{
      if(err) return log_err(err,true,req,res);
      else if(!bookExists) return res.render("./lost",{msg:"Invalid data 2"})
      var oldPic =bookExists.image;
      
      bookExists.image =newBookPhoto+img_extension;
      bookExists.save((err)=>{
        if(err) return log_err(err,true,req,res);
        else if((oldPic != bookExists.image)&& oldPic){
          var fileToDelete=process.env.LIBRARY_PICTURE+"/"+oldPic;
          require("fs").unlink(fileToDelete,(err)=>{
              if(err) console.log("===>>DELETION ERROR " + err);
          })
        }
        return res.redirect("back");
      })
    });
  })
}
exports.getPhoto = (req,res)=>{
	req.assert('bookId', 'Invalid data').isMongoId();
	const errors = req.validationErrors();
	if (errors) return res.status(400).send(errors[0].msg);
	Library.findById(req.params.bookId,(err,bookDetails)=>{
		var photoPath=process.env.LIBRARY_PICTURE+"/"+bookDetails.image;
		return res.sendFile(photoPath);
	})
	
}
exports.deleteBook = (req,res)=>{
	req.assert('bookId', 'Invalid data').isMongoId();
	const errors = req.validationErrors();
	if(errors) return res.status(400).send(errors[0].msg);
	Library.findById(req.params.bookId,(err1,theBook)=>{
		if(err1) return log_err(err1,false,req,res);
		else if(!theBook) return res.status().send("The book does exist")
		require("fs").unlink(theBook.bookName,(err)=>{
		    if(err) return console.log(" FILE NOT DELETED !")
		    require("fs").unlink(process.env.LIBRARY_PICTURE+"/"+theBook.image,(err)=>{
		    	Library.remove({_id:req.params.bookId,school_id:req.user.school_id},(err2,Bookdeleted)=>{
					if(err2) return log_err(err2,false,req,res);
					res.end()
				})
		    })
	 	});
	})
}