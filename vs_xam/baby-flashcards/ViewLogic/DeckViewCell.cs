using System;
using UIKit;
using CoreGraphics;
using Foundation;
using SpriteKit;
using CoreAnimation;

namespace babyflashcards
{
	public class DeckViewCell : UICollectionViewCell
	{
		private readonly UIImageView _imageView;

		[Export ("initWithFrame:")]
		public DeckViewCell (CGRect frame) : base (frame)
		{
			/*			ContentView.Layer.BorderColor = UIColor.LightGray.CGColor;
						ContentView.Layer.CornerRadius = 5;
						ContentView.Layer.MasksToBounds = true;
						ContentView.Layer.BorderWidth = 2.0f;
			ContentView.Transform = CGAffineTransform.MakeScale (0.8f, 0.8f); */

			ContentView.BackgroundColor = UIColor.Clear;
			ContentView.Opaque = false;

			_imageView = new UIImageView (frame);
			_imageView.ContentMode = UIViewContentMode.ScaleAspectFit;
			_imageView.ClipsToBounds = true;
			_imageView.Layer.MasksToBounds = true;
			_imageView.Center = ContentView.Center;
			_imageView.Opaque = false;

			//imageView.Transform = CGAffineTransform.MakeScale (0.7f, 0.7f);

			ContentView.AddSubview (_imageView);
		}

		public override CALayer Layer {
			get {
				base.Layer.Speed = 0.4f;
				return base.Layer;
			}
		}

		public String ImagePath {
			set {
				_imageView.Image = UIImage.FromBundle (value);;
			}
		}

	}
}

