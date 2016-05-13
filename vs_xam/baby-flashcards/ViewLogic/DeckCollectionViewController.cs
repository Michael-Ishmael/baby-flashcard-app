using System;
using UIKit;
using Foundation;
using ObjCRuntime;
using System.Collections.Generic;

namespace babyflashcards
{
	public class DeckCollectionViewController : UICollectionViewController
	{

		static NSString deckViewCellId = new NSString ("DeckViewCell");

		private readonly IApplicationEventHandler _eventHandler;
		private readonly List<DeckViewData> _tiles;

		public DeckCollectionViewController (UICollectionViewLayout layout, FlashCardSet cardSet,  IApplicationEventHandler eventHandler) : base(layout)
		{
			_eventHandler = eventHandler;
			_tiles = new List<DeckViewData> ();

			foreach (var deck in cardSet.Decks) {
				_tiles.Add ( new DeckViewData(deck) );
			}
		}

		public List<DeckViewData> Tiles {
			get {
				return _tiles;
			}
		}

        public override bool PrefersStatusBarHidden()
        {
            return true;
        }

        public override void ViewDidLoad ()
		{
			base.ViewDidLoad ();

			CollectionView.RegisterClassForCell (typeof(DeckViewCell), deckViewCellId);
			CollectionView.BackgroundView = new UIView (CollectionView.Bounds);
			CollectionView.BackgroundView.BackgroundColor = UIColor.White;
			UIMenuController.SharedMenuController.MenuItems = new [] {
				new UIMenuItem ("Custom", new Selector ("custom"))
			};
		}

        public override nint NumberOfSections (UICollectionView collectionView)
		{
			return 1;
		}

		public override nint GetItemsCount (UICollectionView collectionView, nint section)
		{
			return _tiles.Count;
		}

		public override UICollectionViewCell GetCell (UICollectionView collectionView, NSIndexPath indexPath)
		{
			var tilePictureCell = (DeckViewCell)collectionView.DequeueReusableCell (deckViewCellId, indexPath);
			tilePictureCell.Layer.Hidden = false;

			var tile = _tiles [indexPath.Row];

			tilePictureCell.ImagePath = tile.ImageThumb;

			return tilePictureCell;
		}

		public override void ItemSelected (UICollectionView collectionView, NSIndexPath indexPath)
		{
			var item = _tiles[indexPath.Row];
			var cell = Layout.LayoutAttributesForItem (indexPath);
			if (_eventHandler != null)
				_eventHandler.DeckSelected (item, cell.Frame);
		}

		public override bool ShouldSelectItem (UICollectionView collectionView, NSIndexPath indexPath)
		{
			return true;
		}

		public override bool CanBecomeFirstResponder {
			get {
				return true;
			}
		}

		public override void ViewDidAppear (bool animated)
		{
			base.ViewDidAppear (animated);
			//Enables responding to shake gesture
			BecomeFirstResponder ();
		}

		public override void ViewWillDisappear (bool animated)
		{
			base.ViewWillDisappear (animated);
			//Gives back first responder control
			ResignFirstResponder ();
		}

		public override void MotionEnded (UIEventSubtype motion, UIEvent evt)
		{
			base.MotionEnded (motion, evt);
			if (motion == UIEventSubtype.MotionShake) {
				Jumble ();
			}
		}

		public void Jumble(){
			CollectionView.PerformBatchUpdates (() => {
				_tiles.Shuffle();
				CollectionView.ReloadSections(new NSIndexSet(0));

			}, null);
		}

		public override void WillRotate (UIInterfaceOrientation toInterfaceOrientation, double duration)
		{
			base.WillRotate (toInterfaceOrientation, duration);

			//			var lineLayout = CollectionView.CollectionViewLayout as LineLayout;
			//			if (lineLayout != null)
			//			{
			//				if((toInterfaceOrientation == UIInterfaceOrientation.Portrait) || (toInterfaceOrientation == UIInterfaceOrientation.PortraitUpsideDown))
			//					lineLayout.SectionInset = new UIEdgeInsets (400,0,400,0);
			//				else
			//					lineLayout.SectionInset  = new UIEdgeInsets (220, 0.0f, 200, 0.0f);
			//			}
		}
	}

	public static class ListExtensions
	{
		private static Random rng = new Random();  

		public static void Shuffle<T>(this IList<T> list)  
		{  
			int n = list.Count;  
			while (n > 1) {  
				n--;
				int k = rng.Next(n + 1);  
				while(k == n){
					k = rng.Next(n + 1);
				}
				T value = list[k];  
				list[k] = list[n];  
				list[n] = value;  
			}  
		}

	}
}

