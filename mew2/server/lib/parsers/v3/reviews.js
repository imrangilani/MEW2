/**
 * @file reviews.js
 *
 * V3 reviews parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _       = require('lodash');

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request - the node request object
   * @param {Object} payload - the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload) {
    if (request.path.indexOf('feedback') !== -1) {
      return parser.parseFeedback(request, payload);
    }

    return parser.parseList(request, payload);
  }
};

parser.parseFeedback = function(request, payload) {
  var response = {
    reviewId: request.params.reviewId,
    success: payload.success
  };

  return response;
};

parser.parseList = function(request, payload) {
  var response = [];
  var formatted = {};

  _.each(payload.perReviewWrapper, function(review) {
    formatted = {
      id: review.reviewId,
      rating: { avg: review.ratingValue },
      title: review.reviewTitle,
      desc: review.reviewDesc,
      recommended: review.recommended,
      date: review.reviewDate,
      user: {
        name: review.displayName,
        location: review.reviewLocation,
        age: review.ageRangeValue,
        gender: review.genderValue,
        style: (!_.isUndefined(review.styleValue)) ? (review.styleValue) : (undefined),
        fobQuestions: parser.getFobQuestions(review)
      },
      questions: parser.getQuestions(review),
      thumbsUp: review.positiveFeedbacksOnReview || 0,
      thumbsDown: review.negativeFeedbacksOnReview || 0,
      lastModified: review.lastModificationDate
    };

    if (review.shoppingFrequencyValue) {
      formatted.shopAtMacys = {
        q: 'I shop at Macy\'s',
        a: review.shoppingFrequencyValue
      };
    }

    // Remove empty objects from the response
    if (_.isEmpty(formatted.user)) {
      delete formatted.user;
    }

    if (_.isEmpty(formatted.questions)) {
      delete formatted.questions;
    }

    response.push(formatted);
  });

  return response;
};

/**
 * Get array of questions/answers based on business requirements
 */
parser.getQuestions = function(review) {
  var questions = [];

  if (review.fobQuestions) {
    questions = _.map(review.fobQuestions, function(fob) {
      return {
        q: fob.question,
        a: fob.response
      };
    });
  }

  return questions;
};

parser.getFobQuestions = function(review) {
  var questions = [];
  var fobQuestions = review.fobQuestions;

  if (fobQuestions) {
    _.each(fobQuestions, function(fobQuestion) {
      questions.push({
        q: fobQuestion.question,
        a: fobQuestion.response
      });
    });
  }
  return questions;
};

module.exports = parser;
