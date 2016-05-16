//
//  DeckViewData.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 13/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation


enum AspectRatio
{
    case Nine16, Twelve16
}

enum ImageOrientation
{
    case Landscape, Portrait
}

enum ImageType
{
    case Combined, Split
}


struct FlashCardImageCrop
{
    var X1:Double
    var X2:Double
    var Y1:Double
    var Y2:Double
    
    var Width:Double{
        get{
            return X2 - X1
        }
    }
    
    var Height:Double{
        get{
            return Y2 - Y1
        }
    }
}


struct ImgSrc
{
    var xCasset:String
    var crop:FlashCardImageCrop
}

struct ImageFormatDef
{
    var landscape:ImgSrc
    var portrait:ImgSrc
    var imageType:ImageType
}

class FlashCard
{
    var Id:Int = 0
    var Index:Int = 0
    var Sound:String = ""
    var ImageDef:[AspectRatio: ImageFormatDef] = [:]
}

class FlashCardDeck {
    
    var id:Int = 0
    var name:String = ""
    var thumb:String = ""
    var cards:[FlashCard] = []
}

class FlashCardSet {
    
    var id:Int = 0
    var name:String = ""
    var icon:String = ""
    var decks:[FlashCardDeck] = []
}

class AppData {
    var deckSets:[FlashCardSet] = []
}

class DeckViewData
{
    var _index = -1;
    var  _deck:FlashCardDeck;
    
    init (deck:FlashCardDeck)
    {
        _deck = deck;
    }
    
    var caption:String {
        get {
            return _deck.name;
        }
    }
    
    var imageThumb:String {
        get {
            return _deck.thumb
        }
    }
    
    var thumbId:Int {
        return _deck.id;
    }
    
    func getNextFlashCard() -> FlashCard?{
        if _deck.cards.count > 0 {
            incrementIndex()
            return _deck.cards[_index]
        } else {
            return nil
        }
    }
    
    func incrementIndex() {
        if (_index == _deck.cards.count - 1) {
            _index = 0
        } else {
            _index++
        }
    }

}
