//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "MenuDig.h"
#include "ScoreCounter.h"
#include "GameGS.h"
#include "Tower.h"
#include "Tutorial.h"
#include "configuration.h"

NS_CC_BEGIN


MenuDig::MenuDig()
{}

MenuDig::~MenuDig()
{
	ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
}

bool MenuDig::init()
{
	ScrollMenu::init();
	NodeExt::init();

	NodeExt::load( "ini/gamescene", "menudig.xml" );

	_dig = getItemByName( "dig" );
	_digUn = getItemByName( "dig_un" );
	_confirm = getItemByName( "confirm" );
	_confirmUn = getItemByName( "confirm_un" );

	_dig->setCallback( std::bind( &MenuDig::activate, this, std::placeholders::_1, true ) );
	_digUn->setCallback( std::bind( &MenuDig::activate, this, std::placeholders::_1, false ) );
	_confirm->setCallback( std::bind( &MenuDig::confirmSelect, this, std::placeholders::_1, true ) );
	_confirmUn->setCallback( std::bind( &MenuDig::confirmSelect, this, std::placeholders::_1, false ) );

	int cost = mlTowersInfo::shared().getCostFotDig();
	_dig->getChildByName<Label*>( "cost" )->setString( intToStr( cost ) );
	_digUn->getChildByName<Label*>( "cost" )->setString( intToStr( cost ) );

	setVisible( false );
	return true;
}

void MenuDig::appearance()
{
	setVisible( true );
	setEnabled( true );
	runEvent( "appearance" );
	ScoreCounter::shared().observer( kScoreLevel ).add( _ID, std::bind( &MenuDig::onChangeMoney, this, std::placeholders::_1 ) );
	_confirm->setVisible( false );
	_confirmUn->setVisible( false );
	_dig->setVisible( false );
	_digUn->setVisible( false );
	onChangeMoney( ScoreCounter::shared().getMoney( kScoreLevel ) );
	scheduleUpdate();
}

void MenuDig::disappearance()
{
	setEnabled( false );
	ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
	runEvent( "disappearance" );
	_confirm->setVisible( false );
	_confirmUn->setVisible( false );
	_dig->setVisible( false );
	_digUn->setVisible( false );
	unscheduleUpdate();
}

void MenuDig::setClickPoint( const Point & point )
{
	_clickedPoint = point;
	update( 0 );
	//setPosition( point );
}

void MenuDig::activate( Ref * sender, bool avalabledButton )
{
	if( isEnabled() == false )return;
	if( avalabledButton )
		_confirm->setVisible( true );
	else
		_confirmUn->setVisible( true );
	//onChangeMoney( ScoreCounter::shared().getMoney( kScoreLevel ) );
	runEvent( "onclick" );
}

void MenuDig::confirmSelect( Ref * sender, bool avalabledButton )
{
	if( isEnabled() == false )return;
	disappearance();
	if( avalabledButton )
	{
		auto place = GameGS::getInstance()->getTowerPlaceInLocation( _clickedPoint );
		GameGS::getInstance()->getGameBoard().activateTowerPlace( place );
		GameGS::getInstance()->resetSelectedPlace();
	}
	else
	{
        if (k::configuration::useInapps) {
            TutorialManager::shared( ).dispatch( "level_haventgear_dig" );
        }
	}
	runEvent( "onconfirm" );
}

void MenuDig::onChangeMoney( int money )
{
	int cost = mlTowersInfo::shared().getCostFotDig();

	bool availabled = cost <= money;
	if( _confirm->isVisible() || _confirmUn->isVisible() )
	{
		_confirm->setVisible( availabled );
		_confirmUn->setVisible( !availabled );
	}
	_dig->setVisible( availabled );
	_digUn->setVisible( !availabled );
}

void MenuDig::update( float )
{
	auto point = GameGS::getInstance()->getMainLayer()->convertToWorldSpace( _clickedPoint );
	setPosition( point );
}





NS_CC_END
