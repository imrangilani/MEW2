/**
 * @file sizeCharts.js
 *
 * V4 sizeCharts parser - takes JSON response from upstream data source (WSSG),
 * and parses it into a format expected by the mobile client.
 */

'use strict';

var _   = require('lodash');

function formatNumberFraction ( str ){
  var value = {},
      fractionRegex = /^(\d+)\s+(\d+)\/(\d+)$/,
      floatRegex = /^(\d+)\.(\d+)$/,
      fraction,
      tokens;
  //If the string looks like a fraction
  if (fractionRegex.test(str)){
    tokens = str.match(fractionRegex);
    value.w = tokens[1];
    value.num = tokens[2];
    value.denom = tokens[3];
  } else {
    //Now check if it's a number that's float with more then
    //2 digits after the dot
    if (floatRegex.test(str)){
      if (str.split('.')[1].length > 2){
        var number = parseFloat(str);
        str = number.toFixed(2);
      }
    }
    //Otherwise just pass the string
    value.w = str;
  }


  return value;
}


function formatValueString (str){
  var value = {};
  if (str.indexOf('-') !== -1 ){
    var range = str.split('-');
    value.min = formatNumberFraction (range[0]);
    value.max = formatNumberFraction (range[1]);
  } else {
    value = formatNumberFraction( str);
  }

  return value;
}

function getMeasurementSystem (unit){
  return (unit === 'CM' || unit === 'KG' ) ? 'Metric' : 'English';
}

function getChartGroupProperty ( set, description, property){
  var value;

  if (set.length){
    var found = _.find (set, {'description': description});
    if (found){
      value = found[property];
    }

  }

  return value;
}

var parser = {
  /**
   * Internal function used to take an upstream response and manipulate it
   * before sending it back to the client.
   *
   * @param request {Object} the node request object
   * @param payload {Object} the JSON response from the upstream
   *
   * @return - the response data expected by the client
   */
  _parse: function (request, payload) {
    return parser.prepareCharts( payload);
  },

  prepareCharts: function (payload){
    var content = {};

    if (!payload.canvases || !payload.canvases.canvas){
      return {charts:{}};
    }

    var canvas = payload.canvases.canvas[0],
        nestedContent = canvas.rows[0].zones[0]['nested-Content'];
    if (canvas){
      var groupChart = _.filter( canvas.rows[0].zones[0].contents, {contentGroupType: 'SIZE_CHART'});
      
      if (groupChart.length ){
        content.brand = getChartGroupProperty (groupChart, 'brandName', 'text');
        content.categoryName = getChartGroupProperty (groupChart, 'categoryName', 'text');
        content.footer = getChartGroupProperty (groupChart, 'disclaimer', 'text');
        content.layout = _.first(_.pluck(_.filter(canvas.rows[0].attributes, {name: 'SIZE_CHART_LAYOUT'}), 'value'));
        
        var chartsTab = _.filter( groupChart, {contentType: 'SIZE_CHART_TAB'});
        content.categories = [];
        _.each( chartsTab, function( chartTab){

          var category = {};
          category.title = chartTab.text;
          //List of countries to populate the list of countries
          category.countries = [];
          category.systems = [];
          category.chart = {row: []};
          category.chart.header = {sizes: [], measurements: []};

          parser.prepareNestedLinks( category, nestedContent, chartTab.contentlinks);

          if( chartTab['size-chart-data']){
            var columns = chartTab['size-chart-data'].sizeChartColumns;
            _.each( columns, function( column){
            //Get headers 
              //if Size columns
              if (column.unitOfMeasure.toLowerCase() === 'none'){
               //Check if this header is already there (defined by name) and we need to do colspan
                parser.prepareSizeHeader (category.chart.header, column);
                //Add country to the list countries to display
                parser.storeCountry( category, column);

              } else { //Unit of measure is not empty - means measurement
                parser.prepareMeasurementHeader(category.chart.header, column);
              }

              _.each (column.sizeChartRows, function( cellData, index){

                if (!category.chart.row[index]){
                  category.chart.row[index] = {sizes: [], measurements: []};
                }

                var locale = column.locale;
                //If this is size column
                if (column.unitOfMeasure.toLowerCase() === 'none'){
                  //We need to save it with locale
                  //If this locale already there - add size value to array of values for this locale
                  parser.prepareSizeValue(category.chart.row[index], cellData, locale);
                } else {
                  //First check if this is new unit of measure and save it if it is
                  //in the array on a content level
                  parser.prepareMeasurementSystem(category, column);
                  //Now save the measurement value, splitting fractions if needed
                  
                  parser.prepareMeasurementValue(category.chart.row[index], cellData, column );
                }
              });
            });
          }

          if (!category.chart.row.length){
            delete category.chart;
          }

          content.categories.push( category);
        });
      }

    }

    var cleanContent = _.forEach(content, function( val, key){
      if (_.isEmpty(content[key])){
        delete content[key];
      }
    });

    return {charts: cleanContent};
  },

  getNestedContent: function (nestedEntries, links, attribute){
    var value =[];

    _.each (links, function(link){
      var valueId = link.value;
      _.each(nestedEntries.entry, function(entry){
        if( entry.key === valueId){
          var found = _.filter( entry.value.contents, {description: attribute});
          if( found.length){
            value.push (found[0].text);
            return;
          }
        }
      });

    });

    return value;
  },

  prepareNestedLinks: function (category, nestedContent, contentlinks){
    var linkNames = ['sizeChartTitle', 'InternationalCustomer', 'learnMore', 'mobileText', 'howToMeasure', 'stepTitle'];

    _.each (linkNames, function(linkName){
      var data = parser.getNestedContent(nestedContent, contentlinks, linkName);
      if( data.length){
        category[linkName] = data;
      }
    });
  },

  prepareSizeHeader: function (chartHeader, column){
    var storedHeader = _.find( chartHeader.sizes, {title: column.name, locale: column.locale});
    if (!storedHeader){
      var newHeader = { title: column.name, locale: column.locale};
      chartHeader.sizes.push( newHeader);
    } else {
      if( storedHeader.columns ){
        storedHeader.columns++;
      } else {
        //One already exists, now the total is 2
        storedHeader.columns = 2;
      }
    }
  },

  prepareSizeValue: function (chartRow, cellData, locale){
    var size =  _.find( chartRow.sizes, {'locale': locale });
    if (size ){
      size.value.push(formatValueString(cellData));
    } else {
      chartRow.sizes.push({ 'locale': locale, value: [formatValueString(cellData)]});
    }
  },

  prepareMeasurementHeader: function (chartHeader, column){
    chartHeader.measurements.push({name: column.name, system: getMeasurementSystem( column.unitOfMeasure), unit: column.unitOfMeasure});
  },

  prepareMeasurementValue: function (chartRow, cellData, column ){
    //Find this column and save the value under appropriate unit of measurement
    var columnUnit = column.unitOfMeasure;
 
    var measurement = {col: column.name, data: formatValueString(cellData), system: getMeasurementSystem(columnUnit)};
    chartRow.measurements.push(measurement);

  },

  prepareMeasurementUnits: function (content, column){
    var columnUnit = column.unitOfMeasure;
    if (!_.find( content.units, {'unit':columnUnit })){
      var unit = { unit: columnUnit};
      unit.system = getMeasurementSystem(columnUnit);
      content.units.push( unit);
    }
  },

  //Accumulate all possible measurements grouped by
  //system of measure
  prepareMeasurementSystem: function (content, column){
    var system,
        columnUnit = column.unitOfMeasure;

    var system = getMeasurementSystem(columnUnit);

    var storedSystem = _.find( content.systems, {'system': system });
    if (!storedSystem){
      storedSystem = { system: system, units:[columnUnit]};
      content.systems.push(storedSystem);
    } else {
      if( _.indexOf( storedSystem.units, columnUnit) === -1){
        storedSystem.units.push(columnUnit);
      }
    }
  },

  storeCountry: function (content, column){
    var locale = column.locale;
    if (_.indexOf( content.countries, locale) === -1){
      content.countries.push( locale);
    }
  }
};

module.exports = parser;


