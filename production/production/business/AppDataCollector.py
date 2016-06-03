import os

import simplejson
from FileCompilationSettings import FileCompilationSettings as FCS
from CardFileManager import AppImageDef, AspectImageDef, RectDistribution
from Entities import Deck


class AppDataCollector:
    def __init__(self):
        self.data = {"decksets": []}
        self.current_set_dict = None
        self.current_deck_dict = None
        self.current_card_dict = None

    def add_set(self, deck_set):
        set_dict = deck_set.to_json_dict().copy()  # type:dict
        set_dict["decks"] = []
        self.data["decksets"].append(set_dict)
        self.current_set_dict = set_dict

    def add_deck(self, deck):
        """

        :type deck: Deck
        """
        deck.icon = deck.icon.replace("../media/deckthumbs/domestic/", "").replace(".png", "").lower()
        deck_dict = deck.to_json_dict().copy()  # type:dict
        deck_dict["cards"] = []
        del deck_dict["sounds"]
        self.current_set_dict["decks"].append(deck_dict)
        self.current_deck_dict = deck_dict

    def add_card(self, card):
        card_key = os.path.splitext(card.image)[0]
        card_dict = {
            "id": card.id,
            "index": card.index,
            "imagekey": card_key,
            "sound": card.sound,
            "imagedef": {}
        }
        self.current_deck_dict["cards"].append(card_dict)
        self.current_card_dict = card_dict

    def add_image_def(self, image_def):
        """

        :type image_def: AppImageDef
        """
        image_type = "split" if image_def.rect_dist == RectDistribution.split else "combined"
        if image_def.portrait_def is None:
            pass
        image_def_dict = {
            "imagetype": image_type,
            "landscape": {
                "xcasset": image_def.landscape_def.xcasset_name,
                "crop": image_def.landscape_def.crop.to_json_dict() if image_def.landscape_def.crop is not None else None
            },
            "portrait": {
                "xcasset": image_def.portrait_def.xcasset_name,
                "crop": image_def.portrait_def.crop.to_json_dict() if image_def.portrait_def.crop is not None else None
            },
        }

        self.current_card_dict["imagedef"][image_def.aspect_ratio] = image_def_dict

    def dump_app_json(self):
        path = os.path.join(FCS.target_root, "appdata.json")
        if not os.path.exists(os.path.dirname(path)):
            os.makedirs(os.path.dirname(path))
        if os.path.exists(path):
            os.remove(path)
        with open(path, 'w') as json_file:
            simplejson.dump(self.data, json_file, indent=True)
