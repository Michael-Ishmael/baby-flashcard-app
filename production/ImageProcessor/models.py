from django.db import models

# Create your models here.

class ImageItem:
    OrignalPath = ""
    Name=""
    DisplayFormats=[]

    def to_json_obj(self):
        json_obj = {
            "originalpath": self.OrignalPath,
            "name": self.Name,
            "displayformats": [s.to_json_obj + ',' for s in self.DisplayFormats][:-1]
        }
        return json_obj;


class DisplayFormat:
    Key= ""
    Width=0
    Height=0

    def to_json_obj(self):
        json_obj = {
            "key": self.Key,
            "width": self.Width,
            "height": self.Height
        }
        return json_obj;