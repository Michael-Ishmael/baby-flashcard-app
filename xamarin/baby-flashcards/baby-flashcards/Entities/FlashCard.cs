using System;

namespace babyflashcards
{
	public class FlashCard
	{

		public int Index {
			get;
			set;
		}

		public string Image { get; set; }

		public string Sound { get; set; }

		public FlashCardImageCrop PortraitBounds { get; set; }

		public FlashCardImageCrop LandscapeBounds { get; set; }

	}


	public class FlashCardImageCrop
	{
		public float X { get; set; }

		public float Y { get; set; }

		public float Width { get; set; }

		public float Height { get; set; }
	}
}

