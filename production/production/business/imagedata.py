from aetypes import Enum

import simplejson
import os


class Workflow:
    def __init__(self, media_path):
        self.media_path = media_path
        self.backlog_sub_folder = 'backlog'
        self.sounds_sub_folder = 'sounds'
        self.data_file_name = 'data.json'
        self.image_data = ImageData()
        self.backlog = []  # type: List[FileItem]
        self.sounds = []

    def load(self):
        with open(os.path.join(self.media_path, self.data_file_name)) as json_file:
            self.image_data.load_from_json(json_file)
        self.load_files(self.backlog_sub_folder, 'jpg', self.backlog)
        for item in self.backlog:
            match = self.find_in_data(item.name)
            if match is not None:
                item.id = match.id
        sounds = []  # type:Array[FileItem]
        self.load_files(self.sounds_sub_folder, 'mp3', sounds)
        for sound in sounds:
            dir_path = os.path.dirname(sound.full_path)
            sub_folder = os.path.basename(dir_path)
            matching_deck = self.get_matching_deck(sub_folder)
            if matching_deck is not None:
                matching_deck.sounds.append(sound)

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
                    while not dir_name == sub_folder:
                        sub_path = os.path.join(dir_name, sub_path)
                        dir_path = os.path.dirname(dir_path)
                        dir_name = os.path.basename(dir_path)

                    lst.append(FileItem(item_name, sub_path, file_name_path))

    def to_json_dict(self):
        return {
            "backlog": [x.to_json_dict() for x in self.backlog],
            "sounds": [x.to_json_dict() for x in self.sounds],
            "imagedata": self.image_data.to_json_dict()
        }


class FileItem:
    def __init__(self, name, sub_path, full_path):
        self.name = name
        self.sub_path = sub_path
        self.full_path = full_path
        self.id = -1

    def to_json_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "path": self.sub_path,
            "filePath": self.full_path
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
                deck.thumb = dict_deck.get("thumb", "")
                cards = dict_deck.get("cards", [])
                for dict_card in cards:
                    card = FlashCard(current_card_id, dict_card["image"])
                    card.index = dict_card["index"]
                    card.sound = dict_card.get("sound")
                    card.original_image_size = self.load_bounds_from_dict_prop(dict_card, "originalsize")
                    landscape_bounds = self.load_bounds_from_dict_prop(dict_card, "landscapebounds")
                    portrait_bounds = self.load_bounds_from_dict_prop(dict_card, "portraitbounds")

                    crop_set_12 = CropSet(CropFormat.twelve16)
                    crop_set_12.master_crop_def = CropDef(Orientation.landscape)
                    crop_set_12.master_crop_def.crop = landscape_bounds
                    crop_set_12.alt_crop_def = CropDef(Orientation.portrait)
                    crop_set_12.alt_crop_def.crop = portrait_bounds

                    card.crop_sets.append(crop_set_12)

                    crop_set_9 = CropSet(CropFormat.nine16)
                    crop_set_9.master_crop_def = CropDef(Orientation.landscape)
                    crop_set_9.master_crop_def.crop = landscape_bounds
                    crop_set_9.alt_crop_def = CropDef(Orientation.portrait)
                    crop_set_9.alt_crop_def.crop = portrait_bounds

                    card.crop_sets.append(crop_set_9)

                    deck.cards.append(card)
                    current_card_id += 1
                deck_set.decks.append(deck)
            self.deck_sets.append(deck_set)

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
        self.thumb = ""
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

    def to_json_dict(self):
        return {
            "orientation": "landscape" if self.orientation == Orientation.landscape else "portrait",
            "crop": None if self.crop is None else self.crop.__dict__
        }


class CropSet:
    def __init__(self, crop_format):
        self.crop_format = crop_format  # type:CropFormat
        self.master_crop_def = None  # type:CropDef
        self.alt_crop_def = None  # type:CropDef

    def to_json_dict(self):
        return {
            "format": 12 if self.crop_format is CropFormat.twelve16 else 9,
            "masterCropDef": self.master_crop_def.to_json_dict(),
            "altCropDef": self.alt_crop_def.to_json_dict()
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

    def to_json(self):
        return simplejson.dumps(self.__dict__)
