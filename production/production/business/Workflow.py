import os

from production.business.ImageData import ImageData


class Workflow:
    def __init__(self, media_path):
        self.media_path = media_path
        self.backlog_sub_folder = 'backlog'
        self.sounds_sub_folder = 'sounds'
        self.set_icons_sub_folder = 'setIcons'
        self.deck_icons_sub_folder = 'deckThumbs'
        self.data_file_name = 'data.json'
        self.image_data = ImageData()
        self.backlog = []  # type: List[FileItem]
        self.sounds = []
        self.set_icons = []
        self.deck_icons = []

    def load(self):
        # with open(os.path.join(self.media_path, self.data_file_name)) as json_file:
        #     self.image_data.load_from_json(json_file)
        self.load_files(self.backlog_sub_folder, 'jpg', self.backlog)
        # for item in self.backlog:
        #     match = self.find_in_data(item.name)
        #     if match is not None:
        #         item.id = match.id
        # sounds = []  # type:Array[FileItem]
        self.load_files(self.sounds_sub_folder, 'mp3', self.sounds)
        self.load_files(self.set_icons_sub_folder, 'gif', self.set_icons)
        self.load_files(self.deck_icons_sub_folder, 'png', self.deck_icons)
        # for sound in sounds:
        #     dir_path = os.path.dirname(sound.full_path)
        #     sub_folder = os.path.basename(dir_path)
        #     matching_deck = self.get_matching_deck(sub_folder)
        #     if matching_deck is not None:
        #         matching_deck.sounds.append(sound)

    def get_matching_deck(self, deck_name):  # type:Deck
        for deck_set in self.image_data.deck_sets:
            for deck in deck_set.decks:
                if deck.name == deck_name:
                    return deck
        return None

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
                    file_sub = dir_name
                    while not dir_name == sub_folder:
                        sub_path = os.path.join(dir_name, sub_path)
                        dir_path = os.path.dirname(dir_path)
                        dir_name = os.path.basename(dir_path)

                    lst.append(FileItem(item_name, sub_path, file_name_path, file_sub))

    def to_json_dict(self):
        return {
            "backlog": [x.to_json_dict() for x in self.backlog],
            "sounds": [x.to_json_dict() for x in self.sounds],
            "setIcons": [x.to_json_dict() for x in self.set_icons],
            "deckIcons": [x.to_json_dict() for x in self.deck_icons],
            # "imagedata": self.image_data.to_json_dict()
        }


class FileItem:
    def __init__(self, name, sub_path, full_path, sub_folder):
        self.name = name
        self.sub_path = sub_path
        self.full_path = full_path
        self.sub_folder = sub_folder
        self.id = -1

    def to_json_dict(self):
        return {
            "id": self.id,
            "name": self.name,
            "path": self.sub_path,
            "filePath": self.full_path,
            "subFolder": self.sub_folder
        }