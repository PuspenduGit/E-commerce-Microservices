const jwt = require("jsonwebtoken");
const axios = require("axios");

const userAuth = async (req, res, next) => {
  try {
    // console.log("req.cookies", req.cookies.token);
    const token = req.cookies.token || req.headers.authorization.split(" ")[1];

    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const { id } = jwt.verify(token, process.env.JWT_SECRET);

    const response = await axios.get(`${process.env.BASE_URL}/user/profile`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    // console.log("response", response);

    const user = response.data;

    // console.log("user", user);

    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    req.user = user;

    next();
  } catch (err) {
    // console.log(err);
    res.status(500).json({ message: err.message });
  }
};

module.exports = userAuth;
