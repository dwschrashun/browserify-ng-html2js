var fs = require('fs'),
  path = require('path'),
  through = require('through'),
  ngHtml2Js = require('ng-html2js'),
  transformify = require('transformify');

function isExtension(file, extension) {
  return new RegExp('\\.' + extension + '$').test(file);
}

ngHtml2jsify.configure = function (filename, opts) {
  if (typeof opts === 'undefined') { // gulp
    return ngHtml2jsify(filename);
  } else { // CLI
    return ngHtml2jsify(opts)(filename);
  }
};

function ngHtml2jsify(opts) {
  opts = opts || {};
  opts.module = opts.module || null;
  opts.extension = opts.extension || 'html';
  opts.baseDir = opts.baseDir || '';
  opts.prefix = opts.prefix || '';
  opts.requireAngular = opts.requireAngular || false;
  opts.stripPathBefore = opts.stripPathBefore || null;
  opts.rootLocation = opts.rootLocation || process.cwd();

  var fileMatching = new RegExp("^.*\\" + path.sep + "(.*)$");

  return function (file) {
    var stripStartIndex;
    var isWin32 = path.win32.dirname(file) === path.dirname(file);

    if (!isExtension(file, opts.extension)) return through();

    return transformify(end)();

    function end(content) {
      var replacer = path.join(opts.rootLocation, opts.baseDir);
      var fileName = opts.baseDir || opts.stripPathBefore ? rootReplacer() : file.match(fileMatching)[1];
      
      function rootReplacer() {
        var fName = file.replace(replacer, '');
        if (!isWin32) fName = fName.replace(/\\/g, '/');
        return fName;
      }

      if (opts.stripPathBefore) {
        if (opts.stripPathBefore instanceof RegExp) {
          fileName = fileName.replace(opts.stripPathBefore, '');
        } else {
          stripStartIndex = fileName.indexOf(opts.stripPathBefore);

          if (stripStartIndex !== -1) {
            fileName = fileName.substr(stripStartIndex);
          }
        }
      }
      fileName = opts.prefix + fileName;
      content = content.replace(/^\ufeff/g, '');
      var src = ngHtml2Js(fileName, content, opts.module, 'ngModule') + '\nmodule.exports = "' + fileName + '";';
      if (opts.requireAngular) {
        src = 'var angular = require(\'angular\');\n' + src;
      }
      return src;
    }
  };
}

module.exports = ngHtml2jsify.configure;
