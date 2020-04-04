const { clearHash } = require("../services/cache");

module.exports = async (req, res, next) => {
  //ensure that next function is called after the route handler
  await next();

  clearHash(req.user.id);
};
