from aetypes import Enum

import simplejson
import os


class TargetFormat(object):
    def __init__(self, name, path, crop_format, bounds):
        self.name = name
        self.crop_format = crop_format
        self.folder_path = path
        self.target_bounds = bounds  # type:Bounds


class Workflow:
    def __init__(self, media_path):
        self.media_path = media_path
        self.backlog_sub_folder = 'backlog'
        self.sounds_sub_folder = 'sounds'
        self.set_icons_sub_folder = 'setIcons'
        self.deck_icons_sub_folder = 'deckThumbs'
        self.data_file_name = 'data.json'
        self.image_data = ImageData()
        self.backlog = []  # type: List[FileItem]
        self.sounds = []
        self.set_icons = []
        self.deck_icons = []

    def load(self):
        # with open(os.path.join(self.media_path, self.data_file_name)) as json_file:
        #     self.image_data.load_from_json(json_file)
        self.load_files(self.backlog_sub_folder, 'jpg', self.backlog)
        # for item in self.backlog:
        #     match = self.find_in_data(item.name)
        #     if match is not None:
        #         item.id = match.id
        # sounds = []  # type:Array[FileItem]
        self.load_files(self.sounds_sub_folder, 'mp3', self.sounds)
        self.load_files(self.set_icons_sub_folder, 'gif', self.set_icons)
        self.load_files(self.deck_icons_sub_folder, 'png', self.deck_icons)
        # for sound in sounds:
        #     dir_path = os.path.dirname(sound.full_path)
        #     sub_folder = os.path.basename(dir_path)
        #     matching_deck = self.get_matching_deck(sub_folder)
        #     if matching_deck is not None:
        #         matching_deck.sounds.append(sound)

    def get_matching_deck(self, deck_name):  # type:Deck
        for deck_set in self.image_data.deck_sets:
            for deck in deck_set.decks:
                if deck.name == deck_name:
                    return deck
        return None

    def find_in_data(self, image_name):
        for deck_set in self.image_data.deck_sets:
            for deck in deck_set.decks:
                for card in deck.cards:
                    if card.image.lower() == image_name.replace('.jpg', '').lower():
                        return card
        return None

    def load_files(self, sub_folder, ext, lst):
        for dirPath, subFolder, files in os.walk(os.path.join(self.media_path, sub_folder)):
            for item in files:
                if item.endswith("." + ext):
                    file_name_path = os.path.join(dirPath, item)
                    sub_path = item
                    item_name = os.path.basename(item)
                    dir_path = os.path.dirname(file_name_path)
                    dir_name = os.path.basename(dir_path)
                    file_sub = dir_name
                    while not dir_name == sub_folder:
                        sub_path = os.path.join(dir_name, sub_path)
                        dir_path = os.path.dirname(dir_path)
                        dir_name = os.path.basename(dir_path)

                    lst.append(FileItem(item_name, sub_path, file_name_path, file_sub))

    def to_json_dict(self):
        return {
            "backlog": [x.to_json_dict() for x in self.backlog],
            "sounds": [x.to_json_dict() for x in self.sounds],
            "setIcons": [x.to_json_dict() for x in self.set_icons],
            "deckIcons": [x.to_json_dict() for x in self.deck_icons],
            # "imagedata": self.image_data.to_json_dict()
        }


class FileItem:
    def __init__(self, name, sub_path, full_path, sub_folder):
        self.name = name
        self.sub_path = sub_path
        self.full_path = full_path
        self.sub_folder = sub_folder
        self.id = -1

    def to_json_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "path": self.sub_path,
            "filePath": self.full_path,
            "subFolder": self.sub_folder
        }


class ImageData:
    def __init__(self):
        self.deck_sets = []  # type: List[DeckSet]

    def load_from_json(self, json_stream):
        data_dict = simplejson.load(json_stream)
        current_card_id = 1
        for dict_set in data_dict["sets"]:
            deck_set = DeckSet(dict_set["id"], dict_set["name"])
            deck_set.icon = dict_set.get("icon", None)
            decks = dict_set.get("decks", [])
            for dict_deck in decks:
                deck = Deck(dict_deck["id"], dict_deck["name"])
                deck.icon = dict_deck.get("icon", "")
                cards = dict_deck.get("images", [])
                for dict_card in cards:
                    completed = dict_card.get("completed", False)
                    if completed:
                        card = FlashCard(current_card_id, dict_card["name"])
                        card.index = dict_card["indexInDeck"]
                        card.sound = dict_card.get("sound")
                        card.original_image_size = self.load_bounds_from_dict_prop(dict_card, "originalDims")
                        card.ref_image_size = self.load_bounds_from_dict_prop(dict_card, "sizingDims")

                        twelve16 = self.load_crop_set(dict_card, "twelve16", CropFormat.twelve16)
                        nine16 = self.load_crop_set(dict_card, "nine16", CropFormat.nine16)
                        card.crop_sets.append(twelve16)
                        card.crop_sets.append(nine16)

                        deck.cards.append(card)
                        current_card_id += 1
                deck_set.decks.append(deck)
            self.deck_sets.append(deck_set)

    def load_crop_set(self, parent_dict, prop_name, crop_format):
        dict_crop_set = parent_dict.get(prop_name)
        crop_set = CropSet(crop_format)
        crop_set.landscape_crop_def = self.load_crop_def(dict_crop_set, "landscapeCropDef")
        crop_set.portrait_crop_def = self.load_crop_def(dict_crop_set, "portraitCropDef")
        return crop_set

    def load_crop_def(self, parent_dict, prop_name):
        dict_crop_def = parent_dict.get(prop_name)
        l_orientation = dict_crop_def.get("orientation")
        orientation = Orientation.portrait if l_orientation == 1 else Orientation.landscape
        crop_def = CropDef(orientation)
        crop_def.percentages = dict_crop_def.get("cropPercentages", [])
        crop_def.crop = self.load_bounds_from_dict_prop(dict_crop_def, "crop")
        return crop_def

    def load_bounds_from_dict_prop(self, parent_dict, prop_name):
        dict_bounds = parent_dict.get(prop_name, None)
        if dict_bounds is None:
            return None
        return Bounds.load_from_dict(dict_bounds)

    def to_json_dict(self):
        return {
            "sets": [x.to_json_dict() for x in self.deck_sets]
        }


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
            "thumb": self.thumb,
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


class CropFormat(Enum):
    twelve16 = 1
    nine16 = 2


class CropDef:
    def __init__(self, orientation):
        self.orientation = orientation
        self.crop = None  # type:Bounds
        self.offset_x = 0
        self.offset_y = 0
        self.percentages = []

    def to_json_dict(self):
        return {
            "orientation": "landscape" if self.orientation == Orientation.landscape else "portrait",
            "crop": None if self.crop is None else self.crop.__dict__
        }


class CropSet:
    def __init__(self, crop_format):
        self.crop_format = crop_format  # type:CropFormat
        self.landscape_crop_def = None  # type:CropDef
        self.portrait_crop_def = None  # type:CropDef

    def get_combined_rect(self):
        x = min(self.landscape_crop_def.crop.x, self.portrait_crop_def.crop.x)
        y = min(self.landscape_crop_def.crop.x, self.portrait_crop_def.crop.x)
        x2 = max(self.landscape_crop_def.crop.x2(), self.portrait_crop_def.crop.x2())
        y2 = max(self.landscape_crop_def.crop.y2(), self.portrait_crop_def.crop.y2())

        return Bounds(x, y, x2 - x, y2 - y)

    def min_x(self):
        return min(self.landscape_crop_def.percentages[0], self.portrait_crop_def.percentages[0])

    def min_y(self):
        return min(self.landscape_crop_def.percentages[1], self.portrait_crop_def.percentages[1])

    def max_x(self):
        return max(self.landscape_crop_def.percentages[2], self.portrait_crop_def.percentages[2])

    def max_y(self):
        return max(self.landscape_crop_def.percentages[3], self.portrait_crop_def.percentages[3])

    def combined_width(self):
        return self.max_x() - self.min_x()

    def combined_height(self):
        return self.max_y() - self.min_y()

    def get_new_rect_bounds(self, long_side, short_side):

        target_crop = self.landscape_crop_def.crop if self.landscape_crop_def.crop.w < self.portrait_crop_def.crop.h else self.portrait_crop_def.crop;
        alt_crop = self.landscape_crop_def.crop if self.landscape_crop_def.crop.w > self.portrait_crop_def.crop.h else self.portrait_crop_def.crop;

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

    def to_json_dict(self):
        return {
            "format": 12 if self.crop_format is CropFormat.twelve16 else 9,
            "masterCropDef": self.landscape_crop_def.to_json_dict(),
            "altCropDef": self.portrait_crop_def.to_json_dict()
        }


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
