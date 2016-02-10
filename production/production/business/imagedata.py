import simplejson

class Workflow:
    backlog = []



class ImageData:
    sets = []

    def __init__(self):
        self.deck_sets = []

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
    id = -1
    name = ""
    icon = ""
    decks = []

    def __init__(self, id, name):
        self.id = id
        self.name = name

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
    cards = []  #: List[FlashCard]

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
    index = 0
    image = ""
    sound = ""
    original_image_size = None  # type: Bounds
    landscape_bounds = None  # type: Bounds
    portrait_bounds = None  # type: Bounds

    def __init__(self, index, image):
        self.index = index
        self.image = image

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
    x = 0
    y = 0
    w = 0
    h = 0

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
        return json.dumps(self.__dict__)
