/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('cropController', ['$scope', '$routeParams', '$location', 'imageDataService',
    function ($scope, $routeParams, $location, imageDataService) {


        $scope.selectedImg = null;

        $scope.availableIndexes = [];
        $scope.orientation = Orientation.landscape;
        $scope.cropDefIndex = -1;
        $scope.inPreview = false;
        $scope.imageSet = false;

        var cropManager = new CropManager();
        var cropFormatter = new CropFormatter('#cropFormatter', cropChangedCallback);

        function cropChangedCallback() {
            $scope.dataChanged = true;
        }

        $scope.$on('$viewContentLoaded', function () {
            $scope.selectedDeck = null;
            $scope.dataChanged = false;
            imageDataService.ready().then(
                function isReady() {

                    if (!imageDataService.currentItem) {
                        var imageId = $routeParams.imageId;
                        var item = imageDataService.getBacklogItem(imageId);
                        if (item) imageDataService.selectBacklogItem(item, 'crop');
                        //$scope.setPreviewPath(imageDataService.currentItem);
                    }

                    $scope.currentItem = imageDataService.currentItem;

                    $scope.sets = imageDataService.sets;
                    $scope.selectedSet = imageDataService.currentSet;
                    if(imageDataService.currentSet) $scope.decks = imageDataService.currentSet.decks;
                    $scope.selectedDeck = imageDataService.currentDeck;
                    //jCropBox.attr('src', '../media/backlog/path' + imageDataService.path)

                },
                function failed() {
                }
            );


        });

        $scope.preImageChange = function () {

            cropFormatter.clear();

        };

        var jCropBox = $('#currentImage');
        var pScope = $scope;
        jCropBox.load(function () {

            if (!imageDataService.currentItem) return;
            var cropIndex = $routeParams.cropIndex;
            cropIndex = cropIndex ? Number(cropIndex) : 0;
            cropManager.loadItem(imageDataService.currentItem, jCropBox);
            pScope.activeCropSet = cropManager.activeCropSet;
            pScope.activeCropDef = cropManager.activeCropDef;
            pScope.cropDefIndex = cropIndex;
            setStateForIndex();
            $('#imageName').select();
            pScope.$digest();

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
            showCrop();
        }

        function showCrop() {
            if (cropManager.activeCropDef) {
                cropFormatter.setCrop(cropManager.activeCropDef, cropManager.activeCropSet);
                $scope.activeCropSet = cropManager.activeCropSet;
                $scope.orientation = $scope.activeCropSet.activeDef.orientation;
            }
        }

        $scope.isCompleteable = function () {
            if (!(imageDataService && imageDataService.currentItem)) return false;
            return imageDataService.currentItem.getStatus() >= ItemStatus.cropped;
        };

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
        };

        $scope.saveChanges = function () {
            imageDataService.save();
            $scope.dataChanged = false;
        };

        $scope.discardImage = function () {
            imageDataService.discardImage(imageDataService.currentItem);
            $scope.dataChanged = false;
            imageDataService.save();
            var view = 'backlog';
            $location.path(view); // path not hash
        };

        $scope.markComplete = function () {
            imageDataService.markComplete(imageDataService.currentItem);
            $scope.dataChanged = false;

            //var view = 'backlog';
            //var path = $scope.currentItem ? view + '/' + $scope.currentItem .key : view;
            $location.path('backlog'); // path not hash

        };

    }]
);



