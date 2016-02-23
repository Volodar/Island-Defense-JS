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

EU.ScoreNode = cc.Node.extend({
    healths: null,
    golds: null,
    waves: null,
    scores:null,
    healthsIcon: null,
    
    ctor: function(){
        this._super();
        this.scores = {};
        EU.ScoreCounter.observer( EU.kScoreLevel ).add( this.__instanceId, this.on_change_money, this );
        EU.ScoreCounter.observer( EU.kScoreHealth ).add( this.__instanceId, this.on_change_lifes, this );

        this.load_str( "ini/gamescene/scorenode.xml" );

        this.healths = EU.Common.getNodeByPath(this, "lifes/value");
        this.golds = EU.Common.getNodeByPath(this, "gears/value");
        this.waves = EU.Common.getNodeByPath(this, "waves/value");
    },
    clear: function(){
        EU.ScoreCounter.observer( EU.kScoreLevel ).remove( this.__instanceId );
        EU.ScoreCounter.observer( EU.kScoreHealth ).remove( this.__instanceId );
    },
    updateWaves: function()
    {
        var wave = EU.WaveGenerator.getWaveIndex();
        var count = EU.WaveGenerator.getWavesCount();
        var text = wave + "/" + count;
        if( this.waves )
            this.waves.setString( text );
    },
    on_change_money: function( score )
    {
        var prev = this.scores[EU.kScoreLevel];
        var curr = EU.ScoreCounter.getMoney( EU.kScoreLevel );
        if( prev != curr )
        {
            curr = Math.max( 0, curr );
            this.scores[EU.kScoreLevel] = curr;
            if( this.golds )
                this.golds.setString( curr );
        }
    },
    on_change_lifes: function( score )
    {
        var health = Math.max( 0, EU.ScoreCounter.getMoney( EU.kScoreHealth ) );
        if(this.healths)
            this.healths.setString( health );
        //TODO: show damage by player in score area
        //auto run = []( Node*node )
        //{
        //    float s = node.getScale();
        //    if( node.getActionByTag( 0x12 ) )
        //        return;
        //
        //    auto action = EaseBackInOut.create( Sequence.create(
        //    ScaleTo.create( 0.5, s * 1.5f ),
        //    ScaleTo.create( 0.5, s * 1.0f ),
        //    nullptr ) );
        //    action.setTag( 0x12 );
        //    node.runAction( action );
        //};
        //
        //run( this.healths );
        //run( this.healthsIcon );
    }
});

EU.NodeExt.call(EU.ScoreNode.prototype);