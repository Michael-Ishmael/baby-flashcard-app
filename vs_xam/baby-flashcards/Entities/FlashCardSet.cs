using System;
using System.Collections.Generic;

namespace babyflashcards
{
	public class FlashCardSet
	{
		public int Id { get; set; }

		public string Icon { get; set; }

		public string Name { get; set; }

		public List<FlashCardDeck> Decks { get; set; }
	}
}

