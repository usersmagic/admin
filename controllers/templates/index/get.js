const Template = require('../../../models/template/Template');

module.exports = (req, res) => {
  Template.findTemplatesByFiltersAndSorted(req.query, (err, templates) => {
    if (err) return res.redirect('/');

    return res.render('templates/index', {
      page: 'templates/index',
      title: 'Templates',
      includes: {
        external: {
          css: ['fontawesome', 'general', 'header', 'inputs', 'page', 'partials']
        }
      },
      templates
    });
  })
}
