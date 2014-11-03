/**
 * V3 cat index parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */
'use strict';

var _ = require('lodash');
var traverse = require('traverse');
// Top-level menu items that can't be retrieved from API
var config = require('../config');
var url = require('url');
var helpers = require('../helpers');

function trueObject(data) {
  return (_.isObject(data) && !_.isArray(data));
}

var parser = {
  normalizeUrls: function(data) {
    return url.parse(data).path.replace('&edge=hybrid', '');
  },

  pass: function callee(obj, preCatPass, postCatPass) {
    for (var i = 0, j = preCatPass.length; i < j; i++) {
      preCatPass[i](obj);
    }

    if (obj.category) {
      var cat = obj.category,
        i = cat.length;

      while (i--) {
        var piece = cat[i];

        if (!helpers.keepCategory(piece)) {
          cat.splice(i, 1);

          continue;
        }

        callee.call(this, piece, preCatPass, postCatPass);
      }

      if (!obj.category.length) {
        delete obj.category;
      }
    }

    if (postCatPass) {
      for (var i = 0, j = postCatPass.length; i < j; i++) {
        postCatPass[i](obj);
      }
    }
  },

  rename: function(obj) {
    if (obj.mobileName) {
      obj.name = obj.mobileName;

      delete obj.mobileName;
    }
  },

  /**
   * Given a nested object with a consistent nesting hierarchy,
   * _.surface will recursively surface a child attribute value up
   * to its parent, pushing it into a newly created array attribute.
   *
   * @param {non-array object} list - list: the nested non-array object to modify and return
   * @param {string} key - key: the object key which defines the nesting structure
   * @param {string} parent - parent: the parent attribute key to create, whose value will be an array
   * @param {a} attribute - attribute: the child attribute key, whose value will be surfaced to the parent
   * @return {non-array object} the updated original nested non-array object, or an empty object
   */

  surface: function(list, key, parent, attribute) {
    if (trueObject(list)) {
      return traverse(list).forEach(function() {
        var curNode = this.node;

        if (trueObject(curNode) && curNode[key]) {
          if (_.isArray(curNode[key])) {
            curNode[parent] = _.pluck(curNode[key], attribute).map(String);
          }
        }
      });
    } else {
      return {};
    }
  },

  /**
   * Given a nested object with a consistent nesting hierarchy,
   * _.inherit will recursively pass a parent attribute value, setting
   * it as a new attribute on its first-level nested children.
   *
   * @param {non-array object} list - list: the nested non-array object to modify and return
   * @param {string} parent - parent: the parent attribute key to get
   * @param {string} attribute - attribute: the child attribute key to set
   * @param {string} def - default: the default parent attribute value to set on top level items
   * @return {non-array object} the updated original nested non-array object, or an empty object
   */

  inherit: function(list, parent, attribute, def) {
    if (trueObject(list)) {
      return traverse(list).forEach(function() {
        var curNode = this.node,
          curPath = this.path;

        if (trueObject(curNode)) {
          if (curPath.length <= 1 && curPath[0] !== undefined) {
            if (def !== undefined) {
              curNode[attribute] = def;
            }
          } else {
            var trav = traverse(list).get(_.chain(_.initial(curPath, 2)).push(parent).value());

            if (trav !== undefined) {
              curNode[attribute] = trav.toString();
            }
          }
        }
      });
    } else {
      return {};
    }
  },

  /**
   * Given a non-array object, clone each nested value into a root-level key (recursively flattening the object).
   *
   * @param {non-array object} list - list:
   * @param {string} key - key: defines nested structure
   * @param {string} attribute - attribute: the pre-existing key to reference when creating items in the result object
   * @return {object} the resulting non-array object
   */

  pancake: function(list, key, attribute) {
    var ret = {};

    if (trueObject(list)) {
      (function callee(list) {
        for (var i in list) {
          if (list.hasOwnProperty(i)) {
            var value = list[i];

            if (value[key]) {
              callee(value[key]);
            }

            ret[value[attribute]] = value;
            delete ret[value.id][key];
          }
        }
      })(list);
    }

    return ret;
  },

  /**
   * Accepts a hash and a non-array object, where the hash lists existing keys and what they should be renamed as in the result object.
   *
   * @param {non-array object} list - list: the object to be transformed and returned
   * @param {non-array object} map - map: key/value pairs for current name/new name
   * @return {non-array object}  the transformed object
   *
   * @TODO: this function can likely be consolidated with /build/requireLibGenerator's  exports.map function
   */

  perform: function(list, map) {
    var ret = {};

    if (trueObject(list)) {
      for (var key in list) {
        if (list.hasOwnProperty(key)) {
          var value = list[key];

          ret[key] = {};

          for (var myKey in map) {
            if (map.hasOwnProperty(myKey)) {
              var myValue = map[myKey];

              if (value[myKey]) {
                var k = value[myKey];

                if (k === true || k !== false) {
                  ret[key][myValue] = k;
                }
              }
            }
          }
        }
      }
    }

    return ret;
  },

  /**
   * Accepts a hash and a non-array object, where the hash lists existing keys and what they should be renamed as in the result object.
   *
   * @param {non-array object} list - list: the object to be transformed and returned
   * @return {non-array object}  the transformed object
   */

  relativize: function(list) {
    if (trueObject(list)){
      for (var i in list) {
        if (list.hasOwnProperty(i)) {
          var cur = list[i];

          if (cur.o){
            cur.o = this.normalizeUrls(cur.o);
          }

          if (cur.u) {
            cur.u = this.normalizeUrls(cur.u);
          }

          if (cur.i) {
            cur.i = this.normalizeUrls(cur.i);
          }
        }
      }

      return list;
    } else {
      return {};
    }
  },

  depth2: function(data) {
    for (var i = 0, j = data.category.length; i < j; i++) {
      if (data.category[i].hasOwnProperty('category')) {
        for (var k = 0, l = data.category[i].category.length; k < l; k++) {
          if (data.category[i].category[k].hasOwnProperty('category')) {
            delete data.category[i].category[k].category;
          }
        }
      }
    }
  },

  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param {Object} request the node request object
   * @param {Object} payload the JSON response from the upstream
   * @param {Object} response the node response object
   * @param {Boolean} configOverride for testing: whether or not to override the configuration that would be used
   *
   * @return - the response data expected by the client
   */
  _parse: function(request, payload, response, configOverride) {
    // re-assign categories to strip API metadata from request
    // the nested element returns an array object,
    // so we objectify it now as client-side prep
    if (configOverride){
      config = require('../mcom_config.js');
    }
    var categoryObject = {};

    this.pass(payload, [this.rename]);

    payload.category.forEach(function(category) {
      categoryObject[category.id] = category;
    });

   // pass parent id to child as 'p' for 'parent'
    categoryObject = this.inherit(categoryObject, 'id', 'p', 'shop');
    // surface child category id's to the parent's children array as 'c'
    categoryObject = this.surface(categoryObject, 'category', 'c', 'id');
    // flatten child categories into the root level
    categoryObject = this.pancake(categoryObject, 'category', 'id');

    _.each(categoryObject, function(category) {
      if (category.clickable &&
        category.clickable === 'no' || category.clickable === 'Browse Hide') {
        delete category.clickable;
        category.remain = true;

        // If a category is "Browse Hide" and also "GoTo", remove "GoTo" functionality completely so that this category is treated as "Browse Hide"
        if (category.categorytype === 'GoTo') {
          category.categorytype = 'Browse';
          delete category.overrideUrl;
          delete category.overridecatid;
        }
      } else if (category.categorytype === 'GoTo') {
        // Replace 'categorypageurl' with 'overrideurl'
        category.categorypageurl = category.overrideUrl;
      }

      if (category.id === 60308 || category.id === 63568 || category.id === 62367 || category.id === 65447 || category.id === 61478) {
        category.name = 'See All Brands';
      }
    });

    var perf = {
      brandflyout: 'b',
      brandIndexURL: 'i',
      passthru: 'e',
      name: 'n',
      categorytype: 't',
      categorypageurl: 'u',
      p: 'p',
      c: 'c',
      overridecatid: 'g',
      overrideUrl: 'o',
      remain: 'r',
      fobCatId: 'f'
    };

    categoryObject = this.perform(categoryObject, perf);

    // shrink absolute urls to relative urls
    this.relativize(categoryObject);

    categoryObject = _.extend(categoryObject, config.menus);

    // Expose category tree to other parts of server
    parser.categoryTree = categoryObject;
    return categoryObject;
  }
};

module.exports = parser;
