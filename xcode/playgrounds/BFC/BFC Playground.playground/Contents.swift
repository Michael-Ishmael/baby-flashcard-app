import UIKit
import XCPlayground


XCPlaygroundPage.currentPage.needsIndefiniteExecution = true
print("hi")

DataManager.getTopAppsDataFromFileWithSuccess { (data) -> Void in
    
    var json: [String: AnyObject]!
    
    // 1
    do {
        json = try NSJSONSerialization.JSONObjectWithData(data, options: []) as? [String: AnyObject]
    } catch {
        print(error)
        XCPlaygroundPage.currentPage.finishExecution()
    }
    
    // 2
    guard let appData = AppData(json: json) else {
        print("Error initializing object")
        XCPlaygroundPage.currentPage.finishExecution()
    }
    
    // 3
    guard let firstItem = appData.deckSets.first?.name else {
        print("No such item")
        XCPlaygroundPage.currentPage.finishExecution()
    }
    
    // 4
    print(firstItem)
    
    XCPlaygroundPage.currentPage.finishExecution()
    
}
