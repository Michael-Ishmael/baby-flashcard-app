using System;
using CoreGraphics;
using CoreAnimation;
using Foundation;
using UIKit;

namespace babyflashcards
{

	public class FlashCardViewTransitioningDelegate : UIViewControllerTransitioningDelegate
	{

		public override IUIViewControllerAnimatedTransitioning GetAnimationControllerForPresentedController (UIViewController presented, 
			UIViewController presenting, UIViewController source)
		{
			return new FlashCardViewControllerAnimatedTransitioning (){ Presenting = true};

		}

	}

}

