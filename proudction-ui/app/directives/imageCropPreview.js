/**
 * Created by scorpio on 29/03/2016.
 */
app.directive('imageCropPreview',  function () {

    var controller = ['$scope', 'imageDataService', function($scope, imageDataService){

        var self = {
            ci:null
        };

        imageDataService.ready().then(
            function isReady(){

                self.setup(imageDataService.currentItem);


            },
            function fail(){});
        
        $scope.$watch('currentItem',
            function(nv, ov) {

                if(nv != null && nv == ov) return;

                self.setup(nv);



            }
        );

        self.setup = function(ci){
            if(!ci) return;
            if(ci === self.ci) return;
            self.ci = ci;
            self.jPreview.attr('src', '../media/backlog/' + ci.path);
            var scl = Number($scope.scale);
            var cropToUse, label, landscape;
            switch (Number($scope.cropIndex)){
                case 1:
                    cropToUse = ci.twelve16.landscapeCropDef.percentages;
                    label = 'Landscape, 16 / 12';
                    break;
                case 2:
                    cropToUse = ci.twelve16.portraitCropDef.percentages;
                    landscape = true;
                    break;
                case 3:
                    cropToUse = ci.nine16.landscapeCropDef.percentages;
                    label = 'Landscape, 16 / 9';
                    break;
                case 4:
                    cropToUse = ci.nine16.portraitCropDef.percentages;
                    landscape = true;
                    label = 'Portrait, 16 / 9';
                    break;
                default:
                    cropToUse = null;
            }
            if(cropToUse == null) return;
            $scope.label = label;

            if(landscape){
                scl *= ci.originalDims.w / ci.originalDims.h;
            }
            var scaledImage = self.adjustCropForScale(ci.originalDims, scl);
            var scaledCrop = self.scaleImageDimsToCrop(scaledImage, cropToUse);

            self.renderPreview(scaledImage, scaledCrop);
        };
        
        self.assignElements = function(container, img){
            self.jPreviewContainer = container;
            self.jPreview = img;
        };
        
        self.renderPreview = function (original, crop) {
        
            self.jPreview.attr('style', null);
            self.jPreviewContainer.attr('style', null);

            self.jPreviewContainer.css('left', crop.x);
            self.jPreviewContainer.css('top', crop.y);
            self.jPreviewContainer.css('width', crop.w);
            self.jPreviewContainer.css('height', crop.h);
            self.jPreviewContainer.css('overflow', 'hidden');

            self.jPreview.css('marginLeft', -crop.x);
            self.jPreview.css('marginTop', -crop.y);
            self.jPreview.css('width', original.w);
            self.jPreview.css('height', original.h);

        };

        self.adjustCropForScale = function(crop, scale){
            return  {
                x: crop.x * scale,
                y: crop.y * scale,
                w: crop.w * scale,
                h: crop.h * scale
            };
        };

        self.scaleImageDimsToCrop = function(original, pcs){
            return  {
                x: original.w * pcs.x,
                y: original.h * pcs.y,
                w: original.w * pcs.w,
                h: original.h * pcs.h
            };
        };


        return self;
        
    }];

    return {
        restrict: 'E',
        scope: {
            currentItem: '=',
            cropIndex: '@',
            scale: '@',
            rowStart: '@'
        },
        templateUrl: 'views/imageCropPreview.html',
        controller: controller,
        link: function (scope, element, attrs, ctrlr) {

            var holder = $('.crop-preview-container', element);
            var img = $('.crop-preview-img', element);
            ctrlr.assignElements(holder, img);
            /*
            scope.$watch(
                'src', function (nv, ov) {
                    if(nv && nv != ov){

                    }
                }
            );*/





/*            scope.collectionParams = scope.paramholder[attrs.prop];
            scope.$watch(
                function(){
                    return scope.paramholder[attrs.prop];
                },
                function(newValue, oldValue){
                    scope.collectionParams = scope.paramholder[attrs.prop];
                }
            );
            // $parse(attrs.collectionParams)(scope);
            ctrlr.init();*/
        }
    };
});
