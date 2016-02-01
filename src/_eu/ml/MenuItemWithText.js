/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolm_vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

var kNameText = "text";
var kNameText2 = "text2";
var kNameImageNormal = "normal";
var kNameImageSelected = "selected";
var kNameImageDisabled = "disabled";


EU.MenuItemImageWithText = cc.MenuItemImage.extend({
    _useScaleEffectOnSelected: true,
    _imageNormal: "",
    _imageSelected: "",
    _imageDisabled: "",
    _font: "",
    _text: "",
    _font2: "",
    _text2: "",
    _sound: "",
    _onClick: null,
    _labelNormal: null,
    _labelSelected: null,
    _labelDisabled: null,
    _labelNormal2: null,
    _labelSelected2: null,
    _labelDisabled2: null,

    ctor: function(){
        cc.MenuItemImage.prototype.ctor.call(this);
    },
    initWithNormalImage: function( normalImage, selectedImage, disabledImage, fontBMP, text, callback, target ){
        this.initWithCallback( callback, target );
        //EU.NodeExt.init();
        this.setCascadeColorEnabled(true);
        this.setCascadeOpacityEnabled(true);
        this.setImageNormal( normalImage );
        this.setImageSelected( selectedImage );
        this.setImageDisabled( disabledImage );
        this.setFont( fontBMP );
        this.setText( text );
        return true;
    },

    setCallback: function( callback, target ) {
        //var base = std::bind( &on_click, this, std::placeholders::_1 );
        cc.MenuItemImage.initWithCallback( callback, target );
        //_onClick = callback;
    },
    listenTexture: function( file ){
        var texture = cc.textureCache.getTextureForKey(file);
        if( texture ) {
            if (texture.isLoaded())
                this.locateImages();
            else
                texture.addEventListener("load", this.locateImages, this, texture);
        }
    },
    setImageNormal: function( file ) {
        if( this._imageNormal == file )
            return;
        this._imageNormal = file;
        var image = EU.ImageManager.sprite( this._imageNormal );
        this.setNormalImage( image );
        image.setName( kNameImageNormal );
        this.listenTexture(file);
    },
    setImageSelected: function( file ) {
        if( this._imageSelected == file )
            return;
        this._imageSelected = file;
        var image = EU.ImageManager.sprite( this._imageSelected );
        this.setSelectedImage( image );
        image.setName( kNameImageSelected );
        this.listenTexture(file);
    },
    setImageDisabled: function( file ) {
        if( this._imageDisabled == file )
            return;
        this._imageDisabled = file;
        var image = EU.ImageManager.sprite( this._imageDisabled );
        this.setDisabledImage( image );
        image.setName( kNameImageDisabled );
        this.listenTexture(file);
    },
    setText: function( string ) {
        if( this._text == string )
            return;
        this._text = string;
        this.buildText();
    },
    setFont: function( fontfile ) {
        if( this._font == fontfile )return;
        this._font = fontfile;
        this.buildText();
    },
    buildText: function() {
        if( this._font.empty() || this._text.empty() )
            return;
        var allocate = function( label, parent, menuitem )
        {
            assert( parent );

            var center = new cc.Point( parent.getContentSize().width / 2, parent.getContentSize().height / 2 );

            if( !label )
            {
                label = new cc.LabelBMFont(  menuitem._text, menuitem._font, -1, cc.TEXT_ALIGNMENT_LEFT, new cc.Point(0,0))
                parent.addChild( label );
                label.setName( kNameText );
            }
            else
            {
                label.setFntFile( menuitem._font );
                label.setString( menuitem._text, true );
            }
            label.setPosition( center );
        };

        if( this.getNormalImage() )allocate( this._labelNormal, this.getNormalImage(), this );
        if( this.getSelectedImage() )allocate( this._labelSelected, this.getSelectedImage(), this );
        if( this.getDisabledImage() )allocate( this._labelDisabled, this.getDisabledImage(), this );
    },
    setText2: function( string ) {
        if( this._text2 == string )return;
        this._text2 = string;
        this.buildText2();
    },
    setFont2: function( fontfile ) {
        if( this._font2 == fontfile )return;
        this._font2 = fontfile;
        this.buildText2();
    },
    buildText2: function() {
        if( this._font2.empty() || this._text2.empty() )
            return;
        var allocate = function( label2, parent, menuitem ) {
            assert( parent );

            var center = new cc.Point( parent.getContentSize().width / 2, parent.getContentSize().height / 2 );

            if( !label2 ) {
                var str = parent.getName();
                label2 = new cc.LabelBMFont(  menuitem._text, menuitem._font, -1, cc.TEXT_ALIGNMENT_LEFT, new cc.Point(0,0))
                parent.addChild( label2 );
                label2.setName( kNameText2 );
                label2.setAnchorPoint(new cc.Point(0.5, 0.5));
            }
            else {
                label2.setBMFontFilePath( menuitem_font2 );
                label2.setString( menuitem_text2 );
            }
            label2.setPosition( center );
        };

        if( this.getNormalImage() )allocate( this._labelNormal2, this.getNormalImage(), this );
        if( this.getSelectedImage() )allocate( this._labelSelected2, this.getSelectedImage(), this );
        if( this.getDisabledImage() )allocate( this._labelDisabled2, this.getDisabledImage(), this );
    },
    locateImages: function( texture ) {
        if( !this.getNormalImage() )
            return;

        if( texture == undefined || texture.isLoaded() == false )
            return;
        texture.removeEventListener("load", this );

        var center = new cc.Point( this.getNormalImage().getContentSize().width / 2, this.getNormalImage().getContentSize().height / 2 );

        var node = null;
        if( (node = this.getNormalImage()) ){
            node.setAnchorPoint( new cc.Point( 0.5, 0.5 ) );
            node.setPosition( center );
            node.setCascadeColorEnabled( true );
            node.setCascadeOpacityEnabled( true );
        }
        if( (node = this.getSelectedImage()) ) {
            node.setAnchorPoint( new cc.Point( 0.5, 0.5 ) );
            node.setPosition( center );
            node.setCascadeColorEnabled( true );
            node.setCascadeOpacityEnabled( true );
        }
        if( (node = this.getDisabledImage()) ) {
            node.setAnchorPoint( new cc.Point( 0.5, 0.5 ) );
            node.setPosition( center );
            node.setCascadeColorEnabled( true );
            node.setCascadeOpacityEnabled( true );
        }
    },
    on_click: function( sender ) {
        if( this._sound.empty() == false ) {
            //AudioEngine::shared().playEffect( _sound, false, 0 );
        }
        if( this._onClick )
            this._onClick( sender );
    },
    rect: function() {
        //MenuItem::rect();
        var result = new cc.Rect(this._position.x, this._position.y,
            this._contentSize.width, this._contentSize.height);

        var node = this.getNormalImage();
        if( node == null )
            node = this;
        var size = node.getContentSize();
        var pos = this.getPosition();
        var center = node.getAnchorPoint();
        result.origin = new cc.Point( -size.width * center.x, -size.height * center.y );
        result.origin += pos;
        result.size = size;

        return result;
    },
    selected: function() {
        cc.MenuItem.prototype.selected.call(this);

        if( this._useScaleEffectOnSelected ) {
            cc.ScaleTo
            var tag = 0x123;
            var actionN = new cc.EaseIn( new cc.ScaleTo( 0.3, 0.8 ), 2 );
            var actionS = actionN.clone();
            actionN.setTag( tag );
            actionS.setTag( tag );
            if( this.getNormalImage() ) {
                this.getNormalImage().stopActionByTag( tag );
                this.getNormalImage().runAction( actionN );
            }
            if( this.getSelectedImage() ) {
                this.getSelectedImage().stopActionByTag( tag );
                this.getSelectedImage().runAction( actionS );
            }
        }
    },
    unselected: function() {
        cc.MenuItem.prototype.unselected.call(this);

        if( this._useScaleEffectOnSelected ) {
            var  tag = 0x123;
            var actionN = new cc.EaseIn( new cc.ScaleTo( 0.2, 1.0 ), 2 );
            var actionS = actionN.clone();
            actionN.setTag( tag );
            actionS.setTag( tag );
            if( this.getNormalImage() ) {
                this.getNormalImage().stopActionByTag( tag );
                this.getNormalImage().runAction( actionN );
            }
            if( this.getSelectedImage() ) {
                this.getSelectedImage().stopActionByTag( tag );
                this.getSelectedImage().runAction( actionS );
            }
        }
    },
    setEnabled: function( bEnabled ) {
        if( this.isEnabled() == bEnabled )
            return;
        cc.MenuItem.prototype.setEnabled.call(this, bEnabled);
        this.switchAnimation();
    },
    onEnter: function() {
        cc.Node.prototype.onEnter.call(this);
        this.switchAnimation();
    },
    onExit: function() {
        cc.Node.prototype.onExit.call(this);
        this.switchAnimation();
    },
    setSound: function( sound ) {
        this._sound = sound;
    },
    switchAnimation: function() {
        return;
        //	stopActionByTag( kActionTagMenuItemImageWithText_Enabled );
        //
        //	if( isEnabled() )
        //	{
        //		float part = (CCRANDOM_MINUS1_1() * 0.1f + 1) / 2;
        //		float s = 1.05f + CCRANDOM_0_1() * 0.05f;
        //		float t0 = 1 * part;
        //		float t1 = 2 * part;
        //		float t2 = 1 * part;
        //
        //		var a0 = ScaleTo::create( t0, 1 * s, 1 / s );
        //		var a1 = ScaleTo::create( t1, 1 / s, 1 * s );
        //		var a2 = ScaleTo::create( t2, 1, 1 );
        //		var action = RepeatForever::create( Sequence::create( a0, a1, a2, null ) );
        //		runAction( action );
        //		action.setTag( kActionTagMenuItemImageWithText_Enabled );
        //	}
    }
});
EU.MenuItemImageWithText.call(EU.NodeExt_.prototype);

EU.MenuItemImageWithText.create = function(){
    var menuItem = new EU.MenuItemImageWithText();
    menuItem.initWithNormalImage("", "", "", "", "", null, null);
    return menuItem;
};
