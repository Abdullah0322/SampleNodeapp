const express = require("express");
let router = express.Router();
let { User } = require("../../models/user");
var bcrypt = require("bcryptjs");
const _ = require("lodash");
const jwt = require("jsonwebtoken");

const config = require("config");
const validateUser = require("../../middlewares/validateUser");
const forgetPasswordValidator =require("../../middlewares/forgetPasswordValidator");
const admin = require("../../middlewares/admin");
const superadmin = require("../../middlewares/superadmin");
const auth = require("../../middlewares/auth");
const sgMail = require('@sendgrid/mail')


router.post("/register",async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (user) return res.status(400).send("User with given Email already exist");
  user = new User();
  user.name = req.body.name;
  user.email = req.body.email;
  user.password = req.body.password;
  await user.generateHashedPassword();
  await user.save();
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );
  let datatoRetuen = {
    name: user.name,
    email: user.email,
    token: user.token,
  };
  return res.send(datatoRetuen);
});
router.post("/login", async (req, res) => {
  let user = await User.findOne({ email: req.body.email });
  if (!user) return res.status(400).send("User Not Registered");
  let isValid = await bcrypt.compare(req.body.password, user.password);
  if (!isValid) return res.status(401).send("Invalid Password");
  let token = jwt.sign(
    { _id: user._id, name: user.name, role: user.role },
    config.get("jwtPrivateKey")
  );
  res.send(token);
});

router.get('/',async(req,res)=>{
  let page = Number(req.query.page ? req.query.page : 1);
  let perPage = Number(req.query.perPage ? req.query.perPage : 10);
  let skipRecords = perPage * (page - 1);
  let users = await User.find().skip(skipRecords).limit(perPage);
  let total = await User.countDocuments();
  return res.send({ total, users });
})
router.get("/:id", async (req, res) => {
  try {
    let user = await User.findById(req.params.id);
    if (!user)
      return res.status(400).send("Email Not Registered"); //when id is not present id db
    return res.send(user); //everything is ok
  } catch (err) {
    return res.status(400).send("Invalid ID"); // format of id is not correct
  }
});


router.put("/:id",  async (req, res) => {
  let user= await User.findById(req.params.id);
  user.name = req.body.name;
 
  await user.save();
  return res.send(user);
});
router.delete("/:id",  async (req, res) => {
  let user = await User.findByIdAndDelete(req.params.id);
  return res.send(user);
});






      
module.exports = router;
