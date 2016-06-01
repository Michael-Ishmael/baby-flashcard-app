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
    var _firstRun = false;
    var _hold = false
    
    override func prepareLayout() {
        super.prepareLayout()
        if(!_firstRun){
            calculatePositions()
            _firstRun = true;
        }
        
    }
    
    private func calculatePositions(){
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
    
    internal func doneRotation(){
        _lastPositions = [Int: PosStore]()
        calculatePositions()
        _hold = false;
    }
    
    override func prepareForCollectionViewUpdates(updateItems: [UICollectionViewUpdateItem]) {
        calculatePositions()
        super.prepareForCollectionViewUpdates(updateItems)
    }
    
    override func invalidateLayout() {
        super.invalidateLayout()
        //calculatePositions()
    }
    
    override func prepareForAnimatedBoundsChange(oldBounds: CGRect) {
        //calculatePositions()
        super.prepareForAnimatedBoundsChange(oldBounds)
        _hold = true;
    }
    
    override func initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath: NSIndexPath) -> UICollectionViewLayoutAttributes? {
        
        let attributes = super.initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath)
        
        if(_hold) { return attributes};
        
        let item = (self.collectionView?.dataSource as! DeckCollectionViewController).tiles[itemIndexPath.row]
        attributes?.alpha = 1
        attributes?.center = (_lastPositions[item.thumbId]?.lastPos)!
        
        return attributes
        
    }
    
    override func finalLayoutAttributesForDisappearingItemAtIndexPath(itemIndexPath: NSIndexPath) -> UICollectionViewLayoutAttributes? {
        
        let attributes = super.initialLayoutAttributesForAppearingItemAtIndexPath(itemIndexPath)
        
        if(_hold) { return attributes};
        
        let cell = self.collectionView?.cellForItemAtIndexPath(itemIndexPath) as! DeckViewCell
        cell.layer.hidden = true;
        cell.layer.removeAllAnimations()
        
        return attributes
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
