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




EU.MenuTower = EU.ScrollMenu.extend( // public NodeExt
{
    /** @type {EU.Unit} */ _unit : null,
    /** @type {Boolean} */ _disabled : null,
    /** @type {MenuItem} */ _upgrade : null,
    /** @type {MenuItem} */ _upgradeUn : null,
    /** @type {MenuItem} */ _sell : null,
    /** @type {MenuItem} */ _confirm : null,
    /** @type {MenuItem} */ _confirmUn : null,
    /** @type {MenuItem} */ _confirmCurrent : null,
    /** @type {MenuItem} */ _lock : null,
    /** @type {Boolean} */ _waitSellConfirm : null,
    /** @type {Boolean} */ _waitUpgradeConfirm : null,
    _desc : function() {
        "use strict";

        /**Node*/ this.node = null;
         /**Label*/ this.name = null;
         /**Label*/ this.text = null;
         /**Label*/ this.dmg = null;
         /**Label*/ this.rng = null;
         /**Label*/ this.spd = null;
    },


    onExit: function()
    {
        EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );
    },

    ctor: function()
    {
        this._waitSellConfirm = false;
        this._waitUpgradeConfirm = false;
        this._disabled = false;

        this._super();

        this.initExt();

        this.load_str_n_str( "ini/gamescene", "menutower.xml" );

        this._upgrade = this.getItemByName( "upgrade" );
        this._upgradeUn = this.getItemByName( "upgrade_un" );
        this._confirm = this.getItemByName( "confirm" );
        this._confirmUn = this.getItemByName( "confirm_un" );
        this._sell = this.getItemByName( "sell" );
        this._lock = this.getItemByName( "lock" );

        var self = this;
        this._upgrade.setCallback( this.activateUpgrade.bind(this, true), this );
        this._upgradeUn.setCallback( this.activateUpgrade.bind(this, false), this );
        this._sell.setCallback( this.activateSell.bind(this, false), this );
        this._lock.setCallback( this.lockClick, this);

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

    appearance: function()
    {
        this._disabled = false;
        this.setEnabled( true );
        this.setVisible( true );
        this.hideConfirmButton();
        this.runEvent( "appearance" );
        EU.ScoreCounter.observer( EU.kScoreLevel ).add( this.__instanceId, this.onChangeMoney, this );
        this.onChangeMoney( EU.ScoreCounter.getMoney( EU.kScoreLevel ) );

        this._confirm.setVisible( false );
        this._confirmUn.setVisible( false );

        this.scheduleUpdate();
        EU.showRadius( this._unit.getPosition(), this._unit._radius );
    },

    disappearance: function()
    {
        if( this._disabled == false )
        {
            this.setEnabled( false );
            this.hideConfirmButton();
            this.runEvent( "disappearance" );
            this._unit = ( null );
            EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );

            this._confirm.setVisible( false );
            this._confirmUn.setVisible( false );

            this._waitSellConfirm = false;
            this._waitUpgradeConfirm = false;

            EU.hideRadius();
            this.unscheduleUpdate();
            this._disabled = true;
        }
    },

    setUnit: function( unit )
    {
        this._unit = unit;
        if( this._unit )
        {
            var cost1 = ( EU.mlTowersInfo.getCost( this._unit.getName(), this._unit._level + 1 ) );
            var cost2 = ( EU.mlTowersInfo.getSellCost( this._unit.getName(), this._unit._level ) );

            this._upgrade.getChildByName( "cost" ).setString( cost1 );
            this._upgradeUn.getChildByName( "cost" ).setString( cost1 );
            this._sell.getChildByName( "cost" ).setString( cost2 );
        }

        if( this._unit )
        {
            this.setPosition( this._unit.getPosition() );

            this.buildDescription( this._unit._level );
        }
    },

    buildDescription: function( _level )
    {
        var name = this._unit.getName();
        var localization = EU.Language.string( name + "_name" );
        var level = Math.min( this._level, this._unit._maxLevel );

        var dmg = ( EU.mlTowersInfo.get_dmg( name, level ) );
        var rng = ( EU.mlTowersInfo.get_rng( name, level ) );
        var spd = ( EU.mlTowersInfo.get_spd( name, level ) );
        var txt = EU.mlTowersInfo.get_desc( this._unit.getName(), 1 );
        if( this._desc.name )this._desc.name.setString( localization );
        if( this._desc.dmg )this._desc.dmg.setString( dmg );
        if( this._desc.rng )this._desc.rng.setString( rng );
        if( this._desc.spd )this._desc.spd.setString( spd );
        if( this._desc.text )this._desc.text.setString( txt );
    },

    activateUpgrade: function( availebledButton, sender )
    {
        this.buildDescription( this._unit._level + 1 );
        var self = this;
        this._confirm.setCallback( this.confirmUpgrade.bind(this, true) );
        this._confirmUn.setCallback( this.confirmUpgrade.bind(this, false) );

        this._confirm.setVisible( true );
        this._confirm.setPosition( this._upgrade.getPosition() );
        this._confirmUn.setPosition( this._upgrade.getPosition() );

        this._waitSellConfirm = false;
        this._waitUpgradeConfirm = true;
        this.onChangeMoney( EU.ScoreCounter.getMoney( EU.kScoreLevel ) );

        //var rate = EU.mlTowersInfo.rate( this._unit.getName() );
        var radius = EU.mlTowersInfo.radiusInPixels( this._unit.getName(), this._unit._level + 1 );
        EU.showRadius( this._unit.getPosition( ), radius /** rate*/ );
        this.runEvent( "onclick" );
        sender.setVisible(false);
    },

    confirmUpgrade: function( availebledButton, sender )
    {
        EU.assert( this._confirmCurrent );
        EU.assert( this._unit );
        var board = EU.GameGSInstance.getGameBoard();
        board.upgradeTower( this._unit );
        this._confirm.setVisible( false );
        this._confirmUn.setVisible( false );

        this.disappearance();

        if( !availebledButton )
        {
            if (EU.k.useInapps) {
                EU.TutorialManager.dispatch( "level_haventgear_upgrade" );
            }
        }
    },

    activateSell: function( availebledButton, sender )
    {
        var self = this;
        this._confirm.setCallback( this.confirmSell.bind(this, true) );

        this._confirmUn.setVisible( false );
        this._confirm.setVisible( true );
        this._confirm.setPosition( this._sell.getPosition() );

        this._waitSellConfirm = true;
        this._waitUpgradeConfirm = false;

        EU.hideRadius();
        sender.setVisible(false);
    },

    confirmSell: function( availebledButton, sender )
    {
        EU.assert( this._unit );
        EU.GameGSInstance.getGameBoard().removeTower( this._unit );
        this._confirm.setVisible( false );

        this.disappearance();
    },

    lockClick: function( sender )
    {
        this.disappearance();
    },

    showConfirmButton: function()
    {},

    hideConfirmButton: function()
    {},

    onChangeMoney: function(money )
    {
        var cost = EU.mlTowersInfo.getCost( this._unit.getName(), this._unit._level + 1 );

        this._upgrade.setVisible( cost <= money );
        this._upgradeUn.setVisible( cost > money );

        if( !this._waitSellConfirm )
        {
            var hist = this._confirmCurrent;
            if( cost <= money )
            {
                this._confirmCurrent = this._confirm;
                if( this._waitUpgradeConfirm )
                {
                    this._confirm.setVisible( true );
                    this._confirmUn.setVisible( false );
                }
            }
            else
            {
                this._confirmCurrent = this._confirmUn;
                if( this._waitUpgradeConfirm )
                {
                    this._confirm.setVisible( false );
                    this._confirmUn.setVisible( true );
                }
            }
        }

        this.checkLockedUpgrade();
    },

    checkLockedUpgrade: function()
    {
        var level = this._unit._level;
        var max = this._unit._maxLevel;
        var max2 = this._unit._maxLevelForLevel;

        if( level == max )
        {
            this._lock.setVisible( false );
            this._upgrade.setVisible( false );
            this._upgradeUn.setVisible( false );
        }
        else if( level == max2 )
        {
            this._lock.setVisible( true );
            this._upgrade.setVisible( false );
            this._upgradeUn.setVisible( false );
        }
        else
        {
            this._lock.setVisible( false );
        }

    },

    update: function( )
    {
        if( !this._unit )
            return;
        if( EU.radiusTowerIsHiden() )
            EU.showRadius( this._unit.getPosition(), this._unit._radius );

        var pos = this._unit.getPosition();
        var point = EU.GameGSInstance.getMainLayer( ).convertToWorldSpace( pos );
        this.setPosition( point );

        if( this._desc.node )
        {
            var screenpos = this.getPosition( );
            var dessize = cc.view.getDesignResolutionSize( );

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

EU.NodeExt.call(EU.MenuTower.prototype);
