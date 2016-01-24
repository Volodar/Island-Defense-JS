//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "Laboratory.h"
#include "tower.h"
#include "UserData.h"
#include "ml/SmartScene.h"
#include "MapLayer.h"
#include "ScoreCounter.h"
#include "resources.h"
#include "ml/Audio/AudioEngine.h"
#include "configuration.h"
#include "ml/Language.h"
#include "ml/loadxml/xmlProperties.h"
#include "Tutorial.h"
#include "Achievements.h"

NS_CC_BEGIN

Laboratory::Laboratory()
: _scaleFactor( 1 )
{}

Laboratory::~Laboratory()
{}

bool Laboratory::init()
{
	do
	{
		auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		CC_BREAK_IF( !ScrollMenu::init() );
		CC_BREAK_IF( !NodeExt::init() );
		setCascadeOpacityEnabled( true );
		setCascadeColorEnabled( true );
		setKeyboardEnabled( true );

		NodeExt::load( "ini/laboratory", "lab.xml" );

		auto bg = getChildByName( "bg" );
		if( bg )
		{
			auto size = bg->getContentSize();
			size.width = std::min( dessize.width, size.width );
			size.height += bg->getPositionY();
			float sx = dessize.width / size.width;
			_scaleFactor = sx;
			bg->setScale( _scaleFactor );

			_zeroPosition.x = dessize.width / 2;
			_zeroPosition.y = size.height / 2 * _scaleFactor - 10;
			setPosition( _zeroPosition );
		}
        auto caption = getChildByName("text");
        if( caption )
        {
            caption->setPositionY(240.f);
            caption->setPositionX(0.f);
        }
        
        
		Size grid;
		Size content;
		std::list<std::string> towers;
		mlTowersInfo::shared().fetch( towers );
		for( auto & tower : towers )
		{
			auto item = buildItem( tower );
			addItem( item );

			item->setScale( _scaleFactor );

			grid = item->getContentSize();
			grid.width *= _scaleFactor;
			grid.height *= _scaleFactor;
			content.width += grid.width;
			content.height = grid.height;

			setIndicator( tower, false );
			setCost( tower );
			setParam( tower, false );
			setIcon( tower, false );
		}

		setAlignedStartPosition( Point( -_zeroPosition.x, -275 ) * _scaleFactor );
		setGrisSize( grid );
		align( 99 );

		Size scissor( dessize.width, 465 );
		setScissorRect( getAlignedStartPosition(), scissor * _scaleFactor );
		setScissorEnabled( true );
		setScrollEnabled( true );
		setContentSize( content );
		setAllowScrollByY( false );

		auto menu = getChildByName( "menu" );
		if( menu )
		{
			auto close = menu->getChildByName<MenuItem*>( "close" );
			close->setCallback( std::bind( &Laboratory::cb_close, this, std::placeholders::_1 ) );
			close->setScale( _scaleFactor );
			Point pos = close->getPosition();
			pos.y *= _scaleFactor;
			pos.x = dessize.width / 2 - 35;
			close->setPosition( pos );
		}

		fadeenter();
		return true;
	}
	while( false );
	return false;
}

void Laboratory::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		cb_close( nullptr );
}

MenuItemPointer Laboratory::buildItem( const std::string & tower )
{
	int level = UserData::shared().tower_upgradeLevel( tower );
	MenuItemPointer item = xmlLoader::load_node<MenuItem>( "ini/laboratory/item.xml" );
	item->setName( tower );
	item->setCallback( std::bind( &Laboratory::cb_select, this, std::placeholders::_1, tower ) );
	auto conteiner = item->getChildByName( "conteiner" );
	if( conteiner )
	{
		conteiner->setCascadeColorEnabled( true );
		conteiner->setCascadeOpacityEnabled( true );
		auto infonode = conteiner->getChildByName( "info" );
		auto mainnode = conteiner->getChildByName( "main" );
		mainnode->setCascadeColorEnabled( true );
		mainnode->setCascadeOpacityEnabled( true );

		auto caption = conteiner->getChildByName<Label*>( "name" );
		auto icon2 = conteiner->getChildByName<Sprite*>( "icon2" );
		auto icon_lock = conteiner->getChildByName<Sprite*>( "icon_locked" );

		auto indicator = mainnode->getChildByName( "indicator" );

		if( caption )
		{
			std::string name = tower + "_name";
			name = WORD( name );
			caption->setString( name );
		}
		if( icon2 )
		{
			xmlLoader::setProperty( icon2, xmlLoader::kImage, "images/laboratory/icon_" + tower + ".png" );
		}
		if( indicator )
		{
			indicator->setCascadeColorEnabled( true );
			indicator->setCascadeOpacityEnabled( true );
		}

		auto menuinfo = conteiner->getChildByName<Menu*>( "menu_info" );
		if( menuinfo )
		{
			auto info = menuinfo->getChildByName<MenuItem*>( "info" );
			info->setCallback( std::bind( &Laboratory::cb_info, this, std::placeholders::_1, tower ) );
		}

		auto menu = mainnode->getChildByName<Menu*>( "menu" );
		if( menu )
		{
			auto button = menu->getChildByName<MenuItem*>( "buy" );

			button->setName( tower );
			button->setCallback( std::bind( &Laboratory::cb_upgrade, this, std::placeholders::_1, tower ) );
		}
		auto menu_confirm = mainnode->getChildByName<Menu*>( "menu_confirm" );
		if( menu_confirm )
		{
			auto ok = menu_confirm->getChildByName<MenuItem*>( "confirm" );
			auto no = menu_confirm->getChildByName<MenuItem*>( "cancel" );

			ok->setName( tower );
			no->setName( tower );
			ok->setCallback( std::bind( &Laboratory::cb_confirm, this, std::placeholders::_1, tower ) );
			no->setCallback( std::bind( &Laboratory::cb_cancel, this, std::placeholders::_1, tower ) );
		}

		if( infonode )
		{
			auto text = infonode->getChildByName<Label*>( "text" );
			text->setString( mlTowersInfo::shared().get_desc( tower, 1 ) );
		}

		if( level == 0 )
		{
			item->setEnabled( false );
			item->setOpacity( 128 );
			menu_confirm->setEnabled( false );
			menu->setEnabled( false );
			menuinfo->setEnabled( false );
			menu->setOpacity( 128 );

			mainnode->setVisible( false );
			icon_lock->setVisible( true );
		}
	}

	return item;
}

void Laboratory::cb_select( Ref*, const std::string & tower )
{
	selectTower( tower );
}

void Laboratory::cb_info( Ref*sender, const std::string & tower )
{
	selectTower( tower );
	auto item = dynamic_cast<MenuItem*>(sender);
	assert( item );
	switchInfoBox( tower );
}

void Laboratory::cb_upgrade( Ref*, const std::string & tower )
{
	selectTower( tower );
	showConfirmMenu( tower, true );
	setParam( tower, true );
	setIcon( tower, true );
	setIndicator( tower, true );

	TutorialManager::shared( ).dispatch( "lab_clickupgrade" );
}

void Laboratory::cb_confirm( Ref*, const std::string & tower )
{
	int level = UserData::shared().tower_upgradeLevel( tower ) + 1;
	int cost = mlTowersInfo::shared().getCostLab( tower, level );
	int score = ScoreCounter::shared().getMoney( kScoreCrystals );

	if( score < cost )
	{
		if( k::configuration::useInapps )
		{
			if( k::configuration::useInapps && TutorialManager::shared().dispatch( "lab_haventgold" ) )
			{
				cb_close( nullptr );
				return;
			}
			else
			{
				SmartScene * scene = dynamic_cast<SmartScene*>(getScene( ));
				if( scene )
				{
					MapLayer::Pointer map( dynamic_cast<MapLayer*>(scene->getMainLayer( ).ptr( )) );
					if( map )
						map->cb_shop( nullptr );
				}
			}
		}
		else
		{
			cb_cancel(nullptr, tower);
			return;
		}
	}
	else
	{
		selectTower( "" );
		showConfirmMenu( tower, false );
		upgradeTower( tower );
		normalStateForAllItemExcept( "" );
		ScoreCounter::shared().subMoney( kScoreCrystals, cost, true );
		AudioEngine::shared().playEffect( kSoundLabUpgrade );
		UserData::shared().save();
	}
	setParam( tower, false );
	setIcon( tower, false );

	TutorialManager::shared( ).dispatch( "lab_clickconfirm" );
}

void Laboratory::cb_cancel( Ref*, const std::string & tower )
{
	selectTower( "" );
	showConfirmMenu( tower, false );
	normalStateForAllItemExcept( "" );
	setIndicator( tower, false );
}

void Laboratory::selectTower( const std::string & tower )
{
	normalStateForAllItemExcept( tower );
	unsigned count = getItemsCount();
	for( unsigned i = 0; i < count; ++i )
	{
		auto item = getItem( i );
		unsigned opacity = tower.empty() == false ?
			(item->getName() == tower ? 255 : 64) :
			255;
		item->setOpacity( opacity );
	}
}

void Laboratory::showConfirmMenu( const std::string & itemname, bool mode )
{
	int level = UserData::shared().tower_upgradeLevel( itemname );
	auto item = getItemByName( itemname );
	assert( item );
	auto conteiner = item->getChildByName( "conteiner" );
	auto mainnode = conteiner->getChildByName( "main" );
	auto menu0 = mainnode->getChildByName( "menu" );
	auto menu1 = mainnode->getChildByName( "menu_confirm" );

	menu0->setVisible( !mode && level != 5 );
	menu1->setVisible( mode );
}

void Laboratory::switchInfoBox( const std::string & itemname, bool forceHideInfo )
{
	int level = UserData::shared().tower_upgradeLevel( itemname );
	auto item = getItemByName( itemname );
	assert( item );
	auto conteiner = item->getChildByName( "conteiner" );
	auto infonode = conteiner->getChildByName( "info" );
	auto mainnode = conteiner->getChildByName( "main" );

	if( level > 0 )
	{
		bool infovisivle = forceHideInfo ? false : !infonode->isVisible();
		infonode->setVisible( infovisivle );
		mainnode->setVisible( !infovisivle );
	}
}

void Laboratory::upgradeTower( const std::string & tower )
{
	int level = UserData::shared().tower_upgradeLevel( tower ) + 1;
	level = std::min( level, 5 );
	UserData::shared().tower_upgradeLevel( tower, level );
	setIndicator( tower, false );
	setCost( tower );
	Achievements::shared().process( "lab_buyupgrade", 1 );
}

void Laboratory::setIndicator( const std::string & tower, bool nextLevel )
{
	int level = UserData::shared().tower_upgradeLevel( tower );
	if( nextLevel )
		level = std::min( level + 1, 5 );
	auto item = getItemByName( tower );
	auto conteiner = item->getChildByName( "conteiner" );
	auto main = conteiner ? conteiner->getChildByName( "main" ) : nullptr;
	auto indicator = main ? main->getChildByName( "indicator" ) : nullptr;
	if( indicator )
	{
		for( int i = 0; i < 5; ++i )
		{
			auto node = indicator->getChildByName( intToStr( i + 1 ) );
			if( node ) node->setVisible( i < level );
		}
		auto caption = indicator->getChildByName<Label*>( "caption" );
		if( level > 0 )
		{
			caption->setString( WORD("laboratory_tower_level") + intToStr( level ) );
		}
		else
		{
			caption->setString( "" );
		}
	}
	if( level == 5 && !nextLevel )
	{
		auto menu = main->getChildByName( "menu" );
		auto menu2 = main->getChildByName( "menu_confirm" );
		menu->setVisible( false );
		menu2->setVisible( false );
	}
}

void Laboratory::setCost( const std::string & tower )
{
	int level = UserData::shared().tower_upgradeLevel( tower );
	auto item = getItemByName( tower );
	int cost = mlTowersInfo::shared().getCostLab( tower, level + 1 );
	auto cost0 = dynamic_cast<Label*>(getNodeByPath( item, "conteiner/main/menu/" + tower + "/normal/cost" ));
	auto cost1 = dynamic_cast<Label*>(getNodeByPath( item, "conteiner/main/menu_confirm/cost" ));
	if( cost0 ) cost0->setString( intToStr( cost ) );
	if( cost1 ) cost1->setString( intToStr( cost ) );
}

void Laboratory::setParam( const std::string & tower, bool nextLevel )
{
	auto item = getItemByName( tower );
	auto conteiner = item->getChildByName( "conteiner" );
	if( !conteiner )return;
	auto mainnode = conteiner->getChildByName( "main" );
	if( !mainnode )return;

	int level = UserData::shared().tower_upgradeLevel( tower );
	if( nextLevel ) ++level;
	auto dmg = mainnode->getChildByName<Label*>( "dmg" );
	auto rng = mainnode->getChildByName<Label*>( "rng" );
	auto spd = mainnode->getChildByName<Label*>( "spd" );
	if( dmg )
	{
		std::string value = WORD("laboratory_tower_attack") + intToStr( mlTowersInfo::shared().get_dmg( tower, level ) );
		dmg->setString( value );
	}
	if( rng )
	{
		std::string value = WORD("laboratory_tower_range") + intToStr( mlTowersInfo::shared().get_rng( tower, level ) );
		rng->setString( value );
	}
	if( spd )
	{
		std::string value = WORD("laboratory_tower_speed") + intToStr( mlTowersInfo::shared().get_spd( tower, level ) );
		spd->setString( value );
	}
}

void Laboratory::setIcon( const std::string & tower, bool nextLevel )
{
	int level = UserData::shared().tower_upgradeLevel( tower );
	if( nextLevel ) ++level;
	level = std::min( std::max( 1, level ), 5 );

	std::string texture = "images/laboratory/icons/" + tower + intToStr( level ) + ".png";
	auto item = getItemByName( tower );
	auto conteiner = item->getChildByName( "conteiner" );
	if( !conteiner )return;
	auto icon = conteiner->getChildByName<Sprite*>( "icon" );
	if( icon ) xmlLoader::setProperty( icon, xmlLoader::kImage, texture );
}

void Laboratory::normalStateForAllItemExcept( const std::string & tower )
{
	for( unsigned i = 0; i < getItemsCount(); ++i )
	{
		auto item = getItem( i );
		if( item->getName() != tower )
		{
			showConfirmMenu( item->getName(), false );
			switchInfoBox( item->getName(), true );
			setParam( item->getName(), false );
			setIcon( item->getName(), false );
		}
	}
}

void Laboratory::cb_close( Ref* )
{
	auto func = [this]()
	{
		if( this->_callbackOnClosed )
			this->_callbackOnClosed();
		this->removeFromParent();
	};

	fadeexit();
	runAction( Sequence::createWithTwoActions(
		DelayTime::create( 0.5f ),
		CallFunc::create( func )
		) );
}

void Laboratory::fadeexit()
{
	static auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	auto action = EaseBackIn::create( MoveTo::create( 0.5f, _zeroPosition + Point( 0, -dessize.height ) ) );
	runAction( action );
	AudioEngine::shared().playEffect( kSoundShopHide );
}

void Laboratory::fadeenter()
{
	static auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	setPosition( _zeroPosition + Point( 0, -dessize.height ) );
	auto action = EaseBackOut::create( MoveTo::create( 0.5f, _zeroPosition ) );
	runAction( action );
	AudioEngine::shared().playEffect( kSoundShopShow );
}




NS_CC_END
