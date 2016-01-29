/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('imgProcController', ['$scope', function ($scope) {

    $scope.selectedImg = null;
    $scope.workingImg = null;

    $scope.backlog = data.backlog;

    var jcrop_api;

    initJcrop();

    function initJcrop()//{{{
    {



    }

    $('#cropbox').load(function(){


        var img = new Image();
        img.src = $(this).attr('src');
        var dims = {w: img.width, h:img.height};
        var sdI = $scope.selectedImg;
        $scope.workingImg = getNewImageItem(sdI.id, sdI.path, dims);

        jcrop_api = $.Jcrop('#cropbox');
        jcrop_api.setOptions({ allowResize: false });

    });

    $scope.preImageChange = function(){
        if(jcrop_api){
            jcrop_api.destroy();
        }
        $('#cropbox').attr('style', null);
        //var imageHolder = $("#imageHolder");
        //imageHolder.children.remove();
        //var img = $('<img id="cropbox" />');
        //img.attr('src', $scope.getImagePath());
        //imageHolder.append(img);
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

        switch (src)
        {
            case 1: // twelve16 master
                var o = wi.twelve16.master.crop;
                //var bounds = o == 'landscape' ? wi.twelve16.master. ;
                jcrop_api.setSelect(o);
                break;
            case 2: // nine16
                jcrop_api.setSelect([10, 10, 40, 40]);
                break;
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
        var prop;
        if(orientation == 'landscape'){
            prop = format == 12 ? 12 / 16 : 9 / 16;
            var h = visibleDims.w * prop;
            return [0, 0, visibleDims.w, h];
        } else if(orientation == 'portrait'){
            prop = format == 12 ? 12 / 16 : 9 / 16;
            var w = visibleDims.h * prop;
            return [0, 0, w, visibleDims.h];
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
