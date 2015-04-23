// load angular
var fs = require('fs');

var html = fs.readFileSync(__dirname + '/test.html', 'utf8');

require('./bower_components/angular/angular')

console.log(html)