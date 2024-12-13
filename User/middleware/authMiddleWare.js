const jwt = require("jsonwebtoken");
const userModel = require("../models/user.model");
const blacklisttokenModel = require("../models/blacklisttoken.model");

const userAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const isBlacklisted = await blacklisttokenModel
      .findOne({
        token,
      })
      .exec();

    if (isBlacklisted) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);
    const user = await userModel.findById(id).exec();
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    req.user = user;
    next();
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = userAuth;
