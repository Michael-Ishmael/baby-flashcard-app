import os
from aetypes import Enum

from production.business.Entities import BoundsPcs
from production.business.Entities import CsvRecord, Orientation, XCassetItem, TargetFormat, AspectRatio


class RectDistribution(Enum):
    combined = 1
    split = 2

class XCassetSuffixes:
    landscape = "_ls"
    portrait = "_pt"


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
            ins_set = SplitCropInstructionSet(self.image_name, target_format, crop_set)
        self.formats[target_format.crop_format].append(ins_set)

    def get_card_csv_lines(self, card_base_path, target_root):
        lines = []
        for key in self.formats:
            for instruction_set in self.formats[key]:  # type: CropInstructionSet
                for instruction in instruction_set.crop_instructions:  # type:CropInstruction
                    xcasset_name = self.image_key + instruction.xcasset_suffix
                    line = CsvRecord()
                    line.original_path = card_base_path
                    line.file_name = self.image_name.replace('.jpg', instruction.xcasset_suffix + '_'
                                                             + instruction.target_format_name + '.jpg')
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

    def get_xcasset_items(self, target_root):
        items = []
        for key in self.formats:
            for instruction_set in self.formats[key]:  # type: CropInstructionSet
                for instruction in instruction_set.crop_instructions:  # type:CropInstruction
                    xcasset_name = self.image_key + instruction.xcasset_suffix
                    target_format = instruction_set.target_format
                    image_file_name = self.image_name.replace('.jpg', instruction.xcasset_suffix + '_'
                                                             + target_format.name + '.jpg')

                    xci = XCassetItem(image_file_name, target_format.idiom, target_format.scale, target_format.sub_type)
                    xci.xcasset_name = xcasset_name
                    items.append(xci)
        return items

    def get_app_image_defs(self):
        defs = { AspectRatio.nine16: None, AspectRatio.twelve16: None}

        for key in self.formats:
            if defs[key] is None:
                app_image_def = AppImageDef()
                for instruction_set in self.formats[key]:  # type: CropInstructionSet
                    app_image_def.aspect_ratio = key
                    app_image_def.rect_dist = instruction_set.rect_dist

                    if instruction_set.rect_dist == RectDistribution.combined:
                        comb_ins = instruction_set  # type:CombinedCropInstructionSet
                        app_image_def.landscape_def = AspectImageDef(Orientation.landscape, self.image_key,
                                                                     comb_ins.landscape_crop)
                        app_image_def.portrait_def = AspectImageDef(Orientation.portrait, self.image_key,
                                                                     comb_ins.portrait_crop)
                    elif instruction_set.rect_dist == RectDistribution.split:
                        app_image_def.landscape_def = AspectImageDef(Orientation.landscape, self.image_key +
                                                                     XCassetSuffixes.landscape, None)
                        app_image_def.portrait_def = AspectImageDef(Orientation.portrait, self.image_key +
                                                                     XCassetSuffixes.portrait, None)
                    defs[key] = app_image_def
                    break

        return defs


    def set_line_percentages(self, line, crop_percentages):
        line.crop_start_x_pc = crop_percentages[0]
        line.crop_start_y_pc = crop_percentages[1]
        line.crop_end_x_pc = crop_percentages[2]
        line.crop_end_y_pc = crop_percentages[3]

    def get_xcasset_images(self):
        pass


class CropInstructionSet:
    def __init__(self, target_format, rect_dist):
        self.target_format = target_format
        self.rect_dist = rect_dist  # type:int
        self.crop_instructions = []  # type:[CropInstruction]

    def create_crop_instruction(self, crop_pcs, bounds, orientation, suffix, format_name):
        crop_instruction = CropInstruction()  # type:CropInstruction
        crop_instruction.crop_start_x_pc = crop_pcs[0]
        crop_instruction.crop_start_y_pc = crop_pcs[1]
        crop_instruction.crop_end_x_pc = crop_pcs[2]
        crop_instruction.crop_end_y_pc = crop_pcs[3]
        crop_instruction.xcasset_suffix = suffix
        crop_instruction.target_format_name = format_name
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
        :type crop_set: production.business.Entities.CropSet
        """
        CropInstructionSet.__init__(self, target_format, RectDistribution.combined)
        crop_pcs = crop_set.get_combined_crop_percentages()
        target_bounds = crop_set.get_new_rect_bounds(target_format.target_bounds.long_side(),
                                                     target_format.target_bounds.short_side())
        self.crop_instruction = self.create_crop_instruction(crop_pcs, target_bounds, Orientation.landscape,
                                                             "", target_format.name)
        self.crop_instructions.append(self.crop_instruction)
        crops = crop_set.get_combined_crops(target_format.target_bounds.long_side(),
                                            target_format.target_bounds.short_side())

        self.landscape_crop = crops[0]
        self.portrait_crop = crops[1]


class SplitCropInstructionSet(CropInstructionSet):
    def __init__(self, image_name, target_format, crop_set):
        CropInstructionSet.__init__(self, target_format, RectDistribution.split)
        landscape_crop_pcs = crop_set.landscape_crop_def.percentages
        self.image_name = image_name
        self.landscape_instruction = self.create_crop_instruction(landscape_crop_pcs, target_format.target_bounds,
                                                                  Orientation.landscape, XCassetSuffixes.landscape, target_format.name)
        portrait_crop_pcs = crop_set.portrait_crop_def.percentages
        self.portrait_instruction = self.create_crop_instruction(portrait_crop_pcs, target_format.target_bounds,
                                                                 Orientation.portrait, XCassetSuffixes.portrait, target_format.name)
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
        self.target_format_name = ""
        self.xcasset_suffix = ""


class AppImageDef:
    def __init__(self):
        self.rect_dist = RectDistribution.combined
        self.aspect_ratio = AspectRatio.nine16
        self.landscape_def = None  # type:AspectImageDef
        self.portrait_def = None  # type:AspectImageDef


class AspectImageDef:
    def __init__(self, orientation, xcasset_name, crop):
        """

        :type crop: [float]
        :type xcasset_name: str
        :type orientation: int
        """
        self.xcasset_name = xcasset_name
        self.orientation = orientation
        self.crop = crop  # type:BoundsPcs

