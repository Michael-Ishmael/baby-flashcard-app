//
//  JumbleFlowLayout.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 13/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation
import UIKit

class JumbleFlowLayout : UICollectionViewFlowLayout {
    
    var _lastPositions = [Int: PosStore]()
    
    
    override func prepareLayout() {
        super.prepareLayout()
        if let cellCount =  collectionView?.numberOfItemsInSection(0) {
            for i in 0...(cellCount-1) {
                let itemIndexPath = NSIndexPath(forItem: i, inSection: 0)
                let item = (collectionView?.dataSource as! DeckCollectionViewController!).tiles[itemIndexPath.row]
                let attributes = self.layoutAttributesForItemAtIndexPath(itemIndexPath)
                
                if _lastPositions[item.thumbId] == nil {
                    _lastPositions[item.thumbId] = PosStore()
                }
                if let centerPos = attributes?.center {
                    _lastPositions [item.thumbId]?.storePos (centerPos);
                }
                
                
                
                
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
