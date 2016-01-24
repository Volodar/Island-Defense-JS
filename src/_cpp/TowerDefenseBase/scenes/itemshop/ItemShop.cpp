#include "ItemShop.h"
#include "consts.h"
#include "resources.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/Language.h"
#include "ml/loadxml/xmlProperties.h"
#include "ShopLayer.h"
#include "UserData.h"
#include "ScoreCounter.h"
#include "Tutorial.h"
#include "ml/SmartScene.h"
#include "MapLayer.h"
#include "GameGS.h"
#include "ScoreLayer.h"
#include "configuration.h"

NS_CC_BEGIN


ItemShop::ItemShop()
: _scaleFactor( 1 )
, _zeroPosition()
, _removeScoreLayer(false)
{}

ItemShop::~ItemShop()
{}

bool ItemShop::init()
{
	do
	{
		auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		CC_BREAK_IF( !ScrollMenu::init() );
		CC_BREAK_IF( !NodeExt::init() );
		setCascadeOpacityEnabled( true );
		setCascadeColorEnabled( true );
		setKeyboardEnabled( true );

		NodeExt::load( "ini/itemshop/itemshop.xml" );

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

		Size grid;
		Size content;
		std::list<std::string> items;
		items.push_back( "bonusitem_dynamit" );
		items.push_back( "bonusitem_ice" );
		items.push_back( "bonusitem_laser" );

		for( auto & itemname : items )
		{
			auto item = buildItem( itemname );
			addItem( item );

			item->setScale( _scaleFactor );

			grid = item->getContentSize();
			grid.width *= _scaleFactor;
			grid.height *= _scaleFactor;
			content.width += grid.width;
			content.height = grid.height;
		}

		setAlignedStartPosition( Point( -_zeroPosition.x, -275 ) * _scaleFactor );
		setGrisSize( grid );
		align( 99 );

		Size scissor( dessize.width, 464 );
		setScissorRect( getAlignedStartPosition(), scissor * _scaleFactor );
		setScissorEnabled( true );
		setScrollEnabled( true );
		setContentSize( content );
		setAllowScrollByY( false );

		if( content.width < scissor.width )
		{
			float diff = scissor.width - content.width;
			Point point = getAlignedStartPosition();
			point.x += diff / 2;
			setAlignedStartPosition( point );
			align( 99 );
		}

		auto menu = getChildByName( "menu" );
		if( menu )
		{
			auto close = menu->getChildByName<MenuItem*>( "close" );
			close->setCallback( std::bind( &ItemShop::cb_close, this, std::placeholders::_1 ) );
			close->setScale( _scaleFactor );
			Point pos = close->getPosition();
			pos.y *= _scaleFactor;
			pos.x = dessize.width / 2 - 35;
			close->setPosition( pos );
		}

		auto lambda = [this]( EventKeyboard::KeyCode key, Event* )mutable
		{
			if( key == EventKeyboard::KeyCode::KEY_BACK )
				this->fadeexit();
		};
		EventListenerKeyboard * event = EventListenerKeyboard::create();
		event->onKeyReleased = std::bind( lambda, std::placeholders::_1, std::placeholders::_2 );
		getEventDispatcher()->addEventListenerWithSceneGraphPriority( event, this );

		fadeenter();
		return true;
	}
	while( false );
	return false;
}

MenuItemPointer ItemShop::buildItem( const std::string & itemname )
{
	MenuItemPointer item = xmlLoader::load_node<MenuItem>( "ini/itemshop/item.xml" );
	item->setName( itemname );
	item->setCallback( std::bind( &ItemShop::cb_buy, this, std::placeholders::_1, itemname ) );

	auto conteiner = item->getChildByName( "conteiner" );
	auto name = conteiner->getChildByName<Label*>( "name" );
	auto nodeMain = conteiner->getChildByName( "main" );
	auto nodeInfo = conteiner->getChildByName( "info" );
	auto info = nodeInfo ? nodeInfo->getChildByName<Label*>( "text" ) : nullptr;
	auto icon = nodeMain ? nodeMain->getChildByName<Sprite*>( "icon" ) : nullptr;
	auto buy = getNodeByPath<Label>( nodeMain, "menu/buy/normal/cost" );
	auto buyButton = getNodeByPath<MenuItem>( nodeMain, "menu/buy" );
	auto infoButton = getNodeByPath<MenuItem>( conteiner, "menu_info/info" );
	if( name )
	{
		std::string textid = itemname + "_name";
		name->setString( WORD( textid ) );
	}
	if( info )
	{
		std::string textid = itemname + "_desc";
		info->setString( WORD( textid ) );
	}
	if( icon )
	{
		std::string image = "images/itemshop/" + itemname + ".png";
		xmlLoader::setProperty(icon, xmlLoader::kImage, image);
	}
	if( buy )
	{
		int cost = getCost( itemname );
		buy->setString( intToStr( cost ) );
	}
	if( infoButton )
	{
		infoButton->setCallback( std::bind( &ItemShop::cb_info, this, std::placeholders::_1, itemname ) );
	}
	if( buyButton )
	{
		buyButton->setCallback( std::bind( &ItemShop::cb_buy, this, std::placeholders::_1, itemname ) );
	}

	return item;
}

void ItemShop::cb_buy( Ref*, const std::string & itemname )
{
	int cost = getCost( itemname );
	int score = ScoreCounter::shared().getMoney( kScoreCrystals );

	if( score < cost )
	{
        if(k::configuration::useInapps && TutorialManager::shared().dispatch( "itemshop_haventgold" ) )
		{
			cb_close( nullptr );
			return;
		}
		else
		{
			SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
			if( scene )
			{
				MapLayer* map = dynamic_cast<MapLayer*>(scene->getMainLayer().ptr());
				if( map )
					map->cb_shop( nullptr );
				else
				{
					GameGS* layer = dynamic_cast<GameGS*>(scene->getMainLayer().ptr());
					if( layer )
						layer->menuShop(nullptr, false);
				}
			}
		}
	}
	else
	{
		int index( 0 );
		if( itemname == "bonusitem_laser" ) index = 1;
		if( itemname == "bonusitem_ice" ) index = 2;
		if( itemname == "bonusitem_dynamit" ) index = 3;

		UserData::shared().bonusitem_add( index, 1 );
		ScoreCounter::shared().subMoney( kScoreCrystals, cost, true );
		AudioEngine::shared().playEffect( kSoundShopPurchase );
		UserData::shared().save();

		runFly( itemname );
	}

	TutorialManager::shared().dispatch( "itemshop_buy" );
}

void ItemShop::cb_info( Ref*, const std::string & itemname )
{
	auto item = getItemByName( itemname );
	if( !item )
		return;
	auto conteiner = item->getChildByName( "conteiner" );
	auto nodeMain = conteiner->getChildByName( "main" );
	auto nodeInfo = conteiner->getChildByName( "info" );
	if( nodeMain ) nodeMain->setVisible( !nodeMain->isVisible() );
	if( nodeInfo ) nodeInfo->setVisible( !nodeInfo->isVisible() );
}

void ItemShop::cb_close( Ref* )
{
	fadeexit();
}

void ItemShop::fadeexit()
{
	if( _removeScoreLayer )
	{
		auto scene = Director::getInstance()->getRunningScene();
		auto scores = scene->getChildByName( "scorelayer" );
		if( scores )
		{
			scores->removeFromParent();
		}
	}
	static auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	auto action = EaseBackIn::create( MoveTo::create( 0.5f, _zeroPosition + Point( 0, -dessize.height ) ) );
	runAction( Sequence::create( action, RemoveSelf::create(), nullptr) );
	AudioEngine::shared().playEffect( kSoundShopHide );
}

void ItemShop::fadeenter()
{
	static auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	setPosition( _zeroPosition + Point( 0, -dessize.height ) );
	auto action = EaseBackOut::create( MoveTo::create( 0.5f, _zeroPosition ) );
	runAction( action );
	AudioEngine::shared().playEffect( kSoundShopShow );

	auto scene = Director::getInstance()->getRunningScene();
	auto scores = scene->getChildByName( "scorelayer" );
	if( !scores )
	{
		auto scores = ScoreLayer::create();
		scene->addChild( scores, 999 );
		_removeScoreLayer = true;
	}
}

int ItemShop::getCost( const std::string & itemname )
{
	pugi::xml_document doc;
	doc.load_file( "ini/bonusitems.xml" );
	auto root = doc.root().first_child();
	int cost = root.child( itemname.c_str() ).attribute( "cost" ).as_int( 1 );
	return cost;
}

void ItemShop::runFly( const std::string & itemname )
{
	Size size = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	auto item = getItemByName( itemname );
	auto conteiner = item->getChildByName( "conteiner" );
	auto nodeMain = conteiner->getChildByName( "main" );
	auto icon = nodeMain ? nodeMain->getChildByName( "icon" ) : nullptr;

	Point pos = icon->convertToWorldSpace( Point::ZERO );

	xmlLoader::macros::set( "item", itemname );
	xmlLoader::macros::set( "centerx", floatToStr( size.width / 2 ) );
	xmlLoader::macros::set( "centery", floatToStr( size.height / 2 ) );
	xmlLoader::macros::set( "right", floatToStr( size.width ) );
	xmlLoader::macros::set( "position", pointToStr( pos ) );

	auto node = xmlLoader::load_node( "ini/itemshop/itemfly.xml" );
	getScene()->addChild( node,9999 );

	xmlLoader::macros::erase( "centerx" );
	xmlLoader::macros::erase( "centery" );
	xmlLoader::macros::erase( "right" );
	xmlLoader::macros::erase( "position" );
}

NS_CC_END
