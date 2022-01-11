module.exports = (req, res) => {
  return res.render('index/index', {
    page: 'index/index',
    title: 'Admin Dashboard',
    includes: {
      external: {
        css: ['fontawesome', 'general', 'header', 'inputs', 'logo', 'page', 'partials']
      }
    }
  });
}
