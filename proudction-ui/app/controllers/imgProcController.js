/**
 * Created by michaeli on 28/01/2016.
 */

app.controller('imgProcController', ['$scope', function ($scope) {

    $scope.selectedImg = null;

    $scope.backlog = data.backlog;

    var jcrop_api;

    initJcrop();

    function initJcrop()//{{{
    {



    }

    $('#cropbox').load(function(){

        jcrop_api = $.Jcrop('#cropbox');
        jcrop_api.setOptions({ allowResize: false });

    });

    $scope.preImageChange = function(){
        if(jcrop_api){
            jcrop_api.destroy();
        }
    };

    $scope.getImagePath = function(){

        if(!$scope.selectedImg){
            return "placeholder.gif";
        }
        return "../media/" + $scope.selectedImg[0].path;
    };

    $scope.addCropBox = function(src){

        switch (src)
        {
            case 1: // twelve16
                jcrop_api.setSelect([10, 10, 20, 20]);
                break;
            case 2: // nine16
                jcrop_api.setSelect([10, 10, 40, 40]);
                break;
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
}
