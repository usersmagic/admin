module.exports = (req, res, next) => {
  if (!req.session.admin_password || req.session.admin_password != process.env.ADMIN_PASSWORD)
    return res.redirect('/auth/login');

  return next();
}
