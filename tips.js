//ero
return log_err(err,true,req,res);
return log_err(err,false,req,res);
// render msg
return res.render("./lost",{msg:""})
// NMAGULAR  POST
$scope.loadUnits = function(){
	$http
	.post("/unit.list",{_csrf:$scope.anti_csrf,course_id :$scope.course_id})
	.then(function(response){
		$scope.units=response.data;
	})
	.catch(function(erreur){
		Notifier.danger(erreur.data)
	});				 
}
/// clickable label
a.btn-simple.btn.label.btn-rose(ng-click="dosomethin(teacher._id)") confirm
	i.material-icons verified_user
// SWAL 
swal({
	title: 'Deleted!',
	text: course_name+' has been deleted.',
	type: 'success',
	confirmButtonClass: "btn btn-success",
	buttonsStyling: false
})
//
    {__v:0,email:0,password:0,gender:0,phone_number:0,
      class_id:0,school_id:0,isEnabled:0,isValidated:0,upload_time:0,updatedAt:0},
//
      else if(course_exists.teacher_list.indexOf(String(req.user._id) ==-1)
        return res.render("./lost",{msg:"This course is not yours"})
        return res.status(400).send("This course is not yours");
 /// 
 swal({
			title: 'Give us your email address',
			html: '<div class="form-group">' +
					  '<input id="input1" type="email" class="form-control" placeholder="Type your email here" />' +
				  '</div>',
			showCancelButton: true,
			confirmButtonClass: 'btn btn-success',
			cancelButtonClass: 'btn btn-danger',
			buttonsStyling: false
		}).then(function(result) {					
			$scope.requestNewPassword();
		}).catch(swal.noop)
(course_exists.teacher_list.indexOf(String(req.user._id)) ==-1)

 new Notification({
    user_id:req.user._id,
    user_name:req.user.name,
    content: "Congratulations, your account is now validated",
    school_id:req.user.school_id,
    isAuto:false,            
  }).save((err)=>{
    if(err) console.log(" You have to log "+err)
  })
  //-----------------------------------------------------------
  //Angular filtering
  	.filter('toTermName', function() {
		return function(input){
			return input=='S'?'Semester':'Term'
		}
	})
	.filter('toClasseName', function() {
		return function(input, term){
			return term=='S'?'Y'+input:'S'+input
		}
	})
	.filter('yearToDate', function() {
		return function(input){
			input =Number(input)+2000;
			return input = input+'/'+Number(Number(input)+1);
		}
	})
	.filter('toTeacher_name', function(){
		return function(input,list_teachers){
			if(input==''||!input)	return 'Not defined';
			for(var i =0;i < list_teachers.length;i++){
				if(list_teachers[i]._id == input) return list_teachers[i].name
			}
		}
	})
	//+++++++++++++++++++++++++++++++++++++++++++++++++++++++++++++