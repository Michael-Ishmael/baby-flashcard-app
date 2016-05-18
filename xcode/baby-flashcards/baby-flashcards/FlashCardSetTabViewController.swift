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
    var _appData:AppData
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    init (appData:AppData)
    {
        _appData = appData;
        super.init(nibName: nil, bundle: nil)

        
        for cardSet in _appData.deckSets{
            let layout = getFlowLayout()
            let collectionController = DeckCollectionViewController(layout: layout, cardSet: cardSet, eventHandler: self as IApplicationEventHandler)
            collectionController.collectionView?.contentInset = UIEdgeInsets.init(top: 0, left: 0, bottom: 0, right: 0)
            collectionController.tabBarItem = UITabBarItem();
            let tbi = collectionController.tabBarItem;
            tbi.imageInsets = UIEdgeInsets.init(top: 6, left: 0, bottom: -6, right: 0)
            tbi.image = UIImage.init(imageLiteral: cardSet.icon)
            _collectionControllers.append(collectionController)
        }
    
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
        _pictureController = FlashCardViewController(flashCard: tile.getNextFlashCard(), sourceFrame: frame, eventHandler: self as IApplicationEventHandler)
//        var tr = new FlashCardViewTransitioningDelegate ();
//        _pictureController.TransitioningDelegate = tr;
        
        self.presentViewController(_pictureController!, animated: true, completion: nil);
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
    

