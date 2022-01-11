module.exports = (req, res) => {
  return res.render('auth/login', {
    page: 'auth/login',
    title: 'Admin Login',
    includes: {
      external: {
        css: ['general', 'inputs', 'logo', 'page', 'partials']
      }
    }
  });
}
