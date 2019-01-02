const express = require("express");
const jwt = require("jsonwebtoken");
const passwordHash = require("password-hash");
const router = express.Router();

// Auth Model
const Auth = require("../../models/Auth");

// @route POST api/auth/register
// @desc  Register user account
// @access Public
router.post("/register", (req, res) => {
  const newUser = new Auth({
    username: req.body.username,
    password: passwordHash.generate(req.body.password),
    email: req.body.email
  });

  newUser
    .save()
    .then(user => res.json(user))
    .catch(err => res.json({ message: err }));
});

// @route POST api/auth/login
// @desc  Login
// @access Public
router.post("/login", (req, res) => {
  Auth.findOne(
    { username: req.body.username, password: req.body.password },
    (err, user) => {
      if (err) {
        res.json({ message: err, success: false });
      }
      if (user) {
        jwt.sign({ user }, "secretkey", { expiresIn: "1d" }, (err, token) => {
          err
            ? res.json({ message: err })
            : res.json({
                message: "Authenticated",
                token,
                user,
                success: true
              });
        });
      } else {
        res.json({ message: "Invalid Username or Password", success: false });
      }
    }
  );
});

module.exports = router;
