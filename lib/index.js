'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _pdf2json = require('pdf2json');

var _pdf2json2 = _interopRequireDefault(_pdf2json);

var _ramda = require('ramda');

var _ramda2 = _interopRequireDefault(_ramda);

var _momentTimezone = require('moment-timezone');

var _momentTimezone2 = _interopRequireDefault(_momentTimezone);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _toArray(arr) { return Array.isArray(arr) ? arr : Array.from(arr); }

var JOB_SEPERATOR = ' at ';
var DATE_SEPERATOR = '  -  ';
var DATE_SEPERATOR = ' - ';
var EDUCATION_DESC_SEPERATOR = 'Activities and Societies:';

var getHLines = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.prop('y')), _ramda2.default.flatten, _ramda2.default.prop('HLines'));

var getTexts = _ramda2.default.compose(_ramda2.default.slice(2, Infinity), // Remove 'Page [number]'
_ramda2.default.prop('Texts'));

var getRawTexts = _ramda2.default.compose(_ramda2.default.map(_ramda2.default.evolve({
  T: _ramda2.default.compose(_ramda2.default.trim, decodeURIComponent)
})), _ramda2.default.flatten, _ramda2.default.map(_ramda2.default.prop('R')));

var parseDate = function parseDate(str) {
  var date = new Date(str);
  if (!(0, _momentTimezone2.default)(date).isValid()) return undefined;
  date.setUTCDate(1);
  date.setUTCHours(0, 0, 0, 0);
  return date;
};

// assumes that position lines have already been joined into single lines (i.e.
// that they do no span multiple lines)
var isPosition = function isPosition(str) {
  return str.indexOf(JOB_SEPERATOR) !== -1;
};

// See https://github.com/modesty/pdf2json#text-style-data-without-style-dictionary
var isBold = function isBold(text) {
  return text.TS[2] === 1;
};

var seprarateDate = function seprarateDate(date){
  var date_data = date.split(DATE_SEPERATOR.trim());
  var startDate = new Date(Date.parse(date_data[0]));
  var endDate = date_data[1].includes('Present') ? new Date() : new Date(Date.parse(date_data[1]));
  return { startDate: startDate, endDate: endDate };
}

var getPositions = function getPositions(rawTexts) {

  // join lines that are in bold as job only "title at company" lines are bold
  var texts = [rawTexts[0].T];
  var positions = [];
  var last_index=0;
  var current_index=0;
  for (var i = 0; i < rawTexts.length; i++) {
    var currText = rawTexts[i];
    var current_index = i;
    if (isBold(currText)) {

      if(i > 0) {
        if(current_index > last_index) {
          var desc_text = "";
          for (var b=1; b<(current_index-last_index); b++) {
            desc_key = last_index+b;
            desc_text += rawTexts[desc_key].T;
          }
          var position_data = title.split(JOB_SEPERATOR);
          var data = seprarateDate(date);
          data['title'] = position_data[0];
          data['organization'] = position_data[1];
          data['notes'] = desc_text;
          positions.push(data);
        }
      }
      last_index = i;

      var title = currText.T;

      date = "";
      if(rawTexts[i+1].T.indexOf(DATE_SEPERATOR) > -1 || rawTexts[i+1].T.indexOf(DATE_SEPERATOR2) > -1) {
        var date = rawTexts[i+1].T;
        var last_index = i+1;
      }
    }

    if(i == rawTexts.length-1) {
      var desc_text = "";
      for (var b=1; b<=(current_index-last_index); b++) {
        var desc_key = last_index+b;
        desc_text += rawTexts[desc_key].T;
      }
      var position_data = title.split(JOB_SEPERATOR);
      var data = seprarateDate(date);
      data['title'] = position_data[0];
      data['organization'] = position_data[1];
      data['notes'] = desc_text;
      positions.push(data);
    }
  }
  return positions;
};

var getEducations = function getEducations(rawTexts) {

  // join lines that are in bold as job only "title at company" lines are bold
  var texts = [rawTexts[0].T];
  var positions = [];
  var last_index=0;
  var current_index=0;
  var desc_text = "";
  for (var i = 0; i < rawTexts.length; i++) {
    var currText = rawTexts[i];
    var current_index = i;
    if (isBold(currText)) {
      if(i > 0 && currText.T.indexOf(EDUCATION_DESC_SEPERATOR) > -1) {
        var last_index = i;
      } else {
        if(i > 0){
          if(current_index > last_index) {
            var desc_text = "";
            for (var b=1; b<(current_index-last_index); b++) {
              desc_key = last_index+b;
              desc_text += rawTexts[desc_key].T;
            }
            var data = seprarateDate(date);
            data['SchoolId'] = title;
            data['notes'] = desc_text;
            positions.push(data);
            var last_index = i;
          }
        }
        var title = currText.T;
        date = "";
        if(rawTexts[i+1].T.indexOf(DATE_SEPERATOR) > -1 || rawTexts[i+1].T.indexOf(DATE_SEPERATOR2) > -1) {
          var date = rawTexts[i+1].T;
          var last_index = i+1;
        }
      }

    }

    if(i == rawTexts.length-1) {
      var desc_text = "";
      for (var b=1; b<=(current_index-last_index); b++) {
        var desc_key = last_index+b;
        desc_text += rawTexts[desc_key].T;
      }
      var data = seprarateDate(date);
      data['SchoolId'] = title;
      data['notes'] = desc_text;
      positions.push(data);
    }
  }
  return positions;
};

var parsePages = function parsePages(pages) {
  var hlinesPaged = _ramda2.default.map(getHLines, pages);
  var textsPaged = _ramda2.default.map(getTexts, pages);
  var groups = [];

  // Groups texts according to hlines

  var _loop = function _loop(i) {
    var hlines = hlinesPaged[i];
    var texts = textsPaged[i];

    groups.push(_ramda2.default.groupBy(function (text) {
      return _ramda2.default.findIndex(function (hline) {
        return text.y < hline;
      })(hlines);
    }, texts));
  };

  for (var i = 0; i < pages.length; i++) {
    _loop(i);
  }

  // Combine groups below last hline on a page and above first hline on next page
  for (var _i2 = 1; _i2 < groups.length; _i2++) {
    if (!groups[_i2 - 1]['-1'] || !(groups[_i2]['0'] || groups[_i2]['-1'])) continue;
    if (groups[_i2]['0']) {
      groups[_i2]['0'] = _ramda2.default.concat(groups[_i2 - 1]['-1'], groups[_i2]['0']);
    } else {
      groups[_i2]['-1'] = _ramda2.default.concat(groups[_i2 - 1]['-1'], groups[_i2]['-1']);
    }
    delete groups[_i2 - 1]['-1'];
  }

  // Unnest pages and collect groups into a single array of groups,
  // then get the texts within each group
  groups = _ramda2.default.compose(_ramda2.default.map(getRawTexts), _ramda2.default.unnest, _ramda2.default.map(_ramda2.default.valuesIn))(groups);

  // Get the sections we care about
  var sections = {};
  for (var _i3 = 0; _i3 < groups.length; _i3++) {
    var _groups$_i = _toArray(groups[_i3]),
        head = _groups$_i[0],
        tail = _groups$_i.slice(1);
    switch (head.T) {
      case 'Summary':
        sections.summary = _ramda2.default.map(_ramda2.default.prop('T'), tail).join('\n');
        break;
      case 'Experience':
        sections.experience = getPositions(tail);
        break;
      case 'Education':
        sections.education = getEducations(tail);
        break;
      default:
        break;
    }
  }
  return sections;
};

var parse = function parse(pdfBuffer) {
  return new Promise(function (resolve, reject) {
    var pdfParser = new _pdf2json2.default();
    pdfParser.on('pdfParser_dataReady', function (pdfData) {
      try {
	      var data = parsePages(pdfData.formImage.Pages);
        resolve(data);
      } catch (err) {
        reject(err);
      }
    });
    pdfParser.on('pdfParser_dataError', function (errData) {
      return reject(errData);
    });
    pdfParser.parseBuffer(pdfBuffer);
  });
};

exports.default = parse;
