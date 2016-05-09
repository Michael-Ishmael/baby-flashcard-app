from production.business.imagedata import TargetFormat, AspectRatio, Bounds


class FileCompilationSettings:
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