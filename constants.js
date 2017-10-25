/* HERE WE WILL ST SOME COMSTANTS VARIABLES*/
module.exports = function(app) {
	/* TYpes of contents*/
	app.locals.type={
		W_Note:1,
		PDF_Note:2,
		Auto_Assessment:3,
		Written_Assessment:4,
		Uploaded_Assessment:5,
		Offline_Assessment:6,
		Video_link:7,
	};
	app.locals.access_level={
		SUPERADMIN:1,
		HOD: 1.05,
		SA_SCHOOL:1.1,
		ADMIN:2,
		ADMIN_TEACHER:2.1,
		TEACHER:3,
		STUDENT:4,
		PARENT:5,
	};
	app.locals.MAXPOSTLENGTH=140;
	app.locals.tokenLength =13;
}