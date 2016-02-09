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

//Define namespace
var EU = EU || {};

EU.MenuItemTextBG = cc.MenuItemLabel.extend({

    /** @type {cc.Color} */ m_bgColor : null,
    /** @type {cc.LabelTTF} */ m_label : null,
    /** @type {cc.Point} */ m_borders : null,
    /** @type {cc.Sprite} */ m_bg : null,
    /** @type {MenuItem} */ _shop : null,

    g_menuItemImageWithTextCount: 0,

    ctor: function(text, colorBG,  colorText,  callback)
    {
        cc.log("MenuItemTextBG.create");
        this._super();

        if ( ! this.initWithText(text, colorBG, colorText, callback) )
        {
            return null;
        }
        //CC_SAFE_DELETE(ptr);
        return this;
    },
    
    initWithText: function(text, colorBG,  colorText,  callback)
    {
        cc.log("MenuItemTextBG.initWithText");
        this.m_label = new cc.LabelTTF( text, "Arial", 16 );
        if ( !this.m_label )
            return false;
        if( !this.initWithLabel( this.m_label, callback, null ) )
            return false;
        this.m_label.setColor( colorText );
    
        this.m_bg = EU.ImageManager.sprite( EU.kPathSpriteSquare );
        this.m_bg.setAnchorPoint( cc.POINT_ZERO );
        this.m_bg.setColor( new cc.Color( colorBG.r * 255, colorBG.g * 255, colorBG.b * 255 ) );
        this.m_bg.setOpacity( colorBG.a * 255 );
        this.addChild( this.m_bg, -1 );
    
        this.setText( text );
        return true;
    },
    
    setBorders: function(x, y)
    {
        cc.log("MenuItemTextBG.setBorders");
        this.m_borders = cc.p(x, y);
    },
    
    setText: function(text )
    {
        cc.log("MenuItemTextBG.setText");
        this.m_label.setString( text );
        var size = this.m_label.getContentSize();
        this.m_bg.setScale( size.width, size.height );
    }

});

