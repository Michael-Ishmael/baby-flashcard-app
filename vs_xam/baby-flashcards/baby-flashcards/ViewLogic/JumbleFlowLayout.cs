using System;
using UIKit;
using CoreGraphics;
using Foundation;
using System.Collections.Generic;

namespace babyflashcards
{
	public class JumbleFlowLayout : UICollectionViewFlowLayout
	{
		private Dictionary<int, PosStore> _lastPositions;

		public JumbleFlowLayout ()
		{
			_lastPositions = new Dictionary<int, PosStore> ();
		}

		public override void PrepareLayout ()
		{
			base.PrepareLayout ();
			var cellCount = (int)CollectionView.NumberOfItemsInSection (0);

			for (int i = 0; i < cellCount; i++) {
				var itemIndexPath = NSIndexPath.FromItemSection (i, 0);
				var item = (CollectionView.DataSource as DeckCollectionViewController).Tiles [itemIndexPath.Row];
				var attributes = LayoutAttributesForItem (itemIndexPath);
				if (!_lastPositions.ContainsKey (item.ThumbId))
					_lastPositions.Add (item.ThumbId, new PosStore ());
				_lastPositions [item.ThumbId].StorePos (attributes.Center);

			}
		}

		public override void PrepareForAnimatedBoundsChange (CGRect oldBounds)
		{
			var cellCount = (int)CollectionView.NumberOfItemsInSection (0);

			for (int i = 0; i < cellCount; i++) {
				var itemIndexPath = NSIndexPath.FromItemSection (i, 0);
				var item = (CollectionView.DataSource as DeckCollectionViewController).Tiles [itemIndexPath.Row];
				var attributes = LayoutAttributesForItem (itemIndexPath);
				if (!_lastPositions.ContainsKey (item.ThumbId))
					_lastPositions.Add (item.ThumbId, new PosStore ());
				_lastPositions [item.ThumbId].StorePos (attributes.Center);
			}
			base.PrepareForAnimatedBoundsChange (oldBounds);

		}

		public override UICollectionViewLayoutAttributes InitialLayoutAttributesForAppearingItem (NSIndexPath itemIndexPath)
		{
			var attributes = base.InitialLayoutAttributesForAppearingItem (itemIndexPath);

			var item = (CollectionView.DataSource as DeckCollectionViewController).Tiles [itemIndexPath.Row];

			attributes.Alpha = 1;
			attributes.Center = _lastPositions [item.ThumbId].LastPos;

			return attributes;
		}

		public override UICollectionViewLayoutAttributes FinalLayoutAttributesForDisappearingItem (NSIndexPath itemIndexPath)
		{
			var attributes = base.FinalLayoutAttributesForDisappearingItem (itemIndexPath);
			var cell = CollectionView.CellForItem (itemIndexPath) as DeckViewCell;
			cell.Layer.Hidden = true;
			cell.Layer.RemoveAllAnimations ();

			return attributes;
		}

		private class PosStore
		{
			private CGPoint _lastPos = CGPoint.Empty;
			private CGPoint _nextPos = new CGPoint (0, 0);

			public void StorePos (CGPoint pos)
			{
				_lastPos = _nextPos;
				_nextPos = pos;
			}

			public CGPoint LastPos {
				get {
					if (_lastPos == CGPoint.Empty)
						return _nextPos;
					return _lastPos;
				}
			}

			public CGPoint NextPos {
				get {
					return _nextPos;
				}
			}

		}

	}


}

