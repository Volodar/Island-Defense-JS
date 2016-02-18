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
EU = EU || {};

EU.EventBase = cc.Class.extend({
    targetPath : null,
    setParam : function( name, value ){
        if( name == "target" )
            this.targetPath = value;
    },
    loadXmlEntity: function(tag, xmlnode){},
    getTarget: function(context){
        return EU.Common.getNodeByPath(context,this.targetPath);
    },
    execute: function(){}
});

EU.EventsList = cc.Class.extend({
    events: null,
    ctor:function(){
        this.events = [];
    },
    push: function(event){
        this.events.push(event);
    },
    execute: function( context ){
        for( var i=0; i < this.events.length; ++i ){
            this.events[i].execute(context);
        }
    }
});

EU.EventAction = EU.EventBase.extend({

    actionname : null,
    state : null,
    ctor: function(){
    },
    execute: function( context ){
        var action = context.getAction(this.actionname);
        var target = this.getTarget(context);
        if( !action || !target )
            return;
        if( this.state == "run" ){
            var clone = action.clone();
            var tag = action.__instanceId;

            /** Preven jsb fault */
            tag = tag || 1;

            clone.setTag(tag);
            target.runAction(clone);
        }
        else if( this.state == "stop" ){
            tag = action.__instanceId;
            target.stopActionByTag(tag);
        }
    },
    setParam: function( name, value ){
        if( name == "action" ) this.actionname = value;
        else if( name == "state" ) this.state = value;
        else EU.EventBase.prototype.setParam.call( this, name, value );
    }
});

EU.EventRunAction = EU.EventAction.extend({
    ctor: function () {
        this.state = "run";
    }
});

EU.EventStopAction = EU.EventAction.extend({
    ctor: function () {
        this.state = "stop";
    }
});

EU.EventStopAllAction = EU.EventAction.extend({
    execute: function( context ){
        var target = this.getTarget((context));
        if( target )
            target.stopAllActions();
    }
});

EU.EventSetProperty = EU.EventBase.extend({
    property_str : null,
    property_int : null,
    value : "",
    execute: function( context ){
        var target = this.getTarget(context);
        if( !target )
            return;
        if( EU.xmlLoader.setProperty_int( target, this.property_int, this.value ) == false )
            EU.xmlLoader.setProperty_str( target, this.property_str, this.value );
    },
    setParam: function( name, value ){
        if( name == "property" ){
            this.property_str = value;
            this.property_int = EU.xmlLoader.strToPropertyType(value);
        }
        else if( name == "value" ) this.value = value;
        else EU.EventBase.prototype.setParam.call( this, name, value );
    }
});

EU.EventCreateNode = EU.EventBase.extend({
    positionInfo : null,
    node : null,
    additionalZOrder : null,
    ctor:function(){
        this.positionInfo = {};
        this.additionalZOrder = -1;
    },
    execute: function( context ){
        var target = this.getTarget(context);
        if( target && this.node && this.node.getParent() == null )
        {
            target.addChild( this.node );
            switch( this.positionInfo.method )
            {
                case "byContext":
                {
                    var pos = context.getPosition();
                    pos = EU.Common.pointAdd( pos, this.positionInfo.offset );
                    node.setPosition( pos );
                    break;
                }
            }
            this.node.setLocalZOrder( -node.getPositionY() + this.additionalZOrder );
        }
    },
    setParam: function( name, value ){
        if( name == "additionalzorder" ) this.additionalZOrder = EU.Common.strToInt( value );
        else if( name == "posinfo_offset" ) this.positionInfo.offset = EU.Common.strToPoint( value );
        else if( name == "posinfo_method" ) this.positionInfo.method = "byContext";
        else EU.EventBase.prototype.setParam.call( this, name, value );
    }
});

EU.EventPlaySound = EU.EventBase.extend({
    sound : null,
    soundId : null,
    looped : null,
    duration : null,
    preDelay : null,
    panorama : null,

    ctor:function(){
        this.soundId = -1;
        this.looped = false;
        this.duration = 0;
        this.preDelay = 0;
        this.panorama = 0;
    },
    execute: function(){
        EU.assert( this.looped ? this.duration > 0 : true );
        if( this.preDelay == 0 ){
            this.play(0);
        }
        else {
            var key = "EventPlaySound.play" + this.__instanceId;
            //if( cc.director.getScheduler().isScheduled(key, this) == false )
                cc.director.getScheduler().schedule( this.play, this, this.preDelay, false, 0, false, key );
        }
    },
    setParam: function( name, value ){
        if( name == "sound" && value.length != 0 ) this.sound = EU.xmlLoader.macros.parse( EU.xmlLoader.resourcesRoot + value );
        else if( name == "looped" ) this.looped = EU.Common.strToBool( EU.xmlLoader.macros.parse( value ) );
        else if( name == "predelay" ) this.preDelay = EU.Common.strToFloat( EU.xmlLoader.macros.parse( value ) );
        else if( name == "duration" ) this.duration = EU.Common.strToFloat( EU.xmlLoader.macros.parse( value ) );
        else if( name == "panoram" ) this.panoram = EU.Common.strToFloat( EU.xmlLoader.macros.parse( value ) );
        else EU.EventBase.prototype.setParam.call( this, name, value );
    },
    play: function(){
        var key = "EventPlaySound.play" + this.__instanceId;
        cc.director.getScheduler().unschedule( key, this );
        if( this.sound && this.sound.length != 0 )
            this.soundId = EU.AudioEngine.playEffect(this.sound, this.looped);
        if( this.looped ){
            var key = "EventPlaySound.stop" + this.__instanceId;
            //if( cc.director.getScheduler().isScheduled(key, target) == false )
                cc.director.getScheduler().schedule( this.stop, this, this.duration, false, 0, false, key );
            
        }
    },
    stop: function(){
        var key = "EventPlaySound.stop" + this.__instanceId;
        cc.director.getScheduler().unschedule( key, this );
        if( this.sound ){
            EU.AudioEngine.stopEffect(this.soundId);
        }
    }
});
