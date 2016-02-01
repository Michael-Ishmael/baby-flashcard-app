/**
 * Created by scorpio on 01/02/2016.
 */

enum Orientation{
    landscape,
    portrait
}

enum CropFormat{
    twelve16,
    nine16
}

class BoxDims  {

    constructor(public x:number, public y:number, public w:number, h:number){

    }

    toCoordArray(){
        return [this.x, this.y, this.w, this.h];
    }

}

class CropDef {
    orientation: Orientation;
    crop: Array<number>;
}

class CropSet{

    public masterCropDef:CropDef;
    public altCropDef:CropDef;

    constructor(public format:CropFormat){

    }
}

class ImageDataItem{

    public name:string = "empty";
    public twelve16:CropSet;
    public nine16:CropSet;

    constructor(public id:number, public path:string){

    }

}

class BacklogItem{

    constructor(public id:number, public path:string){

    }
}

class DataManager{

    public backlog:Array<BacklogItem> = [];
    public imageDataItems:Array<ImageDataItem> = [];

    public currentItem:ImageDataItem = null;

    constructor(){

    }

    loadBacklogItem(backlogItem:BacklogItem){
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if(item.id == backlogItem.id){
                this.currentItem = item;
                return;
            }
        }

    }

    private createNewImageDataItem(backlogItem:BacklogItem ):ImageDataItem{

        var item = new ImageDataItem(backlogItem.id, backlogItem.path);
        item.twelve16 = new CropSet(CropFormat.twelve16);


        return item;

    }


}