/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('cropController', ['$scope', '$routeParams', 'imageDataService', function ($scope, $routeParams, imageDataService) {

        $scope.activeCropSet = null;
        $scope.selectedImg = null;

        $scope.availableIndexes = [];
        $scope.orientation = Orientation.landscape;
        $scope.cropDefIndex = -1;
        $scope.inPreview = false;
        $scope.imageSet = false;

        var cropManager = new CropManager();
        var cropFormatter = new CropFormatter('#cropFormatter');

        $scope.$on('$viewContentLoaded', function () {
            $scope.selectedDeck = null;
            $scope.dataChanged = false;
            imageDataService.ready().then(
                function isReady(){

                    if (!imageDataService.currentItem) {
                        var imageId = $routeParams.imageId;
                        var item = imageDataService.getBacklogItem(imageId);
                        if (item) imageDataService.selectBacklogItem(item, 'crop');
                        //$scope.setPreviewPath(imageDataService.currentItem);
                    }

                    $scope.currentItem = imageDataService.currentItem;

                    $scope.sets = imageDataService.sets;
                    $scope.selectedSet = imageDataService.currentSet;
                    $scope.decks = imageDataService.currentSet.decks;
                    $scope.selectedDeck = imageDataService.currentDeck;
                    //jCropBox.attr('src', '../media/backlog/path' + imageDataService.path)

                },
                function failed(){}
            );


        });

        $scope.preImageChange = function () {

            cropFormatter.clear();

        };

        var jCropBox = $('#currentImage');

        jCropBox.load(function () {

            if (!imageDataService.currentItem) return;
            cropManager.loadItem(imageDataService.currentItem, jCropBox);
            $scope.activeCropSet = cropManager.activeCropSet;
            $scope.activeCropDef = cropManager.activeCropDef;
            $('#imageName').select();
        });


        $scope.$watch(
            'orientation',
            function (newValue, oldValue) {
                if (newValue == oldValue) return;
                cropManager.setMasterCropOrientation(newValue);
                cropFormatter.clear();
                cropFormatter.setCrop(cropManager.activeCropDef)
            },
            true
        );

        $scope.getImagePath = function () {

            if (!$scope.currentItem) {
                return "placeholder.gif";
            }
            return "../media/backlog/" + $scope.currentItem.path;
        };


        $scope.doNextCropAction = function () {
            if ($scope.cropDefIndex >= 3) return;
            $scope.cropDefIndex++;
            setStateForIndex();
        };

        $scope.doPreviousAction = function () {
            if ($scope.cropDefIndex <= 0) return;
            $scope.cropDefIndex--;
            setStateForIndex();
        };

        function setStateForIndex() {
            cropManager.setStateForIndex($scope.cropDefIndex);
            if (cropManager.activeCropDef) {
                cropFormatter.setCrop(cropManager.activeCropDef);
                $scope.activeCropSet = cropManager.activeCropSet;
                $scope.orientation = $scope.activeCropSet.masterCropDef.orientation;
            }
        }

        $scope.cancelCropAction = function () {
            $scope.inPreview = true;
            $scope.previewCrop();
            cropManager.clearCropActions();
            cropFormatter.clear();
            $scope.cropDefIndex = -1;
            $scope.doNextCropAction();
        };

        $scope.previewCrop = function () {
            if (!$scope.inPreview) {
                cropFormatter.showPreview();
                $scope.inPreview = true;
            } else {
                cropFormatter.hidePreview();
                $scope.inPreview = false;
            }

        }

    }]
);



