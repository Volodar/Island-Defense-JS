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
        this.init();
        this.initExt();
    },

    onEnter: function()
    {
        this._super();
        EU.ScoreCounter.observer( EU.kScoreTime ).add( this.__instanceId, this.change_time, this );
        EU.ScoreCounter.observer( EU.kScoreFuel ).add( this.__instanceId, this.change_fuel, this );
        EU.ScoreCounter.observer( EU.kScoreCrystals ).add( this.__instanceId, this.change_real, this );
        EU.ScoreCounter.observer( EU.kScoreStars ).add( this.__instanceId, this.change_star, this );
        this.updateScore();
    },
    onExit: function()
    {
        this._super();
        EU.ScoreCounter.observer( EU.kScoreTime ).remove( this.__instanceId );
        EU.ScoreCounter.observer( EU.kScoreFuel ).remove( this.__instanceId );
        EU.ScoreCounter.observer( EU.kScoreCrystals ).remove( this.__instanceId );
        EU.ScoreCounter.observer( EU.kScoreStars ).remove( this.__instanceId );
    },

    init: function()
    {
        if (EU.k.useFuel) {
            this.load_str( "ini/scorelayer_fuel.xml" );
        } else {
            this.load_str( "ini/scorelayer.xml" );
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

        this.change_fuel( EU.ScoreCounter.getMoney( EU.kScoreFuel ) );
        this.change_time( EU.ScoreCounter.getMoney( EU.kScoreTime ) );
        this.change_real( EU.ScoreCounter.getMoney( EU.kScoreCrystals ) );
        this.change_star( EU.ScoreCounter.getMoney( EU.kScoreStars ) );
        if( this._shop )
        {
            this._shop.setCallback( this.cb_shop, this );
            if( EU.k.useInapps == false )
                this._shop.setVisible( false );
        }

        if( EU.k.useFuel == false )
        {
            this._fuel.setVisible( false );
            this._time.setVisible( false );
        }

        return true;
    },

    updateScore: function(){
        this.change_time( EU.ScoreCounter.getMoney(EU.kScoreTime) );
        this.change_fuel( EU.ScoreCounter.getMoney(EU.kScoreFuel) );
        this.change_real( EU.ScoreCounter.getMoney(EU.kScoreCrystals) );
    },

    change_time : function(score )
    {
        var min = parseInt( score ) / 60;
        var sec = parseInt( score ) - min * 60;

        var ss;
        if( min != 0 ) ss = ss + min + "m ";
        if( sec != 0 ) ss = ss + sec + "s";
        /** Preven jsb fault */
        ss = ss || "";
        this._time.setString( ss );
    },

    change_fuel : function (score )
    {
        var vis = score < EU.ScoreByTime.max_fuel();
        this._fuel.setString( score);
        this._time.setVisible( vis );

        if( EU.k.useFuel == false )
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

    cb_shop: function(sender) {
        var scene = EU.Common.getSceneOfNode(this);
        if (scene.getChildByName("shop")) return;

        var shop = EU.ShopLayer.create(EU.k.useFreeFuel, true, false, false);
        if (shop) {
            scene.pushLayer(shop, true);
        }
    }

});

EU.NodeExt.call(EU.ScoreLayer.prototype);
