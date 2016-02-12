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



EU.MenuDig = EU.ScrollMenu.extend( // public NodeExt
{
    /** @type {MenuItem} */ _dig : null,
    /** @type {MenuItem} */ _digUn : null,
    /** @type {MenuItem} */ _confirm : null,
    /** @type {MenuItem} */ _confirmUn : null,
    /** @type {Point} */ _clickedPoint : null,


    onExit: function()
    {
        EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );
    },

    ctor: function()
    {
        this._super();

        this.initExt();

        this.load_str_n_str( "ini/gamescene", "menudig.xml" );

        this._dig = this.getItemByName( "dig" );
        this._digUn = this.getItemByName( "dig_un" );
        this._confirm = this.getItemByName( "confirm" );
        this._confirmUn = this.getItemByName( "confirm_un" );

        var self = this;
        this._dig.setCallback( function(a) { return self.activate.bind(self, a, true) } );
        this._digUn.setCallback( function(a) { return self.activate.bind(self, a, false) } );
        this._confirm.setCallback( function(a) { return self.confirmSelect.bind(self, a, true) } );
        this._confirmUn.setCallback( function(a) { return self.confirmSelect.bind(self, a, false) } );

        var cost = EU.mlTowersInfo._digcost;
        this._dig.getChildByName( "cost" ).setString( ( cost ) );
        this._digUn.getChildByName( "cost" ).setString( ( cost ) );

        this.setVisible( false );
        return true;
    },

    appearance: function()
    {
        this.setVisible( true );
        this.setEnabled( true );
        this.runEvent( "appearance" );
        EU.ScoreCounter.observer( EU.kScoreLevel ).add( this.__instanceId, this.onChangeMoney.bind(this) );
        this._confirm.setVisible( false );
        this._confirmUn.setVisible( false );
        this._dig.setVisible( false );
        this._digUn.setVisible( false );
        this.onChangeMoney( EU.ScoreCounter.getMoney( EU.kScoreLevel ) );
        this.scheduleUpdate();
    },

    disappearance: function()
    {
        this.setEnabled( false );
        EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );
        this.runEvent( "disappearance" );
        this._confirm.setVisible( false );
        this._confirmUn.setVisible( false );
        this._dig.setVisible( false );
        this._digUn.setVisible( false );
        this.unscheduleUpdate();
    },

    setClickPoint: function( /**@type {var} */ point )
    {
        this._clickedPoint = point;
        this.update( 0 );
        //setPosition( point );
    },

    activate: function( /**@type {var} */ sender, /**@type {var} */ availableButton )
    {
        if( this.isEnabled() == false )return;
        if( availableButton )
            this._confirm.setVisible( true );
        else
            this._confirmUn.setVisible( true );
        //onChangeMoney( EU.ScoreCounter.getMoney( EU.kScoreLevel ) );
        this.runEvent( "onclick" );
    },

    confirmSelect: function( /**@type {var} */ sender, /**@type {var} */ availableButton )
    {
        if( this.isEnabled() == false )return;
        this.disappearance();
        if( availableButton )
        {
            var place = EU.GameGSInstance.getTowerPlaceInLocation( this._clickedPoint );
            EU.GameGSInstance.getGameBoard().activateTowerPlace( place );
            EU.GameGSInstance.resetSelectedPlace();
        }
        else
        {
            if (EU.k.useInapps) {
                EU.TutorialManager.dispatch( "level_haventgear_dig" );
            }
        }
        this.runEvent( "onconfirm" );
    },

    onChangeMoney: function( /**@type {Number} */ money )
    {
        var cost = EU.mlTowersInfo._digcost;

        var availabled = cost <= money;
        if( this._confirm.isVisible() || this._confirmUn.isVisible() )
        {
            this._confirm.setVisible( availabled );
            this._confirmUn.setVisible( !availabled );
        }
        this._dig.setVisible( availabled );
        this._digUn.setVisible( !availabled );
    },

    update: function( )
    {
        var point = EU.GameGSInstance.getMainLayer().convertToWorldSpace( this._clickedPoint );
        this.setPosition( point );
    }


});

EU.NodeExt.call(EU.MenuDig.prototype);
