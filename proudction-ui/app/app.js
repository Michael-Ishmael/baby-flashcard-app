'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('imgProcessor', ['ngRoute','ui.sortable']);

app.config(['$routeProvider',
    function($routeProvider) {
        $routeProvider.
        when('/backlog', {
            templateUrl: 'views/backlogView.html',
            controller: 'backlogController'
        }).
        when('/assign/:imageId', {
            templateUrl: 'views/assignmentView.html',
            controller: 'assignmentController'
        }).
        when('/crop/:imageId', {
            templateUrl: 'views/croppingView.html',
            controller: 'imgProcController'
        }).
        when('/decks', {
            templateUrl: 'views/deckSetupView.html',
            controller: 'deckSetupController'
        }).
        otherwise({
            redirectTo: '/backlog'
        });
    }]);


/*config(['$routeProvider', function($routeProvider) {
  $routeProvider.otherwise({redirectTo: '/view1'});
}]);*/


