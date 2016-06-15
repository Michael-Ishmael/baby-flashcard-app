import unittest
from os.path import expanduser

from production.business.AppDataCollector import AppDataCollector
from production.business.FileCompiler import FileCompiler
from production.business.ImageConversion import CsvCreator
from production.business.Workflow import Workflow
from production.business.ImageData import *

__author__ = 'scorpio'


class ImageDataTest(unittest.TestCase):
    def bounds_to_json_test(self):
        bounds = Bounds(0, 20, 100, 200)

        result = bounds.to_json()

        expected = '{"y": 20, "x": 0, "w": 100, "h": 200}'

        self.assertEqual(result, expected)

    def flashcard_to_json_test(self):
        card = FlashCard(1, "horse1.jpg")
        card.sound = "horse4.mp3"
        card.original_image_size = Bounds(0, 0, 2000, 1500)
        card.landscape_bounds = Bounds(30, 100, 550, 100)
        card.portrait_bounds = Bounds(200, 20, 100, 550)

        result = simplejson.dumps(card.to_json_dict())

        expected = '{"sound": "horse4.mp3", "index": 1, "image": "horse1.jpg", ' \
                   '"originalImageSize": {"y": 0, "x": 0, "w": 2000, "h": 1500}, ' \
                   '"portraitBounds": {"y": 20, "x": 200, "w": 100, "h": 550}, ' \
                   '"landscapeBounds": {"y": 100, "x": 30, "w": 550, "h": 100}}'

        self.assertEqual(result, expected)

    def deck_to_json_test(self):
        deck = Deck(2, "Horse")
        deck.thumb = "horseThumb1.jpg"

        card1 = FlashCard(1, "horse1.jpg")
        card1.sound = "horse4.mp3"
        card1.original_image_size = Bounds(0, 0, 2000, 1500)
        card1.landscape_bounds = Bounds(30, 100, 550, 100)
        card1.portrait_bounds = Bounds(200, 20, 100, 550)

        card2 = FlashCard(1, "horse2.jpg")
        card2.sound = "horse5.mp3"
        card2.original_image_size = Bounds(0, 0, 2000, 1500)
        card2.landscape_bounds = Bounds(30, 100, 550, 100)
        card2.portrait_bounds = Bounds(200, 20, 100, 550)

        deck.cards.append(card1)
        deck.cards.append(card2)

        expected = ""

        result = simplejson.dumps(deck.to_json_dict())

        self.assertEqual(expected, result)

    def can_load_from_json_file_test(self):
        with open('/Users/scorpio/Dev/Projects/baby-flashcard-app/media/data.json') as json_file:
            image_data = ImageData()
            # json_string = '{ "sets": [ { "id": 1, "name": "domestic" } , { "id": 2, "name": "safari" }   ]}'
            image_data.load_from_json(json_file)

        self.assertEqual(3, len(image_data.deck_sets[0].decks))

    def can_write_image_data_to_json_test(self):
        image_data = ImageData()
        with open('/Users/scorpio/Dev/Projects/baby-flashcard-app/media/data.json') as json_file:
            image_data.load_from_json(json_file)

        json_str = simplejson.dumps(image_data.to_json_dict())

        self.assertTrue(len(json_str) > 50)

        with open('/Users/scorpio/Dev/Projects/baby-flashcard-app/media/data2.json', 'w') as outfile:
            simplejson.dump(image_data.to_json_dict(), outfile, indent=2)

    def can_load_backlog_test(self):
        path = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/proudction-ui/media'
        workflow = Workflow(path)
        workflow.load()

        self.assertTrue(len(workflow.backlog) > 10)
        self.assertTrue(len(workflow.sounds) > 10)


class CsvCreatorTest(unittest.TestCase):
    def can_load_json_test(self):
        path = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/proudction-ui/media'
        creator = CsvCreator(path)
        creator.load()

        result = 1

        expected = 1

        self.assertEqual(result, expected)

    def can_write_lines_test(self):
        path = '/Users/michaelishmael/Dev/Projects/baby-flashcard-app/proudction-ui/media'
        creator = CsvCreator(path)
        creator.load()
        creator.write_csv_lines()
        result = 1

        expected = 1

        self.assertEqual(result, expected)

    def can_write_lines_2_test(self):
        creator = FileCompiler()  # type:FileCompiler
        creator.load()
        creator.compile_files()
        creator.dump_csv_file()
        result = 1

        expected = 1

        self.assertEqual(result, expected)

    def can_create_file_test(self):
        home = expanduser("~")
        path = home + '/Dev/Projects/baby-flashcard-app/proudction-ui/media'
        creator = CsvCreator(path)
        creator.load()
        creator.write_csv_lines()
        creator.dump_csv_file()
        result = 1

        expected = 1

        self.assertEqual(result, expected)

    def can_create_xcassets_test(self):
        creator = FileCompiler()
        creator.load()
        creator.compile_files()
        creator.dump_xcasset_files()
        result = 1

        expected = 1

        self.assertEqual(result, expected)

    def can_run_as_script_test(self):
        creator = FileCompiler()
        creator.dump_image("123")
        result = 1

        expected = 1

        self.assertEqual(result, expected)

    def can_create_app_json_test(self):
        creator = FileCompiler()
        creator.load()
        creator.compile_files()
        creator.dump_app_data_json()

        result = 1
        expected = 1
        self.assertEqual(result, expected)

    def can_update_single_card_data_test(self):
        creator = FileCompiler()
        creator.dump_image("cow1")


        result = 1
        expected = 1
        self.assertEqual(result, expected)




