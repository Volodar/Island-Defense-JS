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
/**TESTED**/
EU.ItemShop = EU.ScrollMenu.extend({

    /** Test instance of */
    __ItemShop : true,


    scaleFactor: null,
    removeScoreLayer: null,
    zeroPosition: null,

    ctor: function () {
        this._super();
        this.initExt();
        this.scaleFactor = 0;
        this.removeScoreLayer = false;
        this.zeroPosition = cc.p(0,0);
        this.init();
    },

    init: function()
    {
        EU.ScrollMenu.prototype.init.call(this);
        var dessize = cc.view.getDesignResolutionSize();
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

        var grid = cc.size(0,0);
        var content = cc.size(0,0);
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
        var visible = cc.size( dessize.width, 464 );
        var asp = cc.p( -this.zeroPosition.x * this.scaleFactor, -275 * this.scaleFactor );
        this.setAlignedStartPosition( asp );
        this.setGrisSize( grid );
        this.align( 99 );
        this.setVisibleRect( cc.rect(asp.x, asp.y, visible.width * this.scaleFactor, visible.height * this.scaleFactor ) );
        this.setContentSize( content );
        this.setAllowScrollByY( false );

        if( content.width < visible.width )
        {
            var diff = visible.width - content.width;
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
        var buy = EU.Common.getNodeByPath( nodeMain, "menu/buy/normal/cost" );
        var buyButton = EU.Common.getNodeByPath( nodeMain, "menu/buy" );
        var infoButton = EU.Common.getNodeByPath( conteiner, "menu_info/info" );
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
            EU.xmlLoader.setProperty_int(icon, EU.xmlKey.Image.int, image);
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
    cb_buy:function( item )
    {
        var itemname = item.getName();
        var cost = this.getCost( itemname );
        var score = EU.ScoreCounter.getMoney( EU.kScoreCrystals );
    
        if( score < cost )
        {
            if(EU.k.useInapps && EU.TutorialManager.dispatch( "itemshop_haventgold" ) )
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
                    if( layer.__MapLayer )
                        layer.cb_shop( null );
                    else if( layer.__GameGS )
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
    
            EU.UserData.bonusitem_add( index, 1 );
            EU.ScoreCounter.subMoney( EU.kScoreCrystals, cost, true );
            EU.AudioEngine.playEffect( EU.kSoundShopPurchase );
            //EU.UserData.save();
    
            this.runFly( itemname );
        }
    
        EU.TutorialManager.dispatch( "itemshop_buy" );
    },
    cb_info: function( item )
    {
        var itemname = item.getParent().getParent().getParent().getName();
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
            var scene = cc.director.getRunningScene();
            var scores = scene.getChildByName( "scorelayer" );
            if( scores )
            {
                EU.removeFromParent(scores, true);
            }
        }
        var dessize = cc.view.getDesignResolutionSize();
        var action = cc.moveTo( 0.5, cc.p(this.zeroPosition.x, this.zeroPosition.y-dessize.height )).easing(cc.easeBackIn());
        this.runAction( cc.sequence( action, cc.callFunc(EU.removeFromParent.bind(this, this, true))) );
        EU.AudioEngine.playEffect( EU.kSoundShopHide );
    },
    fadeenter: function()
    {
        var dessize = cc.view.getDesignResolutionSize();
        this.setPosition( cc.p(this.zeroPosition.x, this.zeroPosition.y-dessize.height  ) );
        var action = cc.moveTo( 0.5, this.zeroPosition ).easing(cc.easeBackOut());
        this.runAction( action );
        EU.AudioEngine.playEffect( EU.kSoundShopShow );

        var scene = cc.director.getRunningScene();
        var score = scene.getChildByName( "scorelayer" );
        //TODO: Score layer
        //if( !score )
        //{
        //    score = EU.ScoreLayer.create();
        //    scene.addChild( score, 999 );
        //    this.removeScoreLayer = true;
        //}
    },
    getCost: function( itemname )
    {
        var xmlnode = null;
        EU.pugixml.readXml( "ini/bonusitems.xml", function(error, data) {
            xmlnode = data;
        }, this);
        var root = xmlnode.firstElementChild;
        var itemXml = root.getElementsByTagName(itemname)[0];
        var cost = 0;
        if( itemXml )
            cost = EU.Common.strToInt( itemXml.getAttribute("cost") );
        return cost;
    },
    runFly: function( itemname )
    {
        var size = cc.view.getDesignResolutionSize();
        //TODO: ScrollMenu call
        var item = this.getItemByName( itemname );
        var conteiner = item.getChildByName( "conteiner" );
        var nodeMain = conteiner.getChildByName( "main" );
        var icon = nodeMain ? nodeMain.getChildByName( "icon" ) : null;

        var pos = icon.convertToWorldSpace( cc.p(0,0) );

        EU.xmlLoader.macros.set( "item", itemname );
        EU.xmlLoader.macros.set( "centerx", ( size.width / 2 ).toString() );
        EU.xmlLoader.macros.set( "centery", ( size.height / 2 ).toString() );
        EU.xmlLoader.macros.set( "right", ( size.width ).toString() );
        EU.xmlLoader.macros.set( "position", EU.Common.pointToStr( pos ) );

        var node = EU.xmlLoader.load_node_from_file( "ini/itemshop/itemfly.xml" );
        var scene = EU.Common.getSceneOfNode( this );
        scene.addChild( node,9999 );

        EU.xmlLoader.macros.erase( "centerx" );
        EU.xmlLoader.macros.erase( "centery" );
        EU.xmlLoader.macros.erase( "right" );
        EU.xmlLoader.macros.erase( "position" );
    }
});

EU.NodeExt.call(EU.ItemShop.prototype);
