/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 *
 * Author: Vladimir Tolmachev
 * Project: Defense of Greece
 * e-mail: tolm_vl@hotmail.com
 * If you received the code is not the author, please contact me
 ******************************************************************************/

//Define namespace
var EU = EU || {};

EU.ParamCollection = cc.Class.extend({
    self: this,
    delimiter_pair : ':',
    delimiter : ',',
    delimiterinvalue : String.fromCharCode(1),
    params:{},

    ctor: function( string ){
        this.parse( string );
    },
    // TODO:
    parse: function (string) {
        var l = 0;
        do
        {
            var k = string.indexOf(this.delimiter, l);
            if (k == -1)
                k = string.length;
            var s = string.substr(l, k - l);
            l = k + 1;

            var d = s.indexOf(this.delimiter_pair);
            var value = d != -1;
            var n = value ? s.substr(0, d) : s;
            var v = value ? s.substr(d + 1) : "";
            while( true ){
                var k = v.indexOf( this.delimiterinvalue );
                if( k == -1 )
                    break;
                v[k] = this.delimiter;
            }

            if (n.length > 0 )
                this.params[n] = v;
        }
        while (l < string.length);
    },

    string : function()
    {
        var result = "";
        for( var name in this.params )
        {
            if( result.empty( ) == false )
                result += this.delimiter;

            var value = this.params[name];
            var l = 0;
            do
            {
                var k = value.indexOf(this.delimiter, l);
                if( k == -1 )
                    break;
                value[k] = this.delimiterinvalue;
                l = k+1;
            }
            while(true);
            result += name + (value.empty( ) ? value : (this.delimiter_pair + value));
        }
        return result;
    },

    get : function( name, value ) {
        if( name in this.params )
            return this.params[name];
        else
            return value;
    },
    get : function( name ) {
        if( name in this.params )
            return this.params[name];
        else
            return "";
    },
    set : function( name, value, override ) {
        if( override ){
            if( name in this.params )
                this.params[name] = value;
        }
        else {
            if( name in this.params == false )
                this.params[name] = value;
        }
    },
    isExist : function( name ) {
        return name in this.params;
    },
    tolog : function() {
        cc.log( "ParamCollection::tolog begin:" );
        for( var name in this.params ) {
            cc.log( name + ":" + this.params[name] );
        }
        cc.log( "ParamCollection::tolog end." );
    },

});