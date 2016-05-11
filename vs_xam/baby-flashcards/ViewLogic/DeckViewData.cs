using System;
using System.Linq;

namespace babyflashcards
{
	public class DeckViewData
	{
		private int _index = -1;
		private readonly FlashCardDeck _deck;

		public DeckViewData (FlashCardDeck deck)
		{
			_deck = deck;
		}

		public String Caption { get { return _deck.Name; } }

		public String ImageThumb { get { return _deck.Thumb; } }

		public int ThumbId { get { return _deck.Id; } }

		public FlashCard GetNextFlashCard ()
		{
		    if (_deck.Cards == null || !_deck.Cards.Any()) return null;
			IncrementIndex ();
			return _deck.Cards [_index];
		}

		private void IncrementIndex(){
			if (_index == _deck.Cards.Count - 1) {
				_index = 0;
			} else {
				_index++;
			}
		}
	}
}

