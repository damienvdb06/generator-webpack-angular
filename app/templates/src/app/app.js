var angular = require('angular');
require('angular-route');

require('../style/app.css');

var app = angular.module('app', ['ngRoute']);
require('./screen/first-page/first-page.controller');

app.config(function($routeProvider) {
  $routeProvider.otherwise({
    template: require('./screen/first-page/first-page.html'),
    controller: require('./screen/first-page/first-page.controller'),
    controllerAs: 'firstPage'
  });
});
