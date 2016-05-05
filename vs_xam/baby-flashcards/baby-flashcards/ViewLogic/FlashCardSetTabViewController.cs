using System;
using System.Collections.Generic;
using UIKit;
using CoreGraphics;
using CoreAnimation;

namespace babyflashcards
{
	
	public class FlashCardSetTabViewController : UITabBarController, IApplicationEventHandler
	{
		private readonly List<DeckCollectionViewController> _collectionControllers;
		private FlashCardViewController _pictureController;
		private int _clickCount = 0;
		private AppData _appData;

		public FlashCardSetTabViewController (AppData appData)
		{
			_appData = appData;
			_collectionControllers = new List<DeckCollectionViewController> ();

			foreach (var cardSet in _appData.Sets) {
				var layout = GetFlowLayout ();
				var collectionController = new DeckCollectionViewController(layout, cardSet, this);
				collectionController.CollectionView.ContentInset = new UIEdgeInsets (0, 0, 0, 0);
				collectionController.TabBarItem = new UITabBarItem ();
				collectionController.TabBarItem.ImageInsets = new UIEdgeInsets(6, 0, -6, 0);
				collectionController.TabBarItem.Image = UIImage.FromBundle (cardSet.Icon);
				_collectionControllers.Add(collectionController);
			}

			/*
			var secondTab = new UIViewController ();
			secondTab.View.BackgroundColor = UIColor.Gray;
			secondTab.TabBarItem = new UITabBarItem ();
			secondTab.TabBarItem.ImageInsets = new UIEdgeInsets(6, 0, -6, 0);
			secondTab.TabBarItem.Image = UIImage.FromBundle ("lionIcon.png");
			*/
			ViewControllers = _collectionControllers.ToArray ();

		}

		private JumbleFlowLayout GetFlowLayout(){

			var flowLayout = new JumbleFlowLayout (){
				//HeaderReferenceSize = new CGSize (4, 50),
				SectionInset = new UIEdgeInsets (20,10,4,10),
				ScrollDirection = UICollectionViewScrollDirection.Vertical,
				MinimumInteritemSpacing = 4, // minimum spacing between cells
				MinimumLineSpacing = 4 // minimum spacing between rows if ScrollDirection is Vertical or between columns if Horizontal
					, ItemSize = new CGSize(114, 140)
			};

			return flowLayout;
		}

		public override bool PrefersStatusBarHidden ()
		{
			return true;
		}

		public void DeckSelected (DeckViewData tile, CGRect frame)
		{
			_pictureController = new FlashCardViewController (tile.GetNextFlashCard(), frame, this);
			var tr = new FlashCardViewTransitioningDelegate ();
			_pictureController.TransitioningDelegate = tr;

			PresentViewController (_pictureController, true, null);

			_clickCount++;

		}

		public void FlashCardDismissed ()
		{
			DismissViewController(true, () => {
				if(_clickCount >= 5){
					_clickCount =0;
					var collectionController = SelectedViewController as DeckCollectionViewController;
					collectionController.Jumble();
				}
			});

			//_pictureController.RemoveFromParentViewController();
		}

	}
}
