from __future__ import division

import os

from production.business.ImageData import *


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

#/Users/michaelishmael/Dev/Projects/baby-flashcard-app/xamarin/baby-flashcards/baby-flashcards/Resources/Images.xcassets

class CsvCreator:
    data_file_name = 'data2.json'
    csv_file_name= "cropping.csv"
    target_root = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/media'
    original_root = 'originals'  # '/Users/scorpio/Dev/Projects/baby-flashcard-app/media/originals'
    target_formats = {
         "twelve16": [
            TargetFormat("iphone4", AspectRatio.twelve16, Bounds(0, 0, 960, 640), "iphone", "1x", None),
            TargetFormat("ipad", AspectRatio.twelve16, Bounds(0, 0, 1024, 768), "ipad", "1x", None),
            TargetFormat("ipadretina", AspectRatio.twelve16, Bounds(0, 0, 2048, 1536), "ipad", "2x", "retina4"),
        #     TargetFormat("ipadpro",  CropFormat.twelve16, Bounds(0, 0, 2732, 2048), "ipad", "3x", "retina4"),
         ],
        "nine16": [
            TargetFormat("iphone5", AspectRatio.nine16, Bounds(0, 0, 1138, 640), "iphone", "2x", "retina4"),
            TargetFormat("iphone6", AspectRatio.nine16, Bounds(0, 0, 1334, 750), "iphone", "2x", "retina4"),
            #TargetFormat("iphone6plus", CropFormat.nine16, Bounds(0, 0, 2208, 1242)),
        ]
    }

    def __init__(self, media_path):
        self.media_path = media_path
        self.image_data = ImageData()
        self.csv_lines = []
        self.xcassets = {}
        self.xamarin = { "sets": [] }

    def load(self):
        with open(os.path.join(self.media_path, self.data_file_name)) as json_file:
            self.image_data.load_from_json(json_file)

    def write_csv_lines(self):
        for deck_set in self.image_data.deck_sets:
            set_dict = deck_set.to_json_dict().copy()  # type:dict
            set_dict["decks"] = []
            self.xamarin["sets"].append(set_dict)
            for deck in deck_set.decks:
                deck_dict = deck.to_json_dict().copy()  # type:dict
                deck_dict["cards"] = []
                del deck_dict["sounds"]
                set_dict["decks"].append(deck_dict)

                for card in deck.cards:     # type: FlashCard

                    card_dict = {
                        "id": card.id,
                        "index": card.index,
                        "imagekey": os.path.splitext(card.image)[0],
                        "sound": card.sound,
                        "imagedef": {}
                    }

                    deck_dict["cards"].append(card_dict)

                    for crop_set in card.crop_sets:
                        if crop_set.crop_format == AspectRatio.twelve16:
                            format_key = "twelve16"
                            target_format_list = CsvCreator.target_formats["twelve16"]
                        else:
                            format_key = "nine16"
                            target_format_list = CsvCreator.target_formats["nine16"]

                        for target_format in target_format_list:
                            lines = self.create_csv_lines(target_format, crop_set, card.image, deck.name, deck_set.name, format_key)
                            for line in lines:
                                self.csv_lines.append(line)
                            xcasset_name = os.path.splitext(card.image)[0] + "_" + format_key
                            if len(lines) == 1:
                                self.add_xcasset_image(xcasset_name, lines[0].file_name, target_format)
                                crops = crop_set.get_combined_crops(target_format.target_bounds.long_side(), target_format.target_bounds.short_side())

                                if not card_dict["imagedef"].has_key(format_key):
                                    card_dict["imagedef"][format_key] = {
                                        "imagetype": "combined",
                                        "imageattributes": {
                                            "combinedview": {
                                                "xcassetname": xcasset_name,
                                                "landscapecrop": crops[0].to_json_dict(),
                                                "portraitcrop": crops[1].to_json_dict()
                                            }
                                        }
                                    }
                            elif len(lines) == 2:
                                self.add_xcasset_image(xcasset_name + "_ls", lines[0].file_name, target_format)
                                self.add_xcasset_image(xcasset_name + "_pt", lines[1].file_name, target_format)

                                if not card_dict["imagedef"].has_key(format_key):
                                    card_dict["imagedef"][format_key] = {
                                        "imagetype": "split",
                                        "imageattributes": {
                                            "landscape": {
                                                "xcassetname": xcasset_name + "_ls",
                                            },
                                            "portrait": {
                                                "xcassetname": xcasset_name + "_pt",
                                            }
                                        }
                                    }


    def add_xcasset_image(self, casset_name, image_name, target_format):
        if not self.xcassets.has_key(casset_name):
            self.xcassets[casset_name] = []
        xci = XCassetItem(image_name, target_format.idiom, target_format.scale, target_format.sub_type)
        self.xcassets[casset_name].append(xci)

    def dump_csv_file(self):
        test_line = self.csv_lines[0].to_string()
        ps_path = "/Users/michaelishmael/Dev/Projects/baby-flashcard-app/photoshop/workingtest"
        path = os.path.join(ps_path, self.csv_file_name)
        with open(path, 'w') as csv_file:
            for ln in self.csv_lines:
                csv_file.write(ln.to_string())
                csv_file.write('\n')

    def dump_xcasset_files(self):
        for key in self.xcassets:
            dict_file = {
                "images": [],
                "info": {
                    "version": 1,
                    "author": "xcode"
                }
            }
            for image in self.xcassets[key]:
                dict_file["images"].append(image.to_json_dict())
            path = os.path.join(self.target_root, "xcassets", key + ".imageset", "contents.json")
            if not os.path.exists(os.path.dirname(path)):
                os.makedirs(os.path.dirname(path))
            if os.path.exists(path):
                os.remove(path)
            with open(path, 'w') as json_file:
                simplejson.dump(dict_file, json_file, indent=True)

    def dump_app_json(self):
        path = os.path.join(self.target_root, "appdata.json")
        if not os.path.exists(os.path.dirname(path)):
            os.makedirs(os.path.dirname(path))
        if os.path.exists(path):
            os.remove(path)
        with open(path, 'w') as json_file:
            simplejson.dump(self.xamarin, json_file, indent=True)



    def create_csv_lines(self, target_format, crop_set, image_name, deck_name, set_name, format_key):

        if crop_set.can_be_combined_rect(target_format.target_bounds.long_side(), target_format.target_bounds.short_side()):
            line = self.get_starter_line(target_format, image_name, deck_name, set_name, '_both', format_key)

            crop_percentages = self.get_crop_percentages(crop_set)
            self.set_line_percentages(line, crop_percentages)

            target_size = self.get_crop_size(crop_set, target_format)
            line.target_width = target_size.w
            line.target_height = target_size.h

            return [line]
        else:
            landscape_line = self.get_starter_line(target_format, image_name, deck_name, set_name, '_landscape', format_key)
            self.set_line_percentages(landscape_line, crop_set.landscape_crop_def.percentages)
            landscape_line.target_width = target_format.target_bounds.w
            landscape_line.target_height = target_format.target_bounds.h

            portrait_line = self.get_starter_line(target_format, image_name, deck_name, set_name, '_portrait', format_key)
            self.set_line_percentages(portrait_line, crop_set.portrait_crop_def.percentages)
            portrait_line.target_width = target_format.target_bounds.h
            portrait_line.target_height = target_format.target_bounds.w

            return [landscape_line, portrait_line]


    def get_starter_line(self,target_format, image_name, deck_name, set_name, aspect_suffix, format_key):
        line = CsvRecord()
        line.original_path = os.path.join(CsvCreator.original_root, set_name, deck_name, image_name)
        line.file_name = image_name.replace('.jpg', '_' + target_format.name + aspect_suffix + '.jpg')
        casset_name = os.path.splitext(image_name)[0] + '_' + format_key
        if aspect_suffix == "_landscape":
            casset_name += "_ls"
        if aspect_suffix == "_portrait":
            casset_name += "_pt"
        line.target_path = os.path.join(self.target_root, "xcassets", casset_name + ".imageset", line.file_name)
            #os.path.join(set_name, target_format.folder_path, line.file_name)

        return line

    def set_line_percentages(self, line, crop_percentages):
        line.crop_start_x_pc = crop_percentages[0]
        line.crop_start_y_pc = crop_percentages[1]
        line.crop_end_x_pc = crop_percentages[2]
        line.crop_end_y_pc = crop_percentages[3]

    def get_crop_percentages(self, target_set):
        x = target_set.min_x()
        y = target_set.min_y()
        x2 = target_set.max_x()
        y2 = target_set.max_y()

        return [x, y, x2, y2]

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