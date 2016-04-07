///<reference path="../../typings/main.d.ts"/>
///<reference path="../models/ImageDataManager.ts"/>
/**
 * Created by scorpio on 02/02/2016.
 */

interface ICropFormatter{

    setCrop(cropDef:CropDef, cropSet:CropSet)

}

interface IJCropApi{
    setOptions(options:any);
    destroy();
    setSelect(c:Array<number>);
}

interface JQueryStatic{
    Jcrop(jquery:HTMLElement);
}

class CropFormatter implements ICropFormatter{

    private activeCropDef:CropDef;
    private activeCropSet:CropSet;
    private jImageContainer:JQuery;
    private jMaskContainer:JQuery;
    private jPreviewContainer:JQuery;
    private jImage:JQuery;
    private jMask:JQuery;
    private jPreview:JQuery;
    private jCropApi:IJCropApi;
    private callback:any;

    constructor(holdingDiv:string, callback:any){
        this.callback = callback;
        this.jImageContainer = $(holdingDiv + ' #imageContainer');
        this.jMaskContainer = $(holdingDiv + ' #maskContainer');
        this.jPreviewContainer = $(holdingDiv + ' #previewContainer');
        this.jImage = $('#currentImage', this.jImageContainer);
        this.jMask = $('#mask', this.jMaskContainer);
        this.jPreview = $('#preview', this.j);
    }

    public setCrop(cropDef:CropDef, cropSet:CropSet) {
        this.activeCropDef = cropDef;
        this.activeCropSet = cropSet;
        if(cropDef.orientation == Orientation.landscape){
            this.displayMasterCrop();
        } else {
            this.displayAltCrop();
        }
    }

    public clear(){
        this.removeJCrop();
        this.jMaskContainer.hide();
        // hide mask
    }

    public showPreview(){
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
    }

    public hidePreview(){
        this.jPreviewContainer.hide();
        this.jImageContainer.show();
    }

    private displayMasterCrop(){
        this.clear();
        this.initJCrop(this.jImage);
        this.setCropPosition(this.activeCropDef.crop);
    }

    private displayAltCrop(){
        this.removeJCrop();
        this.initJCrop(this.jImage);
        var masterCropDef = this.activeCropSet.landscapeCropDef;
        this.displayMask(masterCropDef.crop);
        this.setCropPosition(this.activeCropDef.crop);
    }

    private displayMask(position:BoxDims){
        this.jMaskContainer.remove();
        this.jMask.attr('style', null);
        this.jMaskContainer.css('left', position.x);
        this.jMaskContainer.css('top', position.y);
        this.jMaskContainer.css('width', position.w);
        this.jMaskContainer.css('height', position.h);
        $('.jcrop-holder').append(this.jMaskContainer);
        this.jMaskContainer.show();
    }

    private removeJCrop(){
        if(this.jCropApi){
            this.jCropApi.destroy();
        }
        this.jImage.attr('style', null);
        this.jMask.attr('style', null);
    }

    private initJCrop(target:JQuery){

        this.jCropApi = $.Jcrop(target[0]);
        var dm = this;
        this.jCropApi.setOptions(
            {
                allowResize: true,
                aspectRatio: dm.activeCropDef.getAspectRatio(dm.activeCropSet.format),
                onSelect: function(c){
                    dm.cropMoved(dm.activeCropDef, c);
                }

            }
        );
    }

    private setCropPosition(crop:BoxDims){

        this.jCropApi.setSelect(crop.toCoordArray());

        $('.jcrop-holder').css('background-color', 'transparent');
    }

    private cropMoved(activeCropDef:CropDef, crop:IBox){
        // set crop on active cropdef
        //console.log(crop);
        activeCropDef.crop.setFromBox(crop);
        if(this.callback) this.callback();
    }

}