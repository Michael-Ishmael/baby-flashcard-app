/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('imgProcController', ['$scope', function ($scope) {

    $scope.selectedImg = null;
    $scope.workingImg = null;

    $scope.backlog = data.backlog;
    $scope.inEdit = 0;
    $scope.coordDisplay = ['empty', 'empty', 'empty', 'empty'];
    $scope.buttonModes = [0, 0, 0, 0];

    var jcrop_api;
    var jCropBox = $('#cropbox');
    var jMask = $('#mask');
    var jCropOn = false;

    jCropBox.load(function(){

        if(!$scope.selectedImg) return;

        var img = new Image();
        img.src = $(this).attr('src');
        var dims = {w: img.width, h:img.height};

        var sdI = $scope.selectedImg[0];
        $scope.workingImg = getNewImageItem(sdI.id, sdI.path, dims);

        initJCrop('#cropbox');

    });

    function initJCrop(elId){
        if(!jCropOn){
            jcrop_api = $.Jcrop(elId);
            jcrop_api.setOptions({
                allowResize: false,
                //onChange: showCoords,
                onSelect: showCoords
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

    function showCoords(c){
        if($scope.inEdit){
            var displayString = "{x: " + c.x + ", y: " + c.y + ", w:" + c.w + ", h:" + c.h + "}";
            $scope.coordDisplay[$scope.inEdit -1] = displayString;
            //$scope.$apply();
        }
    }

    $scope.preImageChange = function(){
        if(jcrop_api){
            jcrop_api.destroy();
        }
        $('#cropbox').attr('style', null);
    };

    $scope.getImagePath = function(){

        if(!$scope.selectedImg){
            return "placeholder.gif";
        }
        var imgPath = "../media/" + $scope.selectedImg[0].path;

        return imgPath;
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

    function setCropState(cropsForFormat, mode){
        var cropState = cropsForFormat.master.crop;
        var altCrop = cropsForFormat.alt.crop;
        switch(mode){
            case 0:

                jcrop_api.setSelect(cropState);
                break;
            case 1:
                removeJCrop();
                jMask.css('left', 15 + cropState[0]);
                jMask.css('top', cropState[1]);
                jMask.css('width', 15 + cropState[2]);
                jMask.css('height', cropState[3]);
                jMask.show();
                initJCrop('#mask');
                jcrop_api.setSelect(altCrop);
                //setTimeout(function() {
                    $('.jcrop-holder').css('position', 'absolute');
                $('.jcrop-holder').css('left', '15px');
                $('.jcrop-holder').css('top', '0');
                $('.jcrop-holder').css('background-color', 'transparent');
                //}, 1000);
                break;
            case 2:
                jMask.hide();
                jcrop_api.destroy();
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

    function getNewImageItem(id, path, dims){

        var master12Bounds = getBoxBounds('landscape', 12);
        var alt12Bounds = getBoxBounds('portrait', 12);
        var master9Bounds = getBoxBounds('landscape', 9);
        var alt9Bounds = getBoxBounds('portrait', 9);

        return {
            id: id,
            original: path,
            originalDims: dims,
            name: 'empty',
            twelve16: {
                master: {
                    orientation: "landscape",
                    crop: master12Bounds
                },
                alt: {
                    orientation: "portrait",
                    crop: alt12Bounds
                }
            },
            nine16: {
                master: {
                    orientation: "landscape",
                    crop: master9Bounds
                },
                alt: {
                    orientation: "portrait",
                    crop: alt9Bounds
                }
            }

        };
    }


    function getBoxBounds(orientation, format){

        var visibleImg = $('#cropbox');
        var visibleDims =  {w:visibleImg.width(), h:visibleImg.height()};
        var prop, w, h;
        if(orientation == 'landscape'){
            prop = format == 12 ? 12 / 16 : 9 / 16;
            w = visibleDims.w;
            h = visibleDims.w * prop;
            if(h > visibleDims.h){
                h = visibleDims.h;
                w = visibleDims.h * (1 / prop)
            }
            return [0, 0, w, h];
        } else if(orientation == 'portrait'){
            prop = format == 12 ? 12 / 16 : 9 / 16;
            w = visibleDims.h * prop;
            h = visibleDims.h;
            if(w > visibleDims.w){
                w = visibleDims.w;
                h = visibleDims.w * (1 / prop);
            }
            return [0, 0, w, h];
        }
    }

    }]
);



var data = {
    backlog: [
        {id: 1, path:"donkey1.jpg"},
        {id: 2, path:"cow3.jpg"},
        {id: 3, path:"crit1.png"},
        {id: 4, path:"crit2.png"}
    ],
    imageItems: [
        {
            id: 1,
            original: 'crit1.png',
            name: 'Cow',
            twelve16: {
                master:{
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alt: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            },
            nine16: {
                master:{
                    orientation: "landscape",
                    crop: [0, 0, 1, 1]
                },
                alt: {
                    orientation: "portrait",
                    crop: [0, 0, 1, 1]
                }
            }

        }
    ]
};
