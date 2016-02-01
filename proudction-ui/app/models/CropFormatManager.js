/**
 * Created by scorpio on 01/02/2016.
 */
var Orientation;
(function (Orientation) {
    Orientation[Orientation["landscape"] = 0] = "landscape";
    Orientation[Orientation["portrait"] = 1] = "portrait";
})(Orientation || (Orientation = {}));
var CropFormat;
(function (CropFormat) {
    CropFormat[CropFormat["twelve16"] = 0] = "twelve16";
    CropFormat[CropFormat["nine16"] = 1] = "nine16";
})(CropFormat || (CropFormat = {}));
var BoxDims = (function () {
    function BoxDims(x, y, w, h) {
        this.x = x;
        this.y = y;
        this.w = w;
    }
    BoxDims.prototype.toCoordArray = function () {
        return [this.x, this.y, this.w, this.h];
    };
    return BoxDims;
})();
var CropDef = (function () {
    function CropDef() {
    }
    return CropDef;
})();
var CropSet = (function () {
    function CropSet(format) {
        this.format = format;
    }
    return CropSet;
})();
var ImageDataItem = (function () {
    function ImageDataItem(id, path) {
        this.id = id;
        this.path = path;
        this.name = "empty";
    }
    return ImageDataItem;
})();
var BacklogItem = (function () {
    function BacklogItem(id, path) {
        this.id = id;
        this.path = path;
    }
    return BacklogItem;
})();
var DataManager = (function () {
    function DataManager() {
        this.backlog = [];
        this.imageDataItems = [];
        this.currentItem = null;
    }
    DataManager.prototype.loadBacklogItem = function (backlogItem) {
        for (var i = 0; i < this.imageDataItems.length; i++) {
            var item = this.imageDataItems[i];
            if (item.id == backlogItem.id) {
                this.currentItem = item;
                return;
            }
        }
    };
    DataManager.prototype.createNewImageDataItem = function (backlogItem) {
        var item = new ImageDataItem(backlogItem.id, backlogItem.path);
        item.twelve16 = new CropSet(CropFormat.twelve16);
        return item;
    };
    return DataManager;
})();
//# sourceMappingURL=CropFormatManager.js.map