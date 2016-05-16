//
//  FlashCardViewController.swift
//  baby-flashcards
//
//  Created by Michael Ishmael on 14/05/2016.
//  Copyright © 2016 66Bytes. All rights reserved.
//

import Foundation
import UIKit
import CoreGraphics
import AVFoundation

class FlashCardViewController: UIViewController {
    
    
    private var _flashCard:FlashCard? = nil;
    private var _imageView:UIImageView;
    private var _cancelButton:UIButton;
    private var _itemSound:AVAudioPlayer? = nil;
    private var _eventHandler:IApplicationEventHandler;
    private var _sourceFrame:CGRect;
    
    init(coder:NSCoder, flashCard:FlashCard, sourceFrame:CGRect, eventHandler:IApplicationEventHandler ){
        super.init(coder: coder)!
        _flashCard = flashCard;
        _sourceFrame = sourceFrame
        _eventHandler = eventHandler
    }
    
    required init?(coder aDecoder: NSCoder) {
        fatalError("init(coder:) has not been implemented")
    }
    
    var sourceFrame:CGRect{
        get{
            return _sourceFrame;
        }
    }
    
    override func viewDidLoad() {
        super.viewDidLoad()
        _imageView = UIImageView(frame: self.view.bounds)
        let orientation = UIDevice.currentDevice().orientation
        let crop:FlashCardImageCrop;
        let xCassetName:String;
        
        if(orientation == UIDeviceOrientation.Portrait){
            crop = (_flashCard?.ImageDef[AspectRatio.Twelve16]!.portrait.crop)!
            xCassetName = (_flashCard?.ImageDef[AspectRatio.Twelve16]!.portrait.xCasset)!
        } else {
            crop = (_flashCard?.ImageDef[AspectRatio.Twelve16]!.landscape.crop)!
            xCassetName = (_flashCard?.ImageDef[AspectRatio.Twelve16]!.landscape.xCasset)!
        }
        
        _imageView.layer.contentsRect = CGRect(x: crop.X1, y: crop.Y1, width: crop.Width, height: crop.Height)
        _imageView.image = UIImage.init(contentsOfFile: xCassetName)
        
        _cancelButton = UIButton.init(type: UIButtonType.Custom);
        _cancelButton.frame = self.view.bounds;
        _cancelButton.addTarget(self, action: "cancelPressed", forControlEvents: .TouchUpInside)
        self.view.addSubview(_imageView)
        self.view.addSubview(_cancelButton)
        
        let songURL = NSURL.init(fileReferenceLiteral: "sounds/" + _flashCard!.Sound);
       
        //_itemSound = AVPlayer.init(URL: songURL)  //.init(contentsOfURL: <#T##NSURL#>, fileTypeHint: <#T##String?#>)
        do{
            _itemSound = try AVAudioPlayer.init(contentsOfURL: songURL, fileTypeHint: AVFileTypeMPEGLayer3)
            _itemSound!.volume = 7;
            //			_itemSound.FinishedPlaying += delegate {
            //				// backgroundMusic.Dispose();
            //				_itemSound = null;
            //			};
            _itemSound!.numberOfLoops=0;
            _itemSound!.play();
        } catch{
            
        }

        
        /*

        
        */
    }
    
    func cancelPressed(sender: UIButton){
        _itemSound?.stop()
    }
    
    override func viewDidAppear(animated: Bool) {
        _itemSound?.play()
    }


    
    /*
    
    public override void ViewDidAppear (bool animated)
    {
    //_imageView.SetImage(UIImage.FromBundle(_picPath), UIControlState.Normal);
    _itemSound.Play ();
    }
    
    public FlashCardViewController (FlashCard flashCard, CGRect sourceFrame, IApplicationEventHandler eventHandler)
    {
    _flashCard = flashCard;
    _eventHandler = eventHandler;
    _sourceFrame = sourceFrame;
    }
    
    public CGRect SourceFrame{
    get {
				return _sourceFrame;
    }
    }
    
    */
    
}
