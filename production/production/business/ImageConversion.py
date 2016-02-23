from aetypes import Enum

import simplejson
import os
from production.business.imagedata import ImageData, Bounds


class CsvCreator:

    data_file_name = 'data2.json'
    target_root = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/media'
    target_formats = {"twelve16" : [
        TargetFormat("ipad", "ipad", Bounds(0, 0, 1024, 768)),
        TargetFormat("ipadretina", "ipadretina", Bounds(0, 0, 1024, 768)),
        TargetFormat("iphone4", "iphone4", Bounds(0, 0, 1024, 768)),
    ]}

    def __init__(self, media_path):
        self.media_path = media_path
        self.image_data = ImageData()
        self.csv_lines = []

    def load(self):
        with open(os.path.join(self.media_path, self.data_file_name)) as json_file:
            self.image_data.load_from_json(json_file)

    def write_csv_lines(self):
        for deck_set in self.image_data.deck_sets:
            for deck in deck_set.decks:
                for card in deck.cards:
                    line = self.create_csv_line(card, deck, deck_set)
                    self.csv_lines.append(line)

    def create_csv_line(self, card, deck, deck_set):
        return {}



class CsvRecord:

    def __init__(self):
        self.original_path = ""
        self.target_path = ""
        self.crop_start_x_pc = 0
        self.crop_start_y_pc = 0
        self.crop_end_x_pc = 1
        self.crop_end_y_pc = 1
        self.targetDimension = 0  # 0 for width, 2 for height
        self.targetSize = 0


class TargetFormat:

    def __init__(self, name, path, bounds):
        self.name = name
        self.folder_path = path
        self.target_bounds = bounds  # type:Bounds
