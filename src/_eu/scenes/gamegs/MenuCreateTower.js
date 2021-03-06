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


EU.MenuCreateTower = EU.ScrollMenu.extend(
{
    __MenuCreateTower : true,

    /** @type {bool} */ _disabled : true,
    /** @type {string} */ _selectedTower : "" ,
    /** @type {cc.MenuItem} */ _confirmButton : null,
    /** @type {cc.MenuItem} */ _confirmButtonUn : null,
    /** @type {cc.MenuItem} */ _hidenButton : null,
    _desc : null,

    /** @type {std.map< std.string, MenuItem >} */ _buttonTowers : null,
    /** @type {std.map< std.string, MenuItem >} */ _buttonTowersUn : null,
    /** @type {cc.Point} */ _centerPoint : null,

    onExit: function()
    {
        EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );
        this._super();
    },
    ctor: function()
    {
        this._super();
        this.initExt();
        this._buttonTowers = {};
        this._buttonTowersUn = {};
        this._centerPoint = cc.p(0,0);
        this._desc = {
            /**cc.Node*/ node: new cc.Node(),
            /**cc.LabelTTF*/ name: new cc.LabelTTF(),
            /**cc.LabelTTF*/ text: new cc.LabelTTF(),
            /**cc.LabelTTF*/ dmg: new cc.LabelTTF(),
            /**cc.LabelTTF*/ rng: new cc.LabelTTF(),
            /**cc.LabelTTF*/ spd: new cc.LabelTTF()
        };

        this.load_str_n_str( "ini/gamescene", "menucreatetower.xml" );

        var self = this;

        var size = this.getItemsCount();
        for( var i = 0; i < size; ++i )
        {
            var item = this.getItem( i );
            if( item.getName() == "confirm" )
            {
                this._confirmButton = item;
                this._confirmButton.setVisible( false );
                this._confirmButton.setCallback(this.confirmSelect.bind(this,true), this);
            }
            else if( item.getName() == "confirm_un" )
            {
                this._confirmButtonUn = item;
                this._confirmButtonUn.setVisible( false );
                this._confirmButtonUn.setCallback( this.confirmSelect.bind(this,true), this);
            }
            else
            {
                var name = item.getName( );
                if( name.indexOf( "_un" ) < 0 )
                {
                    this._buttonTowers[name] = item;
                    this._buttonTowers[name].setCallback( this.onActivate.bind(this, item, true), this );
                }
                else
                {
                    //name.erase( name.begin() + (name.length - 3), name.end() );
                    name = name.slice( 0, -3);

                    this._buttonTowersUn[name] = item;
                    this._buttonTowersUn[name].setCallback( this.onActivate.bind(this, item, false), this );
                }
                var level = EU.UserData.tower_getUpgradeLevel( name );
                if( level == 0 )
                    this.setBlockButton( item );
            }
        }

        this._desc.node = this.getChildByName( "desc" );
        if( this._desc.node )
        {
            this._desc.name = ( this._desc.node.getChildByName( "name" ) );
            this._desc.text = ( this._desc.node.getChildByName( "text" ) );
            this._desc.dmg = ( this._desc.node.getChildByName( "dmg" ) );
            this._desc.rng = ( this._desc.node.getChildByName( "rng" ) );
            this._desc.spd = ( this._desc.node.getChildByName( "spd" ) );
        }

        this.setVisible( false );
        return true;
    },

    setBlockButton: function( /**cc.MenuItem*/ button )
    {
        var self = this;
        button.setCallback( this.onBlocked.bind(this));
        var item = button;
        if( item.__MenuItemImageWithText)
        {
            item.setImageNormal( EU.k.resourceGameSceneFolder + "menucreatetower/menu_lock2.png" );
            item.setImageSelected( EU.k.resourceGameSceneFolder + "menucreatetower/menu_lock2.png" );
        }
    },

    onBlocked: function(  sender )
    {
        this.disappearance();
    },

    onActivate: function(  sender, availableButton )
    {
        if( this._disabled )return;
        this.hideConfirmButton();

        var node = sender;
        if( ! (node instanceof cc.MenuItem)) return;
        //TODO: Implement InstrusivePtr on cc.Class.prototype
        this._hidenButton = ( node );
        //this._hidenButton.setVisible( false );

        var name = this._hidenButton.getName();

        if( availableButton )
        {
            this._confirmButton.setPosition( node.getPosition() );
            this._confirmButton.setVisible( true );
            this._buttonTowers[name].setVisible( false );
        }
        else
        {
            name = name.substring(0, name.length - 3);
            this._confirmButtonUn.setName( name );
            this._confirmButtonUn.setPosition( node.getPosition() );
            this._confirmButtonUn.setVisible( true );
        }

        this._selectedTower = name;

        this.runEvent( "onclick" );
        this.runEvent( "onclickby_" + this._selectedTower );
        this.buildDescription();

        //var rate = EU.mlTowersInfo.shared( ).rate( name );
        var radius = EU.mlTowersInfo.radiusInPixels( name, 1 );
        EU.showRadius( this._centerPoint, radius /** rate*/ );
    },

    confirmSelect: function(  sender, availableButton )
    {
        if( this._disabled )return;
        if( availableButton )
        {
            EU.assert( this._hidenButton );
            var towername = this._hidenButton.getName();
            if(towername.indexOf("_un") >= 0 )
            {
                towername = towername.substr( 0, towername.indexOf("_un") );
            }
            this.hideConfirmButton();
            this.runEvent( "onconfirm" );

            EU.GameGSInstance.getGameBoard().createTower( towername );
            this.disappearance();
        }
        else
        {
            if(EU.k.configuration.useInapps && EU.TutorialManager.dispatch( "level_haventgear_build" ) )
                this.disappearance();
        }
    },

    hideConfirmButton: function()
    {
        this._confirmButton.setVisible( false );
        this._confirmButtonUn.setVisible( false );
        if( this._hidenButton )
            this._hidenButton.setVisible( true );
        this._hidenButton = ( null );
    },

    changeCost: function()
    {
        var set = function( node, cost )
        {
            var label = node.getChildByName( "cost" );
            if( label ) label.setString( cost);
        };

        for( var icon in this._buttonTowers )
        {
            if (this._buttonTowers.hasOwnProperty(icon)) {
                var cost = EU.mlTowersInfo.getCost( icon, 1 );
                cost = Math.min( cost, 999 );
                var but0 = this._buttonTowers[icon];
                var but1 = this._buttonTowersUn[icon];
                set( but0, cost );
                set( but1, cost );
            }
        }

    },

    appearance: function()
    {
        this.setVisible( true );
        this.hideConfirmButton();
        this.runEvent( "appearance" );
        this.setEnabled( true );
        this._disabled = false;
        EU.ScoreCounter.observer( EU.kScoreLevel ).add( this.__instanceId, this.onChangeMoney, this);
        this.changeCost();
        this.onChangeMoney( EU.ScoreCounter.getMoney( EU.kScoreLevel ) );
        this.scheduleUpdate();
    },
    disappearance: function()
    {
        if( this._disabled == false )
        {
            this.hideConfirmButton();
            this.runEvent( "disappearance" );
            this.setEnabled( false );
            this._disabled = true;

            EU.hideRadius();
            EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );
            this.unscheduleUpdate();
        }
    },

    setExcludedTowers: function( list ) {},

    addExludedTower: function( towerName )
    {
        var item = this.getItemByName( towerName );
        if( item )
            this.setBlockButton( item );
    },

    removeExludedTower: function(  towerName )
    {
    },

    setActived: function( mode ) {},
    setClickPoint: function(  point )
    {
        this._centerPoint = point;
        this.setPosition( point );
    },

    buildDescription: function()
    {
        var name = this._selectedTower;
        name = EU.Language.string( name + "_name" );
        var dmg = ( EU.mlTowersInfo.get_dmg( this._selectedTower, 1 ) );
        var rng = ( EU.mlTowersInfo.get_rng( this._selectedTower, 1 ) );
        var spd = ( EU.mlTowersInfo.get_spd( this._selectedTower, 1 ) );
        var txt = EU.mlTowersInfo.get_desc( this._selectedTower, 1 );
        if( this._desc.name )this._desc.name.setString( name );
        if( this._desc.dmg )this._desc.dmg.setString( dmg );
        if( this._desc.rng )this._desc.rng.setString( rng );
        if( this._desc.spd )this._desc.spd.setString( spd );
        if( this._desc.text )this._desc.text.setString( txt );
    },

    onChangeMoney: function( money )
    {
        for( var iter in this._buttonTowers )
        if (this._buttonTowers.hasOwnProperty(iter)) {

            var but0 = this._buttonTowers[iter];
            var but1 = this._buttonTowersUn[iter];
            EU.assert( but0 && but1 );

            var cost = EU.mlTowersInfo.getCost( iter, 1 );

            but0.setVisible( cost <= money );
            but1.setVisible( cost > money );
        }

        //	if( this._hidenButton)
        //		this._hidenButton.setVisible( false );

        if( this._confirmButtonUn.isVisible() )
        {
            cost = EU.mlTowersInfo.getCost( this._confirmButtonUn.getName(), 1 );
            if( cost <= money )
            {
                this._confirmButtonUn.setVisible( false );
                this._confirmButton.setVisible( true );
                this._confirmButton.setPosition( this._confirmButtonUn.getPosition() );
            }
        }
    },

    update: function( )
    {
        var point = EU.GameGSInstance.getMainLayer().convertToWorldSpace( this._centerPoint );
        this.setPosition( point );

        if( this._desc.node )
        {
            var screenpos = this.getPosition();
            var dessize = cc.view.getDesignResolutionSize();

            var pos = this._desc.node.getPosition( );
            pos.x = Math.abs( pos.x );
            this._desc.node.setAnchorPoint( cc.p( 0, 0.5 ) );
            if( screenpos.x > dessize.width / 2 )
            {
                pos.x = -pos.x;
                this._desc.node.setAnchorPoint( cc.p( 1, 0.5 ) );
            }
            this._desc.node.setPosition( pos );
        }
    }

});

EU.NodeExt.call(EU.MenuCreateTower.prototype);
