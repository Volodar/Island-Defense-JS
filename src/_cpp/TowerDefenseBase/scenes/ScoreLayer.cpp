//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/SmartScene.h"
#include "ScoreLayer.h"
#include "ScoreCounter.h"
#include "ShopLayer.h"
#include "configuration.h"
NS_CC_BEGIN

ScoreLayer::ScoreLayer()
{
	ScoreCounter::shared().observer( kScoreTime ).add( _ID, std::bind( &ScoreLayer::change_time, this, std::placeholders::_1 ) );
	ScoreCounter::shared().observer( kScoreFuel ).add( _ID, std::bind( &ScoreLayer::change_fuel, this, std::placeholders::_1 ) );
	ScoreCounter::shared().observer( kScoreCrystals ).add( _ID, std::bind( &ScoreLayer::change_real, this, std::placeholders::_1 ) );
	ScoreCounter::shared().observer( kScoreStars ).add( _ID, std::bind( &ScoreLayer::change_star, this, std::placeholders::_1 ) );
}

ScoreLayer::~ScoreLayer()
{
	ScoreCounter::shared().observer( kScoreTime ).remove( _ID );
	ScoreCounter::shared().observer( kScoreFuel ).remove( _ID );
	ScoreCounter::shared().observer( kScoreCrystals ).remove( _ID );
	ScoreCounter::shared().observer( kScoreStars ).remove( _ID );
}

bool ScoreLayer::init()
{
	do
	{
		CC_BREAK_IF( !Layer::init() );
		CC_BREAK_IF( !NodeExt::init() );

        if (k::configuration::useFuel) {
            NodeExt::load( "ini", "scorelayer_fuel.xml" );
        } else {
            NodeExt::load( "ini", "scorelayer.xml" );
        }

		_gold = getChildByName<Label*>( "valuegold" );
		_fuel = getChildByName<Label*>( "valuefuel" );
		_time = getChildByName<Label*>( "valuetime" );
		_star = getChildByName<Label*>( "valuestar" );
		_shop = dynamic_cast<MenuItem*>(getNodeByPath( this, "menu/shop" ));
		CC_BREAK_IF( !_gold );
		CC_BREAK_IF( !_fuel );
		CC_BREAK_IF( !_time );
		CC_BREAK_IF( !_shop );
		CC_BREAK_IF( !_star );

		change_fuel( ScoreCounter::shared().getMoney( kScoreFuel ) );
		change_time( ScoreCounter::shared().getMoney( kScoreTime ) );
		change_real( ScoreCounter::shared().getMoney( kScoreCrystals ) );
		change_star( ScoreCounter::shared().getMoney( kScoreStars ) );
		if( _shop )
		{
			_shop->setCallback( std::bind( &ScoreLayer::cb_shop, this, std::placeholders::_1 ) );
			if( k::configuration::useInapps == false )
				_shop->setVisible( false );
		}

		if( k::configuration::useFuel == false )
		{
			_fuel->setVisible( false );
			_time->setVisible( false );
		}

		return true;
	}
	while( false );
	return false;
}

void ScoreLayer::change_time( int score )
{
	int min = int( score ) / 60;
	int sec = int( score ) - min * 60;

	std::stringstream ss;
	if( min != 0 ) ss << min << "m ";
	if( sec != 0 ) ss << sec << "s";
	_time->setString( ss.str() );
}

void ScoreLayer::change_fuel( int score )
{
	bool vis = score < ScoreByTime::shared().max_fuel();
	_fuel->setString( intToStr( score ) );
	_time->setVisible( vis );

	if( k::configuration::useFuel == false )
	{
		_fuel->setVisible( false );
		_time->setVisible( false );
	}
}

void ScoreLayer::change_real( int score )
{
	_gold->setString( intToStr( score ) );
}

void ScoreLayer::change_star( int score )
{
	_star->setString( intToStr( score ) );
}

void ScoreLayer::cb_shop( Ref*sender )
{
#if PC != 1
	SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
	if( scene->getChildByName( "shop" ) ) return;

	auto shop = ShopLayer::create( k::configuration::useFreeFuel, true, false, false );
	if( shop )
	{
		scene->pushLayer( shop, true );
	}
#endif
}




NS_CC_END
