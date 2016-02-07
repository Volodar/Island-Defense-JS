
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

EU.ScrollMenu = EU.Scissor.extend(
{

    /** @type {Boolean} */ _touchEnabled :false ,
    /** @type {Boolean} */ _scrollEnabled :false ,

    /** @type {MenuItem} */ _selected : null,
    /** @type {MenuItem} */ _selectedOnTouchBegan : null,
    /** @type {Array<MenuItem>} */ _items : [],

    /** @type {Boolean} */ _scrolled : false,
    /** @type {Boolean} */ _allowScrollX : true,
    /** @type {Boolean} */ _allowScrollY : true,
    /** @type {Integer} */ _alignedCols : 99999,
    /** @type {cc.Point} */ _scrollAreaPos : new cc.Point(0,0),
    /** @type {cc.Point} */ _alignedStartPosition : new cc.Point(0,0),
    /** @type {cc.Size} */ _gridSize : new cc.Size(0,0),

    //CC_PROPERTY_PASS_BY_REF( int, _alignedCols, AlignedColums );
    //
    //CC_SYNTHESIZE( Boolean, _allowScrollX, AllowScrollByX );
    //CC_SYNTHESIZE( Boolean, _allowScrollY, AllowScrollByY );
    //
    //CC_SYNTHESIZE_PASS_BY_REF( Size, _gridSize, GrisSize );
    //CC_SYNTHESIZE_PASS_BY_REF( Point, _alignedStartPosition, AlignedStartPosition );

    init: function()
    {
        var result = true ;

        var size = cc.view.getDesignResolutionSize();
        this.setContentSize( size );
        this.setScissorRect( cc.POINT_ZERO, size );
        this.setScissorEnabled( false );
        this.setTouchEnabled( true );
        this.setScrollEnabled( false );

        return result;
    },

    isTouchEnabled: function()
    {
        return this._touchEnabled;
    },

    setEnabled: function( flag )
    {
        this.setTouchEnabled( flag );
    },

    isEnabled: function( )
    {
        return this.isTouchEnabled();
    },

    setTouchEnabled: function(flag )
    {
        if( this._touchEnabled == flag )
        return;

        this._touchEnabled = flag;

        var touchListener = new cc._EventListenerTouchOneByOne();
        touchListener.onTouchBegan = this.onTouchBegan.bind(this);
        touchListener.onTouchMoved = this.onTouchMoved.bind(this);
        touchListener.onTouchEnded = this.onTouchEnded.bind(this);
        touchListener.onTouchCancelled = this.onTouchCancelled.bind(this);
        touchListener.setSwallowTouches( true );
        
        //TODO: Check if addListener is the correct porting method
        cc.eventManager.addListener(touchListener, this);
        //this._eventDispatcher.addEventListener( touchListener, this );

    },

    isScrollEnabled: function( )
    {
            return this._scrollEnabled;
    },

    setScrollEnabled: function( flag )
    {
        this._scrollEnabled = flag;
    },

    onTouchBegan: function( /**cc.Touch */ touch, /** cc.Event*/ event)
    {
        if( this._touchEnabled == false ) return false;
        var node = this;
        while( node )
        {
            if( node.isVisible() == false ) return false;
            node = node.getParent();
        }

        this._selectedOnTouchBegan = this.getItemForTouch( touch );
        if( this._selectedOnTouchBegan )
            this.select( this._selectedOnTouchBegan );

        if( this._scrollEnabled )
        {
            var pointLocal = this.convertToNodeSpace( touch.getLocation() );
            return this.checkTouchInScissorArea( pointLocal );
        }
        return this._selectedOnTouchBegan != null;
    },

    onTouchEnded: function( touch, event)
    {
        if( this._touchEnabled == false ) return;
        if( this._scrollEnabled && this._scrolled )
        {
            this.scrollEnded( touch );
        }
        var item = this.getItemForTouch( touch );
        if( item && item == this._selectedOnTouchBegan )
        {
            this.activate( this._selectedOnTouchBegan );
        }
        this._selectedOnTouchBegan = this._selected = null;
    },

    onTouchMoved: function( touch, event)
    {
        if( this._touchEnabled == false ) return;
        if( this._scrollEnabled )
        {
            if( this._scrolled )
            {
                this.scrollMoved( touch );
            }
            else
            {
                var length = (touch.getStartLocation() - touch.getLocation()).getLength();
                if( length > 5 )
                {
                    this.scrollBegan( touch );
                    this.unselect( this._selectedOnTouchBegan );
                    this._selectedOnTouchBegan = null;
                }
            }
        }

        var item = this.getItemForTouch( touch );
        if( item != this._selected )
        {
            this.unselect( this._selected );
        }
        if( item& this._selected == null& item == this._selectedOnTouchBegan )
        {
            this.select( this._selectedOnTouchBegan );
        }
    },

    onTouchCancelled: function( touch, event)
    {
        if( this._scrollEnabled&& this._scrolled )
        {
            this.scrollCanceled( touch );
        }
        this.unselect( this._selectedOnTouchBegan );
    },

    scrollBegan: function( touch )
    {
        EU.assert( this._scrollEnabled );
        this._scrolled = true;
    },

    scrollMoved: function( touch )
    {
        EU.assert( this._scrollEnabled );
        var point = touch.getLocation( );
        var shift = touch.getDelta();

        var newPos = this._scrollAreaPos + shift;
        newPos = this.fitPosition( newPos );

        shift = newPos - this._scrollAreaPos;
        this._scrollAreaPos = newPos;
        for (var i = 0; i < this.getChildren().length; i++) {
            var child = this.getChildren()[i];
            var pos = child.getPosition( );
            pos.x += this._allowScrollX ? shift.x : 0;
            pos.y += this._allowScrollY ? shift.y : 0;
            child.setPosition( pos );
        }
    },

    scrollEnded: function( touch )
    {
        EU.assert( this._scrollEnabled );
        var pos = this.fitPositionByGrid( this._scrollAreaPos );
        var shift = cc.math.Vec2.subtract(new cc.Point(0,0), pos, this._scrollAreaPos);

        for (var i = 0; i < this.getChildren().length; i++) {
            var child = this.getChildren()[i];
            var to = cc.math.Vec2.add(new cc.Point(0,0), child.getPosition(), shift);
            var action = ( new cc.MoveTo( 0.2, to )).easing(cc.easeBackOut());
            child.runAction( action );
        }
        this._scrollAreaPos = pos;
        this._scrolled = false;
    },

    scrollCanceled: function( touch )
    {
        EU.assert( this._scrollEnabled );
        this.scrollEnded( touch );
    },

    fitPosition: function( pos )
    {
        var result = pos;
        var scissorSize = this.getScissorRect();
        var contentSize = this.getContentSize();

        var right = true ;
        right = this._allowScrollX ? this._gridSize.width > 0 : right;
        right = this._allowScrollY ? this._gridSize.height > 0 : right;

        if( right )
        {
            var min = cc.math.Vec2.subtract(new cc.Point(0,0), scissorSize, contentSize );
            result.x = std.max( min.x, result.x );
            result.x = std.min( 0, result.x );
            result.y = std.max( min.y, result.y );
            result.y = std.min( 0, result.y );
        }
        else
        {
            var max = cc.math.Vec2.subtract(new cc.Point(0,0), scissorSize, contentSize );
            max.y = -max.y;
            result.x = std.min( max.x, result.x );
            result.x = std.max( 0, result.x );
            result.y = std.min( max.y, result.y );
            result.y = std.max( 0, result.y );
        }
        return result;
    },

    fitPositionByGrid: function (pos )
    {
        var result = this._scrollAreaPos;
        if( this._gridSize.width != 0 && this._allowScrollX )
        {
            EU.assert( this._gridSize.width != 0 );
            if( result.x != this.getScissorRect().size.width - this.getContentSize().width )
            {
                var i = ((-this._scrollAreaPos.x / this._gridSize.width) + 0.5);
                result.x = -(this._gridSize.width * i);
            }
        }
        if( this._gridSize.height != 0 && this._allowScrollY )
        {
            EU.assert( this._gridSize.height != 0 );
            var y = this.getScissorRect().size.height - this.getContentSize().height;
            y = this._gridSize.height < 0 ? -y : y;
            if( result.y != y )
            {
                var i = ((-this._scrollAreaPos.y / this._gridSize.height) + 0.5);
                result.y = -(this._gridSize.height * i);
            }
        }
        return this.fitPosition( result );
    },

    select: function(  item )
    {
        EU.assert( this._selected == null || this._selected == item );
        this.unselect( this._selected );
        this._selected = item;
        if( this._selected )
            this._selected.selected();
    },

    unselect: function(  item )
    {
        //	EU.assert(this._selected == item);
        if( item )
            item.unselected();
        this._selected = null;
    },

    activate: function(  item )
    {
        if(this._selected != item || item == null )
            return;
        EU.assert( this._selected == item && item != null );
        this.unselect( this._selected );
        if( item )
            item.activate();
    },

    getItemsCount: function()
    {
        return this._items.length;
    },

    getItem: function( index )
    {
        return this._items[index];
    },

    getItemByName: function(  name )
    {
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            if( item.getName() == name )
                return item;
        }
        return null;
    },

    getItemForTouch: function( touch )
    {
        var point = touch.getLocation();
        var pointLocal = this.convertToNodeSpace( point );

        if( this._scrollEnabled && this.checkTouchInScissorArea( pointLocal ) == false )
            return null;

        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            if( item )
            {
                var check = EU.Common.checkPointInNode( item, pointLocal );
                if( check ) return item;
            }
        }
        return null;
    },

    push: function(
     normalImage,
     selectedImage,
     disabledImage,
     fontBMP,
     text,
     callback )
    {
        var item = new EU.mlMenuItem( normalImage, selectedImage, disabledImage, fontBMP, text, callback );
        this.addItem( item );

        return item;
    },

    addItem: function( item )
    {
        this.addChild( item );
        this._items.push( item );
    },

    //void removeItem( MenuItem item );
    removeAllItems: function( )
    {
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            item.removeFromParent();
        }
        this._items = [];
    },

    push2: function(
     normalImage,
     selectedImage,
     fontBMP,
     text,
     callback )
    {
        return this.push( normalImage, selectedImage, normalImage, fontBMP, text, callback );
    },


    push3: function(
     normalImage,
     selectedImage,
     callback )
    {
        return this.push( normalImage, selectedImage, normalImage, "", "", callback );
    },


    push4: function(
     normalImage,
     callback )
    {
        return this.push( normalImage, normalImage, normalImage, "", "", callback );
    },

    getChildByName: function( name )
    {
        var children = this.getChildren();
        var nodeChildren = Node.prototype.getChildren.call(this);
        for (var i = 0; i < nodeChildren.length; i++) {
            var item = nodeChildren[i];
            children.push( item);
        }
        for (var i = 0; i < children.length; i++) {
            var child = children[i];
            if( child.getName() == name )
                return child;
        }
        return null;
    },

    align: function( cols )
    {
        if( this._gridSize.width == 0 && this._gridSize.height == 0 )
            return;
        this.setAlignedColumns( cols );
        var index = 0;
        var width0 = 0;
        var width1 = 0;
        var height0 = 0;
        var height1 = 0;
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            var row = index / cols;
            var col = index % cols;
            var pos;
            pos.x = col * this._gridSize.width + this._gridSize.width / 2;
            pos.y = row * this._gridSize.height + this._gridSize.height / 2;
            pos += this._alignedStartPosition;

            width0 = std.max( width0, pos.x + item.getContentSize().width * item.getAnchorPoint().x );
            height0 = std.max( height0, pos.y + item.getContentSize().height * item.getAnchorPoint().y );
            width1 = std.min( width1, pos.x - item.getContentSize().width * item.getAnchorPoint().x );
            height1 = std.min( height1, pos.y - item.getContentSize().height * item.getAnchorPoint().y );

            item.setPosition( pos );
        }
        this.setContentSize( Size( Math.abs( width1 - width0 ), Math.abs( height1 - height0 ) ) );
    },

    setAlignedColumns: function(  count )
    {
        this._alignedCols = count;
    },

    getAlignedColumns: function( )
    {
        return this._alignedCols;
    }

});
