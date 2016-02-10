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
EU.Laboratory = EU.ScrollMenu.extend({
    scaleFactor: null,
    zeroPosition: null,
    self : null,
    ctor: function()
    {
        this._super();
        this.scaleFactor = 1;
        this.zeroPosition = cc.p(0,0);
        this.self = this;
        var dessize = cc.view.getDesignResolutionSize();
        this.setCascadeOpacityEnabled( true );
        this.setCascadeColorEnabled( true );
        //TODO: this.setKeyboardEnabled( true );

        this.load_str( "ini/laboratory/lab.xml" );

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
        var caption = this.getChildByName("text");
        if( caption )
        {
            caption.setPositionY(240);
            caption.setPositionX(0);
        }


        var grid = cc.size(0,0);
        var content = cc.size(0,0);
        var towers = [];
        EU.mlTowersInfo.fetch( towers );
        for( var i=0; i< towers.length; ++i )
        {
            var tower = towers[i];
            var item = this.buildItem( tower );
            this.addItem( item );

            item.setScale( this.scaleFactor );

            grid = item.getContentSize();
            grid.width *= this.scaleFactor;
            grid.height *= this.scaleFactor;
            content.width += grid.width;
            content.height = grid.height;

            this.setIndicator( tower, false );
            this.setCost( tower );
            this.setParam( tower, false );
            this.setIcon( tower, false );
        }

        this.setAlignedStartPosition( cc.p( -this.zeroPosition.x * this.scaleFactor, -275 * this.scaleFactor ) );
        this.setGrisSize( grid );
        this.align( 99 );

        var scissor = cc.size( dessize.width, 465 );
        var asp = this.getAlignedStartPosition();
        var visibleRect = cc.rect(asp.x, asp.y,scissor.width,scissor.height);
        this.setVisibleRect( visibleRect );
        this.setScrollEnabled( true );
        this.setTouchEnabled( true );
        this.setContentSize( content );
        this.setAllowScrollByY( false );

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
    //TODO: keyboard
    //void onKeyReleased( EventKeyboard.KeyCode keyCode, Event* event )
    //{
    //    if( keyCode == EventKeyboard.KeyCode.KEY_BACK )
    //        cb_close( null );
    //}
    buildItem: function( tower )
    {
        var level = EU.UserData.tower_getUpgradeLevel( tower );
        var item = EU.xmlLoader.load_node_from_file( "ini/laboratory/item.xml" );
        item.setName( tower );
        item.setCallback( this.cb_select.bind(this, tower), this );
        var conteiner = item.getChildByName( "conteiner" );
        if( conteiner )
        {
            conteiner.setCascadeColorEnabled( true );
            conteiner.setCascadeOpacityEnabled( true );
            var infonode = conteiner.getChildByName( "info" );
            var mainnode = conteiner.getChildByName( "main" );
            mainnode.setCascadeColorEnabled( true );
            mainnode.setCascadeOpacityEnabled( true );
    
            var caption = conteiner.getChildByName( "name" );
            var icon2 = conteiner.getChildByName( "icon2" );
            var icon_lock = conteiner.getChildByName( "icon_locked" );
            var indicator = mainnode.getChildByName( "indicator" );
    
            if( caption )
            {
                var name = tower + "_name";
                name = EU.Language.string( name );
                caption.setString( name );
            }
            if( icon2 )
            {
                EU.xmlLoader.setProperty_int( icon2, EU.xmlKey.Image.int, "images/laboratory/icon_" + tower + ".png" );
            }
            if( indicator )
            {
                indicator.setCascadeColorEnabled( true );
                indicator.setCascadeOpacityEnabled( true );
            }
    
            var menuinfo = conteiner.getChildByName( "menu_info" );
            if( menuinfo )
            {
                var info = menuinfo.getChildByName( "info" );
                info.userdata = {};
                info.userdata.towername = tower;
                info.setCallback( this.cb_info.bind(this, tower), this );
            }
    
            var menu = mainnode.getChildByName( "menu" );
            if( menu )
            {
                var button = menu.getChildByName( "buy" );
    
                button.setName( tower );
                button.setCallback( this.cb_upgrade.bind(this,tower), this );
            }
            var menu_confirm = mainnode.getChildByName( "menu_confirm" );
            if( menu_confirm )
            {
                var ok = EU.Common.getNodeByPath( menu_confirm, "menu/confirm" );
                var no = EU.Common.getNodeByPath( menu_confirm, "menu/cancel" );
    
                ok.setName( tower );
                no.setName( tower );
                ok.setCallback( this.cb_confirm.bind(this, tower), this );
                no.setCallback( this.cb_cancel.bind(this, tower), this );
            }
    
            if( infonode )
            {
                var text = infonode.getChildByName( "text" );
                text.setString( EU.mlTowersInfo.get_desc( tower, 1 ) );
            }
    
            if( level == 0 )
            {
                item.setEnabled( false );
                item.setOpacity( 128 );
                menu_confirm.setEnabled( false );
                menu.setEnabled( false );
                menuinfo.setEnabled( false );
                menu.setOpacity( 128 );
    
                mainnode.setVisible( false );
                icon_lock.setVisible( true );
            }
        }
    
        return item;
    },
    cb_select: function( tower )
    {
        this.selectTower( tower );
    },
    cb_info: function( tower )
    {
        this.selectTower( tower );
        this.switchInfoBox( tower );
    },
    cb_upgrade: function( tower )
    {
        this.selectTower( tower );
        this.showConfirmMenu( tower, true );
        this.setParam( tower, true );
        this.setIcon( tower, true );
        this.setIndicator( tower, true );
    
        EU.TutorialManager.dispatch( "lab_clickupgrade" );
    },
    cb_confirm: function( tower )
    {
        var level = EU.UserData.tower_getUpgradeLevel( tower ) + 1;
        var cost = EU.mlTowersInfo.getCostLab( tower, level );
        var score = EU.ScoreCounter.getMoney( EU.kScoreCrystals );
    
        if( score < cost )
        {
            if( EU.k.useInapps )
            {
                if( EU.k.useInapps && EU.TutorialManager.dispatch( "lab_haventgold" ) )
                {
                    this.cb_close( null );
                    return;
                }
                else
                {
                    var scene = EU.Common.getSceneOfNode(this);
                    if( scene )
                    {
                        var layer = scene.getMainLayer();
                        if( layer instanceof EU.MapLayer)
                            map.cb_shop();
                    }
                }
            }
            else
            {
                this.cb_cancel(null, tower);
                return;
            }
        }
        else
        {
            this.selectTower( "" );
            this.showConfirmMenu( tower, false );
            this.upgradeTower( tower );
            this.normalStateForAllItemExcept( "" );
            EU.ScoreCounter.subMoney( EU.kScoreCrystals, cost, true );
            //TODO: audio
            //AudioEngine.playEffect( kSoundLabUpgrade );
            EU.UserData.save();
        }
        this.setParam( tower, false );
        this.setIcon( tower, false );
    
        EU.TutorialManager.dispatch( "lab_clickconfirm" );
    },
    cb_cancel: function( tower )
    {
        this.selectTower( "" );
        this.showConfirmMenu( tower, false );
        this.normalStateForAllItemExcept( "" );
        this.setIndicator( tower, false );
    },    
    selectTower: function( tower )
    {
        this.normalStateForAllItemExcept( tower );
        var count = this.getItemsCount();
        for( var i = 0; i < count; ++i )
        {
            var item = this.getItem( i );
            var opacity = tower.length > 0 ?
                (item.getName() == tower ? 255 : 255) :
                255;
            item.setOpacity( opacity );
        }
    },    
    showConfirmMenu: function( itemname, mode )
    {
        var level = EU.UserData.tower_getUpgradeLevel( itemname );
        var item = this.getItemByName( itemname );
        EU.assert( item );
        var conteiner = item.getChildByName( "conteiner" );
        var mainnode = conteiner.getChildByName( "main" );
        var menu0 = mainnode.getChildByName( "menu" );
        var menu1 = mainnode.getChildByName( "menu_confirm" );
    
        menu0.setVisible( !mode && level != 5 );
        menu1.setVisible( mode );
    },
    switchInfoBox: function( itemname, forceHideInfo )
    {
        var level = EU.UserData.tower_getUpgradeLevel( itemname );
        var item = this.getItemByName( itemname );
        EU.assert( item );
        var conteiner = item.getChildByName( "conteiner" );
        var infonode = conteiner.getChildByName( "info" );
        var mainnode = conteiner.getChildByName( "main" );
    
        if( level > 0 )
        {
            var infovisivle = forceHideInfo ? false : !infonode.isVisible();
            infonode.setVisible( infovisivle );
            mainnode.setVisible( !infovisivle );
        }
    },    
    upgradeTower: function( tower )
    {
        var level = EU.UserData.tower_getUpgradeLevel( tower ) + 1;
        level = Math.min( level, 5 );
        EU.UserData.tower_setUpgradeLevel( tower, level );
        this.setIndicator( tower, false );
        this.setCost( tower );
        //TODO: Achievments
        //Achievements.process( "lab_buyupgrade", 1 );
    },    
    setIndicator: function( tower, nextLevel )
    {
        var level = EU.UserData.tower_getUpgradeLevel( tower );
        if( nextLevel )
            level = Math.min( level + 1, 5 );
        var item = this.getItemByName( tower );
        var conteiner = item.getChildByName( "conteiner" );
        var main = conteiner ? conteiner.getChildByName( "main" ) : null;
        var indicator = main ? main.getChildByName( "indicator" ) : null;
        if( indicator )
        {
            for( var i = 0; i < 5; ++i )
            {
                var node = indicator.getChildByName( (i + 1).toString() );
                if( node ) node.setVisible( i < level );
            }
            var caption = indicator.getChildByName( "caption" );
            if( level > 0 )
            {
                caption.setString( EU.Language.string("laboratory_tower_level") + level.toString() );
            }
            else
            {
                caption.setString( "" );
            }
        }
        if( level == 5 && !nextLevel )
        {
            var menu = main.getChildByName( "menu" );
            var menu2 = main.getChildByName( "menu_confirm" );
            menu.setVisible( false );
            menu2.setVisible( false );
        }
    },    
    setCost: function( tower )
    {
        var level = EU.UserData.tower_getUpgradeLevel( tower );
        var item = this.getItemByName( tower );
        var cost = EU.mlTowersInfo.getCostLab( tower, level + 1 );
        var cost0 = EU.Common.getNodeByPath( item, "conteiner/main/menu/" + tower + "/normal/cost" );
        var cost1 = EU.Common.getNodeByPath( item, "conteiner/main/menu_confirm/cost" );
        if( cost0 ) cost0.setString( cost );
        if( cost1 ) cost1.setString( cost );
    },    
    setParam: function( tower, nextLevel )
    {
        var item = this.getItemByName( tower );
        var conteiner = item.getChildByName( "conteiner" );
        if( !conteiner )return;
        var mainnode = conteiner.getChildByName( "main" );
        if( !mainnode )return;
    
        var level = EU.UserData.tower_getUpgradeLevel( tower );
        if( nextLevel ) ++level;
        var dmg = mainnode.getChildByName( "dmg" );
        var rng = mainnode.getChildByName( "rng" );
        var spd = mainnode.getChildByName( "spd" );
        var value;
        if( dmg )
        {
            value = EU.Language.string("laboratory_tower_attack") + Math.round(EU.mlTowersInfo.get_dmg( tower, level ));
            dmg.setString( value );
        }
        if( rng )
        {
            value = EU.Language.string("laboratory_tower_range") + Math.round(EU.mlTowersInfo.get_rng( tower, level ));
            rng.setString( value );
        }
        if( spd )
        {
            value = EU.Language.string("laboratory_tower_speed") + Math.round(EU.mlTowersInfo.get_spd( tower, level ));
            spd.setString( value );
        }
    },    
    setIcon: function( tower, nextLevel )
    {
        var level = EU.UserData.tower_getUpgradeLevel( tower );
        if( nextLevel ) ++level;
        level = Math.min( Math.max( 1, level ), 5 );
    
        var texture = "images/laboratory/icons/" + tower + level + ".png";
        var item = this.getItemByName( tower );
        var conteiner = item.getChildByName( "conteiner" );
        if( !conteiner )return;
        var icon = conteiner.getChildByName( "icon" );
        if( icon ) EU.xmlLoader.setProperty_int( icon, EU.xmlKey.Image.int, texture );
    },
    normalStateForAllItemExcept: function( tower )
    {
        for( var i = 0; i < this.getItemsCount(); ++i )
        {
            var item = this.getItem( i );
            if( item.getName() != tower )
            {
                this.showConfirmMenu( item.getName(), false );
                this.switchInfoBox( item.getName(), true );
                this.setParam( item.getName(), false );
                this.setIcon( item.getName(), false );
            }
        }
    },
    cb_close: function()
    {
        this.fadeexit();
        this.runAction( cc.sequence(
            cc.delayTime( 0.5 ),
            cc.callFunc( this.removeFromParent, this )) );
    },
    fadeexit: function()
    {
        var dessize = cc.view.getDesignResolutionSize();
        var action = cc.moveTo( 0.5, EU.Common.pointAdd(this.zeroPosition, cc.p( 0, -dessize.height ) ) ).easing(cc.easeBackIn());
        this.runAction( action );
        //TODO: audio
        //AudioEngine.playEffect( kSoundShopHide );
    },
    fadeenter: function()
    {
        var dessize = cc.view.getDesignResolutionSize();
        this.setPosition( EU.Common.pointAdd(this.zeroPosition, cc.p( 0, -dessize.height ) ) );
        var action = cc.moveTo( 0.5, this.zeroPosition ).easing(cc.easeBackOut());
        this.runAction( action );
        //TODO: audio
        //AudioEngine.playEffect( kSoundShopShow );
    }

});
EU.NodeExt.call(EU.Laboratory.prototype);
