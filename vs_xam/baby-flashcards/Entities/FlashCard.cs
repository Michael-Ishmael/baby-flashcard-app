using System;
using System.Collections.Generic;

namespace babyflashcards
{
	public class FlashCard
	{
        public int Id { get; set; }

		public int Index { get; set; }

		public string Sound { get; set; }

        public Dictionary<AspectRatio, ImageFormatDef> ImageDef { get; set; }

	}

    public enum AspectRatio
    {
        Nine16 = 0,
        Twelve16 = 1
    }

    public enum ImageOrientation
    {
        Landscape = 0,
        Portrait = 1
    }

    public enum ImageType
    {
        Combined = 0,
        Split = 1
    }

    public class ImageFormatDef
    {
        public ImgSrc Landscape { get; set; }
        public ImgSrc Portrait { get; set; }
        public ImageType ImageType { get; set; }
    }

    public class ImgSrc
    {
        public string XCasset { get; set; }
        public FlashCardImageCrop Crop { get; set; }
    }

	public class FlashCardImageCrop
	{
		public float X1 { get; set; }

		public float Y1 { get; set; }

        public float X2 { get; set; }

		public float Y2 { get; set; }

		public float Width { get; set; }

		public float Height { get; set; }
	}
}

