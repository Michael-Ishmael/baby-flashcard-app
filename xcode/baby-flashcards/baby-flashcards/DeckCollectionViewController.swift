//
//  DeckCollectionViewController.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 16/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation
import UIKit

class DeckCollectionViewController : UICollectionViewController {
    
    let deckViewCellId:NSString = NSString.init(string: "DeckViewCell");
    
    private var _eventHandler:IApplicationEventHandler
    private var _tiles:[DeckViewData] = [];
    
    init (layout:UICollectionViewLayout, cardSet:FlashCardSet, eventHandler:IApplicationEventHandler)
    {
        _eventHandler = eventHandler;
        super.init(collectionViewLayout: layout)
        
        for deck in cardSet.decks{
            _tiles.append(DeckViewData(deck: deck))
        }
    }

    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    var tiles:[DeckViewData] {
        get {
            return _tiles;
        }
    }
    
    override func prefersStatusBarHidden() -> Bool {
        return true
    }
    
    override func viewDidLoad ()
    {
        super.viewDidLoad ();

        super.collectionView?.registerClass(DeckViewCell.self, forCellWithReuseIdentifier: deckViewCellId as String)
        super.collectionView!.backgroundView = UIView.init(frame: self.collectionView!.bounds);
        super.collectionView!.backgroundView!.backgroundColor = UIColor.whiteColor()
        UIMenuController.sharedMenuController().menuItems = [
                    UIMenuItem.init(title: "Custom", action: Selector.init("custom"))
        ];
    }

    override func numberOfSectionsInCollectionView(collectionView: UICollectionView) -> Int {
        return 1;
    }
    
    func getItemsCount() -> Int{
        return _tiles.count
    }


//    
//    public override UICollectionViewCell GetCell (UICollectionView collectionView, NSIndexPath indexPath)
//    {
//    var tilePictureCell = (DeckViewCell)collectionView.DequeueReusableCell (deckViewCellId, indexPath);
//    tilePictureCell.Layer.Hidden = false;
//    
//    var tile = _tiles [indexPath.Row];
//    
//    tilePictureCell.ImagePath = tile.ImageThumb;
//    
//    return tilePictureCell;
//    }
    
    
    
}
