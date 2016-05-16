//
//  FlashCardSetTabViewController.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 13/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation
import UIKit

protocol IApplicationEventHandler
{
    func deckSelected(tile:DeckViewData, frame:CGRect);
    func flashCardDismissed();
}


class FlashCardSetTabViewController : UITabBarController, IApplicationEventHandler
{
    var _collectionControllers:[UICollectionViewController] = []
    var _pictureController:UIViewController?
    var _clickCount = 0
    var _appData = ""
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    required init? (coder aDecoder: NSCoder, appData:String)
    {
        super.init(coder: aDecoder)
        _appData = appData;
    
//    foreach (var cardSet in _appData.DeckSets) {
//				var layout = GetFlowLayout ();
//				var collectionController = new DeckCollectionViewController(layout, cardSet, this);
//				collectionController.CollectionView.ContentInset = new UIEdgeInsets (0, 0, 0, 0);
//				collectionController.TabBarItem = new UITabBarItem ();
//				collectionController.TabBarItem.ImageInsets = new UIEdgeInsets(6, 0, -6, 0);
//				collectionController.TabBarItem.Image = UIImage.FromBundle (cardSet.Icon);
//				_collectionControllers.Add(collectionController);
//    }
    
    /*
    var secondTab = new UIViewController ();
    secondTab.View.BackgroundColor = UIColor.Gray;
    secondTab.TabBarItem = new UITabBarItem ();
    secondTab.TabBarItem.ImageInsets = new UIEdgeInsets(6, 0, -6, 0);
    secondTab.TabBarItem.Image = UIImage.FromBundle ("lionIcon.png");
    */
        self.viewControllers = _collectionControllers;
    
    }
    
    func getFlowLayout() -> JumbleFlowLayout{
    
        let flowLayout = JumbleFlowLayout ()
    
            //HeaderReferenceSize = new CGSize (4, 50),
        flowLayout.sectionInset = UIEdgeInsets (top: 20,left: 10,bottom: 4,right: 10);
        flowLayout.scrollDirection = UICollectionViewScrollDirection.Vertical;
        flowLayout.minimumInteritemSpacing = 4; // minimum spacing between cells
        flowLayout.minimumLineSpacing = 4 // minimum spacing between rows if ScrollDirection is Vertical or between columns if Horizontal
        flowLayout.itemSize = CGSize(width: 114, height: 140)
    
        return flowLayout;
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return true
    }
    
    func deckSelected(tile:DeckViewData, frame:CGRect){
        //_pictureController = FlashCardV
//        _pictureController = new FlashCardViewController (tile.GetNextFlashCard(), frame, this);
//        var tr = new FlashCardViewTransitioningDelegate ();
//        _pictureController.TransitioningDelegate = tr;
        
        self.presentViewController(_pictureController, animated: true, completion: nil);
        _clickCount+=1;
    }
    
    func flashCardDismissed() {
        dismissViewControllerAnimated(true, completion: checkAndJumble)
    }
    
    func checkAndJumble(){
        if _clickCount >= 5 {
            _clickCount = 0;
            (selectedViewController as! DeckCollectionViewController).jumble();
        }
    }

    
    //_pictureController.RemoveFromParentViewController();
    }
    

