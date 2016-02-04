/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('imgProcController', ['$scope', 'imageCropDataService', function ($scope, imageCropDataServiceI) {

        $scope.currentItem = null;
        $scope.activeCropSet = null;
        $scope.selectedImg = null;
        $scope.backlog = seedData_1.backlog;
        $scope.sets = seedData_1.sets;
        $scope.selectedSet = seedData_1.sets[0];
        $scope.selectedDeck = null;
        $scope.availableIndexes = [];
        $scope.orientation = Orientation.landscape;
        $scope.cropDefIndex = -1;
        $scope.inPreview = false;
        $scope.imageSet = false;

        var imageCropDataService = new ImageDataManager();
        var cropFormatter = new CropFormatter('#cropFormatter');


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



