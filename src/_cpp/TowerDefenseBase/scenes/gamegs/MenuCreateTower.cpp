//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/Language.h"
#include "MenuCreateTower.h"
#include "GameGS.h"
#include "ScoreCounter.h"
#include "Tower.h"
#include "support.h"
#include "UserData.h"
#include "Tutorial.h"
#include "configuration.h"

NS_CC_BEGIN

MenuCreateTower::MenuCreateTower()
: _disabled( true )
{}

MenuCreateTower::~MenuCreateTower()
{
	ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
}

bool MenuCreateTower::init()
{
	ScrollMenu::init();
	NodeExt::init();

	NodeExt::load( "ini/gamescene", "menucreatetower.xml" );

	unsigned size = getItemsCount();
	for( unsigned i = 0; i < size; ++i )
	{
		auto item = getItem( i );
		if( item->getName() == "confirm" )
		{
			_confirmButton = item;
			_confirmButton->setVisible( false );
			item->setCallback( std::bind( &MenuCreateTower::confirmSelect, this, std::placeholders::_1, true ) );
		}
		else if( item->getName() == "confirm_un" )
		{
			_confirmButtonUn = item;
			_confirmButtonUn->setVisible( false );
			item->setCallback( std::bind( &MenuCreateTower::confirmSelect, this, std::placeholders::_1, false ) );
		}
		else
		{
			std::string name = item->getName( );
			if( name.find( "_un" ) == std::string::npos )
			{
				_buttonTowers[name] = item;
				item->setCallback( std::bind( &MenuCreateTower::onActivate, this, std::placeholders::_1, true ) );
			}
			else
			{
				name.erase( name.begin() + (name.size() - 3), name.end() );
				_buttonTowersUn[name] = item;
				item->setCallback( std::bind( &MenuCreateTower::onActivate, this, std::placeholders::_1, false ) );
			}
			int level = UserData::shared().tower_upgradeLevel( name );
			if( level == 0 )
				setBclokButton( item );
		}
	}

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

void MenuCreateTower::setBclokButton( MenuItem*button )
{
	button->setCallback( CC_CALLBACK_1( MenuCreateTower::onBlocked, this ) );
	auto item = dynamic_cast<MenuItemImageWithText*>(button);
	if( item )
	{
		item->setImageNormal( k::resourceGameSceneFolder + "menucreatetower/menu_lock2.png" );
		item->setImageSelected( k::resourceGameSceneFolder + "menucreatetower/menu_lock2.png" );
	}
}

void MenuCreateTower::onBlocked( Ref * sender )
{
	disappearance();
}

void MenuCreateTower::onActivate( Ref * sender, bool availebledButton )
{
	if( _disabled )return;
	hideConfirmButton();

	auto node = dynamic_cast<MenuItem*>(sender);
	if( !node ) return;
	_hidenButton.reset( node );
	//_hidenButton->setVisible( false );

	std::string name = _hidenButton->getName();

	if( availebledButton )
	{
		_confirmButton->setPosition( node->getPosition() );
		_confirmButton->setVisible( true );
	}
	else
	{
		name.erase( name.begin() + name.size() - 3, name.end() );
		_confirmButtonUn->setName( name );
		_confirmButtonUn->setPosition( node->getPosition() );
		_confirmButtonUn->setVisible( true );
	}

	_selectedTower = name;

	runEvent( "onclick" );
	runEvent( "onclickby_" + _selectedTower );
	buildDescription();

	//float rate = mlTowersInfo::shared( ).rate( name );
	float radius = mlTowersInfo::shared().radiusInPixels( name, 1 );
	showRadius( _centerPoint, radius /** rate*/ );
}

void MenuCreateTower::confirmSelect( Ref * sender, bool availebledButton )
{
	if( _disabled )return;
	if( availebledButton )
	{
		assert( _hidenButton );
		std::string towername = _hidenButton->getName();
		if(towername.find("_un") != std::string::npos )
		{
			towername = towername.substr( 0, towername.find("_un") );
		}
		hideConfirmButton();
		runEvent( "onconfirm" );

		GameGS::getInstance()->getGameBoard().createTower( towername );
		disappearance();
	}
	else
	{
		if(k::configuration::useInapps && TutorialManager::shared().dispatch( "level_haventgear_build" ) )
			disappearance();
	}
}

void MenuCreateTower::hideConfirmButton()
{
	_confirmButton->setVisible( false );
	_confirmButtonUn->setVisible( false );
	if( _hidenButton )
		_hidenButton->setVisible( true );
	_hidenButton.reset( nullptr );
}

void MenuCreateTower::changeCost()
{
	auto set = []( Node*node, int cost )
	{
		auto label = node->getChildByName<Label*>( "cost" );
		if( label ) label->setString( intToStr( cost ) );
	};

	for( auto& icon : _buttonTowers )
	{
		unsigned cost = mlTowersInfo::shared().getCost( icon.first, 1 );
		cost = std::min<unsigned>( cost, 999 );
		auto& but0 = icon.second;
		auto& but1 = _buttonTowersUn[icon.first];
		set( but0, cost );
		set( but1, cost );
	}

}

void MenuCreateTower::appearance()
{
	setVisible( true );
	hideConfirmButton();
	runEvent( "appearance" );
	_disabled = false;
	ScoreCounter::shared().observer( kScoreLevel ).add( _ID, std::bind( &MenuCreateTower::onChangeMoney, this, std::placeholders::_1 ) );
	changeCost();
	onChangeMoney( ScoreCounter::shared().getMoney( kScoreLevel ) );
	scheduleUpdate();
}

void MenuCreateTower::disappearance()
{
	if( _disabled == false )
	{
		hideConfirmButton();
		runEvent( "disappearance" );
		_disabled = true;

		hideRadius();
		ScoreCounter::shared().observer( kScoreLevel ).remove( _ID );
		unscheduleUpdate();
	}
}

void MenuCreateTower::setExcludedTowers( const std::list<std::string> & list ) {}

void MenuCreateTower::addExludedTower( const std::string & towerName ) 
{
	auto item = getItemByName( towerName );
	if( item )
		setBclokButton( item );
}

void MenuCreateTower::removeExludedTower( const std::string & towerName ) 
{
}

void MenuCreateTower::setActived( bool mode ) {}
void MenuCreateTower::setClickPoint( const Point & point )
{
	_centerPoint = point;
	setPosition( point );
}

void MenuCreateTower::buildDescription()
{
	std::string name = _selectedTower;
	name = WORD( name + "_name" );
	std::string dmg = intToStr( mlTowersInfo::shared().get_dmg( _selectedTower, 1 ) );
	std::string rng = intToStr( mlTowersInfo::shared().get_rng( _selectedTower, 1 ) );
	std::string spd = intToStr( mlTowersInfo::shared().get_spd( _selectedTower, 1 ) );
	std::string txt = mlTowersInfo::shared().get_desc( _selectedTower, 1 );
	if( _desc.name )_desc.name->setString( name );
	if( _desc.dmg )_desc.dmg->setString( dmg );
	if( _desc.rng )_desc.rng->setString( rng );
	if( _desc.spd )_desc.spd->setString( spd );
	if( _desc.text )_desc.text->setString( txt );
}

void MenuCreateTower::onChangeMoney( int money )
{
	for( auto& iter : _buttonTowers )
	{
		auto& but0 = iter.second;
		auto& but1 = _buttonTowersUn[iter.first];
		assert( but0 && but1 );

		int cost = mlTowersInfo::shared().getCost( iter.first, 1 );

		but0->setVisible( cost <= money );
		but1->setVisible( cost > money );
	}

	//	if( _hidenButton)
	//		_hidenButton->setVisible( false );

	if( _confirmButtonUn->isVisible() )
	{
		int cost = mlTowersInfo::shared().getCost( _confirmButtonUn->getName(), 1 );
		if( cost <= money )
		{
			_confirmButtonUn->setVisible( false );
			_confirmButton->setVisible( true );
			_confirmButton->setPosition( _confirmButtonUn->getPosition() );
		}
	}
}

void MenuCreateTower::update( float )
{
	auto point = GameGS::getInstance()->getMainLayer()->convertToWorldSpace( _centerPoint );
	setPosition( point );

	if( _desc.node )
	{
		auto screenpos = getPosition();
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
