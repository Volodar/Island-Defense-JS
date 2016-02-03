
//Define namespace
var EU = EU || {};

EU.IndicatorNode = cc.Node.extend({

    /** For Test Instance of */
    __IndicatorNode : true,

    IndicatorWidth : 30,
    /**@type {cc.Sprite}*/ _bg : null,
    /**@type {cc.Sprite}*/ _progressNode : null,

    ctor: function( )
    {
        this._super();
        //TODO:ImageManager
        this._bg = ImageManager.shared().sprite( "images/square.png" );
        this._progressNode = ImageManager.sprite( "images/square.png" );
        EU.assert( this._bg );
        EU.assert( this._progressNode );

        this._bg.setAnchorPoint( cc.p( 0.0, 0.0) );
        this._bg.setScale( this.IndicatorWidth, 4 );
        this._bg.setColor( new cc.Color( 220, 0, 0 ) );

        this._progressNode.setAnchorPoint( cc.p( 0.0, 0.0) );
        this._progressNode.setScale( this.IndicatorWidth, 4 );
        this._progressNode.setColor( new cc.Color( 0, 192, 0 ) );

        this.addChild( this._bg, -1 );
        this.addChild( this._progressNode, 1 );

        this.setName( "health_indicator" );
    },

    setProgress: function( progress)
    {
        progress = Math.min( progress, 1 );
        progress = Math.max( progress, 0 );
        this._progressNode.setScaleX( progress * this.IndicatorWidth );
    }

});
