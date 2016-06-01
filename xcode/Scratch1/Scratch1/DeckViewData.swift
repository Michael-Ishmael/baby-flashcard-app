//
//  DeckViewData.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 13/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation



public enum AspectRatio : String
{
    case Nine16 = "nine16"
    case Twelve16 = "twelve16"

}

public enum ImageOrientation : String
{
    case Landscape = "landscape"
    case Portrait = "portrait"
}

public enum ImageType : String
{
    case Combined = "combined"
    case Split = "split"
}


public struct FlashCardImageCrop : Decodable
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
    
    public init?(json: JSON) {
        
        guard let x1:Double = "x1" <~~ json,
            let x2:Double = "x2" <~~ json,
            let y1:Double = "y1" <~~ json,
            let y2:Double = "y2" <~~ json
            else {
                return nil
        }
        
        self.X1 = x1
        self.X2 = x2
        self.Y1 = y1
        self.Y2 = y2
        
    }
}


public struct ImgSrc : Decodable
{
    var xCasset:String
    var crop:FlashCardImageCrop?
    
    public init?(json: JSON) {
        
        guard let xCasset:String = "xcasset" <~~ json
            else {
                return nil
        }
        
        self.xCasset = xCasset
        self.crop = "crop" <~~ json
    }
}

public struct ImageFormatDef : Decodable
{
    var landscape:ImgSrc
    var portrait:ImgSrc
    var imageType:ImageType
    
    public init?(json: JSON) {
        
        guard let landscape:ImgSrc = "landscape" <~~ json,
            portrait:ImgSrc = "portrait" <~~ json,
            imageType:ImageType = "imagetype" <~~ json
            else {
                return nil
        }
        
        self.landscape = landscape
        self.portrait = portrait
        self.imageType = imageType
    }
}

public struct FlashCard : Decodable
{
    var id:Int = 0
    var index:Int = 0
    var sound:String = ""
    var imageDef:[AspectRatio: ImageFormatDef] = [:]
    
    public init?(json: JSON) {
        guard let id:Int = "id" <~~ json,
            index:Int = "index" <~~ json,
            sound:String = "sound" <~~ json,
            imageDef:[String: ImageFormatDef] = "imagedef" <~~ json
            else {
                return nil
        }
        
        self.id = id
        self.index = index
        self.sound = sound
        self.imageDef = Dictionary(imageDef.map { (key, value) in (
            AspectRatio(rawValue: key)!, value)
            })    }
    
}

extension Dictionary {
    init(_ pairs: [Element]) {
        self.init()
        for (k, v) in pairs {
            self[k] = v
        }
    }
}


public struct FlashCardDeck : Decodable {
    
    var id:Int = 0
    var name:String = ""
    var thumb:String = ""
    var cards:[FlashCard] = []
    
    public init?(json: JSON) {
        guard let id:Int = "id" <~~ json,
            name:String = "name" <~~ json,
            thumb:String = "thumb" <~~ json,
            cards:[FlashCard] = "cards" <~~ json
            else {
                return nil
        }
        
        self.id = id
        self.name = name
        self.thumb = thumb
        self.cards = cards
    }
}

public struct FlashCardSet : Decodable {
    
    public var id:Int = 0
    public var name:String = ""
    public var icon:String = ""
    public var decks:[FlashCardDeck] = []
    
    public init?(json: JSON) {
        guard let id:Int = "id" <~~ json,
            name:String = "name" <~~ json,
            icon:String = "icon" <~~ json,
            decks:[FlashCardDeck] = "decks" <~~ json
            else {
                return nil
        }
        
        self.id = id
        self.name = name
        self.icon = icon
        self.decks = decks
    }
}

public struct AppData : Decodable {
    public var deckSets:[FlashCardSet] = []
    
    public init?(json: JSON) {
        guard let deckSets:[FlashCardSet] = "decksets" <~~ json
            else {
                return nil
        }
        
        self.deckSets = deckSets
        
    }
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
        if (_index == 1) { // _deck.cards.count - 1) {
            _index = 0
        } else {
            _index++
        }
    }

}
