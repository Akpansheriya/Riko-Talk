const jwt = require("jsonwebtoken");

module.exports = (allowedRoles) => {
  return (req, res, next) => {
    try {
      const token = req.headers.authorization.split(" ")[1];
      const decoded = jwt.verify(token, "hello$%#@!ADMIN___++");
      // console.log("decoded",decoded);

      if (allowedRoles.includes(decoded.role)) {
        next();
      } else {
        return res.status(403).json({
          message: "you do not have an Authority",
        });
      }
    } catch (error) {
      return res.status(401).json({
        message: "Auth failed",
      });
    }
  };
};
