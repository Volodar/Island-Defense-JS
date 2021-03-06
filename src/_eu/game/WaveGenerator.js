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

EU.WaveGenerator = {

    /** For Test Instance of */
    __WaveGenerator : true,

    /**@type {Integer} */
    m_waveIndex: 0,

    /**
     * @return {number}
     */
    getWaveIndex: function() {return this.m_waveIndex;},

    /**@type {Integer} */
    m_wavesCount: 0,

    /**
     * @return {number}
     */
    getWavesCount: function() {return this.m_waveIndex;},

    /** @type {Array< EU.WaveInfo >} */
    m_waves: [],

    /** @type {EU.WaveInfo} */
    m_currentWave: null,
    /** @type {Integer} */
    m_currentWaveIndex: null,

    /** @type {EU.Common.TimeCounter} */ m_delayUnits : null,
    /** @type {EU.Common.TimeCounter} */ m_delayWaves : null,
    /** @type {Boolean} */ m_delayWavesNow : true,
    /** @type {Boolean} */ m_isRunning : true,


    init: function(){
        this.m_currentWave = new EU.WaveInfo();
        this.m_delayUnits = new EU.Common.TimeCounter();
        this.m_delayWaves = new EU.Common.TimeCounter();
        this.m_currentWaveIndex = -1;
    },
    load: function(node)
    {
        this.m_delayWaves.set( EU.asObject(node.getAttribute("defaultdelayonewave"), 0.0) );

        var index = 0;
        for(var i=0; i < node.children.length; i++){
            var waveXml = node.children[i];
            if (waveXml.tagName == "wave") {

                this.m_waves.push(new EU.WaveInfo());
                var wave = this.m_waves[this.m_waves.length - 1];
                wave.index = index++;

                wave.type = EU.strToUnitLayer( EU.asObject(waveXml.getAttribute("routetype"), null) );
                var dname = EU.asObject(waveXml.getAttribute("defaultname"), null);
                var dhealthRate = EU.asObject(waveXml.getAttribute("defaulthealthrate"), 0.0);
                var dscore = EU.asObject(waveXml.getAttribute("defaultscore"), 0.0);
                var ddelay = EU.asObject(waveXml.getAttribute("defaultdelay"), 0.0);
                var droutest = EU.strToRouteSubType( EU.asObject(waveXml.getAttribute("defaultroutesubtype"), null) );
                var drouteindex = EU.asObject(waveXml.getAttribute("defaultrouteindex"), 0);
                var count = EU.asObject(waveXml.getAttribute("count"), 0);

                if ( count != 0 )
                {
                    EU.assert(dname ? dname.length > 0 : false );
                    EU.assert(dhealthRate != 0 );
                    EU.assert(dscore != 0 );
                    EU.assert(ddelay != 0 );
                    while( count-- )
                    {
                        wave.creeps.push(dname);
                        wave.healthRate.push(dhealthRate);
                        wave.scores.push(dscore);
                        wave.delayOneUnit.push(ddelay);
                        wave.routeIndex.push( drouteindex );
                        wave.routeSubType.push( droutest );
                    }
                }
                else
                {
                    for(var j=0; j < waveXml.children.length; j++){
                        var creep = waveXml.children[j];

                        var name = EU.asObject(creep.getAttribute("name"), null);
                        var healthRate = EU.asObject(creep.getAttribute("healthrate"), 0.0);
                        var score = EU.asObject(creep.getAttribute("score"), 0);
                        var delay = EU.asObject(creep.getAttribute("delay"), 0.0);
                        /**RouteSubType */
                        var routest = EU.strToRouteSubType( EU.asObject(creep.getAttribute("routesubtype") ));
                        var routeindex = EU.asObject(creep.getAttribute("routeindex"), 0);
                        if ( EU.xmlLoader.stringIsEmpty(name) ) name = dname;
                        if ( healthRate == 0 ) healthRate = dhealthRate;
                        if ( score == 0 ) score = dscore;
                        if ( delay == 0 ) delay = ddelay;
                        //TODO: EU.RouteSubType
                        if ( routest == EU.RouteSubType.defaultvalue ) routest = droutest;
                        if ( routeindex == 0 ) routeindex = drouteindex;
                        wave.creeps.push(name);
                        wave.healthRate.push(healthRate);
                        wave.scores.push(score);
                        wave.delayOneUnit.push(delay);
                        wave.routeIndex.push( routeindex );
                        wave.routeSubType.push( routest );
                    }
                }
            }
        }
    },

    clear: function()
    {
        this.m_waveIndex = 0;
        this.m_wavesCount = 0;
        
        while (this.m_waves.length > 0) { this.m_waves.pop(); }
        this.m_currentWave = null;
        this.m_currentWaveIndex = -1;

        this.m_delayUnits.set( 0 );
        this.m_delayWaves.set( 0 );

        this.m_delayWavesNow = false;
    },
    start: function()
    {
        this.m_delayUnits.reset();
        this.m_delayWaves.reset();
        this.m_currentWave = null;
        this.m_currentWaveIndex = -1;

        this.m_delayUnits.set( 0 );

        this.m_waveIndex = 0;
        this.m_wavesCount = this.m_waves.length;
        this.m_delayWavesNow = false;
        EU.GameGSInstance.updateWaveCounter();
        this.resume();
    },
    pause: function()
    {
        this.m_isRunning = false;
    },
    resume: function()
    {
        this.m_isRunning = true;
    },
    update: function(dt)
    {
        if( this.m_isRunning == false )
            return;

        if ( this.m_currentWave != null && this.m_currentWave.valid() == false )
        {
            this.m_waves.shift();
            this.m_currentWave = null;
            this.m_currentWaveIndex = -1;
            this.onFinishWave();
        }
        else
        if ( this.m_currentWave != null && this.m_currentWave.valid() )
        {
            this.m_delayUnits.tick( dt );
            if( this.m_delayUnits.is() )
            {
                this.generateCreep();
                if( this.m_currentWave.valid() )
                {
                    var delay = this.m_currentWave.delayOneUnit[0];
                    this.m_delayUnits.set( delay );
                }
                else
                {
                    this.m_delayUnits.reset();
                }
            }
        }
        else
        {
            if( this.m_delayWavesNow == false )
            {
                this.m_delayWavesNow = true;
                if ( this.m_waves.length > 0 )
                {
                    this.onPredelayWave( this.m_waves[0] );
                }
            }

            else
            {
                this.m_delayWaves.reset();
                this.m_delayWavesNow = false;
                if ( this.m_waves.length > 0 )
                {
                    this.m_currentWave = this.m_waves[0];
                    EU.assert( this.m_currentWave.valid() );
                    this.onStartWave(this.m_currentWave );
                    var delay = this.m_currentWave.delayOneUnit[0];
                    this.m_delayUnits.set( delay );
                }
            }
        }
    },

    onPredelayWave: function(wave )
    {
        EU.GameGSInstance.updateWaveCounter();
        EU.GameGSInstance.getGameBoard( ).onPredelayWave( wave, (this.m_waveIndex != 0? this.m_delayWaves.value() : 0) );
    },

    onStartWave: function(wave )
    {
        this.m_waveIndex = Math.min( this.m_waveIndex + 1, this.m_wavesCount );
        EU.GameGSInstance.getGameBoard( ).onStartWave( wave );
    },

    onFinishWave: function()
    {
        EU.GameGSInstance.getGameBoard().onFinishWave();
        if ( this.m_waves.length == 0 )
        {
            this.onFinishAllWaves();
        }
    },

    onFinishAllWaves: function()
    {
        EU.GameGSInstance.getGameBoard().onFinishWaves();
    },

    generateCreep: function()
    {
        EU.assert( this.m_currentWave != null );
        EU.assert(this.m_currentWave.creeps.length > 0);
        var name = this.m_currentWave.creeps[0];

        var rst = this.m_currentWave.routeSubType[0];
        var ri = this.m_currentWave.routeIndex[0];
        var creep = EU.GameGSInstance.getGameBoard().createCreep(name, rst, ri);
        if ( creep )
        {
            var cost = this.m_currentWave.scores[0];
            creep._cost = cost;
            creep.setRate( this.m_currentWave.healthRate[0] );
        }
        this.m_currentWave.pop();
    }
};


EU.WaveInfo = cc.Class.extend(
{
    /** @type {Array< string >} */creeps : null,
    /** @type {Array< var >} */delayOneUnit : null,
    /** @type {Array< Integer >} */scores : null,
    /** @type {Array< EU.RouteSubType >} */routeSubType : null,
    /** @type {Array< Integer >} */routeIndex : null,
    /** @type {Array< var >} */healthRate : null,
    /** @type {Array< EU.UnitLayer >} */type : null,
    /** @type {Integer} */index : -1,
    ctor: function()
    {
        "use strict";
        this.creeps = [];
        this.delayOneUnit = [];
        this.scores = [];
        this.routeSubType = [];
        this.routeIndex = [];
        this.healthRate = [];
        this.type = EU.UnitLayer.any;
    },
    valid: function()
    {
        "use strict";
        return this.delayOneUnit.length > 0;
    },
    pop: function()
    {
        "use strict";
        this.creeps.shift();
        this.delayOneUnit.shift();
        this.scores.shift();
        this.healthRate.shift();
        this.routeSubType.shift();
        this.routeIndex.shift();
    }
});

(function(){
    EU.WaveGenerator.init();
})();
