/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('cropController', ['$scope', 'imageDataService', function ($scope, imageDataService) {

        $scope.activeCropSet = null;
        $scope.selectedImg = null;

        $scope.availableIndexes = [];
        $scope.orientation = Orientation.landscape;
        $scope.cropDefIndex = -1;
        $scope.inPreview = false;
        $scope.imageSet = false;
        $scope.doneAssignment = false;

        $scope.existingDeckCards = [
            {id: 1, path:"../media/donkey1.jpg", index: 0},
            {id: 2, path:"../media/cow3.jpg", index: 1},
            {id: 3, path:"../media/chicken1.jpg", index: 2},
            {id: 4, path:"../media/horse1.jpg", index: 3}
        ];

        $scope.$on('$viewContentLoaded', function () {
            $scope.selectedDeck = null;
            $scope.dataChanged = false;
            imageDataService.ready().then(
                function isReady(){

                    if (!imageDataService.currentItem) {
                        var imageId = $routeParams.imageId;
                        var item = imageDataService.getBacklogItem(imageId);
                        if (item) imageDataService.selectBacklogItem(item);
                        //$scope.setPreviewPath(imageDataService.currentItem);
                    }

                    $scope.backlog = imageDataService.backlog;

                    $scope.currentItem = imageDataService.currentItem;

                    $scope.sets = imageDataService.sets;
                    $scope.selectedSet = imageDataService.currentSet;
                    $scope.decks = set.decks;
                    $scope.selectedDeck = imageDataService.currentDeck;
                    if(imageDataService.currentDeck) $scope.selectedDecks.push(imageDataService.currentDeck)

                    if (!imageDataService.currentItem || imageDataService.currentItem.indexInDeck == -1)
                        $scope.selectedIndex = 0;
                    else
                        $scope.selectedIndex = imageDataService.currentItem.indexInDeck;

                    $scope.setPreviewPath(imageDataService.currentItem);

                },
                function failed(){}
            );


        });




        $scope.preImageChange = function () {

            cropFormatter.clear();

        };

        var jCropBox = $('#currentImage');

        jCropBox.load(function () {

            if (!$scope.selectedImg) return;
            $scope.imageSet = true;
            imageCropDataService.loadBacklogItem($scope.selectedImg[0], jCropBox);
            $scope.currentItem = imageCropDataService.currentItem;
            $scope.$digest();
            $('#imageName').select();
        });


        $scope.$watch(
            'selectedDeck',
            function (newValue, oldValue) {
                if (newValue == oldValue || newValue == null || $scope.currentItem == null) return;
                var existingIndexes = imageCropDataService.getExistingIndexesForDeck(newValue);
                if (existingIndexes.length) {
                    existingIndexes.sort();
                    var max = existingIndexes[existingIndexes.length - 1];
                    existingIndexes.push(max + 1);
                    $scope.availableIndexes = existingIndexes;
                } else {
                    $scope.availableIndexes = [0];
                }
            },
            true
        );

        $scope.setDeck = function(selectedIndex){
            if ( $scope.currentItem == null) return;
            $scope.currentItem.deck = new Deck($scope.selectedSet.name, $scope.selectedDeck);
            $scope.currentItem.indexInDeck = selectedIndex;
            $scope.doneAssignment = true;
        }   ;

        $scope.$watch(
            'orientation',
            function (newValue, oldValue) {
                if (newValue == oldValue) return;
                imageCropDataService.setMasterCropOrientation(newValue);
                cropFormatter.clear();
                cropFormatter.setCrop(imageCropDataService.activeCropDef)
            },
            true
        );

        $scope.$watch(
            'currentItem'
            , function (newValue, oldValue) {
                if (newValue == oldValue) return;
                $scope.cropDefIndex = -1;
                $scope.doNextCropAction();


            }
        );


        $scope.getImagePath = function () {

            if (!$scope.selectedImg) {
                return "placeholder.gif";
            }
            var imgPath = "../media/" + $scope.selectedImg[0].path;

            return imgPath;
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
            imageCropDataService.setStateForIndex($scope.cropDefIndex);
            if (imageCropDataService.activeCropDef) {
                cropFormatter.setCrop(imageCropDataService.activeCropDef);
                $scope.activeCropSet = imageCropDataService.activeCropDef.parent;
                $scope.orientation = $scope.activeCropSet.masterCropDef.orientation;
            }
        }

        $scope.cancelCropAction = function () {
            $scope.inPreview = true;
            $scope.previewCrop();
            imageCropDataService.clearCropActions();
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



