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
        if( type == "node" ) return cc.Node.create();
        if( type == "sprite" ) return cc.Sprite.create();
        if( type == "menu" ) return cc.Menu.create();
        if( type == "layer" ) return cc.Layer.create();
        if( type == "particle" ) return cc.CCParticleSystemQuad.create();
        if( type == "progresstimer" ) return cc.ProgressTimer.create(null);
        if( type == "paralax" ) return cc.ParallaxNode.create();
        if( type == "menuitem" ) return EU.MenuItemImageWithText.create();
        //TODO: change Label to Text
        if( type == "text" ) return cc.Label.create();
        //TODO: build types:
        //if( type == "scrollmenu" ) return EU.ScrollMenu.create();
        //if( type == "menuitem" ) return EU.mlMenuItem.create();
        //if( type == "layerext" ) return EU.LayerExt.create();
        //if( type == "nodeext" ) return EU.NodeExt_.create();
        //if( type == "menuext" ) return EU.MenuExt.create();
        //if( type == "panel" ) return EU.Panel.create();

        //TODO: build events:
        //if( type == "action" ) return EU.EventAction.create();
        //if( type == "runaction" ) return EU.EventRunAction.create();
        //if( type == "stopaction" ) return EU.EventStopAction.create();
        //if( type == "stopallaction" ) return EU.EventStopAllAction.create();
        //if( type == "setproperty" ) return EU.EventSetProperty.create();
        //if( type == "playsound" ) return EU.EventPlaySound.create();
        //if( type == "scenestack" ) return EU.EventScene.create();
        //if( type == "createnode" ) return EU.EventCreateNode.create();
        //if( type == "statistic_accumulate" ) return EU.EventStatisticAccumulate.create();

        cc.log("cannot create object  by type: " + type);
    },
}