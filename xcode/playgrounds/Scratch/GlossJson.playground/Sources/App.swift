import Foundation

public struct App: Decodable {
    
    // 1
    public let name: String
    public let link: String
    
    public init?(json: JSON) {
        // 2
        guard let container: JSON = "im:name" <~~ json,
            let id: JSON = "id" <~~ json
            else { return nil }
        
        guard let name: String = "label" <~~ container,
            link: String = "label" <~~ id
            else { return nil }
        
        self.name = name
        self.link = link
    }
    
}