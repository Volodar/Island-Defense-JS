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
        this.healths = new cc.LabelBMFont( kFontStroke, "" );
        this.golds = new cc.LabelBMFont( kFontStroke, "" );
        this.waves = new cc.LabelBMFont( kFontStroke, "" );
        
        this.addChild( this.healths, 1 );
        this.addChild( this.golds, 1 );
        this.addChild( this.waves, 1 );
        
        this.healths.setAnchorPoint( Point( 0, 0.5 ) );
        this.golds.setAnchorPoint( Point( 0, 0.5 ) );
        this.waves.setAnchorPoint( Point( 0, 0.5 ) );
        
        this.healths.setPosition( Point( 85, -25 ) );
        this.golds.setPosition( Point( 190, -25 ) );
        this.waves.setPosition( Point( 85, -70 ) );
        
        this.healths.setScale( 0.5 );
        this.golds.setScale( 0.5 );
        this.waves.setScale( 0.5 );
        
        this.healthsIcon = EU.ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_lifes.png" );
        this.healthsIcon.setPosition( 62, -30 );
        this.addChild( this.healthsIcon );
        var icon = EU.ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_gold1.png" );
        icon.setPosition( 162, -30 );
        this.addChild( icon );
        icon = EU.ImageManager.sprite( EU.k.resourceGameSceneFolder + "icon_wave1.png" );
        icon.setPosition( 62, -75 );
        this.addChild( icon );
        
        EU.ScoreCounter.observer( EU.kScoreLevel ).add( __instanceId, this.on_change_money, this );
        EU.ScoreCounter.observer( EU.kScoreHealth ).add( __instanceId, this.on_change_lifes, this );
    },
    //ScoresNode.~ScoresNode()
    //{
    //    EU.ScoreCounter.observer( EU.kScoreLevel ).remove( __instanceId );
    //    EU.ScoreCounter.observer( EU.kScoreHealth ).remove( __instanceId );
    //}
    updateWaves: function()
    {
        var wave = EU.WaveGenerator.getWaveIndex();
        var count = EU.WaveGenerator.getWavesCount();
        var text = wave + "/" + count;
        this.waves.setString( text );
    },
    on_change_money: function( score )
    {
        var prev = this.scores[kScoreLevel];
        var curr = EU.ScoreCounter.getMoney( EU.kScoreLevel );
        if( prev != curr )
        {
            curr = Math.max( 0, curr );
            this.scores[kScoreLevel] = curr;
            this.golds.setString( curr );
        }
    },
    on_change_lifes: function( score )
    {
        var health = Math.max( 0, EU.ScoreCounter.getMoney( EU.kScoreHealth ) );
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
    },

});