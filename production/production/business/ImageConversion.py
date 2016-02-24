from aetypes import Enum

import simplejson
import os
from production.business.imagedata import *


# 	                W	H	    Ratio
#
# iPhone5	    1138	640	    9/16	  9/16
# iPhone6	    1334	750	    9/16	  9/16
# iPhone6plus	2208	1242    9/16	  9/16
#
# iPhone4	    960	    640	    11/16	  2/3
# iPad Mini	    1024	768	    12/16	  3/4
# ipad Other	2048	1536    12/16	  3/4
# iPad Pro	    2732	2048    12/16	  3/4


class CsvCreator:
    data_file_name = 'data2.json'
    target_root = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/media'
    original_root = '/Users/scorpio/Dev/Projects/baby-flashcard-app/media/originals'
    target_formats = {
        "twelve16": [
            TargetFormat("iphone4", "iphone4", Bounds(0, 0, 960, 640)),
            TargetFormat("ipad", "ipad", Bounds(0, 0, 1024, 768)),
            TargetFormat("ipadretina", "ipadretina", Bounds(0, 0, 2048, 1536)),
            TargetFormat("ipadpro", "ipadpro", Bounds(0, 0, 2732, 2048)),
        ],
        "nine16": [
            TargetFormat("iphone5", "iphone5", Bounds(0, 0, 1138, 640)),
            TargetFormat("iphone6", "iphone6", Bounds(0, 0, 1334, 750)),
            TargetFormat("iphone6plus", "iphone6plus", Bounds(0, 0, 2208, 1242)),
        ]
    }

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
                    for crop_set in card.crop_sets:
                        if crop_set.crop_format == CropFormat.twelve16:
                            target_formats = target_formats.
                        line = self.create_csv_line(card, deck, deck_set)
                    self.csv_lines.append(line)

    def create_csv_line(self, image_name, set_name, deck_name, crop_set):
        line = CsvRecord()
        line.original_path = os.path.join(CsvCreator.original_root, set_name, deck_name, image_name)
        line.target_path = os.path.join(CsvCreator.target_root, set_name, deck_name)


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
