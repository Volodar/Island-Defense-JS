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

EU.UnitInfo = cc.Menu.extend(
{
    /** For Test Instance of */
    __UnitInfo : true,

    _unitName: "",

    ctor: function( unitName )
    {
        this._super();

        //if ( EU.NodeExt.prototype.init.call(this) ) return;

        this._unitName = "ini/tutorial/units/" + unitName + ".xml";

        var path = "ini/tutorial/units/";
        var namefile = "unitinfoicon.xml";
        this.load_str_n_str( path, namefile );

        this.runEvent( "oninit" );

        return true;
    },
    get_callback_by_description : function( name )
    {
        if( name == "showinfo" )
            return this.cb_click;
        return null;
    },
    cb_click: function()
    {
        var info = EU.Tutorial.create( this._unitName );
        info.enter();
        this.removeFromParent();
    }

});

EU.NodeExt.call(EU.UnitInfo.prototype);
