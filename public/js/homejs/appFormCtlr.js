var app =angular.module('eshuri_App', ['ngRoute', 'ngStorage', 'ngFileUpload']);
    app.filter('toTitle', function() {
        return function(input){
          if(isNaN(input)) return input;
          switch(input){
            case '1': input ="Mr";break;case '2': input ="Mrs";
            default: input="Ms";break;
          }
          return input;
        }
      })
      .filter('toGender', function() {
        return function(input){
          if(isNaN(input)) return input;
          switch(input){
            case '1': input ="Male";break;case '2': input ="Femele";
            default: input="Unknown";break;
          }
          return input;
        }
      })
      .filter('toProvince', function() {
        return function(input, list_provinces){
          if(input==''||!input) return 'Not defined';
          for(var i =0;i < list_provinces.length;i++){
            if(list_provinces[i].Province_ID == input) return list_provinces[i].Province_NAME
          }
        }
      })
      .filter('toDistrict', function() {
        return function(input, list_districts){
          if(input==''||!input) return 'Not defined';
          for(var i =0;i < list_districts.length;i++){
            if(list_districts[i].District_ID == input) return list_districts[i].District_NAME
          }
        }
      })
      .filter('toSector', function() {
        return function(input, list_sectors){
          if(input==''||!input) return 'Not defined';
          for(var i =0;i < list_sectors.length;i++){
            if(list_sectors[i].Sector_ID == input) return list_sectors[i].Sector_NAME
          }
        }
      })
      .controller('formCtrl',['$scope', '$http', '$window', '$localStorage', function($scope, $http, $window, $localStorage){
      	var vm = this;
        vm.submit = function(){ //function to call on form submit
            if (vm.upload_form.file.$valid &amp;&amp; vm.file) { //check if from is valid
                vm.upload(vm.file); //call upload function
            }
        }
        vm.upload = function (file) {
            Upload.upload({
                url: 'http://localhost:3000/upload', //webAPI exposed to upload the file
                data:{file:file} //pass file as data, should be user ng-model
            }).then(function (resp) { //upload function returns a promise
                if(resp.data.error_code === 0){ //validate success
                    $window.alert('Success ' + resp.config.data.file.name + 'uploaded. Response: ');
                } else {
                    $window.alert('an error occured');
                }
            }, function (resp) { //catch error
                console.log('Error status: ' + resp.status);
                $window.alert('Error status: ' + resp.status);
            }, function (evt) { 
                console.log(evt);
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                console.log('progress: ' + progressPercentage + '% ' + evt.config.data.file.name);
                vm.progress = 'progress: ' + progressPercentage + '% '; // capture upload progress
            });
        };
        vm.regForm = {};
     	vm.stage = "";
	    vm.formValidation = false;
	    vm.toggleJSONView = false;
	    vm.toggleFormErrorsView = false;
	      
		vm.regForm = {
			ccEmail: '',
			ccEmailList: []
		};
	      
	      // Navigation functions
	      vm.next = function (stage) {
	        //$scope.direction = 1;
	        //$scope.stage = stage;
	        
	        vm.formValidation = true;
	        
	        if (vm.multiStepForm.$valid) {
	          vm.direction = 1;
	          vm.stage = stage;
	          vm.formValidation = false;
	        }
	      };

	      vm.back = function (stage) {
	        vm.direction = 0;
	        vm.stage = stage;
	      };
	      
	      // CC email list functions
	      vm.addCCEmail = function () {
	        vm.rowId++;

	        var email = {
	          email: vm.regForm.ccEmail,
	          row_id: vm.rowId
	        };

	        vm.regForm.ccEmailList.push(email);

	        vm.regForm.ccEmail = '';
	      };

	      vm.removeCCEmail = function (row_id) {
	        for (var i = 0; i < vm.regForm.ccEmailList.length; i++) {
	          if (vm.regForm.ccEmailList[i].row_id === row_id) {
	            vm.regForm.ccEmailList.splice(i, 1);
	            break;
	          }
	        }
	      };
	      
	      
	      // Post to desired exposed web service.
	      vm.submitForm = function () {
	        var wsUrl = "someURL";

	        // Check form validity and submit data using $http
	        if (vm.multiStepForm.$valid) {
	          vm.formValidation = false;

	          $http({
	            method: 'POST',
	            url: wsUrl,
	            data: JSON.stringify(vm.regForm)
	          }).then(function successCallback(response) {
	            if (response
	              && response.data
	              && response.data.status
	              && response.data.status === 'success') {
	              vm.stage = "success";
	            } else {
	              if (response
	                && response.data
	                && response.data.status
	                && response.data.status === 'error') {
	                vm.stage = "error";
	              }
	            }
	          }, function errorCallback(response) {
	            vm.stage = "error";
	            console.log(response);
	          });
	        }
	      };
	      vm.provinces = [];
	      var allData = [];
	      vm.getProvinces = function(){
	        $http.get('locals.json')
	        .then(function(response){
	          allData = response.data;
	          vm.provinces = allData.provinces;
	        })
	      }
	      vm.getDistricts = function(province){
	        vm.districts = [];
	        var allDists = [];
	        allDists = allData.districts
	        for(var i=0;i<allDists.length;i++){
	          if(allDists[i].Province_ID==province){
	            vm.districts.push(allDists[i])
	          }
	        }
	      }
	      vm.getSectors = function(district){
	        vm.sectors = [];
	        var allSectors = allData.sectors;
	        for(var i=0;i<allSectors.length;i++){
	          if(allSectors[i].District_ID==district){
	            vm.sectors.push(allSectors[i])
	          }
	        }
	      }
	      vm.getProvinces();
	      vm.years=[];
	      vm.programs=[];
	      vm.reset = function() {
	        // Clean up scope before destorying
	        vm.regForm = {};
	        vm.stage = "";
	      }
	      vm.loadSchool = function(){
	        if (typeof(Storage) !== "undefined") {
	          if($localStorage.selected_school){
	            var school = $localStorage.selected_school;
	            vm.school = school;
	            var stringCombination = school.combinations.split(',');
	            for(var c=0; c<stringCombination.length;c++){
	              vm.programs.push(stringCombination[c]);
	            }
	            for(var i=1;i<=school.years;i++){
	              vm.years.push(i)
	            }
	            console.log('Programs:'+vm.programs+' Years: '+vm.years+'-----------'+JSON.stringify(school))
	          }
	        }
	      }
	      vm.titles=[1,2];
	      vm.regForm.names="#{user.name}";
	      vm.regForm.email="#{user.email}";
	      vm.regForm.gender="#{user.gender}";
	      vm.regForm.phone="#{user.phone_number}";
	      vm.loadSchool();
      }])