/* Fir upload ing files */
const multer = require('multer'); 
const MB = 1024*1024;
const pdfMaxSize =16*MB; // 2 MB

/**
 * Different Controllers (route handlers).
 */
const userController = require('./controllers/user');
const infoController = require('./controllers/info');
// const calendarController = require('./controllers/calendar');
// const chartsController =require('./controllers/chart');
const schoolController = require('./controllers/school');
const coursesController = require('./controllers/course');
const unitsController = require('./controllers/unit');
const dashboardController = require('./controllers/dashboard');
const classeController = require('./controllers/classe');
const noteController =require('./controllers/content/pdf_note');
const wNoteController =require('./controllers/content/written_note');
const automatedController =require('./controllers/content/automated');
const uploadedAssessmentController =require('./controllers/content/uploaded');
const writtenController =require('./controllers/content/written_test');
const offlineController =require('./controllers/content/offline_test');
const marksController =require('./controllers/marks');
const videoController =require('./controllers/content/video');
const timelineCtrl =require('./controllers/timeline');
const backUpCtrl =require('./controllers/manage/backup');

const parentController =require('./controllers/parent');

const universityController =require('./controllers/university');
const facultyController =require('./controllers/faculty');
const departmentCtrl =require('./controllers/department');
const libraryCtrl = require('./controllers/library');
const passport = require('passport');
const multPart = require('connect-multiparty');

//Profiling registration services

// Service controllers
const profileController = require('./controllers/profile');
const applicationsController = require('./controllers/applications')

module.exports = function(app) {
	// ---DONT LET THIS MIDDLEWARE ACTIVATED in PROD it will leak req.body
	app.use((req,res,next) =>{
		// console.log('___________C_O_O_K_I_E_S___'+req.user)
		if(process.env.devStatus=='DEV'){
			if(req.user) console.log(JSON.stringify(req.user.name)+" "+ req.method+" @ "+JSON.stringify(req.path)+' -- '+JSON.stringify(req.body))
			else console.log("Not connected "+ req.method+" @ "+JSON.stringify(req.path)+' -- '+JSON.stringify(req.body))
		}
		// console.log(req.method+" @ "+JSON.stringify(req.path)+' -- '+JSON.stringify(req.body))
		return next();
	});
	app.use((req,res,next) =>{
		if(req.user){
			if(!req.user.isEnabled) return res.status(401).send('Your account has been disabled ');	
		}
		return next();
	});	
	/* cette fonction est utilises pour les gens ki on gere bcp d eschools /options tu vois?*/
	app.use((req,res,next)=>{
		if(req.session.currentOption && req.user.access_level==req.app.locals.access_level.HOD) 
			req.user.school_id=req.session.currentOption;
		return next();
	});

/*
 For the app :
	1. Create schools
	2. Create classes in schools
	3. Create users by affecting tasks (Root creates for admins and admin creates teachers and students and parents)
	4. Then let anyone connect to the system.
	5. Boom
*/
	var isAuthenticated =function(req,res,next){
		if(req.isAuthenticated()) return next();
		return res.redirect('/user.signin');     	
	}
	var isSuperAdmin =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level == req.app.locals.access_level.SUPERADMIN) 
			return next();
		return res.status(400).send(" You are not authorized to access this");     	
	}
	var isAtLeastHOD =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level <= req.app.locals.access_level.HOD) 
			return next();
		return res.status(400).send("This operation is for Head of departments");     	
	}
	var isAtLeastAdmin =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level <= req.app.locals.access_level.ADMIN_TEACHER) 
			return next();
		return res.status(400).send("This operation is only for school administrators");     	
	}
	var isAbsoluteTeacher =function(req,res,next){
		if(req.isAuthenticated() && (req.user.access_level == req.app.locals.access_level.TEACHER)||(req.user.access_level == req.app.locals.access_level.ADMIN_TEACHER)) 
			return next();
		return res.status(400).send("This operation is only for teachers");     	
	}
	var isAtLeastTeacher =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level <= req.app.locals.access_level.TEACHER) 
			return next();
		return res.status(400).send("This operation is for teachers");     	
	}
	var isTeacherOrAdmin =function(req,res,next){
		var userAccess = req.app.locals.access_level;
		var accLvl = req.user.access_level;
		if(req.isAuthenticated() && (accLvl != userAccess.SUPERADMIN || accLvl == userAccess.STUDENT || accLvl != userAccess.PARENT)) 
			return next();
		return res.status(400).send("This operation is for teachers");     	
	}
	var isAtLeastStudent =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level <= req.app.locals.access_level.STUDENT) 
			return next();
		return res.status(400).send("You are not authorized to view this");     	
	}
	var isStudent =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level == req.app.locals.access_level.STUDENT) 
			return next();
		return res.status(400).send("This operation is only for students");     	
	}
	var isParent =function(req,res,next){
		if(req.isAuthenticated() && req.user.access_level == req.app.locals.access_level.PARENT) 
			return next();
		return res.status(400).send("This operation is only for parents");     	
	}
	var isGuest =(req, res, next)=>{
		if(req.isAuthenticated() && req.user.access_level == req.app.locals.access_level.GUEST);
			return next();
		return res.status(400).send("This operation is only for guest")
	}
	var isGuestOrStudent=(req, res, next)=>{
		if(req.isAuthenticated()&&(req.user.access_level == req.app.locals.access_level.GUEST||req.user.access_level == req.app.locals.access_level.STUDENT))
			return next();
		return res.render("./lost",{msg:'This operation is only for guest or student'});
		// return res.status(400).send("This operation is only for guest or student")
	}
	/* This function is dangerous*/
	// var createSA =(req,res,next)=>{
	// 	req.body.name="Akimana Jean dAmour";req.body.email="a.k.imanaja17@gmail.com";
	// 	req.body.password ="akimanaja";
	// 	req.body.password2 ="akimanaja";
	// 	req.body.phone_number="+2456";
	// 	req.body.type=1;
	// 	req.body.institution=2;
	// 	req.body.gender=1;
	// 	next();
	// }
	// THEN CHANGE ACCESS_LEVEL isValidated and isEnabled
	// app.get("/createSA",createSA,userController.postSignUp);
	/* This function is the middleware that uploads file to the system*/
	/*-------------*/
	var upload_File = (req,res,next)=>{
		var file_storage;
		if(req.path=="/content.add.note" ||req.path=="/content.update.note")
			file_storage =process.env.NOTEPATH;
		else if(req.path=="/content.add.uploaded" ||req.path=="/content.update.uploaded")
			file_storage =process.env.UPLOADED_PATH;
		else if(req.path=="/content.do.uploaded")
			file_storage =process.env.UPLOADED_PATH_ANSWERS;
		else if(req.path == "/library.do.upload")
			file_storage =process.env.LIBRARY_FILE;
		else return res.status(400).send("Unexpected data");
		var storage = multer.diskStorage({
		  destination: function (req, file, cb) {
		  	console.log('Saving '+file_storage+"<br/>  with path ="+req.path)
		  	console.log('---'+file_storage)
			cb(null, file_storage)
		  },
		  filename: function (req, file, cb) {
			cb(null, Date.now()+"."+file.originalname.split('.').pop());
		  }
		});
		var upload = multer({ 
			storage:storage,
			limits:{fileSize:pdfMaxSize},
			fileFilter: (req, file, cb)=>{
				console.log(" File before saving"+JSON.stringify(file));
				if(file.mimetype !=="application/pdf") return cb("Sorry, only pdf format is accepted")
				return cb(null, true);
			},
		})
		.single('pdf_note'); // the name of the file to be uploaded
		upload(req,res,(uploadErr)=>{
			if(uploadErr) return res.render("./lost",{msg:uploadErr});
			return next();
		})
	};
	/**
	 * Primary app routes.
	 */	
	//  app.get('/toka',(req,res,next)=>{
	// 	require('./models/User').update(
	// 		{class_id:ObjectId("591437335842b7596513ce51")},
	// 		{class_id:ObjectId("59102b6cb5d05f3540731049")},{multi:true},(err,ok)=>{
	// 	    if(err) return res.status(400).send('Vyanse vieu '+err);
	// 	    return res.send(' Okay'+JSON.stringify(ok));
 	//		})
	// });
	app .get('/',infoController.getMainPage);
	app .get('/home',infoController.getWelcomePage);
	app .get('/backup.page',isSuperAdmin,backUpCtrl.getBackupPage);
	app .get('/backup.create',isSuperAdmin,backUpCtrl.createBackUp);
	app .get('/backup.list',isSuperAdmin,backUpCtrl.getbackupListAvailable);
	app .get('/errors.list',isSuperAdmin,backUpCtrl.getErrorsList);
	app .get('/backup.download/:file',isSuperAdmin,backUpCtrl.downloadBackup);

	//User
	app .get('/user.signin',userController.getPageSignIn);
	app.post('/user.signin',userController.postSignIn);
	app.get('/user.facebook.auth', passport.authenticate('facebook', { 
		scope : ['public_profile', 'email'] }));
	app.get('/user.google.auth', passport.authenticate('google', { 
		scope : ['profile', 'email'] }));
	app.get('/google-callback', userController.googleCallback);
	app.get('/fb-callback',userController.fbCallback);
	// app.post('/offline.user.signin',userController.postOfflineSignIn);
	app .get('/user.signup', userController.getPageSignUp);
	app.post('/user.signup', userController.postSignUp);
	app .get('/user.settings',isAuthenticated,userController.getPageUserSettings);
	app.post('/user.email_recover',userController.postForgotPassword);
	app.post('/user.resendEmail_link',userController.postResendLink);
			/// PARENTS THINGS
	app .get('/parent',isAuthenticated,isParent,parentController.getParentPage);
	app .post('/parent.request',isAuthenticated,isParent,parentController.postRequestChild);
	app .get('/parent.child.list',isAuthenticated,isParent,parentController.getListChild);
	app .get('/parent.child.remove/:student_URN',isAuthenticated,isParent,parentController.removeFromChild);
	app .post('/parent.set.student',isAuthenticated,isParent,parentController.parentSetStudent);
	app .get('/parent.get.student.report',isAuthenticated,isParent,parentController.parentGetStudentReport);
	app .get('/parents',isAuthenticated,isStudent,parentController.getParentPage);
	app .get('/student.parents.list',isAuthenticated,isStudent,parentController.getListParents);
	app .delete('/student.parent.remove/:parent_URN',isAuthenticated,isStudent,parentController.removeFromParents);
	app .put('/student.action.on.parent',isAuthenticated,isStudent,parentController.modifyAccessOnParent);
	
	app.post('/user.renew_password',isAuthenticated,userController.renewPassword);
	app.post('/user.change_email',isAuthenticated,userController.changeEmail);
	app .get('/user.logout',userController.logout);
	// app.post('/user.teachers.list',isAuthenticated, userController.loadTeachers);
	app .get('/user.get.id',isAuthenticated, userController.get_IDUser);
	app.post('/user.update.profile',isAuthenticated, userController.changeProfile);
	app.get('/user.enable/:user_id',isAtLeastAdmin, userController.enableUser);
	
	app .get('/pp.view/:user_id',userController.getProfileUser);

					/* Password things*/
	app .get('/password.reset', userController.getResetPasswordPage);
	app.post('/password.reset', userController.postResetPassword);
	app .get('/email.validation', userController.getValidateYourAccount);
	
				/* SCHOOLS Things*/
	app .get('/school',isAuthenticated, schoolController.getPageSchool);
	app .get('/school.list', schoolController.getSchool_JSON);
	app.get('/eshuri/schools/alljson.json', schoolController.getSchool_JSON);
	app.get('/school.list/:name', schoolController.getSchool_BySearch);
	app .get('/school.list.dashboard',isAtLeastAdmin,schoolController.getSchool_DashboardJSON);
	
	app .get('/school.department.list',isAtLeastAdmin, schoolController.getDepartments_JSON);
	app .get('/option.list/:department_id',isAtLeastAdmin, schoolController.getOptions_JSON);
	app.get('/option.choose/:department_id',isAtLeastHOD,departmentCtrl.getPageChooseOption);
	app.get('/option.set/:option_id',isAtLeastHOD,departmentCtrl.setNewOption);
	

	app.post('/school.update.school.super_admin',isAtLeastAdmin, schoolController.updateSuperAdmin);
	app.post('/department.set_super_admin',isAtLeastAdmin, schoolController.setHeadOfDepartment);
	
	app.post('/school.add',isSuperAdmin, schoolController.postNewSchool);
	app.get('/school.setting/:school_id',isSuperAdmin, schoolController.getSettingSchoolPage);
	app .get('/school.profile/:school_id', schoolController.getSchoolProfile);
	app .post('/school.update.profile',isSuperAdmin, schoolController.changeSchoolProfile);
	app .post('/add.school.info',isSuperAdmin, schoolController.addSchoolInfo);
	app .get('/school/:id_school',isAuthenticated, schoolController.homepageSchool);
	app.post('/school.delete',isSuperAdmin, schoolController.removeSchool);
	app.get('/school.content.list/:school_id',isAuthenticated, schoolController.getSchoolData);
	// Get user classes from past to now.
	app.get('/school.get.userClasses/:school_id', isAuthenticated, schoolController.getUserClasses);
	/*
	You send POST @ "/school.content.courses" -- {"_csrf":"","class_id":"58c970b9708c4a9f40dfbb85","currentTerm":1}
	You will get a list of course_name, course_id, and teacher_id
	*/
	app.post('/school.content.courses',isAuthenticated, schoolController.getCoursesList);
	
	app.post('/school.admin.add',isAtLeastAdmin, schoolController.setTeacherAsAdmin);
	app.post('/school.teacher.to.admin',isAtLeastAdmin, schoolController.setAdminAsTeacher);
	app.post('/school.admins.list',isAtLeastAdmin, schoolController.getAdminsList);
	app .get('/school.teachers.list/:school_id',isAuthenticated, schoolController.getTeachersList);
	app.post('/school.teacher.delete',isAtLeastAdmin, schoolController.removeTeacher);
	app.post('/school.teacher.dissociate',isAtLeastAdmin, schoolController.dissociateTeacher);

	app.post('/school.students.list',isAuthenticated, schoolController.getStudentsList);
	app.post('/school.student.delete',isAtLeastAdmin, schoolController.removeStudent);
	//Akimanaedit student
	app.post('/school.student.edit',isAtLeastAdmin, schoolController.editStudent);
	app.get('/school.allUsers.list/:school_id',isAuthenticated, schoolController.getUsersSchool);
	//Users for teaChat
	app.get('/school.allTeacAdminUsers.list/:school_id', isTeacherOrAdmin, schoolController.getTeacherAndAdminSchool);
	/*				DASHBOARD THINGS
		Concerning adding new school, classe, course -- > For SA and A, Only*/
			// FOR SUPER ADMIN ONLY
	app .get('/dashboard',isAtLeastAdmin, dashboardController.getHomePageDashboard);
	app .get('/dashboard.school',isSuperAdmin, dashboardController.getPageSchools);	
	app .get('/dashboard.university',isSuperAdmin, dashboardController.getPageUniversities);	
				// FOR ADMINS LEVEL
	app .get('/dashboard.classe/:school_id',isAtLeastAdmin, dashboardController.getPageUpdateSchool);
	app .get('/dashboard.course/:classe_id',isAtLeastAdmin, dashboardController.getPageClasse);
	app .get('/dashboard.register.course/:school_id',isAtLeastAdmin, dashboardController.getPageRegisterCourse);	
	app .get('/dashboard.faculty/:univ_id',isAtLeastAdmin, dashboardController.getPageFaculties);
	app .get('/dashboard.accounts.validation/:school_id',isAtLeastAdmin, dashboardController.getPageConfirmAccounts);
	app.post('/dashboard.accounts.tovalidate',isAtLeastAdmin,dashboardController.getAccountsValidate_JSON);
	app.post('/dashboard.validate.teacher',isAtLeastAdmin,dashboardController.confirmTeacherAccount);
	app.post('/dashboard.validate.student',isAtLeastAdmin,dashboardController.confirmStudentAccount);
	
	app .get('/dashboard.admins/:school_id',isAtLeastAdmin, dashboardController.getPageAdmins);
	app.post('/dashboard.admin.add',isAtLeastAdmin, dashboardController.postNewAdmin);
	app .get('/dashboard.teachers/:school_id',isAtLeastAdmin, dashboardController.getPageTeachers);	
	app .get('/dashboard.students/:class_id',isAtLeastAdmin, dashboardController.getPageStudents);
	// app .get('/dashboard.students/:school_id',isAuthenticated, dashboardController.getPageStudents);
	app .get('/dashboard.departments/:fac_id',isAtLeastAdmin, dashboardController.getPageDepartments);
	app .get('/dashboard.options/:department_id',isAtLeastAdmin, dashboardController.getPageOptions);
	app.post('/dashboard.statistics',isAtLeastAdmin, dashboardController.getPageDashboardStats);	

				/* FOR ANYONE PUBLIC */
	app .get('/dashboard.universities.signup', dashboardController.getAvailableUniversities);
	app .get('/dashboard.faculties.signup/:univ_id', dashboardController.getAvailableFaculties);
	app .get('/dashboard.department.signup/:faculty_id', dashboardController.getAvailableDepartments);
	app .get('/dashboard.option.signup/:department_id', dashboardController.getAvailableOptions);
	app .get('/dashboard.class.signup/:school_id', dashboardController.getAvailableClasses);


					/*UNIVERSITIES THINGS */
	app.post('/university.add',isSuperAdmin, universityController.postNewUniversity);
	app .get('/university.list',isSuperAdmin, universityController.getUniv_JSON);
	
	app.post('/university.delete',isSuperAdmin, universityController.removeUniversity);
				/* FACULTIES*/
	app.post('/fac.add',isSuperAdmin, facultyController.postNewFaculty);
	app.post('/fac.list',isSuperAdmin, facultyController.getFac_JSON);
	app.post('/fac.delete',isSuperAdmin, facultyController.removeFaculty);
				/* DEPARTMENTS*/
	app.post('/department.list',isSuperAdmin,departmentCtrl.getDepartment_JSON);
	app.post('/department.add',isSuperAdmin,departmentCtrl.postNewDepartment);
	app.post('/department.delete',isSuperAdmin, departmentCtrl.removeDepartment);
	

				/*CLASSES THINGS */
	app.post('/class.add',isAtLeastAdmin, classeController.postNewClass);
	app .get('/classe.list/:school_id',isAuthenticated, classeController.getClasses_JSON);
	app.post('/set.class.teacher', isAtLeastAdmin, classeController.setClassTeacher);
	app .get('/classe.list.for.report/:school_id',isAuthenticated, classeController.getClasses_JSON_For_Report);
	app .get('/classe.list.confirm/:school_id',isAuthenticated, classeController.getClasses_JSONConfirm);
	
	app.post('/classe.edit',isAtLeastAdmin,classeController.editClasse)
	app.post('/classe.delete',isAtLeastAdmin, classeController.removeClasse);
	app.post('/class.update.settings',isAtLeastAdmin, classeController.updateSettings);
	app.get('/classe/:classe_id',isAuthenticated, classeController.getPageOneClasse);
	app.get('/classe.get.courses/:classe_id/:t_quantity', isAuthenticated, classeController.getClassCourses);
	app.get('/classe.get.nexts/:class_id', isAtLeastAdmin,classeController.getNextClasses);
	app.post('/school.change.to.next',isAtLeastAdmin, classeController.getToNextClass);
	app.post('/school.change.to.previous',isAtLeastAdmin, classeController.returnToPreviousClass)
				/*COURSES THINGS*/
	app .get('/courses/:course_id',isAuthenticated, coursesController.getPageOneCourse);
	app.post('/course.add',isAtLeastAdmin, coursesController.postNewCourse);
	app.post('/course.list',isAuthenticated, coursesController.getCourses_JSON);
	app.post('/course.delete',isAtLeastAdmin, coursesController.deleteCourse);
	app.post('/course.change.coursename', isAtLeastAdmin, coursesController.changeCourseName)
	app.post('/course.affect.teacher',isAtLeastAdmin, coursesController.affectTeacher_Course);
	app.get('/course.page.edit.quota/:course_id',isAtLeastTeacher,coursesController.getPageEditQuota)
	app.post('/course.update.quota',isAtLeastTeacher, coursesController.updateQuota);

	app.post('/school.add.new_program', isAtLeastAdmin, schoolController.postSchoolProgram);
	app.get('/school.courseAndProgram.list/:school_id',isAuthenticated, schoolController.getSchoolCourseAndProgram_JSON);
	app.post('/school.delete.program', isAtLeastAdmin, schoolController.deleteSchoolProgram)
	app.post('/school.add.course',isAtLeastAdmin, schoolController.postSchoolCourse);
	app.post('/school.delete.course',isAtLeastAdmin, schoolController.deleteSchoolCourse);
				/* UNIT THINGS*/
	app.post('/unit.add',isAtLeastTeacher, unitsController.postNewUnit);
	/*
		You send POST @ "/unit.list" -- {"course_id":"58c971af708c4a9f40dfbb91"}
		You receive a list unit_name, unit_id 
	*/
	app.post('/unit.list',isAuthenticated, unitsController.getUnit_JSON);	
	app.post('/unit.delete',isAtLeastTeacher, unitsController.removeUnit);			
				/* CONTENTS THINGS*/	
	/*
		You send POST @ "/content.list" -- {"unit_id":"58c971c5708c4a9f40dfbb92","type":X}
		X: 1 for  WNOtes, 2 for PDFNOTEs
		You received a list content_id content_name upload_time 
	*/
	app.post('/content.list',isAuthenticated, wNoteController.get_Content_JSON);
	app .get('/content.list.tests/:course_id',isAtLeastTeacher, wNoteController.getListContentPerCourse);
	app.post('/content.publish',isAtLeastTeacher, wNoteController.setPublish);
	app.post('/content.set_CAT',isAbsoluteTeacher, wNoteController.setCAT);
	app.post('/content.set_Quoted',isAbsoluteTeacher, wNoteController.set_Quoted);
	app.post('/content.delete',isAbsoluteTeacher, wNoteController.removeContent);
	
	app .get('/content.add.w_note/:unit_id',isAtLeastTeacher, wNoteController.pageNew_WrittenNote);
	app.post('/content.add.w_note',isAbsoluteTeacher, wNoteController.postNew_WrittenNote);
	app .get('/content.edit.w_note/:content_id',isAtLeastTeacher, wNoteController.pageEdit_WNotes);
	app.post('/content.update.w_note',isAbsoluteTeacher, wNoteController.postUpdateW_Note);
	app .get('/content.view/:content_id',isAuthenticated, noteController.viewContent);
	app .get('/content.do.w_note/:content_id',isAuthenticated, noteController.viewContent)

	app .get('/content.add.note/:unit_id',isAtLeastTeacher, noteController.pageNew_Note);
	app.post('/content.add.note',isAbsoluteTeacher,upload_File,noteController.postNew_Note);	
	app .get('/content.edit.note/:content_id',isAtLeastTeacher, noteController.pageEdit_Notes);
	app.post('/content.update.note',isAbsoluteTeacher,upload_File, noteController.postUpdateNote);
	app .get('/content.do.note/:content_id',isAuthenticated, noteController.viewContent);	
	app .get('/content.do.video/:content_id',isAuthenticated, noteController.viewContent);
	/*
	GET @ "/pdf.view/58d692cecee48a100c6ebd38" -- {} // you give the content_id
	You received the file.pdf
	*/		
	app .get('/pdf.view/:content_id',isAuthenticated,noteController.getPdf);
	/*
		GET @ '/pdf.download/:content_id' -- {} //
		You receive the file PDF to download.
	*/
	app .get('/pdf.download/:content_id',isAuthenticated,noteController.downloadPdf);
	app .get('/pdf.check/:content_id',isAuthenticated,noteController.checkPDFName);// for Windows app only
							
	app .get('/content.add.video/:unit_id',isAtLeastTeacher, videoController.pageNewVideo);
	app.post('/content.add.video',isAtLeastTeacher,videoController.postNew_Video);

							/* ASSESSMENTS TESTS*/
		/* this method will be called by all assessment types*/
	app.get('/content.answers.page/:content_id',isAtLeastTeacher, writtenController.getPageListAnswers);
	app .get('/content.answers.list.json/:content_id',isAtLeastTeacher, writtenController.getJSON_Answers);
	app.post('/content.update.total_marks',isAtLeastTeacher,writtenController.updateTotalMarks);

								/* Methods only*/
	app .get('/content.add.automated/:unit_id',isAtLeastTeacher, automatedController.pageNewAutomated);
	app.post('/content.add.automated/',isAtLeastTeacher, automatedController.postNew_Automated);
	app.post('/content.update.automated/',isAtLeastTeacher, automatedController.postUpdate_Automated);
	app .get('/content.edit.automated/:content_id',isAtLeastTeacher, automatedController.pageEdit_Automated);
	app .get('/content.edit.get.automated/:content_id',isAtLeastTeacher, automatedController.pageGET_Automated);
	app .get('/content.do.automated/:content_id',isAuthenticated, automatedController.pageDO_Automated);
	app .get('/content.questions.do.automated/:content_id',isAuthenticated, automatedController.getQuestions);
	app.post('/content.questions.do.automated/:content_id',isAuthenticated, automatedController.postAnswers);

	app .get('/content.add.uploaded/:unit_id',isAtLeastTeacher, uploadedAssessmentController.pageNew_Uploaded);
	app.post('/content.add.uploaded',isAtLeastTeacher,upload_File,uploadedAssessmentController.postNew_Uploaded);
	app .get('/content.do.uploaded/:content_id',isAuthenticated, uploadedAssessmentController.do_Uploaded);
	app.post('/content.do.uploaded/',isAuthenticated,upload_File,uploadedAssessmentController.uploadAnswer);
	app .get('/content.uploaded.view.student.page/:marks_id',isAuthenticated, uploadedAssessmentController.getPageViewAnswer);
	app .get('/pdf.view.answer.uploaded/:marks_id',isAuthenticated,uploadedAssessmentController.readAnswerUploadedPDF)
	app.post('/content.uploaded.set_marks/:marks_id',isAtLeastTeacher, uploadedAssessmentController.setMarksToStudent);
	app.get('/content.edit_marks/:content_id',isAbsoluteTeacher, offlineController.setSpecialMarks);


	app .get('/content.add.written/:unit_id',isAtLeastTeacher, writtenController.pageNewWritten);
	app.post('/content.add.written',isAtLeastTeacher,writtenController.postNew_Written);
	app .get('/content.edit.written/:content_id',isAtLeastTeacher, writtenController.pageEdit_Written);
	app .get('/content.edit.get.written/:content_id',isAtLeastTeacher, writtenController.pageGET_Written);
	app.post('/content.update.written/',isAtLeastTeacher, writtenController.postUpdate_Written);
	app .get('/content.do.written/:content_id',isAuthenticated, writtenController.pageDO_Written);
	app .get('/content.questions.do.written/:content_id',isAuthenticated, writtenController.pageGET_Written);
	app.post('/content.questions.do.written/:content_id',isAuthenticated, writtenController.postAnswers);
	app .get('/content.written.view.student.page/:marks_id',isAuthenticated, writtenController.getPageViewAnswer);
	app .get('/content.written.view.student.json/:marks_id',isAuthenticated, writtenController.getJSONViewAnswer);
	app.post('/content.written.set_marks/:marks_id',isAtLeastTeacher, writtenController.setMarksToStudent);
	
	app .get('/content.add.offline/:unit_id',isAtLeastTeacher, offlineController.pageNewOfflineTest);
	app.post('/content.add.offline',isAtLeastTeacher, offlineController.addOfflineTest);
	app .get('/content.edit.offline/:content_id',isAtLeastTeacher, offlineController.pageEditOfflineTest);	
	app.post('/content.update.offline',isAtLeastTeacher, offlineController.updateOfflineTest);
	app .get('/content.do.offline/:content_id',isAuthenticated, noteController.viewContent);		
	app.post('/content.list.students.offline',isAtLeastStudent,offlineController.getPageOfflineStudents);
	app.post('/content.offline.set_marks',isAtLeastTeacher,offlineController.setMarksStudent);
	app.post('/content.offline.undo_marks',isAtLeastTeacher,offlineController.undoMarksStudent);

	app .get('/report',isAuthenticated, marksController.getPageReport);
	app.get('/report.teacher', isAbsoluteTeacher, marksController.getReportPageToTeacher)
	app .get('/chart',isAuthenticated, marksController.getPageChart);
	app .get('/report/:student_id',isAuthenticated, marksController.getPageReportUniversity);
	app.post('/report.university',isAuthenticated,marksController.getReport_JSON);
	//Akimanaprint report
	app.post('/report.one',isAuthenticated,marksController.getFullReportOneStudent);
	app.post('/report.all',isAuthenticated,marksController.getFullReportAllStudent);
	app.post('/get.general.class.marks',isAuthenticated,marksController.getClassMarks);
	//new administration report
	app.get('/printable.report',isAuthenticated,marksController.printableReport);

	app .get('/class.academic_years',isAuthenticated,marksController.getListAcademicYears);
	app .get('/class.academic_years/:class_id',isAuthenticated,marksController.getClassAcademicYears);
	app .get('/student.get.terms/:academic_year',isAuthenticated,marksController.getListTerms);
	app .post('/get.Class.terms/',isAuthenticated,marksController.getClassListTerms);
	app .get('/students/:course_id',isAuthenticated,coursesController.getPageStudentsOneCourse);
	app .get('/student.list/:course_id',isAuthenticated,coursesController.getListStudentsCourse);
	app.post('/student.set.retake',isAtLeastTeacher,coursesController.setStudentRetake);
	app.post('/student.delete.retake',isAtLeastTeacher,coursesController.removeRetakeCourse);
	app.get('/student.marks.page/:course_id',isAuthenticated,coursesController.getPageMyMarks)
////////////////////////////////////////////////////////////////////////////////////////////////////////////

	// app.get('/teacher.student.marks.page/:course_id',isTeacherOrAdmin,coursesController.getStudentPageMyMarks)

	// app.get('/teacher.student.marks/:course_id',isTeacherOrAdmin,coursesController.getStudentPageMyMarks);

////////////////////////////////////////////////////////////////////////////////////////////////////

	app.get('/student.marks/:course_id',isStudent,coursesController.getMyMarks);
	app.post('/student.set_paid',isAtLeastAdmin,dashboardController.studentSetPaid);

	// -------------------------dangerous---------------------------------------------
	app.get('/Ssg3nSAwdtAztx79dLGb', isSuperAdmin, dashboardController.Ssg3nSAwdtAztx79dLGb);
	app.get('/Ssg3nSAwdtAztx79dLGb.post', isSuperAdmin, dashboardController.Ssg3nSAwdtAztx79dLGbPost)
	app.post('/Ssg3nSAwdtAztx79dLGb.delete', isSuperAdmin, dashboardController.Ssg3nSAwdtAztx79dLGbDelete)
	app.post('/Ssg3nSAwdtAztx79dLGb.update', isSuperAdmin, dashboardController.Ssg3nSAwdtAztx79dLGbUpdate)
	app.post('/get.all.conts', isSuperAdmin, dashboardController.getAllConts)
	
	// ------------------------dangerous--------------------------------------------------
	/*---------------------------------------------------------------------------
					Profiling
	----------------------------------------------------------------------------*/
		// Profile Routes
	app.get('/profile', isAtLeastAdmin, schoolController.displayProfile);
	app.post('/profile.create', isAtLeastAdmin, schoolController.createSchoolProfile);
	app.get('/profile/:profile_id', profileController.singleSchoolProfile);
	app.get('/fees', isAtLeastAdmin, profileController.feesProfile);
	// app.get('/:school_name', profileController.displayProfileSchoolDetail)
	/*---------------------------------------------------------------------------
					Profiling
	----------------------------------------------------------------------------*/
	/*---------------------------------------------------------------------------
					Application for admission
	----------------------------------------------------------------------------*/
	// app.get('/admission', isGuest, applicationsController.getApplicationPage);
	app.get('/application.new', isAuthenticated, isGuestOrStudent, applicationsController.displayApplicationForm);
	app.post('/submit.new.application', isGuestOrStudent, applicationsController.newAppSubmission);
	app.get('/application', isAuthenticated, applicationsController.viewApplicationPage);
	app.get('/view.application', isAuthenticated, applicationsController.viewApplication)
	app.get('/application.get.one/:app_id', isAuthenticated, applicationsController.getOneApplication)
	app.post('/application.change.status', isAtLeastAdmin, applicationsController.changeApplicationStatus)
	app.post('/attach.fileid/:app_id', applicationsController.postIDFile);
	app.post('/attach.file.transcript/:app_id', applicationsController.postTranscriptFile);
	/*---------------------------------------------------------------------------
					Application for admission
	----------------------------------------------------------------------------*/


	app.get('/timeline',isAuthenticated,timelineCtrl.pageTimeline);
	app.post('/timeline.create.post',isAuthenticated,timelineCtrl.createPost);
	app.post('/timeline.post.comment',isAuthenticated,timelineCtrl.addComment);
	app.get('/timeline.post.like/:post_id',isAuthenticated,timelineCtrl.addLike);
	app .get('/timeline.get',isAuthenticated,timelineCtrl.getTimeline);
	app.get('/timeline.get.adminpost', isTeacherOrAdmin, timelineCtrl.getAdminPosts);
	app .get('/messages.get/:from_id',isAuthenticated,timelineCtrl.getMEssageFromOne);

	app.get('/library',isAuthenticated,libraryCtrl.getLibraryViewPage)
	app.post('/library.book.list',isAtLeastStudent,libraryCtrl.getLibraryBookList)
	app.post('/library.do.upload',isAtLeastTeacher,upload_File,libraryCtrl.postLibraryFile)
	app.get('/library.get.pdf/:bookId',isAuthenticated,libraryCtrl.getPdfFile)
	app.get('/library.level.list',isAuthenticated,libraryCtrl.getLevelList)
	app.delete('/delete.Book/:bookId',isAtLeastTeacher,libraryCtrl.deleteBook)
	app.put('/update.book.details',isAtLeastTeacher,libraryCtrl.updateBookInfo)
	app.post('/update.book.photo',isAtLeastTeacher,libraryCtrl.updatePhoto)
	app.get('/library.get.photo/:bookId',isAuthenticated,libraryCtrl.getPhoto)

	// app .get('/report3',isAuthenticated,marksController.getReport_JSON);
	// app .get('/charts', chartsController.getPageCharts);
	// app .get('/calendar', calendarController.getPageCalendar)
	app .get('/aboutme', infoController.getPageAbout)
			/* TERMS AND CONDITIONS  ABOUT*/
	app .get('/termsConditions',infoController.getTerms_Conditions);
	app.all('*',infoController.getPage404);
}