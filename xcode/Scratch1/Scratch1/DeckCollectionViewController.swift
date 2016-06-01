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
    
    private var _eventHandler:IApplicationEventHandler? = nil
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
        //fatalError("init(coder:) has not been implemented")
        super.init(coder: aDecoder)
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
    
    
    override func collectionView(collectionView: UICollectionView, numberOfItemsInSection section: Int) -> Int {
        return _tiles.count
    }
    
    override func collectionView(collectionView: UICollectionView, cellForItemAtIndexPath indexPath: NSIndexPath) -> UICollectionViewCell {
        let cell = self.collectionView?.dequeueReusableCellWithReuseIdentifier(deckViewCellId as String, forIndexPath: indexPath) as! DeckViewCell
        
        cell.layer.hidden = false;
        
        let tile = _tiles[indexPath.row]
        
        cell.setImagePath(tile.imageThumb)
        
        return cell;
    }

    override func collectionView(collectionView: UICollectionView, didDeselectItemAtIndexPath indexPath: NSIndexPath) {
        
        let item = _tiles[indexPath.row]
        let cell = self.collectionViewLayout.layoutAttributesForItemAtIndexPath(indexPath)
        _eventHandler?.deckSelected(item, frame: (cell?.frame)!)
        
    }
    
    override func collectionView(collectionView: UICollectionView, shouldSelectItemAtIndexPath indexPath: NSIndexPath) -> Bool {
        return true;
    }
    
    override func canBecomeFirstResponder() -> Bool {
        return true;
        
    }
    
    override func viewDidAppear(animated: Bool) {
        super.viewDidAppear(animated)
        self.resignFirstResponder()
    }
    
    override func motionEnded(motion: UIEventSubtype, withEvent event: UIEvent?) {
        super.motionEnded(motion, withEvent: event)
    }
    
    func jumble(){
        self.collectionView?.performBatchUpdates({
            self._tiles.shuffle()
            self.collectionView?.reloadSections(NSIndexSet(index: 0))
            }, completion: nil)
    }
 
    override func willRotateToInterfaceOrientation(toInterfaceOrientation: UIInterfaceOrientation, duration: NSTimeInterval) {
        super.willRotateToInterfaceOrientation(toInterfaceOrientation, duration: duration)
        //
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

extension Array{
   
    mutating func shuffle(){
        var n = self.count;
        while(n > 1){
            n--;
            var k = Int(arc4random_uniform(UInt32(n)) + 1)
            while(k == n){
                k = Int(arc4random_uniform(UInt32(n)) + 1)
            }
            let value = self[k];
            self[k] = self[n];
            self[n] = value;
        }
    }
    
}








