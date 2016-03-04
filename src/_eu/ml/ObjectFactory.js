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

EU.Factory  = {
    build: function(type) {
        if( type == "node" ) return new cc.Node();
        if( type == "sprite" ) return new cc.Sprite();
        if( type == "menu" ) return new cc.Menu();
        if( type == "layer" ) return new cc.Layer();
        if( type == "particle" ) return new cc.Particle();
        if( type == "progresstimer" ) return new cc.ProgressTimer(null);
        if( type == "paralax" ) return new cc.ParallaxNode();
        if( type == "menuitem" ) return new EU.MenuItemImageWithText();
        if( type == "layerext" ) return new EU.LayerExt;
        if( type == "nodeext" ) return new EU.NodeExt_;
        if( type == "action" ) return new EU.EventAction();
        if( type == "runaction" ) return new EU.EventRunAction();
        if( type == "stopaction" ) return new EU.EventStopAction();
        if( type == "stopallaction" ) return new EU.EventStopAllAction();
        if( type == "setproperty" ) return new EU.EventSetProperty();
        if( type == "playsound" ) return new EU.EventPlaySound();
        if( type == "createnode" ) return new EU.EventCreateNode();
        //TODO: change Label to Text
        if( type == "text" ) return new cc.LabelBMFont();
        //TODO: build types:
        //if( type == "scrollmenu" ) return EU.ScrollMenu.create();
        //if( type == "menuitem" ) return EU.mlMenuItem.create();

        //if( type == "menuext" ) return EU.MenuExt.create();
        //if( type == "panel" ) return EU.Panel.create();

        //if( type == "scenestack" ) return EU.EventScene.create();
        //if( type == "statistic_accumulate" ) return EU.EventStatisticAccumulate.create();

        var result = null;
        if( this.add_build != undefined ){
            result = this.add_build(type);
        }
        if( !result )
            cc.log("cannot create object  by type: " + type);
    }
};