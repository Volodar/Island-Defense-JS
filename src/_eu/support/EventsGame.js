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


EU.EventCreateUnit = EU.EventBase.extend(
{
    __EventCreateUnit: true,

    /** @type {Array<string>} */ _units : null,
    /** @type {Number} */ _radius : null,
    /** @type {Number} */ _lifetime : null,
    /** @type {EU.UnitType} */ _unitType : null,


    /*****************************************************************************/
    //MARK: class EventCreateUnit
    /*****************************************************************************/
    ctor: function()
    {
        this._radius = 0;
        this._lifetime = 30;
        this._unitType = EU.UnitType.creep;
        this._units = [];

    },

    execute: function( /**@type EU.NodeExt */ context )
    {
        this.createUnits( context );
    },

    /**
     * @return Array<EU.Unit>
     */
    createUnits: function( /**@type EU.NodeExt */  context )
    {
        var holder = context.__Unit ? context : null;
        EU.assert( context );
        EU.assert( this._units.length > 0 );
        EU.assert( this._units.length > 1 ? this._radius > 0 : true );
        EU.assert( holder );

        var startangle = cc.randomMinus1To1() * (360 / this._units.length);
        var points = [];
        points = EU.Common.computePointsByRadius( points, this._radius, this._units.length, startangle );
        var board = EU.GameGSInstance.getGameBoard();
        var units = [];
        for (var i = 0; i < this._units.length; i++) {
            var unitname = this._units[i];
            var position = cc.pAdd(holder.getPosition(), points[i]);
            if( this._unitType == EU.UnitType.creep )
            {
                var route = holder.getMover().getRoute();
                var unit = board.createCreepOnRoute( unitname, route, position );
                if( unit )
                {
                    var cost = holder._cost;
                    var rate = holder.getRate();
                    unit._cost = cost;
                    unit.setRate( rate );
                    units.push( unit );
                }
            }
            else if( this._unitType == EU.UnitType.desant )
            {
                var unit = board.createDesant( unitname, position, this._lifetime );
                if( unit )
                {
                    units.push( unit );
                }
            }
        }

        return units;
    },

    setParam: function( /**@type {String} */ name, /**@type {String} */ value )
    {
        if( name == "units" ) EU.Common.split( this._units, value );
        else if( name == "radius" ) this._radius = EU.Common.strToFloat( value );
        else if( name == "unittype" ) this._unitType = EU.strToUnitType( value );
        else if( name == "lifetime" ) this._lifetime = EU.Common.strToFloat( value );
        else this._super( name, value );
    },

    getParam: function( /**@type {String} */ name )
    {
        return "";
    }

});

EU.EventCreateUnitReverseRoute = EU.EventCreateUnit.extend(
{
    __EventCreateUnitReverseRoute: true,

    /*****************************************************************************/
    //MARK: class EventCreateUnitReverseRoute
    /*****************************************************************************/

    execute: function( /**@type EU.NodeExt */ context )
    {
        var board = EU.GameGSInstance.getGameBoard();
        var units = this.createUnits( context );
        var distance = 100 ;
        for (var i = 0; i < units.length; i++) {
            var unit = units[i];
            /**TripleRoute */ var route = board.getRoute( unit._unitLayer, unit.getPosition(), distance );
            if( route.main.length == 0 )
                continue;
            route.main.reverse();
            unit.moveByRoute( route.main );
        }
    }

});

EU.EventAreaDamage = EU.EventBase.extend(
{
    __EventAreaDamage: true,

    /** @type {Number} */ _radius : null,
    /** @type {Number} */ _sector : null,
    /** @type {UnitType} */ _asUnitType : null,


    /*****************************************************************************/
    //MARK: class EventAreaDamage
    /*****************************************************************************/
    ctor: function()
    {
        this._radius = 0;
        this._sector = 360;
        this._asUnitType = EU.UnitType.tower;

    },

    execute: function( /**@type EU.NodeExt */ context )
    {
        var holder = context.__Unit ? context: null;
        EU.assert( context );
        EU.assert( holder );
        var board = EU.GameGSInstance.getGameBoard();

        var radius = holder._radius;
        var sector = holder.getDamageBySectorAngle();
        var unittype = holder._type;
        holder._radius = this._radius ;
        holder._type = this._asUnitType ;
        holder._damageBySectorAngle = this._sector ;

        board.applyDamageBySector( holder );

        holder._radius = radius ;
        holder._damageBySectorAngle = sector ;
        holder._type = unittype;
    },

    setParam: function( /**@type {String} */ name, /**@type {String} */ value )
    {
        if( name == "radius" ) this._radius = EU.Common.strToFloat( value );
        else if( name == "sector" ) this._sector = EU.Common.strToFloat( value );
        else if( name == "asunittype" ) this._asUnitType= EU.strToUnitType( value );
        else this._super( name, value );
    },

    getParam: function( /**@type {String} */ name )
    {
        return "";
    }

});



