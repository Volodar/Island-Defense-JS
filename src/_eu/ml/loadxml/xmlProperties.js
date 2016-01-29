/**
 *
 */
//Define namespace
var EU = EU || {};

EU.xmlKey = {
    i:0,
    Type:                   { name : "type", int : 0},
    Pos:                    { name : "pos", int : 1},
    Scale:                  { name : "scale", int : 2},
    Rotation:               { name : "rotation", int : 3},
    Strech:                 { name : "strech", int : 4},
    Size:                   { name : "size", int : 5},
    Visible:                { name : "visible", int : 6},
    LocalZ:                 { name : "z", int : 7},
    GlobalZ:                { name : "globalzorder", int : 8},
    Center:                 { name : "center", int : 9},
    Tag:                    { name : "tag", int : 10},
    CascadeColor:           { name : "cascadecolor", int : 11},
    CascadeOpacity:         { name : "cascadeopacity", int : 12},
    Name:                   { name : "name", int : 13},
    Image:                  { name : "image", int : 14},
    Blending:               { name : "blending", int : 15},
    Opacity:                { name : "opacity", int : 16},
    Color:                  { name : "color", int : 17},
    Animation:              { name : "animation", int : 18},
    ImageNormal:            { name : "imageN", int : 19},
    ImageSelected:          { name : "imageS", int : 20},
    ImageDisabled:          { name : "imageD", int : 21},
    Text:                   { name : "text", int : 22},
    Font:                   { name : "font", int : 23},
    TextWidth:              { name : "textwidth", int : 24},
    TextAlign:              { name : "textalign", int : 25},
    MenuCallBack:           { name : "callback", int : 26},
    ScaleEffect:            { name : "scale_effect", int : 27},
    Sound:                  { name : "sound", int : 28},
    Path:                   { name : "path", int : 29},
    Template:               { name : "template", int : 30},
    AlignCols:              { name : "cols", int : 31},
    AlignStartPosition:     { name : "alignstartpos", int : 32},
    GridSize:               { name : "gridsize", int : 33},
    ScissorRect:            { name : "scissorrect", int : 34},
    ScissorEnabled:         { name : "scissorenabled", int : 35},
    ScrollEnabled:          { name : "scrollenabled", int : 36},
    AllowScrollByX:         { name : "allowscrollbyx", int : 37},
    AllowScrollByY:         { name : "allowscrollbyy", int : 38},
    //ProgressTimer
    ProgressType:           { name : "progresstype", int : 39},
    Percent:                { name : "percent", int : 40},
    MidPoint:               { name : "midpoint", int : 41},
    BarChangeRate:          { name : "barchangerate", int : 42},
    
    //declare other properties as UserProperties + int constant
    UserProperties: { name : "", int : 43},

    //NodeExt
    _directory : null,
    //static std::map<std::string, const int>
    properties : {},
    __autofillproperties: function() {
        this.boolProperty( this.Type.name, this.Type.int );
        this.boolProperty( this.Visible.name, this.Visible.int );
        this.boolProperty( this.Pos.name, this.Pos.int );
        this.boolProperty( this.Scale.name, this.Scale .int );
        this.boolProperty( this.Strech.name, this.Strech ) ;
        this.boolProperty( this.Size.name, this.Size.int );
        this.boolProperty( this.Rotation.name, this.Rotation .int );
        this.boolProperty( this.LocalZ.name, this.LocalZ ) ;
        this.boolProperty( this.GlobalZ.name, this.GlobalZ .int );
        this.boolProperty( this.Center.name, this.Center.int );
        this.boolProperty( this.Tag.name, this.Tag.int );
        this.boolProperty( this.CascadeOpacity.name, this.CascadeOpacity .int );
        this.boolProperty( this.CascadeColor.name, this.CascadeColor .int );
        this.boolProperty( this.Image.name, this.Image .int );
        this.boolProperty( this.Blending.name, this.Blending.int );
        this.boolProperty( this.Opacity.name, this.Opacity.int );
        this.boolProperty( this.Color.name, this.Color .int );
        this.boolProperty( this.Animation.name, this.Animation .int );
        this.boolProperty( this.Name.name, this.Name.int );
        this.boolProperty( this.AlignCols.name, this.AlignCols.int );
        this.boolProperty( this.ImageNormal.name, this.ImageNormal.int);
        this.boolProperty( this.ImageSelected.name, this.ImageSelected .int );
        this.boolProperty( this.ImageDisabled.name, this.ImageDisabled .int );
        this.boolProperty( this.Text.name, this.Text .int );
        this.boolProperty( this.Font.name, this.Font .int );
        this.boolProperty( this.MenuCallBack.name, this.MenuCallBack .int );
        this.boolProperty( this.TextWidth.name, this.TextWidth .int );
        this.boolProperty( this.TextAlign.name, this.TextAlign.int );
        this.boolProperty( this.ScaleEffect.name, this.ScaleEffect .int );
        this.boolProperty( this.Sound.name, this.Sound .int );
        this.boolProperty( this.Template.name, this.Template.int );
        this.boolProperty( this.Path.name, this.Path.int );
        this.boolProperty( this.AlignStartPosition.name, this.AlignStartPosition.int );
        this.boolProperty( this.GridSize.name, this.GridSize.int );
        this.boolProperty( this.ScissorRect.name, this.ScissorRect.int );
        this.boolProperty( this.ScissorEnabled.name, this.ScissorEnabled.int );
        this.boolProperty( this.ScrollEnabled.name, this.ScrollEnabled.int );
        this.boolProperty( this.AllowScrollByX.name, this.AllowScrollByX.int );
        this.boolProperty( this.AllowScrollByY.name, this.AllowScrollByY.int );
        this.boolProperty( this.ProgressType.name, this.ProgressType.int );
        this.boolProperty( this.Percent.name, this.Percent.int );
        this.boolProperty( this.MidPoint.name, this.MidPoint.int );
        this.boolProperty( this.BarChangeRate.name, this.BarChangeRate.int );
    },
    /**
     * Set bool
     * @param name
     * @param iname
     */
    boolProperty: function ( name, iname )
    {
        if (_DEBUG !== undefined) {
            for (var key in this.properties) {
                // skip loop if the property is from prototype
                if (!this.properties.hasOwnProperty(key)) continue;

                var obj = this.properties[key];
                EU.assert(obj != iname);
                EU.assert(key != name);
            }
        }
        this.properties[name] = iname;
    },
    /**
     *
     * @param {String} property
     * @returns {*}
     */
    strToPropertyType: function (property )
    {
        this.first = true;
        if( this.first )
        {
            this.__autofillproperties();
            this.first = false;
        }
        return properties[property];
    },
    /**
     *
     * @param {cc.Node} node
     * @param {String} property
     * @param {String} value
     */
    setProperty_str: function (node, property, value )
    {
        if( property == this.Template.name )
            return;

        var iproperty = this.strToPropertyType( property );
        if( false == this.setProperty_int( node, iproperty, value ) )
        {
            /** @type {EU.NodeExt} nodeext */
            var nodeext = node;
            if( nodeext instanceof EU.NodeExt ) nodeext.setProperty( property, value );
        }
    },
    /**
     *
     * @param {cc.Node} node
     * @param {Integer} property
     * @param {String} rawvalue
     * @returns {*}
     */
    setProperty_int: function(node, property, rawvalue )
    {
        var result = false ;
        EU.assert( node );
        //TODO: EU.Language
        var language = EU.Language.shared();

        /** @type {cc.Sprite} sprite */
        var sprite = node;
        /** @type {EU.ScrollMenu} scrollmenu */
        var scrollmenu = node;
        //Menu * menu = dynamic_cast<Menu*>(node);
        /** @type {EU.MenuItemImageWithText} menuitem */
        var menuitem = node;
        /** @type {ccui.Text} label */
        var label = node;
        /** @type {cc.ProgressTimer} progress */
        var progress = node;

        var value = EU.xmlLoader.macros.parse( rawvalue );

        var point;
        var size;
        var frame;
        //Texture2D * texture( nullptr );
        var nodeext;

        /** @type {EU.NodeExt} nodeext */
        nodeext = node;
        if( nodeext instanceof EU.NodeExt)
            result = nodeext.setProperty( property, value );

        if( result == false )
        {
            //TODO: EU.Common
            result = true;
            switch( property )
            {
                //for node:
                case this.Type.name:
                    break;
                case this.Name.name:
                    node.setName( value );
                    break;
                case this.Visible.name:
                    node.setVisible( EU.Common.strToBool( value ) );
                    break;
                case this.Pos.name:
                    node.setPosition( EU.Common.strToPoint( value ) );
                    break;
                case this.Scale.name:
                    point = EU.Common.strToPoint( value );
                    node.setScale( point.x, point.y );
                    break;
                case this.Rotation.name:
                    node.setRotation( EU.Common.strToFloat( value ) );
                    break;
                case this.Center.name:
                    node.setAnchorPoint( EU.Common.strToPoint( value ) );
                    break;
                case this.Strech.name:
                    size = node.getContentSize();
                    if( cc.sizeEqualToSize( size, cc.size(0,0)) == false )
                    {
                        var sx = 0.0;
                        var sy = 0.0;
                        var parce = function ()
                        {
                            var framepoint;
                            var mode;
                            var k = value.lastIndexOf( ":" );
                            if( k >= 0 )
                            {
                                framepoint = value.substr( 0, k );
                                mode = value.substr( k + 1 );
                            }
                            s = EU.Common.strToPoint( framepoint );
                            sx = s.x / size.width;
                            sy = s.y / size.height;
                            return mode;
                        };

                        var mode = parce( value );
                        if( mode == "x" )
                            node.setScaleX( sx );
                        else if( mode == "y" )
                            node.setScaleY( sy );
                        else if( mode == "xy" )
                            node.setScale( sx, sy );
                        else if( mode == "max" )
                            node.setScale( Math.max( sx, sy ) );
                        else if( mode == "min" )
                            node.setScale( Math.max( sx, sy ) );
                        else
                            EU.assert( !"TODO:" );
                    }
                    break;
                case this.Size.name:
                    size.width = EU.Common.strToPoint( value ).x;
                    size.height = EU.Common.strToPoint( value ).y;
                    node.setContentSize( size );
                    break;
                case this.Tag.name:
                    node.setTag( EU.Common.strToInt( value ) );
                    break;
                case this.CascadeColor.name:
                    node.setCascadeColorEnabled( EU.Common.strToBool( value ) );
                    break;
                case this.CascadeOpacity.name:
                    node.setCascadeOpacityEnabled( EU.Common.strToBool( value ) );
                    break;
                case this.LocalZ.name:
                    node.setLocalZOrder( EU.Common.strToInt( value ) );
                    break;
                case this.GlobalZ.name:
                    node.setGlobalZOrder( EU.Common.strToInt( value ) );
                    break;
                //for sprite:
                case this.Image.name:
                    if( sprite )
                    {
                        //TODO: EU.ImageManager
                        frame = EU.ImageManager.shared().spriteFrame( value );
                        if( frame )
                            sprite.setSpriteFrame( frame );
                        else
                            sprite.setTexture( value );
                    }
                    else if( progress )
                    {
                        var sprite = EU.ImageManager.sprite( value );
                        if( sprite )
                            progress.setSprite( sprite );
                    }
                    break;
                //for scroll menu:
                case this.Blending.name:
                    EU.assert( sprite instanceof cc.Sprite);
                    sprite.setBlendFunc( EU.Common.strToBlendFunc(value) );
                    break;
                case this.Opacity.name:
                    node.setOpacity( EU.Common.strToInt( value ) );
                    break;
                case this.Color.name:
                    node.setColor( EU.Common.strToColor3B( value ) );
                    break;
                case this.Animation.name:
                    node.runAction( EU.xmlLoader.load_action_str( value ) );
                    break;
                case this.AlignCols.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setAlignedColums( EU.Common.strToInt( value ) );
                    break;
                //for MenuItemImageWithText:
                case this.ImageNormal.name:
                    EU.assert( menuitem instanceof EU.MenuItemImageWithText);
                    menuitem.setImageNormal( value );
                    break;
                case this.ImageSelected.name:
                    EU.assert(  menuitem instanceof EU.MenuItemImageWithText );
                    menuitem.setImageSelected( value );
                    break;
                case this.ImageDisabled.name:
                    EU.assert(  menuitem instanceof EU.MenuItemImageWithText );
                    menuitem.setImageDisabled( value );
                    break;
                case this.MenuCallBack.name:
                    EU.assert(  menuitem instanceof EU.MenuItemImageWithText );
                    if( _directory )
                        menuitem.setCallback( _directory.get_callback_by_description( value ) );
                    break;
                case this.Sound.name:
                    EU.assert(  menuitem instanceof EU.MenuItemImageWithText );
                    menuitem.setSound( value );
                case this.Text.name:
                    EU.assert(  menuitem instanceof EU.MenuItemImageWithText ||  label instanceof ccui.Text );
                    if( label ) label.setString( language.string( value ) );
                    else menuitem.setText( language.string( value ) ); break;
                case this.Font.name:
                    EU.assert(   menuitem instanceof EU.MenuItemImageWithText ||  label instanceof ccui.Text );
                    //TODO: font value here is without path, so xml value must be changed
                    if( label ) label.setFontName( value );
                    else menuitem.setFont( value ); break;
                case this.TextWidth.name:
                    EU.assert(  label instanceof ccui.Text );
                    if( label ) label.setContentSize( EU.Common.strToFloat( value ) );
                    break;
                case this.TextAlign.name:
                    EU.assert( label instanceof ccui.Text );
                    if( label instanceof ccui.Text  )
                    {
                        /**
                         * @type {Number} align
                         */
                        var align;
                        if( value == "center" ) align = cc.TEXT_ALIGNMENT_CENTER;
                        else if( value == "right" ) align = cc.TEXT_ALIGNMENT_RIGHT;
                        else align = cc.TEXT_ALIGNMENT_LEFT;
                        label.setAlignment( align );
                    }
                    break;
                case this.ScaleEffect.name:
                    EU.assert(  menuitem instanceof EU.MenuItemImageWithText );
                    menuitem.useScaleEffect( EU.Common.strToBool( value ) );
                    break;
                case this.AlignStartPosition.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu );
                    scrollmenu.setAlignedStartPosition( EU.Common.strToPoint( value ) );
                    break;
                case this.GridSize.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setGrisSize( EU.Common.strToSize( value ) );
                    break;
                case this.ScissorRect.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setScissorRect( EU.Common.strToRect( value ) );
                    break;
                case this.ScrollEnabled.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setScrollEnabled( EU.Common.strToBool( value ) );
                    break;
                case this.ScissorEnabled.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setScissorEnabled( EU.Common.strToBool( value ) );
                    break;
                case this.AllowScrollByX.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setAllowScrollByX( EU.Common.strToBool( value ) );
                    break;
                case this.AllowScrollByY.name:
                    EU.assert( scrollmenu instanceof EU.ScrollMenu);
                    scrollmenu.setAllowScrollByY( EU.Common.strToBool( value ) );
                    break;
                case this.ProgressType.name:
                    EU.assert( progress instanceof cc.ProgressTimer);
                    progress.setType( value == "radial" ? cc.ProgressTimer.TYPE_RADIAL : cc.ProgressTimer.TYPE_BAR );
                    break;
                case this.Percent.name:
                    EU.assert( progress instanceof cc.ProgressTimer );
                    progress.setPercentage( EU.Common.strToFloat( value ) );
                    break;
                case this.MidPoint.name:
                    EU.assert( progress instanceof cc.ProgressTimer );
                    progress.setMidpoint( EU.Common.strToPoint( value ) );
                    break;
                case this.BarChangeRate.name:
                    EU.assert( progress instanceof cc.ProgressTimer );
                    progress.setBarChangeRate( EU.Common.strToPoint( value ) );
                    break;
                default:
                    result = false;
                    cc.log( "property with name[%d] not dispathed node by name[%s]", property, node.getName() );
                    break;
            }
        }
        return result;
    },
    /**
     *
     * @param {EU.NodeExt} node
     */
    bookDirectory: function(node )
    {
        this.unbookDirectory();
        this._directory = node;
        if( node && node.as_node_ref() )
            node.as_node_ref().retain();
    },
    /**
     *
     */
    unbookDirectory: function()
    {
        if( this._directory && this._directory.as_node_ref() )
            this._directory.as_node_ref().release();
        this._directory = nullptr;
    }
};