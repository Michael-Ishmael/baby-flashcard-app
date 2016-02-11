import simplejson
import os


class Workflow:

    def __init__(self, media_path):
        self.media_path = media_path
        self.backlog_sub_folder = 'backlog'
        self.sounds_sub_folder = 'sounds'
        self.data_file_name = 'data.json'
        self.image_data = ImageData()
        self.backlog = [] # type: List[FileItem]
        self.sounds = []

    def load(self):
        with open(os.path.join(self.media_path, self.data_file_name)) as json_file:
            self.image_data.load_from_json(json_file)
        self.load_files(self.backlog_sub_folder, 'jpg', self.backlog)
        for item in self.backlog:
            match = self.find_in_data(item.name)
            if match is not None:
                item.id = match.id

        self.load_files(self.sounds_sub_folder, 'mp3', self.sounds)

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
            "backlog" : [ x.__dict__ for x in self.backlog ],
            "sounds" : [ x.__dict__ for x in self.sounds ],
            "imagedata" : self.image_data.to_json_dict()
        }


class FileItem:
    def __init__(self, name, sub_path, full_path):
        self.name = name
        self.sub_path = sub_path
        self.full_path = full_path
        self.id = -1


class ImageData:

    def __init__(self):
        self.deck_sets = [] # type: List[DeckSet]


    def load_from_json(self, json_stream):
        data_dict = simplejson.load(json_stream)
        for dict_set in data_dict["sets"]:
            deck_set = DeckSet(dict_set["id"], dict_set["name"])
            deck_set.icon = dict_set.get("icon", None)
            decks = dict_set.get("decks", [])
            for dict_deck in decks:
                deck = Deck(dict_deck["id"], dict_deck["name"])
                deck.thumb = dict_deck.get("thumb", "")
                cards = dict_deck.get("cards", [])
                for dict_card in cards:
                    card = FlashCard(dict_card["index"], dict_card["image"])
                    card.sound = dict_card.get("sound")
                    card.original_image_size = self.load_bounds_from_dict_prop(dict_card, "originalsize")
                    card.landscape_bounds = self.load_bounds_from_dict_prop(dict_card, "landscapebounds")
                    card.portrait_bounds = self.load_bounds_from_dict_prop(dict_card, "portraitbounds")
                    deck.cards.append(card)
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
    id = -1
    name = ""
    thumb = ""
    cards = []  # type: List[FlashCard]

    def __init__(self, id, name):
        self.id = id
        self.name = name

    def add_card(self, card):
        self.cards.append(card)

    def to_json_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "thumb": self.thumb,
            "cards": [x.to_json_dict() for x in self.cards]
        }


class FlashCard:

    def __init__(self, id, image):
        self.id = id
        self.index = id
        self.image = image
        self.sound = ""
        self.sub_path = ""
        self.full_path = ""
        self.original_image_size = None  # type: Bounds
        self.landscape_bounds = None  # type: Bounds
        self.portrait_bounds = None  # type: Bounds

    def to_json_dict(self):
        return {
            "index": self.index,
            "image": self.image,
            "sound": self.sound,
            "originalsize": None if self.original_image_size is None else self.original_image_size.__dict__,
            "landscapebounds": None if self.landscape_bounds is None else self.landscape_bounds.__dict__,
            "portraitbounds": None if self.portrait_bounds is None else self.portrait_bounds.__dict__,
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
