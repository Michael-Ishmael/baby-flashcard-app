from production.business.Entities import *


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
                deck.icon = dict_deck.get("icon", { "name", "not found"})["name"]
                cards = dict_deck.get("images", [])
                for dict_card in cards:
                    completed = dict_card.get("completed", False)
                    if completed:
                        card = FlashCard(current_card_id, dict_card["name"])
                        card.index = dict_card["indexInDeck"]
                        card.sound = dict_card.get("sound")
                        card.original_image_size = self.load_bounds_from_dict_prop(dict_card, "originalDims")
                        card.ref_image_size = self.load_bounds_from_dict_prop(dict_card, "sizingDims")

                        twelve16 = self.load_crop_set(dict_card, "twelve16", AspectRatio.twelve16)
                        nine16 = self.load_crop_set(dict_card, "nine16", AspectRatio.nine16)
                        card.crop_sets.append(twelve16)
                        card.crop_sets.append(nine16)

                        deck.cards.append(card)
                        current_card_id += 1
                deck_set.decks.append(deck)
            self.deck_sets.append(deck_set)

    def load_crop_set(self, parent_dict, prop_name, crop_format):
        """
        :type crop_format: AspectRatio
        :type prop_name: str
        :type parent_dict: object
        """
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
        crop_def.percentageBox = self.load_bounds_from_dict_prop(dict_crop_def, "percentages")
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

