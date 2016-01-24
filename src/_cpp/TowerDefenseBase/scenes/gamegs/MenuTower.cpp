//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/Language.h"
#include "MenuTower.h"
#include "ScoreCounter.h"
#include "GameGS.h"
#include "Tower.h"
#include "support.h"
#include "Tutorial.h"
#include "configuration.h"

NS_CC_BEGIN



MenuTower::MenuTower()
: _waitSellConfirm( false )
, _waitUpgradeConfirm( false )
, _disabled ( false )
{}

MenuTower::~MenuTower()
{
	ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
}

bool MenuTower::init()
{
	do
	{
		ScrollMenu::init();
		NodeExt::init();

		NodeExt::load( "ini/gamescene", "menutower.xml" );

		_upgrade = getItemByName( "upgrade" );
		_upgradeUn = getItemByName( "upgrade_un" );
		_confirm = getItemByName( "confirm" );
		_confirmUn = getItemByName( "confirm_un" );
		_sell = getItemByName( "sell" );
		_lock = getItemByName( "lock" );

		_upgrade->setCallback( std::bind( &MenuTower::activateUpgrade, this, std::placeholders::_1, true ) );
		_upgradeUn->setCallback( std::bind( &MenuTower::activateUpgrade, this, std::placeholders::_1, false ) );
		_sell->setCallback( std::bind( &MenuTower::activateSell, this, std::placeholders::_1, false ) );
		_lock->setCallback( std::bind( &MenuTower::lockClick, this, std::placeholders::_1 ) );

		_desc.node = getChildByName( "desc" );
		if( _desc.node )
		{
			_desc.name.reset( _desc.node->getChildByName<Label*>( "name" ) );
			_desc.text.reset( _desc.node->getChildByName<Label*>( "text" ) );
			_desc.dmg.reset( _desc.node->getChildByName<Label*>( "dmg" ) );
			_desc.rng.reset( _desc.node->getChildByName<Label*>( "rng" ) );
			_desc.spd.reset( _desc.node->getChildByName<Label*>( "spd" ) );
		}

		setVisible( false );
		return true;
	}
	while( false );
	return false;
}

void MenuTower::appearance()
{
	_disabled = false;
	setEnabled( true );
	setVisible( true );
	hideConfirmButton();
	runEvent( "appearance" );
	ScoreCounter::shared().observer( kScoreLevel ).add( _ID, std::bind( &MenuTower::onChangeMoney, this, std::placeholders::_1 ) );
	onChangeMoney( ScoreCounter::shared().getMoney( kScoreLevel ) );

	_confirm->setVisible( false );
	_confirmUn->setVisible( false );

	scheduleUpdate();
	showRadius( _unit->getPosition(), _unit->getRadius() );
}

void MenuTower::disappearance()
{
	if( _disabled == false )
	{
		setEnabled( false );
		hideConfirmButton();
		runEvent( "disappearance" );
		_unit.reset( nullptr );
		ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );

		_confirm->setVisible( false );
		_confirmUn->setVisible( false );

		_waitSellConfirm = false;
		_waitUpgradeConfirm = false;

		hideRadius();
		unscheduleUpdate();
		_disabled = true;
	}
}

void MenuTower::setUnit( Unit::Pointer unit )
{
	_unit = unit;
	if( _unit )
	{
		std::string cost1 = intToStr( mlTowersInfo::shared().getCost( _unit->getName(), _unit->getLevel() + 1 ) );
		std::string cost2 = intToStr( mlTowersInfo::shared().getSellCost( _unit->getName(), _unit->getLevel() ) );

		_upgrade->getChildByName<Label*>( "cost" )->setString( cost1 );
		_upgradeUn->getChildByName<Label*>( "cost" )->setString( cost1 );
		_sell->getChildByName<Label*>( "cost" )->setString( cost2 );
	}

	if( _unit )
	{
		setPosition( _unit->getPosition() );

		buildDescription( _unit->getLevel() );
	}
}

void MenuTower::buildDescription( unsigned _level )
{
	std::string name = _unit->getName();
	std::string localization = WORD( name + "_name" );
	unsigned level = std::min( _level, _unit->getMaxLevel() );

	std::string dmg = intToStr( mlTowersInfo::shared().get_dmg( name, level ) );
	std::string rng = intToStr( mlTowersInfo::shared().get_rng( name, level ) );
	std::string spd = intToStr( mlTowersInfo::shared().get_spd( name, level ) );
	std::string txt = mlTowersInfo::shared().get_desc( _unit->getName(), 1 );
	if( _desc.name )_desc.name->setString( localization );
	if( _desc.dmg )_desc.dmg->setString( dmg );
	if( _desc.rng )_desc.rng->setString( rng );
	if( _desc.spd )_desc.spd->setString( spd );
	if( _desc.text )_desc.text->setString( txt );
}

void MenuTower::activateUpgrade( Ref * sender, bool availebledButton )
{
	buildDescription( _unit->getLevel() + 1 );
	_confirm->setCallback( std::bind( &MenuTower::confirmUpgrade, this, std::placeholders::_1, true ) );
	_confirmUn->setCallback( std::bind( &MenuTower::confirmUpgrade, this, std::placeholders::_1, false ) );

	_confirm->setVisible( true );
	_confirm->setPosition( _upgrade->getPosition() );
	_confirmUn->setPosition( _upgrade->getPosition() );

	_waitSellConfirm = false;
	_waitUpgradeConfirm = true;
	onChangeMoney( ScoreCounter::shared().getMoney( kScoreLevel ) );

	//float rate = mlTowersInfo::shared().rate( _unit->getName() );
	float radius = mlTowersInfo::shared().radiusInPixels( _unit->getName(), _unit->getLevel() + 1 );
	showRadius( _unit->getPosition( ), radius /** rate*/ );
	runEvent( "onclick" );
}

void MenuTower::confirmUpgrade( Ref * sender, bool availebledButton )
{
	assert( _confirmCurrent );
	assert( _unit );
	auto& board = GameGS::getInstance()->getGameBoard();
	board.upgradeTower( _unit );
	_confirm->setVisible( false );
	_confirmUn->setVisible( false );

	disappearance();

	if( !availebledButton )
	{
        if (k::configuration::useInapps) {
            TutorialManager::shared( ).dispatch( "level_haventgear_upgrade" );
        }
	}
}

void MenuTower::activateSell( Ref * sender, bool availebledButton )
{
	_confirm->setCallback( std::bind( &MenuTower::confirmSell, this, std::placeholders::_1, true ) );

	_confirmUn->setVisible( false );
	_confirm->setVisible( true );
	_confirm->setPosition( _sell->getPosition() );

	_waitSellConfirm = true;
	_waitUpgradeConfirm = false;

	hideRadius();
}

void MenuTower::confirmSell( Ref * sender, bool availebledButton )
{
	assert( _unit );
	GameGS::getInstance()->getGameBoard().removeTower( _unit );
	_confirm->setVisible( false );

	disappearance();
}

void MenuTower::lockClick( Ref * sender )
{
	disappearance();
}

void MenuTower::showConfirmButton()
{}

void MenuTower::hideConfirmButton()
{}

void MenuTower::onChangeMoney( int money )
{
	int cost = mlTowersInfo::shared().getCost( _unit->getName(), _unit->getLevel() + 1 );

	_upgrade->setVisible( cost <= money );
	_upgradeUn->setVisible( cost > money );

	if( !_waitSellConfirm )
	{
		auto hist = _confirmCurrent;
		if( cost <= money )
		{
			_confirmCurrent = _confirm;
			if( _waitUpgradeConfirm )
			{
				_confirm->setVisible( true );
				_confirmUn->setVisible( false );
			}
		}
		else
		{
			_confirmCurrent = _confirmUn;
			if( _waitUpgradeConfirm )
			{
				_confirm->setVisible( false );
				_confirmUn->setVisible( true );
			}
		}
	}

	checkLockedUpgrade();
}

void MenuTower::checkLockedUpgrade()
{
	unsigned level = _unit->getLevel();
	unsigned max = _unit->getMaxLevel();
	unsigned max2 = _unit->getMaxLevelForLevel();

	if( level == max )
	{
		_lock->setVisible( false );
		_upgrade->setVisible( false );
		_upgradeUn->setVisible( false );
	}
	else if( level == max2 )
	{
		_lock->setVisible( true );
		_upgrade->setVisible( false );
		_upgradeUn->setVisible( false );
	}
	else
	{
		_lock->setVisible( false );
	}

}

void MenuTower::update( float )
{
	if( !_unit )
		return;
	if( radiusTowerIsHiden() )
		showRadius( _unit->getPosition(), _unit->getRadius() );

	auto pos = _unit->getPosition();
	auto point = GameGS::getInstance( )->getMainLayer( )->convertToWorldSpace( pos );
	setPosition( point );
	
	if( _desc.node )
	{
		auto screenpos = getPosition( );
		auto dessize = Director::getInstance( )->getOpenGLView( )->getDesignResolutionSize( );

		auto pos = _desc.node->getPosition( );
		pos.x = fabs( pos.x );
		_desc.node->setAnchorPoint( Point( 0, 0.5f ) );
		if( screenpos.x > dessize.width / 2 )
		{
			pos.x = -pos.x;
			_desc.node->setAnchorPoint( Point( 1, 0.5f ) );
		}
		_desc.node->setPosition( pos );
	}
}

NS_CC_END
