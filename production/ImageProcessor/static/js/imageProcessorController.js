/**
 * Created by michaelishmael on 28/01/2016.
 */
'use strict';

// Declare app level module which depends on views, and components
var app = angular.module('myApp', []);

app.config(function ($interpolateProvider) {
    $interpolateProvider.startSymbol('[[');
    $interpolateProvider.endSymbol(']]');
});

app.controller('imageProcessorController', function ($scope) {

    function getNewItem() {
        var newItem = {
            name: "",
            deck: "",
            actualDimensions: null,
            twelve16: {
                master: {
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alternate: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            },
            nine16: {
                master: {
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alternate: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            }
        };
        return newItem;
    }


    $scope.backLog = [
        'donkey1.jpg',
        'cow3.jpg'

    ];

    $scope.loadedImage = null;

    $scope.workingItem = getNewItem();

    $scope.getImageSrc = function () {
        if ($scope.loadedImage) {
            return 'media/' + $scope.loadedImage;
        }
        return '/static/img/placeholder.gif'
    };

    $scope.setupImageChoice = function () {
        var img = new Image();
        img.src = $scope.getImageSrc();

        $scope.workingItem.actualDimensions = {
            width: img.width,
            height: img.height
        }
    };

    $scope.deck = [
        {
            id: 1,
            name: 'cat',
            images: []
        },
        {
            id: 2,
            name: 'cow',
            images: []
        }, {
            id: 3,
            name: 'donkey',
            images: []
        }
    ];

    $scope.images = [];


});