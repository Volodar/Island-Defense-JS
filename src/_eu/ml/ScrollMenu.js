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

EU.ScrollMenu = cc.Layer.extend(
{
    /** Test instance of */
    __ScrollMenu : true,

    /** @type {Boolean} */ _touchEnabled :null ,
    /** @type {Boolean} */ _scrollEnabled :null ,

    /** @type {MenuItem} */ _selected : null,
    /** @type {MenuItem} */ _selectedOnTouchBegan : null,
    /** @type {Array<MenuItem>} */ _items : null,

    /** @type {Boolean} */ _scrolled : null,
    /** @type {Boolean} */ _allowScrollX : null,
    /** @type {Boolean} */ _allowScrollY : null,
    /** @type {Integer} */ _alignedCols : null,
    /** @type {cc.Point} */ _scrollAreaPos : null,
    /** @type {cc.Point} */ _alignedStartPosition : null,
    /** @type {cc.Size} */ _gridSize : null,
    /** @type {cc.Rect} */ _visibleRect : null,

    ctor: function()
    {
        this._super();
        this._touchEnabled = false;
        this._scrollEnabled  = false;
        this._selected = null;
        this._selectedOnTouchBegan = null;
        this._items = [];
        this._scrolled = false;
        this._allowScrollX = true;
        this._allowScrollY = true;
        this._alignedCols = 99999;
        this._scrollAreaPos = cc.p(0,0);
        this._alignedStartPosition = cc.p(0,0);
        this._gridSize = cc.size(0,0);
        this._visibleRect = cc.rect(0,0,0,0);
    },
    init: function()
    {
        var result = true ;

        var size = cc.view.getDesignResolutionSize();
        this.setContentSize( size );
        this.setTouchEnabled( true );
        this.setScrollEnabled( false );
        this.setVisibleRect( cc.rect(0,0,size.width, size.height) );

        return result;
    },

    setVisibleRect: function( rect ){
        EU.assert( rect );
        this._visibleRect = rect;
    },
    getVisibleRect:function(){
        return this._visibleRect;
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

        this.touchListener = cc.EventListener.create({
            event: cc.EventListener.TOUCH_ONE_BY_ONE,
            swallowTouches: true,
            onTouchBegan: this.onTouchBegan,
            onTouchMoved: this.onTouchMoved,
            onTouchEnded: this.onTouchEnded,
            onTouchCancelled: this.onTouchCancelled
        });
        cc.eventManager.addListener(this.touchListener, this);
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
        var target = event.getCurrentTarget();
        if( target._touchEnabled == false ) return false;
        var node = target;
        while( node )
        {
            if( node.isVisible() == false ) return false;
            node = node.getParent();
        }

        target._selectedOnTouchBegan = target.getItemForTouch( touch );
        if( target._selectedOnTouchBegan )
            target.select( target._selectedOnTouchBegan );

        if( target._scrollEnabled )
        {
            var pointLocal = target.convertToNodeSpace( touch.getLocation() );
            return target._selectedOnTouchBegan != null;
        }
        return target._selectedOnTouchBegan != null;
    },

    onTouchEnded: function( touch, event)
    {
        var target = event.getCurrentTarget();
        if( target._touchEnabled == false ) return;
        if( target._scrollEnabled && target._scrolled )
        {
            target.scrollEnded( touch );
        }
        var item = target.getItemForTouch( touch );
        if( item && item == target._selectedOnTouchBegan )
        {
            target.activate( target._selectedOnTouchBegan );
        }
        target._selectedOnTouchBegan = target._selected = null;
    },

    onTouchMoved: function( touch, event)
    {
        var target = event.getCurrentTarget();
        if( target._touchEnabled == false ) return;
        if( target._scrollEnabled )
        {
            if( target._scrolled )
            {
                target.scrollMoved( touch );
            }
            else
            {
                var length = EU.Common.pointLength(EU.Common.pointDiff(touch.getStartLocation(), touch.getLocation()));
                if( length > 5 )
                {
                    target.scrollBegan( touch );
                    target.unselect( target._selectedOnTouchBegan );
                    target._selectedOnTouchBegan = null;
                }
            }
        }

        var item = target.getItemForTouch( touch );
        if( item != target._selected )
        {
            target.unselect( target._selected );
        }
        if( item && target._selected == null && item == target._selectedOnTouchBegan )
        {
            target.select( target._selectedOnTouchBegan );
        }
    },

    onTouchCancelled: function( touch, event)
    {
        var target = event.getCurrentTarget();
        if( target._scrollEnabled && target._scrolled )
        {
            target.scrollCanceled( touch );
        }
        target.unselect( target._selectedOnTouchBegan );
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

        var newPos = EU.Common.pointAdd(this._scrollAreaPos, shift);
        newPos = this.fitPosition( newPos );

        shift = EU.Common.pointDiff(newPos, this._scrollAreaPos);
        this._scrollAreaPos = newPos;
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            var pos = item.getPosition( );
            pos.x += this._allowScrollX ? shift.x : 0;
            pos.y += this._allowScrollY ? shift.y : 0;
            item.setPosition( pos );
        }
    },

    scrollEnded: function( touch )
    {
        //EU.assert( this._scrollEnabled );
        var pos = this.fitPositionByGrid( this._scrollAreaPos );
        var shift = EU.Common.pointDiff(pos, this._scrollAreaPos);

        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            var to = EU.Common.pointAdd(item.getPosition(), shift);
            var action = (cc.moveTo( 0.2, to )).easing(cc.easeBackOut());
            item.runAction( action );
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
        var visibledRect = this.getVisibleRect();
        var visibledSize = cc.size(visibledRect.width, visibledRect.height);
        var contentSize = this.getContentSize();

        var right = true ;
        right = this._allowScrollX ? this._gridSize.width > 0 : right;
        right = this._allowScrollY ? this._gridSize.height > 0 : right;

        if( right )
        {
            var min = cc.p(0,0);
            min.x = visibledSize.width - contentSize.width;
            min.y = visibledSize.height - contentSize.height;
            result.x = Math.max( min.x, result.x );
            result.x = Math.min( 0, result.x );
            result.y = Math.max( min.y, result.y );
            result.y = Math.min( 0, result.y );
        }
        else
        {
            var max = cc.p(0,0);
            max.x = visibledSize.width - contentSize.width;
            max.y = visibledSize.height - contentSize.height;
            max.y = -max.y;
            result.x = Math.min( max.x, result.x );
            result.x = Math.max( 0, result.x );
            result.y = Math.min( max.y, result.y );
            result.y = Math.max( 0, result.y );
        }
        return result;
    },

    fitPositionByGrid: function ( pos )
    {
        var result = cc.p(this._scrollAreaPos.x, this._scrollAreaPos.y);
        if( this._gridSize.width != 0 && this._allowScrollX )
        {
            EU.assert( this._gridSize.width != 0 );
            if( result.x != this.getVisibleRect().width - this.getContentSize().width )
            {
                var i = Math.round((-this._scrollAreaPos.x / this._gridSize.width));
                result.x = -(this._gridSize.width * i);
            }
        }
        if( this._gridSize.height != 0 && this._allowScrollY )
        {
            EU.assert( this._gridSize.height != 0 );
            var y = this.getVisibleRect().height - this.getContentSize().height;
            y = this._gridSize.height < 0 ? -y : y;
            if( result.y != y )
            {
                var i = Math.round((-this._scrollAreaPos.y / this._gridSize.height));
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

        //if( this._scrollEnabled && this.checkTouchInScissorArea( pointLocal ) == false )
        //    return null;

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
            item.removeFromParentAndCleanup(true);
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

    align: function( cols )
    {
        if( this._gridSize.width == 0 && this._gridSize.height == 0 )
            return;
        this.setAlignedColumns( cols );
        var width0 = 0;
        var width1 = 0;
        var height0 = 0;
        var height1 = 0;
        for (var i = 0; i < this._items.length; i++) {
            var item = this._items[i];
            var row = Math.round(i / cols);
            var col = i % cols;
            var pos = cc.p(0,0);
            pos.x = col * this._gridSize.width + this._gridSize.width / 2;
            pos.y = row * this._gridSize.height + this._gridSize.height / 2;
            pos = EU.Common.pointAdd( pos, this._alignedStartPosition );

            width0 = Math.max( width0, pos.x + item.getContentSize().width * item.getAnchorPoint().x );
            height0 = Math.max( height0, pos.y + item.getContentSize().height * item.getAnchorPoint().y );
            width1 = Math.min( width1, pos.x - item.getContentSize().width * item.getAnchorPoint().x );
            height1 = Math.min( height1, pos.y - item.getContentSize().height * item.getAnchorPoint().y );

            item.setPosition( pos );
        }
        this.setContentSize( cc.size( Math.abs( width1 - width0 ), Math.abs( height1 - height0 ) ) );
    },

    setAlignedColumns: function(  count )
    {
        this._alignedCols = count;
    },

    getAlignedColumns: function( )
    {
        return this._alignedCols;
    },
    setAlignedStartPosition: function( point ){
        this._alignedStartPosition = point;
    },
    getAlignedStartPosition: function(){
        return this._alignedStartPosition ;
    },
    setAllowScrollByX: function( value ){
        this._allowScrollX = value;
    },
    getAllowScrollByX: function(){
        return this._allowScrollX ;
    },
    setAllowScrollByY: function( value ){
        this._allowScrollY = value;
    },
    getAllowScrollByY: function(){
        return this._allowScrollY;
    },
    setGrisSize: function( size ){
        this._gridSize = size;
    },
    getGrisSize: function(){
        return this._gridSize;
    }
});
