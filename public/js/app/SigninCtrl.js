var app =angular.module('eshuri_App', ['ngRoute']);

app.controller('SigninCtrl', function($scope, $http, $window){
	$scope.signin = function(){
		$scope.nvUser._csrf=$scope.anti_csrf;
		$http
		.post("/user.signin",$scope.nvUser)
		.then(function(response){
			$scope.nvUser =null;
			$window.location.href=response.data;
		})
		.catch(function(erreur){
			$scope.nvUser.password =null;
			$scope.resend_show=true;
			Notifier.danger(erreur.data);
		}); 
	}
	$scope.forgotPassword = function(){
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
	}
	$scope.resendValidationCode = function(){
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
			$http
			.post("/user.resendEmail_link",{
					email_recover: $('#input1').val(),
					_csrf:$scope.anti_csrf
				})
			.then(function(response){
				swal({
					type: 'success',
					html: 'A link has been sent to your email box',
					confirmButtonClass: 'btn btn-success',
					buttonsStyling: false
				})
			})
			.catch(function(erreur){
				Notifier.danger(erreur.data);
			}); 
		}).catch(swal.noop)
	}
	$scope.requestNewPassword = function(){
		$http
		.post("/user.email_recover",{
								email_recover: $('#input1').val(),
								_csrf:$scope.anti_csrf
							})
		.then(function(response){
			swal({
				type: 'success',
				html: 'A link has been sent to your email box',
				confirmButtonClass: 'btn btn-success',
				buttonsStyling: false
			})
		})
		.catch(function(erreur){
			Notifier.danger(erreur.data);
		}); 
	}
	$scope.anti_csrf ="#{csrf_token}";

	setTimeout(function() {
		// after 1000 ms we add the class animated to the login/register card
		$('.card').removeClass('card-hidden');
	}, 700)
});