(function() {

    'use strict';

    var app = angular
        .module('eshuri_App');
    app.run(function(formlyConfig, $window) {
        formlyConfig.setWrapper({
            name: 'loading',
            templateUrl: 'loading.html'
        });
        // Put types in here.
        formlyConfig.setType({
            name: 'upload',
            extends: 'input',
            wrapper: ['bootstrapLabel', 'bootstrapHasError'],
            link: function(scope, el, attrs) {
                el.on("change", function(changeEvent) {
                    var file = changeEvent.target.files[0];
                    if (file) {
                        console.log('scope.id', scope.id);
                        var fd = new FormData();
                        // use key on backEnd
                        fd.append('uploadFile', file);
                        scope.$emit('fileToUpload', fd);
                        var fileProp = {};
                        for (var properties in file) {
                            if (!angular.isFunction(file[properties])) {
                                fileProp[properties] = file[properties];
                            }
                        }
                        scope.fc.$setViewValue(fileProp);
                    } else {
                        scope.fc.$setViewValue(undefined);
                    }
                });
                el.on("focusout", function(focusoutEvent) {
                    // dont run validation , user still opening pop up file dialog
                    if ($window.document.activeElement.id === scope.id) {
                        // so we set it untouched
                        scope.$apply(function(scope) {
                            scope.fc.$setUntouched();
                        });
                    } else {
                        // element losing focus so we trigger validation
                        scope.fc.$validate();
                    }
                });

            },
            defaultOptions: {
                templateOptions: {
                    type: 'file',
                    required: true
                }
            }
        });
    });
    app.controller('MainController', function MainController($scope, $http, $window, province, Upload) {

        console.log("controller MainController loaded");
        // $scope.schoolCombinations = $window.localStorage.combinations;
        $scope.schoolCombinations = ['me', 'you'];
        $scope.schoolYears = $window.localStorage.years
        localStorage.clear();
        var customOption = []
        for (var i = 1; i <= $scope.schoolYears; i++) {
            customOption.push({
                "name": "Year " + i,
                "value": "year" + i
            })
        }
        if (customOption = []) {
            customOption = [{
                "name": "Year 1",
                "value": "year1"
            }, {
                "name": "Year 2",
                "value": "year2"
            }, {
                "name": "Year 3",
                "value": "year3"
            }, {
                "name": "Year 4",
                "value": "year4"
            }, {
                "name": "Year 5",
                "value": "year5"
            }]

        }
        var customOptionv2 = []
        // var tempFaculties = $scope.schoolCombinations.split(',')
        // for (var j = 0; j < tempFaculties.length; j++){
        //     customOptionv2.push({
        //         "name": tempFaculties[j],
        //         "value": tempFaculties[j]
        //     })
        // }
        // console.log($scope.schoolCombinations)
        // console.log(tempFaculties)
        console.log(customOptionv2)
        var vm = this;

        // funcation assignment
        vm.finishWizard = finishWizard;

        vm.exampleTitle = 'With angular-wizard'; // add this

        // The model object that we reference
        // on the  element in index.html

        $scope.resmsg = "";
        vm.model1 = {};
        vm.model2 = {};
        vm.reg_id = '5';

        vm.exitValidation = function(form) {
            return form && !form.$invalid;
        };

        // An array of our form fields with configuration
        // and options set. We make reference to this in
        // the 'fields' attribute on the  element
        vm.fields = {
            step1: [{
                "key": "title",
                "type": "radio",
                "templateOptions": {
                    "label": "Title",
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": [{
                        "name": "Mr",
                        "value": "Mr"
                    }, {
                        "name": "Mrs",
                        "value": "mrs"
                    }, {
                        "name": "Ms",
                        "value": "ms"
                    }]
                }
            }, {
                key: 'firstname',
                type: 'input',
                templateOptions: {
                    label: 'First Name',
                    placeholder: 'Firstname',
                    required: true
                }
            }, {
                key: 'lastname',
                type: 'input',
                templateOptions: {
                    label: 'Last Name',
                    placeholder: 'Lastname',
                    required: true
                }
            }, {
                "key": "gender",
                "type": "radio",
                "templateOptions": {
                    "label": "Gender",
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": [{
                        "name": "Male",
                        "value": "M"
                    }, {
                        "name": "Female",
                        "value": "F"
                    }]
                }
            }, {
                key: 'email',
                type: 'input',
                templateOptions: {
                    label: 'Email address',
                    type: 'email',
                    placeholder: 'Email address',
                    required: true
                }
            }, {
                key: 'phone',
                type: 'input',
                templateOptions: {
                    label: 'Phone Number',
                    type: 'number',
                    placeholder: 'Phone Number',
                    required: true
                }
            }, {
                "key": "dob",
                "type": "datepicker",
                "templateOptions": {
                    "label": "Date of Birth",
                    "type": "text",
                    "datepickerPopup": "dd-MMMM-yyyy"
                }
            }, {
                "key": "marital_status",
                "type": "radio",
                "templateOptions": {
                    "label": "Marital Status",
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": [{
                        "name": "Single",
                        "value": "S"
                    }, {
                        "name": "Married",
                        "value": "M"
                    }, {
                        "name": "Widow(er)",
                        "value": "W"
                    }, {
                        "name": "Divorced",
                        "value": "D"
                    }, ]
                }
            }],
            step2: [{
                    key: 'guardian1',
                    type: 'input',
                    templateOptions: {
                        label: 'First Guardian Name',
                        required: true
                    }
                }, {
                    key: 'guardian2',
                    type: 'input',
                    templateOptions: {
                        label: 'Second Guardian Names',
                        required: false
                    }
                }, {
                    "key": "province",
                    "type": "select",
                    "templateOptions": {
                        "label": "Province",
                        "options": province.getProvinces("provinces"),
                        "required": true
                    }
                }, {
                    "key": "district",
                    "type": "select",
                    "templateOptions": {
                        "label": "District",
                        "options": province.getProvinces("districts"),
                        "required": true
                    }
                }, {
                    "key": "sector",
                    "type": "input",
                    "templateOptions": {
                        "label": "Sector(Comma Separated)",
                        "options": province.getProvinces("districts"),
                        "required": true,
                        placeholder: 'Sector, Village',
                    }
                }
                /***********TODO************/
                /* ¬ Order districts due to*/
                /* selected province       */
                /***************************/
            ],
            step3: [{
                "key": "program",
                "type": "radio",
                "templateOptions": {
                    "label": "Choose program",
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": [{
                        "name": "Day",
                        "value": "day"
                    }, {
                        "name": "Evening",
                        "value": "evening"
                    }, {
                        "name": "weekend",
                        "value": "weekends"
                    }]
                }
            }, {
                "key": "year_o_s",
                "type": "radio",
                "templateOptions": {
                    "label": "Year of Studies",
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": customOption
                }
            }, {
                key: 'programs',
                type: 'radio',
                templateOptions: {
                    "label": 'Programs to attend',
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": customOptionv2
                }
            }, {
                key: 'previous_school',
                type: 'input',
                templateOptions: {
                    label: 'Previous School',
                    type: 'text',
                    required: true
                }
            },{
                key: 'previous_combination',
                type: 'input',
                templateOptions: {
                    label: 'Previous option of study',
                    type: 'text',
                    required: true
                }
            }, {
                key: 'grade',
                type: 'input',
                templateOptions: {
                    label: 'Grades',
                    type: 'text',
                    required: true
                }
            }, {
                "key": "finance",
                "type": "radio",
                "templateOptions": {
                    "label": "Financial Category",
                    "valueProp": "value",
                    "keyProp": "name",
                    "required": true,
                    "options": [{
                        "name": "Self Sponsorship",
                        "value": "self"
                    }, {
                        "name": "FARG sponsorship",
                        "value": "farg"
                    }, {
                        "name": "Others",
                        "value": "others"
                    }]
                }
            }],
            step4: [{
                key: 'reg_files',
                type: 'upload',
                ngModelAttrs: {
                    upselect: {
                        bound: 'ngf-select',
                        attribute: 'ngf-select'
                    },
                    upmodel: {
                        bound: 'ng-model',
                        attribute: 'ng-model'
                    },
                    upmaxsize: {
                        bound: 'ngf-max-size',
                        attribute: 'ngf-max-size'
                    }
                },
                templateOptions: {
                    label: 'Attach Identification Document, National ID or Passport',
                    upmodel: "up.file",
                    upmaxsize: "20MB",
                    upselect: ""
                }
            }, {
                key: 'reg_files_1',
                type: 'upload',
                ngModelAttrs: {
                    upselect: {
                        bound: 'ngf-select',
                        attribute: 'ngf-select'
                    },
                    upmodel: {
                        bound: 'ng-model',
                        attribute: 'ng-model'
                    },
                    upmaxsize: {
                        bound: 'ngf-max-size',
                        attribute: 'ngf-max-size'
                    }
                },
                templateOptions: {
                    label: 'Attach Your latest certificate/diploma/diplome',
                    upmodel: "up.file",
                    upmaxsize: "20MB",
                    upselect: ""
                }
            }, {
                key: 'reg_files_2',
                type: 'upload',
                ngModelAttrs: {
                    upselect: {
                        bound: 'ngf-select',
                        attribute: 'ngf-select'
                    },
                    upmodel: {
                        bound: 'ng-model',
                        attribute: 'ng-model'
                    },
                    upmaxsize: {
                        bound: 'ngf-max-size',
                        attribute: 'ngf-max-size'
                    }
                },
                templateOptions: {
                    label: 'Attach Transcript 1',
                    upmodel: "up.file",
                    upmaxsize: "20MB",
                    upselect: "",
                    required: false
                }
            }, {
                key: 'reg_files_3',
                type: 'upload',
                ngModelAttrs: {
                    upselect: {
                        bound: 'ngf-select',
                        attribute: 'ngf-select'
                    },
                    upmodel: {
                        bound: 'ng-model',
                        attribute: 'ng-model'
                    },
                    upmaxsize: {
                        bound: 'ngf-max-size',
                        attribute: 'ngf-max-size'
                    }
                },
                templateOptions: {
                    label: 'Attach transcript 2',
                    upmodel: "up.file",
                    upmaxsize: "20MB",
                    upselect: "",
                    required: false
                }
            }, {
                key: 'reg_files_4',
                type: 'upload',
                ngModelAttrs: {
                    upselect: {
                        bound: 'ngf-select',
                        attribute: 'ngf-select'
                    },
                    upmodel: {
                        bound: 'ng-model',
                        attribute: 'ng-model'
                    },
                    upmaxsize: {
                        bound: 'ngf-max-size',
                        attribute: 'ngf-max-size'
                    }
                },
                templateOptions: {
                    label: 'Attach Transcript 3',
                    upmodel: "up.file",
                    upmaxsize: "20MB",
                    upselect: "",
                    required: false
                }
            }],
        };

        vm.originalFields = angular.copy(vm.fields);

        function finishWizard() {
            var all_reg_data = JSON.stringify(vm.model)
            console.log(all_reg_data)
            return $http
                .post("/new_application",
                    all_reg_data)
                .then(function(response) {
                    $scope.resmsg = response.data._id;
                })
                .catch(function(erreur) {
                    if (erreur.data.status == "exist") {
                        var r = confirm(erreur.data.message);
                        if (r == true) {
                            return $http
                                .post("/application/existing",
                                    all_reg_data)
                        }
                    } else {
                        Notifier.danger(erreur.data);
                    }
                });
        }
    });
})();