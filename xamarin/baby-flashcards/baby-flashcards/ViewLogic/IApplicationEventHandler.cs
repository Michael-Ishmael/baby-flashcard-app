using System;
using CoreGraphics;

namespace babyflashcards
{
	public interface IApplicationEventHandler
	{
		void DeckSelected(DeckViewData tile, CGRect frame);
		void FlashCardDismissed();
	}
}

