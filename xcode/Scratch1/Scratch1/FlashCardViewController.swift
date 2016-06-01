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
    private var _imageView:UIImageView? = nil;
    private var _cancelButton:UIButton? = nil;
    private var _itemSound:AVAudioPlayer? = nil;
    private var _eventHandler:IApplicationEventHandler;
    private var _sourceFrame:CGRect;
    
    init(flashCard:FlashCard?, sourceFrame:CGRect, eventHandler:IApplicationEventHandler ){
        _flashCard = flashCard;
        _sourceFrame = sourceFrame
        _eventHandler = eventHandler
        super.init(nibName: nil, bundle: nil )
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
        self.view.backgroundColor = UIColor.whiteColor()
        self.prefersStatusBarHidden()
        _imageView = UIImageView(frame: self.view.bounds)
        setImageFromOrientation()
        _cancelButton = UIButton.init(type: UIButtonType.Custom);
        _cancelButton!.frame = self.view.bounds;
        _cancelButton!.addTarget(self, action: Selector("cancelPressed:"), forControlEvents: .TouchUpInside)
        self.view.addSubview(_imageView!)
        self.view.addSubview(_cancelButton!)
        
        let songURL = NSURL.init(fileReferenceLiteral: _flashCard!.sound);
       
        //_itemSound = AVPlayer.init(URL: <#T##NSURL#>) //.init(contentsOfURL: <#T##NSURL#>, fileTypeHint: <#T##String?#>)
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


    }
    
    override func prefersStatusBarHidden() -> Bool {
        return true
    }
    
    
    func setImageFromOrientation(){
        let orientation = UIDevice.currentDevice().orientation
        let crop:FlashCardImageCrop;
        let xCassetName:String;
        
        if(orientation == UIDeviceOrientation.Portrait){
            crop = (_flashCard?.imageDef[AspectRatio.Nine16]!.portrait.crop)!
            xCassetName = (_flashCard?.imageDef[AspectRatio.Nine16]!.portrait.xCasset)!
        } else {
            crop = (_flashCard?.imageDef[AspectRatio.Nine16]!.landscape.crop)!
            xCassetName = (_flashCard?.imageDef[AspectRatio.Nine16]!.landscape.xCasset)!
        }

        _imageView!.frame = self.view.bounds;
        _imageView!.layer.contentsRect = //CGRect(x: 0.1, y: 0.1, width: 0.6, height: 0.7)
            CGRect(x: crop.X1, y: crop.Y1, width: crop.X1 + crop.Width, height: crop.Y1 + crop.Height)
        _imageView!.image = UIImage.init(named: xCassetName)
    }
    
    override func viewWillTransitionToSize(size: CGSize, withTransitionCoordinator coordinator: UIViewControllerTransitionCoordinator) {
        coordinator.animateAlongsideTransition({
            _ in
            self.setImageFromOrientation()
            }, completion: {
            _ in
            
           
        })
    }
    
    func cancelPressed(sender: UIButton!){
        _eventHandler.flashCardDismissed()
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
