const express = require("express");
const passport = require('passport');
const authRoutes = express.Router();
const User = require("../models/User");
const sendConfirmationMail = require('../nodemailer/sendmail');


// Bcrypt to encrypt passwords
const bcrypt = require("bcrypt");
const bcryptSalt = 10;


authRoutes.get("/login", (req, res, next) => {
  res.render("auth/login", { "message": req.flash("error") });
});

authRoutes.post("/login", passport.authenticate("local", {
  successRedirect: "/",
  failureRedirect: "/auth/login",
  failureFlash: true,
  passReqToCallback: true
}));

authRoutes.get("/signup", (req, res, next) => {
  res.render("auth/signup");
});

authRoutes.post("/signup", (req, res, next) => {
  const username = req.body.username;
  const email = req.body.email;
  const password = req.body.password;
  const rol = req.body.role;
  if (username === "" || password === "") {
    res.render("auth/signup", { message: "Indicate username and password" });
    return;
  }

  User.findOne({ username }, "username", (err, user) => {
    if (user !== null) {
      res.render("auth/signup", { message: "The username already exists" });
      return;
    }

    const salt = bcrypt.genSaltSync(bcryptSalt);
    const hashPass = bcrypt.hashSync(password, salt);
    // Hashing the confirmation code
    const hashConfirmationCode = bcrypt.hashSync(username, salt);

    const newUser = new User({
      username,
      email,
      password: hashPass,
      confirmationCode: encodeURIComponent(hashConfirmationCode)
    });

    newUser.save((err) => {
      if (err) {
        res.render("auth/signup", { message: "Something went wrong" });
      } else {
        sendConfirmationMail(newUser)
        res.redirect("/");
      }
    });
  });
});


authRoutes.get("/confirm/:confirmCode", (req,res) => {
  User.findOneAndUpdate({'confirmationCode':encodeURIComponent(req.params.confirmCode)},{'status':'Activated'})
  .then(res.render("auth/thanks"));
})

authRoutes.get("/logout", (req, res) => {
  req.logout();
  res.redirect("/");
});

module.exports = authRoutes;
