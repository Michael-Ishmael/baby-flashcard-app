import os

import simplejson
from FileCompilationSettings import FileCompilationSettings as FCS
from production.business.Entities import XCassetItem


class XCassetCollector:
    def __init__(self):
        self.xcassets = {}

    def add_xcasset_image(self, xci):
        if not self.xcassets.has_key(xci.xcasset_name):
            self.xcassets[xci.xcasset_name] = []
        self.xcassets[xci.xcasset_name].append(xci)

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
            path = os.path.join(FCS.target_root, "Assets.xcassets", key + ".imageset", "Contents.json")
            if not os.path.exists(os.path.dirname(path)):
                os.makedirs(os.path.dirname(path))
            if os.path.exists(path):
                os.remove(path)
            with open(path, 'w') as json_file:
                simplejson.dump(dict_file, json_file, indent=True)
