using System;
using System.Collections.Generic;


namespace babyflashcards
{
	public class FlashCardDeck
	{
		public int Id { get; set; }

		public string Name { get; set; }

		public string Thumb { get; set; }

		public List<FlashCard> Cards { get; set; }
	}
}
