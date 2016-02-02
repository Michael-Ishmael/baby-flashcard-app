/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('imgProcController', ['$scope', 'imageCropDataService', function ($scope, imageCropDataServiceI) {

    $scope.selectedImg = null;
    $scope.workingImg = null;

    $scope.backlog = seedData_1.backlog;
    $scope.inEdit = 0;
    $scope.coordDisplay = ['empty', 'empty', 'empty', 'empty'];
    $scope.buttonModes = [0, 0, 0, 0];

    var jcrop_api;
    var jCropBox = $("#cropbox");
    var jMask = $("#mask");
    var jMaskHolder = $("#maskHolder");
    var jCropOn = false;
    var imageCropDataService = new ImageDataManager();

    $scope.preImageChange = function(){
        if(jcrop_api){
            jcrop_api.destroy();
        }
        $('#cropbox').attr('style', null);
    };

    jCropBox.load(function(){

        if(!$scope.selectedImg) return;

        imageCropDataService.loadBacklogItem($scope.selectedImg, jCropBox);

    });

    function initJCrop(elId){
        if(!jCropOn){
            jcrop_api = $.Jcrop(elId);
            jcrop_api.setOptions({
                allowResize: false,
                //onChange: showCoords,
                onSelect: setCoords
            });
            jCropOn = true;
        }

    }

    function removeJCrop() {
        if(jcrop_api){
            jcrop_api.destroy();
        }
        jCropOn = false;
    }

    function setCoords(c){

        imageCropDataService.setActiveCropCoords(c);
    }



    $scope.getImagePath = function(){

        if(!$scope.selectedImg){
            return "placeholder.gif";
        }
        var imgPath = "../media/" + $scope.selectedImg[0].path;

        return imgPath;
    };


    $scope.doNextCropAction = function(src){
        imageCropDataService.doNextCropAction(src);
    };

    $scope.addCropBox = function(src){



        var wi = $scope.workingImg;
        $scope.inEdit = src;
        var mode = $scope.buttonModes[src - 1];
        switch (src)
        {
            case 1: // twelve16 master
                setCropState(wi.twelve16, mode);
                //jcrop_api.setSelect(wi.twelve16.master.crop);
                break;
            case 2: // twelve16 alt
                jcrop_api.setSelect(wi.twelve16.alt.crop);
                break;
            case 3: // nine16 master
                jcrop_api.setSelect(wi.nine16.master.crop);
                break;
            case 4: // nine16 alt
                jcrop_api.setSelect(wi.nine16.alt.crop);
                break;
        }

        if(mode == 2){
            $scope.buttonModes[src -1] = 0;
        } else {
            $scope.buttonModes[src -1]++;
        }
    };

    function setCropState(cropsFormat, mode){
        var cropState = cropsFormat.master.crop;

        switch(mode){
            case 0:

                jcrop_api.setSelect(cropState);
                break;
            case 1:
                removeJCrop();
                jMaskHolder.css('left', cropState[0]);
                jMaskHolder.css('top', cropState[1]);
                jMaskHolder.css('width',  cropState[2]);
                jMaskHolder.css('height', cropState[3]);
                jMaskHolder.show();

                var altOrientation = getOtherOrientation(cropsFormat.master.orientation);
                cropsFormat.alt.crop = getBoxBounds(altOrientation, cropsFormat.format, {w: cropsFormat[2], h: cropState[3]});
                setTimeout(function() {
                    initJCrop('#mask');
                    jcrop_api.setSelect(cropsFormat.alt.crop);
                    $('.jcrop-holder').css('background-color', 'transparent');
                }, 50);
                break;
            case 2:
                jcrop_api.destroy();
                jMask.hide();

                break;
        }
    }

    $scope.getButtonState = function (idx) {
      switch ($scope.buttonModes[idx - 1] ){
          case 0:
              return {caption: 'Mark Crop', css: 'button-state release'};
          case 1:
              return {caption: 'Set Crop', css: 'button-state mark'};
          case 2:
              return {caption: 'Release Crop', css: 'button-state set'};
      }
    };




    }]
);



