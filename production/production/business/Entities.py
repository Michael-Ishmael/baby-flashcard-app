from aetypes import Enum

import simplejson


class DeckSet:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.icon = ""
        self.decks = []  # type:List[Deck]

    def add_deck(self, deck):
        self.decks.append(deck)

    def to_json_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "icon": self.icon,
            "decks": [x.to_json_dict() for x in self.decks]
        }


class Deck:
    def __init__(self, id, name):
        self.id = id
        self.name = name
        self.icon = ""
        self.cards = []  # type: List[FlashCard]
        self.sounds = []  # type: List[FileItem]

    def add_card(self, card):
        self.cards.append(card)

    def to_json_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "thumb": self.icon,
            "cards": [x.to_json_dict() for x in self.cards],
            "sounds": [x.to_json_dict() for x in self.sounds]
        }


class FlashCard:
    def __init__(self, id, image):
        self.id = id
        self.index = 0
        self.image = image
        self.sound = ""
        self.sub_path = ""
        self.full_path = ""
        self.original_image_size = None  # type: Bounds
        self.ref_image_size = None  # type:Bounds
        self.crop_sets = []  # type: [CropSet]
        # self.landscape_bounds = None  # type: Bounds
        # self.portrait_bounds = None  # type: Bounds

    def to_json_dict(self):
        return {
            "id": self.id,
            "index": self.index,
            "image": self.image,
            "sound": self.sound,
            "originalSize": None if self.original_image_size is None else self.original_image_size.__dict__,
            "cropSets": [x.to_json_dict() for x in self.crop_sets],
            # "landscapebounds": None if self.landscape_bounds is None else self.landscape_bounds.__dict__,
            # "portraitbounds": None if self.portrait_bounds is None else self.portrait_bounds.__dict__,
        }


class Orientation(Enum):
    portrait = 1
    landscape = 2


class AspectRatio():
    twelve16 = "twelve16"
    nine16 = "nine16"


class CropDef:
    def __init__(self, orientation):
        self.orientation = orientation
        self.percentageBox = None  # type:Bounds
        self.offset_x = 0
        self.offset_y = 0
        self.percentages = []

    def to_json_dict(self):
        return {
            "orientation": "landscape" if self.orientation == Orientation.landscape else "portrait",
            "crop": None if self.percentageBox is None else self.percentageBox.__dict__
        }


class CropSet:
    def __init__(self, crop_format):
        self.crop_format = crop_format  # type:AspectRatio
        self.landscape_crop_def = None  # type:CropDef
        self.portrait_crop_def = None  # type:CropDef

    def get_combined_rect(self):
        x = min(self.landscape_crop_def.percentageBox.x, self.portrait_crop_def.percentageBox.x)
        y = min(self.landscape_crop_def.percentageBox.x, self.portrait_crop_def.percentageBox.x)
        x2 = max(self.landscape_crop_def.percentageBox.x2(), self.portrait_crop_def.percentageBox.x2())
        y2 = max(self.landscape_crop_def.percentageBox.y2(), self.portrait_crop_def.percentageBox.y2())

        return Bounds(x, y, x2 - x, y2 - y)

    def min_x(self):
        return min(self.landscape_crop_def.percentages[0], self.portrait_crop_def.percentages[0])

    def min_y(self):
        return min(self.landscape_crop_def.percentages[1], self.portrait_crop_def.percentages[1])

    def max_x(self):
        return max(self.landscape_crop_def.percentages[2], self.portrait_crop_def.percentages[2])

    def max_y(self):
        return max(self.landscape_crop_def.percentages[3], self.portrait_crop_def.percentages[3])

    def get_combined_crop_percentages(self):
        x = self.min_x()
        y = self.min_y()
        x2 = self.max_x()
        y2 = self.max_y()

        return [x, y, x2, y2]

    def combined_width(self):
        return self.max_x() - self.min_x()

    def combined_height(self):
        return self.max_y() - self.min_y()

    def can_be_combined_rect(self, long_side, short_side):
        combined_rect = self.get_new_rect_bounds(long_side, short_side)

        return (combined_rect.w * combined_rect.h) < (long_side * short_side * 2)

    def get_new_rect_bounds(self, long_side, short_side):

        pcs = self.landscape_crop_def.percentageBox
        landscape_crop = Bounds(long_side * pcs.x, short_side * pcs.y, long_side * pcs.w, short_side * pcs.h)

        pcs = self.portrait_crop_def.percentageBox
        portrait_crop = Bounds(short_side * pcs.x, long_side * pcs.y, short_side * pcs.w, long_side * pcs.h)

        target_crop = landscape_crop if landscape_crop.w < portrait_crop.h else portrait_crop
        alt_crop = landscape_crop if landscape_crop.w > portrait_crop.h else portrait_crop

        offset_x = max(target_crop.x - alt_crop.x, 0)
        extra_after_x = max(alt_crop.x2() - target_crop.x2(), 0)

        offset_y = max(target_crop.y - alt_crop.y, 0)
        extra_after_y = max(alt_crop.y2() - target_crop.y2(), 0)

        target_orientation = Orientation.landscape if target_crop.w < target_crop.h \
            else Orientation.portrait

        width = 0
        height = 0
        extra_x_ratio = 1
        extra_y_ratio = 1

        extra_x = offset_x + extra_after_x
        extra_y = offset_y + extra_after_y

        if target_orientation == Orientation.landscape:
            width = long_side
            height = short_side
            if extra_x > 0:
                extra_x_ratio = extra_x / target_crop.h
            if extra_y > 0:
                extra_y_ratio = extra_y / target_crop.w
        elif target_orientation == Orientation.portrait:
            width = short_side
            height = long_side
            if extra_x > 0:
                extra_x_ratio = extra_x / target_crop.w
            if extra_y > 0:
                extra_y_ratio = extra_y / target_crop.h

        if extra_x > 0:
            new_extra_x_size = width * extra_x_ratio
            width += new_extra_x_size

        if extra_y > 0:
            new_extra_y_size = height * extra_y_ratio
            height += new_extra_y_size

        return Bounds(0,0,width, height)

    def get_combined_crops(self, long_side, short_side):

        pcs = self.landscape_crop_def.percentageBox
        landscape_crop = Bounds(long_side * pcs.x, short_side * pcs.y, long_side * pcs.w, short_side * pcs.h)

        pcs = self.portrait_crop_def.percentageBox
        portrait_crop = Bounds(short_side * pcs.x, long_side * pcs.y, short_side * pcs.w, long_side * pcs.h)

        if landscape_crop.x <= portrait_crop.x:
            portrait_crop.x = portrait_crop.x - landscape_crop.x
        else:
            landscape_crop.x = landscape_crop.x - portrait_crop.x

        if landscape_crop.y <= portrait_crop.y:
            portrait_crop.y = portrait_crop.y - landscape_crop.y
        else:
            landscape_crop.y = landscape_crop.y - portrait_crop.y

        return [landscape_crop.to_bounds_pcs(long_side, short_side), portrait_crop.to_bounds_pcs(long_side, short_side)]

    def to_json_dict(self):
        return {
            "format": 12 if self.crop_format is AspectRatio.twelve16 else 9,
            "masterCropDef": self.landscape_crop_def.to_json_dict(),
            "altCropDef": self.portrait_crop_def.to_json_dict()
        }


class XCassetItem:
    def __init__(self, file_name, idiom, scale, sub_type):
        self.xcasset_name = None
        self.file_name = file_name
        self.idiom = idiom
        self.scale = scale
        self.sub_type = sub_type

    def to_json_dict(self):
        dict = {
            "filename": self.file_name,
            "idiom": self.idiom,
            "scale": self.scale
        }
        if not self.sub_type is None:
            dict["subtype"] = self.sub_type

        return dict



# class XcassettCreator:
#     data_file_name = 'data2.json'
#     csv_file_name= "cropping.csv"
#     target_root = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/media'
#     original_root = 'originals'  # '/Users/scorpio/Dev/Projects/baby-flashcard-app/media/originals'
#     target_formats = {
#         "twelve16": [
#             TargetFormat("iphone4", "iphone4", CropFormat.twelve16, Bounds(0, 0, 960, 640)),
#             TargetFormat("ipad", "ipad", CropFormat.twelve16, Bounds(0, 0, 1024, 768)),
#             TargetFormat("ipadretina", "ipadretina", CropFormat.twelve16, Bounds(0, 0, 2048, 1536)),
#             TargetFormat("ipadpro", "ipadpro", CropFormat.twelve16, Bounds(0, 0, 2732, 2048)),
#         ],
#         "nine16": [
#             TargetFormat("iphone5", "iphone5", CropFormat.nine16, Bounds(0, 0, 1138, 640)),
#             TargetFormat("iphone6", "iphone6", CropFormat.nine16, Bounds(0, 0, 1334, 750)),
#             TargetFormat("iphone6plus", "iphone6plus", CropFormat.nine16, Bounds(0, 0, 2208, 1242)),
#         ]
#     }


class CsvRecord:
    def __init__(self):
        self.original_path = ""
        self.target_path = ""
        self.crop_start_x_pc = 0
        self.crop_start_y_pc = 0
        self.crop_end_x_pc = 1
        self.crop_end_y_pc = 1
        self.target_width = 0
        self.target_height = 0
        self.file_name = ""

    def to_string(self):
        return "{},{},{},{},{},{},{},{}".format(self.original_path, self.target_path, self.target_width, self.target_height, \
                                                self.crop_start_x_pc, self.crop_start_y_pc, self.crop_end_x_pc, self.crop_end_y_pc)


class Bounds:
    def __init__(self, x, y, w, h):
        self.x = x
        self.y = y
        self.w = w
        self.h = h

    @staticmethod
    def load_from_dict(bounds_dict):
        x = bounds_dict.get("x", 0)
        y = bounds_dict.get("y", 0)
        w = bounds_dict.get("w", 0)
        h = bounds_dict.get("h", 0)

        return Bounds(x, y, w, h)

    def x2(self):
        return self.x + self.w

    def y2(self):
        return self.y + self.h

    def is_outside_x_bounds(self, other):
        if other.x < self.x:
            return True
        if other.x2() > self.x2():
            return True
        return False

    def is_outside_y_bounds(self, other):
        if other.y < self.y:
            return True
        if other.y2() > self.y2():
            return True
        return False

    def get_adjusted(self, offset_x, offset_y):
        return Bounds(self.x + offset_x, self.y + offset_y, self.w, self.h)

    def long_side(self):
        return self.w if self.w >= self.h else self.h

    def short_side(self):
        return self.h if self.h <= self.w else self.w

    def to_bounds_pcs(self, container_width, container_height):
        bounds_pcs = BoundsPcs()
        bounds_pcs.x1 = self.x / container_width
        bounds_pcs.x2 = self.x2() / container_width
        bounds_pcs.y1 = self.y / container_height
        bounds_pcs.y2 = self.y2() / container_height
        return bounds_pcs

    def to_json(self):
        return simplejson.dumps(self.__dict__)


class BoundsPcs:
    def __init__(self):
        self.x1 = 0.0
        self.y2 = 0.0
        self.x2 = 0.0
        self.y2 = 0.0

    def to_json_dict(self):
        return {
            "x1": self.x1,
            "y1": self.y1,
            "x2": self.x2,
            "y2": self.y2
        }


class TargetFormat(object):
    def __init__(self, name, crop_format, bounds, idiom, scale, sub_type):
        self.name = name
        self.crop_format = crop_format
        self.target_bounds = bounds  # type:Bounds
        self.scale = scale
        self.idiom = idiom
        self.sub_type = sub_type