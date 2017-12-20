const School = require('../models/School'),
  email_sender = require('./email_sender'),
  log_err = require('./manage/errorLogger');
  
exports.displayProfile = function(req, res, next) {
  School.findOne({
    '_id': req.user.school_id
  }, function(err, school) {
    if (err)
      return handleError(err);
    return res.render('profile/create_profile', {
      title: 'Create Profile',
      access_lvl: req.user.access_level,
      email: req.user.email,
      school_id: req.user.school_id,
      school: school
    });
  })
}

exports.singleSchoolProfile = function(req, res, next) {
  School.findById(req.params.profile_id, function(err, school) {
    if (err) {
      //return handleError(err);
      return res.status(500).redirect("/profile");
    } else {
      console.log(school)
      return res.render('profile/view_profile', {
        title: 'View Profile',
        access_lvl: req.user.access_level,
        user: req.user,
        school: school
      });
    }
  })
}

exports.createProfile = function(req, res, next) {
  School.findOne({
    _id: req.user.school_id
  }, (err, schoolExists) => {
    if (err) return log_err(err, false, req, res);
    else if (!schoolExists) {
      return res.status(400).send("School not found!!");
    } else {
      schoolExists.name = req.body.school_name
      schoolExists.description = req.body.school_desc
      schoolExists.average_school_fees = req.body.school_fees
      schoolExists.additional_information = req.body.school_info
      schoolExists.curriculum = req.body.school_curr
      schoolExists.other_programs = req.body.school_prog
      schoolExists.years = req.body.school_years
      schoolExists.student_requirements = req.body.school_requ
      schoolExists.stories.success_stories = req.body.school_stor
      schoolExists.stories.icons = req.body.school_peop
      schoolExists.contact.website = req.body.school_site
      schoolExists.contact.address = req.body.school_addr
      schoolExists.contact.postal_code = req.body.school_code
      var selectedFaculties = req.body.school_faculties
        //TODO: Add school telephone and email
      var facultyConvertedArray = [];
      for (var i = 0; i < selectedFaculties.length; i++) {
        facultyConvertedArray.push(Object.values(selectedFaculties[i]))
      }
      schoolExists.combinations = facultyConvertedArray

      schoolExists.save((err) => {
        if (err) {
          console.log(err);
          return res.status(500).send("Sorry! Service not available");
        } else {
          return res.end();
        }
      })
    }
  });
}

exports.feesProfile = function(req, res, next) {
  School.findOne({
    _id: req.user.school_id
  }, (err, schoolExists) => {
    if (err) return log_err(err, false, req, res);
    else if (!schoolExists) {
      return res.status(400).send("School not found!!");
    } else {
      return res.render('profile/manage_fees', {
        title: 'Manage Fees',
        access_lvl: req.user.access_level,
        user: req.user,
        school: schoolExists
      });
    }
  });
}

exports.saveSchoolFeesPerPay = function(req, res, next) {
  School.findOne({
    _id: req.user.school_id
  }, (err, schoolForFees) => {
    if (err) {
      console.log(err)
      return log_err(err, false, req, res);
    } else if (!schoolForFees) {
      return res.status(400).send("School not found!!");
    } else {
      schoolForFees.fees = req.body.fees;
      schoolForFees.save((err) => {
        if (err) {
          console.log(err)
          return log_err(err, false, req, res);
        }
      });
      return res.end();
    }
  });
}