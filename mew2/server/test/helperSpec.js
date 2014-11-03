/*jshint expr: true*/
'use strict';
require('should');

var _ = require('lodash'),
assert = require('assert'),
helpers = require('../lib/parsers/helpers'),
productFixtures = require('../test/fixtures/productFixtures');

describe('helpers', function() {

  describe('optionalParameter', function() {

    it('should be empty with no agruments', function() {
      helpers.optionalParameter('&currentpage=', undefined).should.be.empty;
    });

    it('should return the concatenated query string', function() {
      helpers.optionalParameter('&currentpage=', '1').should.equal('&currentpage=1');
    });
  });

  describe('getAttribute', function() {
    var product;
    product = void 0;
    beforeEach(function() {
      product = productFixtures.master.product[0];
    });

    it('should return a single string for attributes with only one value', function() {
      var attr;
      attr = helpers.getAttribute(product.productDetails.attributes, 'USE_TEMPLATE_PDP');
      attr.should.be.a('string');
    });

    it('should return an array of objects for attributes with multiple values', function() {
      var attrs;
      attrs = helpers.getAttribute(product.productDetails.attributes, 'PRODUCT_COLOR');
      attrs.should.be.an.instanceOf(Array);
      return _.each(attrs, function(attr) {
        attr.should.be.a('object');
      });
    });

    it('should return `undefined` for attributes that do not exist', function() {
      var attr;
      attr = helpers.getAttribute(product.productDetails.attributes, 'DOES_NOT_EXIST');
      assert(typeof attr === 'undefined');
    });
  });

  describe('getDomainAttribute', function() {
    var masterWithDomainAttribute, masterWithoutDomainAttribute;
    masterWithDomainAttribute = void 0;
    masterWithoutDomainAttribute = void 0;
    beforeEach(function() {
      masterWithDomainAttribute = productFixtures.bcomMaster.product[0];
      masterWithoutDomainAttribute = productFixtures.master.product[0];
    });

    it('should return an array of strings for domain attributes that have multiple values', function() {
      var customerChoice;
      customerChoice = helpers.getDomainAttribute(masterWithDomainAttribute.productDetails, 'CUSTOMER_CHOICE');
      assert(typeof customerChoice !== 'undefined');
      customerChoice.should.be.an.instanceOf(Array);
      _.each(customerChoice, function(value) {
        value.should.be.a('string');
      });
    });

    it('should return `undefined` for domain attributes that do not exist', function() {
      var customerChoice;
      customerChoice = helpers.getDomainAttribute(masterWithoutDomainAttribute.productDetails, 'CUSTOMER_CHOICE');
      assert(typeof customerChoice === 'undefined');
    });
  });
});

