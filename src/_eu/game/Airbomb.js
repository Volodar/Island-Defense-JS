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


EU.Airbomb = EU.Unit.extend(
{
    /** For Test Instance of */
    __Airbomb : true,

    /**Point */
    _targetPoint: null,

    ctor: function(  path,  xmlFile,   position )
    {
        //if ( !NodeExt.init.call(this) ) return;

        this._targetPoint = cc.p(0,0);
        this._targetPoint = position;

        var count = 3 ;
        var positions = [];
        for( var i = 0; i < count; ++i )
        {
            var dx = cc.randomMinus1To1() * 50;
            var dy = cc.randomMinus1To1() * 50;
            var pos = cc.pAdd(position, cc.p( dx, dy ));
            positions.push( pos );
            EU.xmlLoader.macros.set( "airplane_bomb_posx" +  i+1 , ( pos.x ) );
            EU.xmlLoader.macros.set( "airplane_bomb_posy" +  i+1 , ( pos.y ) );
        }

        this.init_str_str.call(this, path, xmlFile );

        for( var i = 0; i < count; ++i )
        {
            EU.xmlLoader.macros.erase( "airplane_bomb_posx" +  i + 1 ) ;
            EU.xmlLoader.macros.erase( "airplane_bomb_posy" +  i + 1 ) ;

            var pos = positions[i];
            var actionBomb = /**FiniteTimeAction*/ (this.getAction(  (i + 1) + "_bomb_move" ));
            var expl = actionBomb.getDuration();
            var self = this;
            var exp = cc.sequence( cc.delayTime( expl ), cc.callFunc( this.explosion.bind(this, this.pos)));
            this.runAction( exp );
        }

        var actionPlace = /**FiniteTimeAction*/ (this.getAction( "3_place" ));
        var life = actionPlace.getDuration();
        var self = this;
        var die = cc.sequence( cc.delayTime( life ),
            cc.callFunc( this.die.bind(this)) );
        this.runAction( die );

        this.runEvent( "run" );
    },
    explosion: function( position )
    {
        var pos = this.getPosition();
        var z = this.getLocalZOrder();
        this.setPosition( position );
        var board = GameGS.getInstance().getGameBoard();
        board.applyDamageBySector( this );
        this.setPosition( pos );
        this.setLocalZOrder( z );
        GameGS.getInstance().shake();
    },

    die: function()
    {
        this.removeFromParent();
    }


});
