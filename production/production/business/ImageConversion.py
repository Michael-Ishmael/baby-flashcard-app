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
    original_root = 'originals'  # '/Users/scorpio/Dev/Projects/baby-flashcard-app/media/originals'
    target_formats = {
        "twelve16": [
            TargetFormat("iphone4", "iphone4", CropFormat.twelve16, Bounds(0, 0, 960, 640)),
            TargetFormat("ipad", "ipad", CropFormat.twelve16, Bounds(0, 0, 1024, 768)),
            TargetFormat("ipadretina", "ipadretina", CropFormat.twelve16, Bounds(0, 0, 2048, 1536)),
            TargetFormat("ipadpro", "ipadpro", CropFormat.twelve16, Bounds(0, 0, 2732, 2048)),
        ],
        "nine16": [
            TargetFormat("iphone5", "iphone5", CropFormat.nine16, Bounds(0, 0, 1138, 640)),
            TargetFormat("iphone6", "iphone6", CropFormat.nine16, Bounds(0, 0, 1334, 750)),
            TargetFormat("iphone6plus", "iphone6plus", CropFormat.nine16, Bounds(0, 0, 2208, 1242)),
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
                            target_format_list = CsvCreator.target_formats["twelve16"]
                        else:
                            target_format_list = CsvCreator.target_formats["nine16"]
                        for target_format in target_format_list:
                            line = self.create_csv_line(target_format, crop_set, card.original_image_size, card.image, deck.name, deck_set.name)
                            self.csv_lines.append(line)

    def create_csv_line(self, target_format, crop_set, image_dims, image_name, deck_name, set_name):
        line = CsvRecord()
        line.original_path = os.path.join(CsvCreator.original_root, set_name, deck_name, image_name)
        file_name = image_name.replace('.jpg', '_' + target_format.name + '.jpg')
        line.target_path = os.path.join(set_name, target_format.folder_path, file_name)

        crop_percentages = self.get_crop_percentages(crop_set, image_dims)
        target_size = self.get_crop_size(crop_set, target_format)

        line.crop_start_x_pc = crop_percentages[0]
        line.crop_start_y_pc = crop_percentages[1]
        line.crop_end_x_pc = crop_percentages[2]
        line.crop_end_y_pc = crop_percentages[3]
        line.target_width = target_size.w
        line.target_height = target_size.h

        return line

    def get_crop_percentages(self, target_set, original_image_size):
        x = target_set.min_x()
        y = target_set.min_y()
        x2 = target_set.max_x()
        y2 = target_set.max_y()

        return [x / original_image_size.w, y / original_image_size.h,
                x2 / original_image_size.w, y2 / original_image_size.h]

    def get_crop_size(self, target_set, target_format):
        long_side = target_format.target_bounds.w if target_format.target_bounds.w > target_format.target_bounds.h \
            else target_format.target_bounds.h
        short_side = target_format.target_bounds.w if target_format.target_bounds.w < target_format.target_bounds.h \
            else target_format.target_bounds.h

        return target_set.get_new_rect_bounds(long_side, short_side)

    def get_pc_dim_array(self, image_dims, crop_dims):
        pc_x1 = crop_dims.x / image_dims.w
        pc_x2 = crop_dims.x2() / image_dims.w
        pc_y1 = crop_dims.y / image_dims.h
        pc_y2 = crop_dims.y2() / image_dims.h

        return [pc_x1, pc_y1, pc_x2, pc_y2]



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
