using System;
using CoreGraphics;
using CoreAnimation;
using Foundation;
using UIKit;

namespace babyflashcards
{

	public class FlashCardViewControllerAnimatedTransitioning : UIViewControllerAnimatedTransitioning  {

		private IUIViewControllerContextTransitioning _transitionContext;
		private AnimDoneDelegate _animDoneDelegate;

		public bool Presenting { get; set; }

		public override double TransitionDuration (IUIViewControllerContextTransitioning transitionContext)
		{
			return 0.5;
		}

		public override void AnimateTransition (IUIViewControllerContextTransitioning transitionContext)
		{
			_transitionContext = transitionContext;

			var containerView = transitionContext.ContainerView;

			FlashCardViewController toViewController;
			UIViewController fromViewController;

			if (Presenting) {
				fromViewController = transitionContext.GetViewControllerForKey (UITransitionContext.FromViewControllerKey) as UIViewController;
				toViewController = transitionContext.GetViewControllerForKey (UITransitionContext.ToViewControllerKey) as FlashCardViewController;
			} else {
				toViewController = transitionContext.GetViewControllerForKey (UITransitionContext.FromViewControllerKey) as FlashCardViewController;
				fromViewController = transitionContext.GetViewControllerForKey (UITransitionContext.ToViewControllerKey) as UIViewController;
			}

			if(Presenting)
				containerView.AddSubview(toViewController.View);

			var originRect = toViewController.SourceFrame;

			var circleRect = new CGRect (originRect.GetMidX(), originRect.GetMidY(), 10, 10);

			var circleMaskPathInitial = UIBezierPath.FromOval(circleRect); //(ovalInRect: button.frame);
			var extremePoint = new CGPoint(circleRect.X - toViewController.View.Bounds.Width, circleRect.Y - toViewController.View.Bounds.Height ); //CGRect.GetHeight (toViewController.view.bounds));
			var radius = (float)Math.Sqrt((extremePoint.X * extremePoint.X) + (extremePoint.Y * extremePoint.Y));
			var largeCircleRect = circleRect.Inset (-radius, -radius);
			var circleMaskPathFinal = UIBezierPath.FromOval (largeCircleRect);

			CGPath fromPath;
			CGPath toPath;

			if (Presenting) {
				fromPath = circleMaskPathInitial.CGPath;
				toPath = circleMaskPathFinal.CGPath;
			} else {
				var path = new CGPath ();
				fromPath = circleMaskPathFinal.CGPath;
				toPath = circleMaskPathInitial.CGPath;
			}

			var maskLayer = new CAShapeLayer();
			maskLayer.Path = fromPath;
			if (Presenting) {
				toViewController.View.Layer.Mask = maskLayer;
			} else {
				toViewController.View.Layer.Mask = maskLayer;
			}

			var maskLayerAnimation = CABasicAnimation.FromKeyPath("path");
			maskLayerAnimation.From = ObjCRuntime.Runtime.GetNSObject(fromPath.Handle);
			maskLayerAnimation.To = ObjCRuntime.Runtime.GetNSObject(toPath.Handle);
			maskLayerAnimation.Duration = this.TransitionDuration(transitionContext);
			_animDoneDelegate = new AnimDoneDelegate (transitionContext);
			maskLayerAnimation.Delegate = _animDoneDelegate;
			maskLayer.AddAnimation(maskLayerAnimation, "path");

		}

		public override void AnimationEnded (bool transitionCompleted)
		{

		}

		private class AnimDoneDelegate : CAAnimationDelegate{

			private IUIViewControllerContextTransitioning _transitionContext;

			public AnimDoneDelegate(IUIViewControllerContextTransitioning transitionContext){
				_transitionContext = transitionContext;
			}

			public override void AnimationStopped (CAAnimation anim, bool finished)
			{
				_transitionContext.CompleteTransition (!_transitionContext.TransitionWasCancelled);
				var fromCont = _transitionContext.GetViewControllerForKey (UITransitionContext.ToViewControllerKey) as UIViewController;
				fromCont.View.Layer.Mask = null;
			}

		}

	}

}
