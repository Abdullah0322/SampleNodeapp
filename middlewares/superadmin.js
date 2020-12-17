function superadmin(req, res, next) {
    if (req.user.role != "superadmin")
      return res.status(403).send("You are not authorized");
    next();
  }
  module.exports = superadmin;