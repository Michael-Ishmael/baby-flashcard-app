///<reference path="../../typings/main.d.ts"/>
///<reference path="../models/ImageDataManager.ts"/>
/**
 * Created by scorpio on 02/02/2016.
 */
var CropFormatter = (function () {
    function CropFormatter(holdingDiv, callback) {
        this.callback = callback;
        this.jImageContainer = $(holdingDiv + ' #imageContainer');
        this.jMaskContainer = $(holdingDiv + ' #maskContainer');
        this.jPreviewContainer = $(holdingDiv + ' #previewContainer');
        this.jImage = $('#currentImage', this.jImageContainer);
        this.jMask = $('#mask', this.jMaskContainer);
        this.jPreview = $('#preview', this.j);
    }
    CropFormatter.prototype.setCrop = function (cropDef, cropSet) {
        this.activeCropDef = cropDef;
        this.activeCropSet = cropSet;
        if (cropDef.orientation == Orientation.landscape) {
            this.displayMasterCrop();
        }
        else {
            this.displayAltCrop();
        }
    };
    CropFormatter.prototype.clear = function () {
        this.removeJCrop();
        this.jMaskContainer.hide();
        // hide mask
    };
    CropFormatter.prototype.showPreview = function () {
        this.jPreview.attr('style', null);
        this.jPreviewContainer.attr('style', null);
        var crop = this.activeCropDef.crop;
        this.jPreviewContainer.css('left', crop.x);
        this.jPreviewContainer.css('top', 10 + crop.y);
        this.jPreviewContainer.css('width', crop.w);
        this.jPreviewContainer.css('height', crop.h);
        this.jPreview.css('marginLeft', -crop.x);
        this.jPreview.css('marginTop', -crop.y);
        this.jPreview.css('width', this.jImage.width());
        this.jPreview.css('height', this.jImage.height());
        this.jPreviewContainer.show();
        this.jImageContainer.hide();
    };
    CropFormatter.prototype.hidePreview = function () {
        this.jPreviewContainer.hide();
        this.jImageContainer.show();
    };
    CropFormatter.prototype.displayMasterCrop = function () {
        this.clear();
        this.initJCrop(this.jImage);
        this.displayCrop(this.activeCropDef.percentages);
    };
    CropFormatter.prototype.displayAltCrop = function () {
        this.removeJCrop();
        this.initJCrop(this.jImage);
<<<<<<< HEAD
        var masterCropDef = this.activeCropSet.landscapeCropDef;
        this.displayMask(masterCropDef.crop);
        this.setCropPosition(this.activeCropDef.crop);
=======
        var masterCropDef = this.activeCropSet.masterCropDef;
        var maskCrop = this.getAdjustedCrop(masterCropDef.percentages);
        this.displayMask(maskCrop);
        this.displayCrop(this.activeCropDef.percentages);
    };
    CropFormatter.prototype.displayCrop = function (cropPercentages) {
        var calcCrop = this.getAdjustedCrop(cropPercentages);
        this.setCropPosition(calcCrop);
    };
    CropFormatter.prototype.getAdjustedCrop = function (cropPercentages) {
        var w = this.jImage.width();
        var h = this.jImage.height();
        var x = w * cropPercentages.x, y = h * cropPercentages.y, w = w * cropPercentages.w, h = h * cropPercentages.h;
        return new BoxDims(x, y, w, h);
>>>>>>> origin/master
    };
    CropFormatter.prototype.displayMask = function (position) {
        this.jMaskContainer.remove();
        this.jMask.attr('style', null);
        this.jMaskContainer.css('left', position.x);
        this.jMaskContainer.css('top', position.y);
        this.jMaskContainer.css('width', position.w);
        this.jMaskContainer.css('height', position.h);
        $('.jcrop-holder').append(this.jMaskContainer);
        this.jMaskContainer.show();
    };
    CropFormatter.prototype.removeJCrop = function () {
        if (this.jCropApi) {
            this.jCropApi.destroy();
        }
        this.jImage.attr('style', null);
        this.jMask.attr('style', null);
    };
    CropFormatter.prototype.initJCrop = function (target) {
        this.jCropApi = $.Jcrop(target[0]);
        var dm = this;
        this.jCropApi.setOptions({
            allowResize: true,
            aspectRatio: dm.activeCropDef.getAspectRatio(dm.activeCropSet.format),
            onSelect: function (c) {
                dm.cropMoved(dm.activeCropDef, c);
            }
        });
    };
    CropFormatter.prototype.setCropPosition = function (crop) {
        this.jCropApi.setSelect(crop.toCoordArray());
        $('.jcrop-holder').css('background-color', 'transparent');
    };
    CropFormatter.prototype.cropMoved = function (activeCropDef, crop) {
        // set crop on active cropdef
        //console.log(crop);
        activeCropDef.crop.setFromBox(crop);
        var pcs = this.cropToPercentages(crop, this.jImage.width(), this.jImage.height());
        activeCropDef.percentages.setFromBox(pcs);
        if (this.callback)
            this.callback();
    };
    CropFormatter.prototype.cropToPercentages = function (crop, w, h) {
        return new BoxDims(crop.x / w, crop.y / h, crop.w / w, crop.h / h);
    };
    return CropFormatter;
}());
//# sourceMappingURL=CropFormatter.js.map