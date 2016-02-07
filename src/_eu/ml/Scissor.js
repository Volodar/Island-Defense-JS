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


EU.Scissor = cc.Layer.extend(
{

    /** @type {Node} */ _container : null,
    /** @type {cc.Rect} */ _frame : new cc.Rect(),
    /** @type {cc.Rect} */ _parentScissorRect : new cc.Rect(),
    /** @type {Boolean} */ _scissorRestored : false,
    /** @type {cc.CustomRenderCmd} */ _beforeDrawCommand : new cc.CustomRenderCmd(),
    /** @type {cc.CustomRenderCmd} */ _afterDrawCommand : new cc.CustomRenderCmd(),
    /** @type {Boolean} */ _scissorEnabled : false,
    /** @type {Boolean} */ _childAddToConteiner : true,

    ctor: function() {
        this._super();
        this._container = new cc.Node();
        EU.assert( this._container );
        this._container.setParent( this );

        this.setCascadeColorEnabled( true );
        this.setCascadeOpacityEnabled( true );
        this._container.setCascadeColorEnabled( true );
        this._container.setCascadeOpacityEnabled( true );
    },

    onEnter: function()
    {
        this._super();
        this._container.onEnter();
    },

    onExit: function()
    {
        this._super();
        this._container.onExit();
    },

    visit: function( /**@type {cc.Node.RenderCmd} renderer */renderer, parentTransform, parentFlags )
    {
        if( this.isVisible() )
        {
            this._super( renderer, parentTransform, parentFlags );

            if( this._scissorEnabled ) this.visit_scissor( renderer, parentTransform, parentFlags );
            else this.visit_normal( renderer, parentTransform, parentFlags );
        }
    },
    isScissorEnabled: function() { return this._scissorEnabled; },
    setScissorEnabled: function( mode ) { this._scissorEnabled = mode; },

    setScissorRect: function( rect )
    {
        this.setScissorRect_point_n_size( rect.origin, rect.size );
        EU.assert( this._frame.size.width >= 0 );
        EU.assert( this._frame.size.height >= 0 );
    },

    setScissorRect_point_n_size: function( origin, area )
    {
        this._frame.origin = origin;
        this._frame.size = area;
        EU.assert( this._frame.size.width >= 0 );
        EU.assert( this._frame.size.height >= 0 );
        this._container.setContentSize( area );
    },

    getScissorRect: function()
    {
        return this._frame;
    },


    addChild: function( child )
    {
        this._childAddToConteiner ? this._container.addChild( child )
            : cc.Node.prototype.addChild.call( this, child);
    },
    addChild_1: function( child, zOrder )
    {
        this._childAddToConteiner ? this._container.addChild( child, zOrder )
            : cc.Node.prototype.addChild.call( this, child, zOrder );
    },
    addChild_2: function( child, zOrder, tag)
    {
        this._childAddToConteiner ? this._container.addChild( child, zOrder, tag )
            : cc.Node.prototype.addChild.call( this, child, zOrder, tag );
    },
    //addChild_3: function( child, zOrder,  name )
    //{
    //    this._childAddToConteiner ? this._container.addChild( child, zOrder, name ) : Node.addChild( child, zOrder, name );
    //},

    addChildNotScissor: function( child )
    {
        this._childAddToConteiner = false;
        cc.Node.prototype.addChild.call( this, child );
        this._childAddToConteiner = true;
    },
    addChildNotScissor_1: function( child, zOrder )
    {
        this._childAddToConteiner = false;
        cc.Node.prototype.addChild.call( this, child, zOrder );
        this._childAddToConteiner = true;

    },
    addChildNotScissor_2: function( child, zOrder, tag)
    {
        this._childAddToConteiner = false;
        cc.Node.prototype.addChild.call( this, child, zOrder, tag );
        this._childAddToConteiner = true;
    },
    //addChildNotScissor: function( child, zOrder,  name )
    //{
    //    this._childAddToConteiner = false;
    //    Node.addChild( child, zOrder, name );
    //    this._childAddToConteiner = true;
    //},

    getChildren: function() { return this._container.getChildren(); },
    getChildrenCount: function()  { return this._container.getChildrenCount(); },

    checkTouchInScissorArea: function( point )
    {
        var point_ = cc.math.Vec2.subtract(new cc.Point(0,0), point, this._frame.origin);
        var result = this.checkPointInNode( this._container, point_, this._scissorEnabled ? 0 : -1 );
        return result;
    },
    getScissorConteiner: function() { return this._container; },
    updateDisplayedOpacity: function( parentOpacity )
    {
        this._displayedOpacity = this._realOpacity * parentOpacity / 255.0;
        this.updateColor( );

        if( this._cascadeOpacityEnabled )
        {
            for (var i = 0; i < this._children.length; i++) {
                var child = this._children[i];
                child.updateDisplayedOpacity( this._displayedOpacity );
            }
            for (var i = 0; i < this._container.getChildren().length; i++) {
                var child = this._container.getChildren()[i];
                child.updateDisplayedOpacity( this._displayedOpacity );
            }
        }
    },
    visit_scissor: function( renderer,  /** cc.math.Matrix4Stack */ parentTransform, parentFlags )
    {
        var check_null_rotate = function()
        {
            var node = this;
            while( node )
            {
                if( node.getRotation() != 0 )
                    return false;
                node = node.getParent();
            }
            return true;
        };
        EU.assert( check_null_rotate() );

        this._container.setVisible( false );
        this.beforeDraw();
        this._container.setVisible( true );
        this.visit_normal( renderer, parentTransform, parentFlags );
        this.afterDraw();
    },
    visit_normal: function( renderer, /** cc.math.Matrix4Stack */ parentTransform, parentFlags )
    {
        var director = cc.director;
        cc.kmGLPushMatrixWitMat4( cc.modelview_matrix_stack );
        cc.kmGLLoadMatrix( cc.modelview_matrix_stack, this._modelViewTransform );

        this._container.visit( renderer, cc.kmMat4Multiply( new cc.math.Matrix4(), parentTransform, this._transform)
            , parentFlags | cc.Node._dirtyFlags.transformDirty);

        cc.kmGLPopMatrix(cc.modelview_matrix_stack);
    },

    beforeDraw: function()
    {
        this._beforeDrawCommand.init( this.getGlobalZOrder() );
        this._beforeDrawCommand.func = this.onBeforeDraw.bind(this);
        //TODO: check if pushRenderCommand is correct ported function
        cc.renderer.pushRenderCommand(this._beforeDrawCommand );
    },

    afterDraw: function()
    {
        this._afterDrawCommand.init( this.getGlobalZOrder() );
        this._afterDrawCommand.func = this.onAfterDraw.bind(this);
        cc.renderer.pushRenderCommand(this._afterDrawCommand );
    },

    onBeforeDraw: function()
    {
        var glview = cc.view;
        var frame = new cc.Rect();

        frame.origin = this.convertToWorldSpace( this._frame.origin );
        frame.size = this._frame.size;

        this._scissorRestored = false;

        if( glview.isScissorEnabled() )
        {
            this._scissorRestored = true;
            this._parentScissorRect = glview.getScissorRect();
            if( cc.rectIntersectsRect(frame, this._parentScissorRect ) )
            {
                var x = Math.max( frame.origin.x, this._parentScissorRect.origin.x );
                var y = Math.max( frame.origin.y, this._parentScissorRect.origin.y );
                var xx = Math.min( frame.origin.x + frame.size.width, this._parentScissorRect.origin.x + this._parentScissorRect.size.width );
                var yy = Math.min( frame.origin.y + frame.size.height, this._parentScissorRect.origin.y + this._parentScissorRect.size.height );
                glview.setScissorInPoints( x, y, xx - x, yy - y );
            }
        }
        else
        {
            cc.glEnable( gl.SCISSOR_TEST );
            glview.setScissorInPoints( frame.origin.x, frame.origin.y, frame.size.width, frame.size.height );
        }
    },

    onAfterDraw: function()
    {
        var glview = cc.view;
        if( this._scissorRestored )
        {//restore the parent's scissor rect
            glview.setScissorInPoints( this._parentScissorRect.origin.x, this._parentScissorRect.origin.y,
                this._parentScissorRect.size.width, this._parentScissorRect.size.height );
        }
        else
        {
            //TODO: there isn't any glDisable in the code
            cc.glEnable( false );
            //glDisable( GL_SCISSOR_TEST );
        }
    }
});
