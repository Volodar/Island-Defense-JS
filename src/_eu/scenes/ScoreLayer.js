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


EU.ScoreLayer = cc.Scene.extend({
    
    /** @type {Label} */ _gold : null,
    /** @type {Label} */ _fuel : null,
    /** @type {Label} */ _time : null,
    /** @type {Label} */ _star : null,
    /** @type {MenuItem} */ _shop : null,


    ctor: function()
    {
        this._super();
        EU.scoreCounter.observer( EU.kScoreTime ).add( _ID, this.change_time );
        EU.scoreCounter.observer( EU.kScoreFuel ).add( _ID, this.change_fuel );
        EU.scoreCounter.observer( EU.kScoreCrystals ).add( _ID, this.change_real );
        EU.scoreCounter.observer( EU.kScoreStars ).add( _ID, this.change_star );

        EU.assert( this.init(), "Cannot init a ScoreLayer");
    },

    //TODO: is onExit correct for replacing destroy function in cpp?
    onExit: function()
    {
        EU.scoreCounter.observer( EU.kScoreTime ).remove( _ID );
        EU.scoreCounter.observer( EU.kScoreFuel ).remove( _ID );
        EU.scoreCounter.observer( EU.kScoreCrystals ).remove( _ID );
        EU.scoreCounter.observer( EU.kScoreStars ).remove( _ID );
    },

    init: function()
    {
        //CC_BREAK_IF( !Layer::init() );
        if ( EU.NodeExt.prototype.init.call(this) ) return false;

        if (EU.k.configuration.useFuel) {
            this.load_str_n_str( EU.xmlLoader.resourcesRoot + "ini", "scorelayer_fuel.xml" );
        } else {
            this.load_str_n_str( EU.xmlLoader.resourcesRoot + "ini", "scorelayer.xml" );
        }

        this._gold = this.getChildByName( "valuegold" );
        this._fuel = this.getChildByName( "valuefuel" );
        this._time = this.getChildByName( "valuetime" );
        this._star = this.getChildByName( "valuestar" );
        this._shop = EU.Common.getNodeByPath( this, "menu/shop" );
        if ( !this._gold ) return false;
        if ( !this._fuel ) return false;
        if ( !this._time ) return false;
        if ( !this._shop ) return false;
        if ( !this._star ) return false;

        this.change_fuel( EU.scoreCounter.getMoney( EU.kScoreFuel ) );
        this.change_time( EU.scoreCounter.getMoney( EU.kScoreTime ) );
        this.change_real( EU.scoreCounter.getMoney( EU.kScoreCrystals ) );
        this.change_star( EU.scoreCounter.getMoney( EU.kScoreStars ) );
        if( this._shop )
        {
            this._shop.setCallback( this.cb_shop );
            if( EU.k.configuration.useInapps == false )
                this._shop.setVisible( false );
        }

        if( EU.k.configuration.useFuel == false )
        {
            this._fuel.setVisible( false );
            this._time.setVisible( false );
        }

        return true;
    },

    change_time : function(score )
    {
        var min = parseInt( score ) / 60;
        var sec = parseInt( score ) - min * 60;

        var ss;
        if( min != 0 ) ss = ss + min + "m ";
        if( sec != 0 ) ss = ss + sec + "s";
        this._time.setString( ss.str() );
    },

    change_fuel : function (score )
    {
        var vis = score < EU.scoreByTime.max_fuel();
        this._fuel.setString( score);
        this._time.setVisible( vis );

        if( EU.k.configuration.useFuel == false )
        {
            this._fuel.setVisible( false );
            this._time.setVisible( false );
        }
    },

    change_real : function (score )
    {
        this._gold.setString( ( score ) );
    },

    change_star : function (score )
    {
        this._star.setString( ( score ) );
    },

    cb_shop: function(sender ) {
        if (EU.PC != 1) {
            /**@type {EU.SmartScene} */
            var scene = this.getScene();
            if (scene.this.getChildByName("shop")) return;

            var shop = EU.ShopLayer.create(EU.k.configuration.useFreeFuel, true, false, false);
            if (shop) {
                scene.pushLayer(shop, true);
            }
        }
    }

});

EU.NodeExt.call(EU.ScoreLayer.prototype);
