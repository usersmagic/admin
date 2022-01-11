const Template = require('../../../models/template/Template');

module.exports = (req, res) => {
  Template.createTemplate(req.body, (err, id) => {
    if (err) return res.redirect('/');

    return res.redirect('/templates');
  });
}
