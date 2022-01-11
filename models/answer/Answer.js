const async = require('async');
const mongoose = require('mongoose');
const validator = require('validator');

const getWeek = require('../../utils/getWeek');

const LIMIT_FOR_ANSWER_DELETE = 1000;
const MAX_DATABASE_TEXT_FIELD_LENGTH = 1e4;
const MAX_DATABASE_ARRAY_FIELD_LENGTH = 1e3;

const Schema = mongoose.Schema;

const AnswerSchema = new Schema({
  template_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  question_id: {
    type: mongoose.Types.ObjectId,
    required: true
  },
  answer_given_to_question: {
    type: String,
    required: true,
    maxlength: MAX_DATABASE_TEXT_FIELD_LENGTH
  },
  week_answer_is_given_in_unix_time: {
    type: Number,
    required: true
  },
  week_answer_will_be_outdated_in_unix_time: {
    type: Number,
    required: true
  },
  person_id_list: {
    type: Array,
    default: [],
    maxlength: MAX_DATABASE_ARRAY_FIELD_LENGTH
  },
  person_id_list_length: {
    type: Number,
    default: 0
  }
});

AnswerSchema.statics.findAnswerById = function (id, callback) {
  const Answer = this;

  if (!id || !validator.isMongoId(id.toString()))
    return callback('bad_request');

  Answer.findById(mongoose.Types.ObjectId(id.toString()), (err, answer) => {
    if (err) return callback('database_error');
    if (!answer) return callback('document_not_found');

    return callback(null, answer);
  });
};

AnswerSchema.statics.deleteOutdatedAnswers = function (callback) {
  const Answer = this;

  getWeek(0, (err, curr_week) => {
    if (err) return callback(err);

    Answer
      .find({
        week_answer_will_be_outdated_in_unix_time: { $lt: curr_week }
      })
      .limit(LIMIT_FOR_ANSWER_DELETE)
      .then(answers => {
        async.timesSeries(
          answers.length,
          (time, next) => Answer.findByIdAndDelete(answers[time]._id, err => {
              if (err) return next('database_error');

              return next(null);
          }),
          err => {
            if (err) return callback(err);

            return callback(null);
          }
        )
      })
      .catch(err => callback('database_error'));
  });
};

module.exports = mongoose.model('Answer', AnswerSchema);
