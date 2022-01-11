const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const Company = require('../company/Company');
const Product = require('../product/Product');
const Template = require('../template/Template');

const DUPLICATED_UNIQUE_FIELD_ERROR_CODE = 11000;
const MAX_QUESTION_NUMBER_PER_COMPANY = 20;

const Schema = mongoose.Schema;

const QuestionSchema = new Schema({
  signature: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  template_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  company_id: {
    type: mongoose.Types.ObjectId,
    required: true,
    index: true
  },
  product_id: {
    type: mongoose.Types.ObjectId,
    default: null
  },
  order_number: {
    type: Number,
    required: true,
    index: true
  },
  is_active: {
    type: Boolean,
    default: true
  }
});

QuestionSchema.statics.findQuestionById = function (id, callback) {
  const Question = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Question.findById(mongoose.Types.ObjectId(id.toString()), (err, question) => {
    if (err) return callback('database_error');
    if (!question) return callback('document_not_found');

    return callback(null, question);
  });
};

QuestionSchema.statics.createQuestion = function (data, callback) {
  const Question = this;

  Company.findCompanyById(data.company_id, (err, company) => {
    if (err) return callback(err);
    if (company.is_on_waitlist) return callback('not_authenticated_request');

    Template.findTemplateById(data.template_id, (err, template) => {
      if (err) return callback(err);

      Question
        .find({
          company_id: company._id
        })
        .countDocuments()
        .then(order_number => {
          if (order_number >= MAX_QUESTION_NUMBER_PER_COMPANY)
            return callback('too_many_documents');

          if (template.type == 'product') {
            Product.findProductById(data.product_id, (err, product) => {
              if (err) return callback(err);
    
              const newQuestionData = {
                signature: template._id.toString() + company._id.toString() + product._id.toString(),
                template_id: template._id,
                company_id: company._id,
                product_id: product._id,
                order_number
              };

              const newQuestion = new Question(newQuestionData);

              newQuestion.save((err, question) => {
                if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                  return callback('duplicated_unique_field');
                if (err) return callback('database_error');

                return callback(null, question._id.toString());
              });
            });
          } else {
            const newQuestionData = {
              signature: template._id.toString() + company._id.toString(),
              template_id: template._id,
              company_id: company._id,
              order_number
            };

            const newQuestion = new Question(newQuestionData);

            newQuestion.save((err, question) => {
              if (err && err.code == DUPLICATED_UNIQUE_FIELD_ERROR_CODE)
                return callback('duplicated_unique_field');
              if (err) return callback('database_error');

              return callback(null, question._id.toString());
            });
          }
        })
        .catch(err => callback('database_error'));
    });
  });
};

QuestionSchema.statics.createQuestionsForDefaultTemplates = function (company_id, callback) {
  const Question = this;

  Company.findCompanyById(company_id, (err, company) => {
    if (err) return callback(err);

    Template.findTemplatesByFiltersAndSorted({
      language: company.preferred_language,
      is_default_template: true
    }, (err, templates) => {
      if (err) return callback(err);

      async.timesSeries(
        templates.length,
        (time, next) => {
          Question.createQuestion({
            company_id: company._id,
            template_id: templates[time]._id
          }, err => next(err));
        },
        err => {
          if (err) return callback(err);

          return callback(null);
        }
      );
    });
  });
};

module.exports = mongoose.model('Question', QuestionSchema);
