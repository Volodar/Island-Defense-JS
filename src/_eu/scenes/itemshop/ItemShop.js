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

EU.ItemShop = EU.ScrollMenu.extend({
    scaleFactor: null,
    removeScoreLayer: null,
    zeroPosition: null,

    ctor: function () {
        this._super();
        this.initExt();
        this.scaleFactor = 0;
        this.removeScoreLayer = false;
        this.zeroPosition = new cc.Point(0,0);
    },

    init: function()
    {
        var dessize = cc.director.getWinSize();
        this.setCascadeOpacityEnabled( true );
        this.setCascadeColorEnabled( true );
        //TODO: keyboard
        //this.setKeyboardEnabled( true );

        this.load_str( "ini/itemshop/itemshop.xml" );

        var bg = this.getChildByName( "bg" );
        if( bg )
        {
            var size = bg.getContentSize();
            size.width = Math.min( dessize.width, size.width );
            size.height += bg.getPositionY();
            this.scaleFactor = dessize.width / size.width;
            bg.setScale( this.scaleFactor );

            this.zeroPosition.x = dessize.width / 2;
            this.zeroPosition.y = size.height / 2 * this.scaleFactor - 10;
            this.setPosition( this.zeroPosition );
        }

        var grid = new cc.Size(0,0);
        content = new cc.Size(0,0);
        var items = [];
        items.push( "bonusitem_dynamit" );
        items.push( "bonusitem_ice" );
        items.push( "bonusitem_laser" );

        for( var i=0; i<items.length; ++i )
        {
            var itemname = items[i];
            var item = this.buildItem( itemname );
            this.addItem( item );

            item.setScale( this.scaleFactor );

            grid = item.getContentSize();
            grid.width *= this.scaleFactor;
            grid.height *= this.scaleFactor;
            content.width += grid.width;
            content.height = grid.height;
        }
        //TODO: Scroll menu
        var scissor = new cc.Size( dessize.width, 464 );
        this.setAlignedStartPosition( Point( -this.zeroPosition.x, -275 ) * this.scaleFactor );
        this.setGrisSize( grid );
        this.align( 99 );
        this.setScissorRect( this.getAlignedStartPosition(), scissor * this.scaleFactor );
        this.setScissorEnabled( true );
        this.setScrollEnabled( true );
        this.setContentSize( content );
        this.setAllowScrollByY( false );

        if( content.width < scissor.width )
        {
            var diff = scissor.width - content.width;
            var point = this.getAlignedStartPosition();
            point.x += diff / 2;
            this.setAlignedStartPosition( point );
            this.align( 99 );
        }

        var menu = this.getChildByName( "menu" );
        if( menu )
        {
            var close = menu.getChildByName( "close" );
            close.setCallback( this.cb_close, this );
            close.setScale( this.scaleFactor );
            var pos = close.getPosition();
            pos.y *= this.scaleFactor;
            pos.x = dessize.width / 2 - 35;
            close.setPosition( pos );
        }

        this.fadeenter();
        return true;
    },
    
    buildItem: function( itemname )
    {
        var item = EU.xmlLoader.load_node_from_file( "ini/itemshop/item.xml" );
        item.setName( itemname );
        item.setCallback( this.cb_buy, this, itemname );
    
        var conteiner = item.getChildByName( "conteiner" );
        var name = conteiner.getChildByName( "name" );
        var nodeMain = conteiner.getChildByName( "main" );
        var nodeInfo = conteiner.getChildByName( "info" );
        var info = nodeInfo ? nodeInfo.getChildByName( "text" ) : null;
        var icon = nodeMain ? nodeMain.getChildByName( "icon" ) : null;
        var buy = this.getNodeByPath( nodeMain, "menu/buy/normal/cost" );
        var buyButton = this.getNodeByPath( nodeMain, "menu/buy" );
        var infoButton = this.getNodeByPath( conteiner, "menu_info/info" );
        if( name )
        {
            var textid = itemname + "_name";
            name.setString( EU.Language.string( textid ) );
        }
        if( info )
        {
            textid = itemname + "_desc";
            info.setString( EU.Language.string( textid ) );
        }
        if( icon )
        {
            var image = "images/itemshop/" + itemname + ".png";
            EU.xmlLoader.setProperty_int(icon, EU.xmlKey.Image.var, image);
        }
        if( buy )
        {
            var cost = this.getCost( itemname );
            buy.setString( cost.toString() );
        }
        if( infoButton )
        {
            infoButton.setCallback( this.cb_info, this, itemname );
        }
        if( buyButton )
        {
            buyButton.setCallback( this.cb_buy, this, itemname );
        }
    
        return item;
    },
    cb_buy:function( itemname )
    {
        var cost = this.getCost( itemname );
        var score = EU.ScoreCounter.getMoney( kScoreCrystals );
    
        if( score < cost )
        {
            if(k.configuration.useInapps && EU.TutorialManager.dispatch( "itemshop_haventgold" ) )
            {
                this.cb_close( null );
                return;
            }
            else
            {
                var scene = EU.Common.getSceneOfNode( this );
                if( scene )
                {
                    var layer = scene.getMainLayer();
                    if( layer instanceof EU.MapLayer )
                        layer.cb_shop( null );
                    else if( layer instanceof EU.GameGS )
                    {
                        if( layer )
                            layer.menuShop(null, false);
                    }
                }
            }
        }
        else
        {
            var index = 0;
            if( itemname == "bonusitem_laser" ) index = 1;
            if( itemname == "bonusitem_ice" ) index = 2;
            if( itemname == "bonusitem_dynamit" ) index = 3;
    
            UserData.bonusitem_add( index, 1 );
            ScoreCounter.subMoney( kScoreCrystals, cost, true );
            //TODO: audio
            //AudioEngine.playEffect( kSoundShopPurchase );
            UserData.save();
    
            this.runFly( itemname );
        }
    
        TutorialManager.dispatch( "itemshop_buy" );
    },
    cb_info: function( itemname )
    {
        var item = this.getItemByName( itemname );
        if( !item )
            return;
        var conteiner = item.getChildByName( "conteiner" );
        var nodeMain = conteiner.getChildByName( "main" );
        var nodeInfo = conteiner.getChildByName( "info" );
        if( nodeMain ) nodeMain.setVisible( !nodeMain.isVisible() );
        if( nodeInfo ) nodeInfo.setVisible( !nodeInfo.isVisible() );
    },
    cb_close: function()
    {
        this.fadeexit();
    },

    fadeexit: function()
    {
        if( this.removeScoreLayer )
        {
            var scene = Director.getInstance().getRunningScene();
            var scores = scene.getChildByName( "scorelayer" );
            if( scores )
            {
                scores.removeFromParent();
            }
        }
        var dessize = cc.director.getWinSize();
        var action = EaseBackIn.create( MoveTo.create( 0.5, this.zeroPosition + Point( 0, -dessize.height ) ) );
        this.runAction( Sequence.create( action, RemoveSelf.create(), null) );
        //TODO: audio
        //AudioEngine.playEffect( kSoundShopHide );
    },
    fadeenter: function()
    {
        var dessize = cc.director.getWinSize();
        this.setPosition( this.zeroPosition + Point( 0, -dessize.height ) );
        var action = EaseBackOut.create( MoveTo.create( 0.5, this.zeroPosition ) );
        this.runAction( action );
        //TODO: audio
        //AudioEngine.playEffect( kSoundShopShow );

        var scene = Director.getInstance().getRunningScene();
        var score = scene.getChildByName( "scorelayer" );
        if( !score )
        {
            score = ScoreLayer.create();
            scene.addChild( score, 999 );
            this.removeScoreLayer = true;
        }
    },
    getCost: function( itemname )
    {
        var xmlnode = EU.pugixml.readXml( "ini/bonusitems.xml" );
        var root = xmlnode.firstElementChild;
        var itemXml = root.getElementsByTagName(itemname)[0];
        var cost = 0;
        if( itemXml )
            cost = EU.Common.strToInt( itemXml.getAttribute("cost") );
        return cost;
    },
    runFly: function( itemname )
    {
        var size = cc.director.getWinSize();
        //TODO: ScrollMenu call
        var item = this.getItemByName( itemname );
        var conteiner = item.getChildByName( "conteiner" );
        var nodeMain = conteiner.getChildByName( "main" );
        var icon = nodeMain ? nodeMain.getChildByName( "icon" ) : null;

        var pos = icon.convertToWorldSpace( Point.ZERO );

        xmlLoader.macros.set( "item", itemname );
        xmlLoader.macros.set( "centerx", ( size.width / 2 ).toString() );
        xmlLoader.macros.set( "centery", ( size.height / 2 ).toString() );
        xmlLoader.macros.set( "right", ( size.width ).toString() );
        xmlLoader.macros.set( "position", EU.Common.pointToStr( pos ) );

        var node = xmlLoader.load_node( "ini/itemshop/itemfly.xml" );
        var scene = EU.Common.getSceneOfNode( this );
        scene.addChild( node,9999 );

        xmlLoader.macros.erase( "centerx" );
        xmlLoader.macros.erase( "centery" );
        xmlLoader.macros.erase( "right" );
        xmlLoader.macros.erase( "position" );
    }
});

EU.NodeExt.call(EU.ItemShop.prototype);
