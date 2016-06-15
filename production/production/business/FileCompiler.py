import os
import subprocess

from production.business.AppDataCollector import AppDataCollector
from production.business.CardFileManager import CardFileManager

from production.business.ImageData import *
from FileCompilationSettings import FileCompilationSettings as FCS
from production.business.XCassetCollector import XCassetCollector


class FileCompiler:

    def __init__(self):
        self.image_data = ImageData()
        self.csv_lines = []
        self.data_collector = AppDataCollector()
        self.x_collector = XCassetCollector()

    def load(self):
        json_file_path = os.path.join(FCS.media_path, FCS.data_file_name)
        with open(json_file_path) as json_file:
            self.image_data.load_from_json(json_file)

    def compile_files(self):
        for deck_set in self.image_data.deck_sets:
            self.data_collector.add_set(deck_set)
            for deck in deck_set.decks:
                self.data_collector.add_deck(deck)

                for card in deck.cards:     # type: FlashCard

                    self.data_collector.add_card(card)
                    card_key = os.path.splitext(card.image)[0]
                    manager = CardFileManager(card_key, card.image)

                    for crop_set in card.crop_sets:  # type: CropSet
                        target_format_list = FCS.target_formats[crop_set.crop_format]

                        for target_format in target_format_list:

                            manager.add_format(target_format, crop_set)

                    src_path_root = os.path.join(FCS.original_root, deck_set.name, deck.name, card.image)
                    lines = manager.get_card_csv_lines(src_path_root, FCS.target_root)

                    for line in lines:
                        self.csv_lines.append(line)

                    x_items = manager.get_xcasset_items(FCS.target_root)
                    for item in x_items:
                        self.x_collector.add_xcasset_image(item)

                    d_images = manager.get_app_image_defs()
                    for key in d_images:
                        self.data_collector.add_image_def(d_images[key])

    def dump_csv_file(self):
        path = os.path.join(FCS.ps_path, FCS.csv_file_name)
        with open(path, 'w') as csv_file:
            for ln in self.csv_lines:
                csv_file.write(ln.to_string())
                csv_file.write('\n')

    def dump_xcasset_files(self):
        self.x_collector.dump_xcasset_files()

    def dump_app_data_json(self):
        self.data_collector.dump_app_json()

    def dump_image(self, image_key):
        as_script = self.get_ascript(image_key)
        res = self.as_run(as_script)
        print res;


    def get_ascript(self, image_key):

        ascript = '''
        on run argv
            tell application "Adobe Photoshop CC 2015"
              set js to "#include ~/Dev/Projects/baby-flashcard-app/photoshop/singleImage.jsx" & return
              set js to js & "main(arguments);" & return
              do javascript js with arguments argv

            end tell
        end run
        '''
        return ascript

    def as_run(self, ascript):
        "Run the given AppleScript and return the standard output and error."
        line = "originals/domestic/cow/cow5.jpg,/Users/michaelishmael/Dev/Projects/baby-flashcard-app/photoshop/testarea/cow5_iphone6.jpg,1334,750,0.4,0.3,0.8,0.9"
        osa = subprocess.call(['osascript', '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/photoshop/resize_cmd.scpt', line])

            # .Popen(['osascript', line],
            #                    stdin=subprocess.PIPE,
            #                    stdout=subprocess.PIPE)
        #res = osa.communicate(ascript)[0]
        #print res, type(osa)
        return 1

    def as_quote(self, astr):
        "Return the AppleScript equivalent of the given string."

        astr = astr.replace('"', '" & quote & "')
        return '"{}"'.format(astr)
