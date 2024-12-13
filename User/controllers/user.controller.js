const userModel = require("../models/user.model");
const blacklisttokenModel = require("../models/blacklisttoken.model");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const user = await userModel.findOne({ email }).exec();
    if (user) {
      return res.status(400).send("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new userModel({
      name,
      email,
      password: hashedPassword,
    });
    await newUser.save();
    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    res.cookie("token", token);
    delete newUser._doc.password;
    res.send({ token, newUser });
  } catch (err) {
    console.log(err);
    res.status(500).json({ message: err.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await userModel.findOne({ email }).select("+password").exec();
    if (!user) {
      return res.status(400).send("User not found");
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).send("Incorrect password");
    }
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "1h",
    });
    delete user._doc.password;
    res.cookie("token", token);
    res.send({ token, user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

const logout = async (req, res) => {
  try {
    const token = req.cookies.token;
    await blacklisttokenModel.create({ token });
    res.clearCookie("token");
    res.send({ message: "User logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const profile = async (req, res) => {
  try {
    res.send(req.user);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  register,
  login,
  logout,
  profile,
};
