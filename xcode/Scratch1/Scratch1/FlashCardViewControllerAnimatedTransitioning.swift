//
//  FlashCardViewControllerAnimatedTransitioning.swift
//  Scratch1
//
//  Created by Michael Ishmael on 21/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation
import CoreGraphics;
import UIKit;

public class FlashCardViewTransitioningDelegate : NSObject, UIViewControllerTransitioningDelegate
{
    
    public func animationControllerForPresentedController(presented: UIViewController, presentingController presenting: UIViewController, sourceController source: UIViewController) -> UIViewControllerAnimatedTransitioning? {
        return FlashCardViewControllerAnimatedTransitioning(presenting: true)
    }
    
}


public class FlashCardViewControllerAnimatedTransitioning : NSObject, UIViewControllerAnimatedTransitioning  {
    
    private var _transitionContext:UIViewControllerContextTransitioning?;
    private var  _animDoneDelegate:AnimDoneDelegate?;
    
    public var presenting:Bool
    
    public init(presenting:Bool) {
        self.presenting = presenting;
    }
    
    
    @objc public func transitionDuration(transitionContext: UIViewControllerContextTransitioning?) -> NSTimeInterval {
        return NSTimeInterval(0.5)
    }
    
    
    @objc public func animateTransition(transitionContext: UIViewControllerContextTransitioning) {
        
        _transitionContext = transitionContext;
    
        let containerView = transitionContext.containerView();
    
        let toViewController:FlashCardViewController?;
        //let fromViewController:UIViewController;
    
        if (self.presenting) {
				//fromViewController = transitionContext.viewControllerForKey(UITransitionContextFromViewKey)!   as UIViewController;
				toViewController = transitionContext.viewControllerForKey (UITransitionContextToViewKey) as? FlashCardViewController;
        } else {
                    toViewController = transitionContext.viewControllerForKey(UITransitionContextFromViewKey) as? FlashCardViewController;
                 //   fromViewController = transitionContext.viewControllerForKey(UITransitionContextToViewControllerKey)! as UIViewController;
        }
        
        if toViewController == nil {
            return
        }
    
        if self.presenting{
            containerView!.addSubview(toViewController!.view);
        }
				
    
    let originRect = toViewController!.sourceFrame;
    let circleRect = CGRect(x: originRect.midX, y: originRect.midY, width: 10, height: 10);
    
    let circleMaskPathInitial = UIBezierPath.init(ovalInRect: circleRect); //(ovalInRect: button.frame);
    let extremePoint = CGPoint(x: circleRect.minX - toViewController!.view.bounds.width, y:circleRect.minY - toViewController!.view.bounds.height ); //CGRect.GetHeight (toViewController.view.bounds));
    let radius = Float(sqrt((extremePoint.x * extremePoint.x) + (extremePoint.y * extremePoint.y)));
    let largeCircleRect = circleRect.insetBy(dx: CGFloat(-radius), dy: CGFloat(-radius))
    let circleMaskPathFinal = UIBezierPath.init(ovalInRect: largeCircleRect)
        
    var fromPath:CGPath
    var toPath:CGPath
    
    if (presenting) {
        fromPath = circleMaskPathInitial.CGPath;
        toPath = circleMaskPathFinal.CGPath;
    } else {
        fromPath = circleMaskPathFinal.CGPath;
        toPath = circleMaskPathInitial.CGPath;
    }
    
    let maskLayer = CAShapeLayer();
    maskLayer.path = fromPath;
    if (presenting) {
        toViewController!.view.layer.mask = maskLayer;
    } else {
        toViewController!.view.layer.mask = maskLayer;
    }
    
    let maskLayerAnimation = CABasicAnimation.init(keyPath: "path")
    maskLayerAnimation.fromValue = fromPath;
    maskLayerAnimation.toValue = toPath;
    maskLayerAnimation.duration = self.transitionDuration(transitionContext);
    _animDoneDelegate = AnimDoneDelegate.init(transitionContext: transitionContext);
    maskLayerAnimation.delegate = _animDoneDelegate;
    maskLayer.addAnimation(maskLayerAnimation, forKey: "path");
    
    }
    
    @objc public func animationEnded(transitionCompleted: Bool) {
    
    }
    
}

class AnimDoneDelegate : CAAnimation {
    
    private let _transitionContext:UIViewControllerContextTransitioning
    
    init(transitionContext:UIViewControllerContextTransitioning){
        _transitionContext = transitionContext;
        super.init()
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
     func animationStopped ( anim:CAAnimation, finished:Bool)
    {
        _transitionContext.completeTransition (!_transitionContext.transitionWasCancelled());
        let fromCont = _transitionContext.viewControllerForKey (UITransitionContextToViewControllerKey)! as UIViewController;
    fromCont.view.layer.mask = nil;
    }
    
}



