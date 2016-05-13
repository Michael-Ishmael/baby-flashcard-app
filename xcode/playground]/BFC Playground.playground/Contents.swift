import UIKit


class Shape {
    var numSides: Int {
        didSet {
            numSideSquare =  numSides * numSides
        }
    }
    
    var numSideSquare: Int
    
    init?(numSides: Int){
        self.numSides = numSides
        self.numSideSquare = numSides * numSides
    }
    
    func giveDesc() -> String{
        return "A shape with \(numSides) sides"
    }
}

var shape: Shape? //= Shape(numSides: 6)

print(shape?.numSideSquare)

extension String {
    var firstLetter:Character {
        return self.characters.first!
    }
}

"Dave".firstLetter

var view = UIImage(contentsOf "DonkeyThumb.png")

