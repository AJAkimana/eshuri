const ErrorLog=require('../../models/ErrorLog'),
	  log_err=require('../manage/errorLogger');
exports.getBackupPage = (req,res,next)=>{
  if(!req.user.email=='ngendlio@gmail.com' || req.user.access_level !=req.app.locals.access_level.SUPERADMIN)
   return res.redirect('back');

  res.render('dashboard/backup',{
	title: 'Create a backup',
	pic_id:req.user._id,
	pic_name:req.user.name.replace('\'',"\\'"),
	access_lvl:req.user.access_level,
	csrf_token:res.locals.csrftoken, // always set this buddy
  });
}
exports.createBackUp=(req,res,next)=>{
	if(!req.user.email=='ngendlio@gmail.com' || req.user.access_level !=req.app.locals.access_level.SUPERADMIN){
		return res.status(400).send('Sorry you are not authorized');
	}

	const spawn = require('child_process').spawn;
	var time =Date.now();
	var output=process.env.BACKUP_ZONE+'/'+time;
	var compressedFILE =process.env.BACKUP_ZONE+'/'+'Eshuri_'+time+'.tar.gz';
	

	ls = spawn('mongodump',['--out',output]);
	// ls.stdout.on('data', (data) => {
	//   console.log(`stdout: ${data}`);
	// });
	// ls.stderr.on('data', (data) => {
	//   console.log(`stderr: ${data}`);
	// });
	ls.on('close', (code) => {
	  console.log(`child process exited with code ${code}`);
		console.log("Now i start ZIPPING ...");
		if(code !=0)
			return res.status(500).send('Backing up failed with code '+code);
		zip =spawn('tar',['-zcvf',compressedFILE,output]);
		zip.stdout.on('data', (data) => {
		  console.log(`stdout: ${data}`);
		});
		zip.stderr.on('data', (data) => {
		  console.log(`stderr: ${data}`);
		});
		zip.on('close', (code) =>{
		  console.log(`ZIP process exited with code ${code}`);
		  console.log('ZIP is '+'Eshuri_'+time+'.tar.gz')
		  res.send(" Backup successflly created with code "+code );
		  deleteFolder = spawn('rm',['-rf',output]);
			deleteFolder.stdout.on('data', (data) => {
			  console.log(`stdout: ${data}`);
			});
			deleteFolder.stderr.on('data', (data) => {
			  console.log(`stderr: ${data}`);
			});
			deleteFolder.on('close', (code) => {
			  console.log(`DELETE FOLDER process exited with code ${code}`);
			});
		});
	});
}
exports.getbackupListAvailable = (req,res,next)=>{
  if(!req.user.email=='ngendlio@gmail.com' || req.user.access_level !=req.app.locals.access_level.SUPERADMIN)
   return res.status(400).send('Sorry you are not authorized');
	require('fs').readdir(process.env.BACKUP_ZONE, function(err, items) {
		return res.json(items);
	});
}

exports.getErrorsList = (req,res,next)=>{
  if(!req.user.email=='ngendlio@gmail.com' || req.user.access_level !=req.app.locals.access_level.SUPERADMIN)
  return res.status(400).send('Sorry you are not authorized');
	ErrorLog.find({})
	.sort({'created_at':1})
	.exec((err,errorList)=>{
		// err="Uratemutse joshua";
		if(err) return log_err(err,false,req,res);
		return res.json(errorList);
	})
}
exports.downloadBackup = (req,res,next)=>{
	if(!req.user.email=='ngendlio@gmail.com' || req.user.access_level !=req.app.locals.access_level.SUPERADMIN)
   	return res.status(400).send('Sorry, this is not your duty');
     req.assert('file', 'Invalid input').notEmpty();
	 const errors = req.validationErrors();
	 if (errors) res.status(400).send(errors[0].msg);
   	 return res.download(process.env.BACKUP_ZONE+'/'+req.params.file);
}