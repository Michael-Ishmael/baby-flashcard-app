//
//  JumbleFlowLayout.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 13/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation
import UIKit

class DeckCollectionViewController: UICollectionViewController {
    var tiles:[Int] = []
}

class JumbleFlowLayout : UICollectionViewFlowLayout {
    
    var _lastPositions = [Int: PosStore]()
    
    
    override func prepareLayout() {
        super.prepareLayout()
        if let cellCount =  collectionView?.numberOfItemsInSection(0) {
            for i in 0...cellCount {
                let itemIndexPath = NSIndexPath(forItem: i, inSection: 0)
                var item = collectionView?.dataSource.Tiles[itemIndexPath.Row]; //DeckCollectionViewController
                var attributes = LayoutAttributesForItem (itemIndexPath);
                if (!_lastPositions.ContainsKey (item.ThumbId))
                _lastPositions.Add (item.ThumbId, new PosStore ());
                _lastPositions [item.ThumbId].StorePos (attributes.Center);
                
            }
        }
        

    }
    
    
    
    class PosStore
    {
        var _lastPos:CGPoint? = nil
        var nextPos:CGPoint = CGPoint (x: 0, y: 0);
    
        func storePos(pos:CGPoint) {
            _lastPos = nextPos;
            nextPos = pos;
        }
        
        var lastPos: CGPoint {
            get{
                if(_lastPos == nil){
                    return nextPos;
                }
                return _lastPos!;
            }
        }
        
    }
    
}
