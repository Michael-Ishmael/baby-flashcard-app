import os
from aetypes import Enum

from pyparsing import Dict

from production.business.ImageConversion import CsvRecord
from production.business.imagedata import AspectRatio, Orientation, CropSet, Bounds, TargetFormat


class RectDistribution(Enum):
    combined = 1
    split = 2

# combined for 3 twelve16s

# split for 2 nine16s

# xcassets: chicken2 x 6, chicken2_ls x 2, chicken2_pt x 2

# 5 formats, ls + pt, 10 crops


class CardFileManager:
    def __init__(self, image_key, image_name):
        self.image_key = image_key  # type: str
        self.image_name = image_name  # type: str
        self.formats = {
            "twelve16": [],  # type: [CropInstructionSet]
            "nine16": []  # type: [CropInstructionSet]
        }  # type: Dict[str, [CropInstructionSet]]

    def add_format(self, target_format, crop_set):
        if crop_set.can_be_combined_rect(target_format.target_bounds.long_side(),
                                         target_format.target_bounds.short_side()):
            ins_set = CombinedCropInstructionSet(self.image_name, target_format, crop_set)
        else:
            ins_set = SpitCropInstructionSet(self.image_name, target_format, crop_set)
        self.formats[str(target_format.crop_format)].append(ins_set)

    def get_card_csv_lines(self, card_base_path, target_root):
        lines = []
        for key in self.formats:
            for instruction_set in self.formats[key]:  # type: CropInstructionSet
                for instruction in instruction_set.crop_instructions:  # type:CropInstruction
                    xcasset_name = self.image_key + instruction.xcasset_suffix
                    line = CsvRecord()
                    line.original_path = card_base_path + self.image_name
                    line.file_name = self.image_name.replace('.jpg', '_' + key + instruction.xcasset_suffix + '.jpg')
                    line.target_path = os.path.join(target_root, "xcassets", xcasset_name + ".imageset",
                                                    line.file_name)
                    line.crop_start_x_pc = instruction.crop_start_x_pc
                    line.crop_start_y_pc = instruction.crop_start_y_pc
                    line.crop_end_x_pc = instruction.crop_end_x_pc
                    line.crop_end_y_pc = instruction.crop_end_y_pc
                    line.target_width = instruction.target_width
                    line.target_height = instruction.target_height
                    lines.append(line)
        return lines

    def set_line_percentages(self, line, crop_percentages):
        line.crop_start_x_pc = crop_percentages[0]
        line.crop_start_y_pc = crop_percentages[1]
        line.crop_end_x_pc = crop_percentages[2]
        line.crop_end_y_pc = crop_percentages[3]

    def get_xcasset_ting(self):
        v = 1
        # xcasset_name = manager.get_card_csv_lines()
        # if len(lines) == 1:
        #     self.add_xcasset_image(xcasset_name, lines[0].file_name, target_format)
        #     crops = crop_set.get_combined_crops(target_format.target_bounds.long_side(),
        #                                         target_format.target_bounds.short_side())
        #
        #     if not card_dict["imagedef"].has_key(format_key):
        #         card_dict["imagedef"][format_key] = {
        #             "imagetype": "combined",
        #             "imageattributes": {
        #                 "combinedview": {
        #                     "xcassetname": xcasset_name,
        #                     "landscapecrop": crops[0].to_json_dict(),
        #                     "portraitcrop": crops[1].to_json_dict()
        #                 }
        #             }
        #         }
        # elif len(lines) == 2:
        #     self.add_xcasset_image(xcasset_name + "_ls", lines[0].file_name, target_format)
        #     self.add_xcasset_image(xcasset_name + "_pt", lines[1].file_name, target_format)
        #
        #     if not card_dict["imagedef"].has_key(format_key):
        #         card_dict["imagedef"][format_key] = {
        #             "imagetype": "split",
        #             "imageattributes": {
        #                 "landscape": {
        #                     "xcassetname": xcasset_name + "_ls",
        #                 },
        #                 "portrait": {
        #                     "xcassetname": xcasset_name + "_pt",
        #                 }
        #             }
        #         }

class CropInstructionSet:
    def __init__(self, format_name, rect_dist):
        self.format_name = format_name
        self.rect_dist = rect_dist  # type:int
        self.crop_instructions = []  # type:[CropInstruction]

    def create_crop_instruction(self, crop_pcs, bounds, orientation, suffix):
        crop_instruction = CropInstruction()
        crop_instruction.crop_start_x_pc = crop_pcs[0]
        crop_instruction.crop_start_y_pc = crop_pcs[1]
        crop_instruction.crop_end_x_pc = crop_pcs[2]
        crop_instruction.crop_end_y_pc = crop_pcs[3]
        crop_instruction.suffix = suffix
        if orientation == Orientation.landscape:
            crop_instruction.target_width = bounds.long_side()
            crop_instruction.target_height = bounds.short_side()
        else:
            crop_instruction.target_width = bounds.short_side()
            crop_instruction.target_height = bounds.long_side()
        return crop_instruction


class CombinedCropInstructionSet(CropInstructionSet):
    def __init__(self, image_name, target_format, crop_set):
        """

        :type target_format: TargetFormat
        :type crop_set: CropSet
        """
        CropInstructionSet.__init__(self, target_format.name, RectDistribution.combined)
        crop_pcs = crop_set.get_combined_crop_percentages()
        target_bounds = crop_set.get_new_rect_bounds(target_format.target_bounds.long_side(), target_format.target_bounds.short_side())
        self.crop_instruction = self.create_crop_instruction(crop_pcs, target_bounds, Orientation.landscape, "")
        self.crop_instructions.append(self.crop_instruction)
        self.landscape_crop = 5
        self.portrait_crop = 6


class SpitCropInstructionSet(CropInstructionSet):
    def __init__(self, image_name, target_format, crop_set):
        CropInstructionSet.__init__(self, target_format.name, RectDistribution.split)
        landscape_crop_pcs = crop_set.landscape_crop_def.percentages
        self.image_name = image_name
        self.landscape_instruction = self.create_crop_instruction(landscape_crop_pcs, target_format.target_bounds, Orientation.landscape, "_ls")
        portrait_crop_pcs = crop_set.portrait_crop_def.percentages
        self.portrait_instruction = self.create_crop_instruction(portrait_crop_pcs, target_format.target_bounds, Orientation.portrait, "_pt")
        self.crop_instructions = [self.landscape_instruction, self.portrait_instruction]


class CropInstruction:
    def __init__(self):
        # type: () -> object
        self.crop_start_x_pc = 0
        self.crop_start_y_pc = 0
        self.crop_end_x_pc = 1
        self.crop_end_y_pc = 1
        self.target_width = 0
        self.target_height = 0
        self.xcasset_suffix = ""