//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include <thread>
#include <chrono>

#include "ml/loadxml/xmlLoader.h"
#include "ml/ImageManager.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/SmartScene.h"
#include "ml/loadxml/xmlProperties.h"

#include "ShopLayer.h"
#include "consts.h"
#include "resources.h"
#include "ScoreCounter.h"
#include "inapp/Purchase.h"
#include "UserData.h"
#include "flurry/flurry_.h"
#include "configuration.h"
#include "Tutorial.h"
#include "Language.h"
#include "plugins/AdsPlugin.h"
#include "game/unit/Hero.h"
#include "fyber/fyber.h"

NS_CC_BEGIN

#if PC != 1
const std::string kShopIcons( "images/shop/icons/" );

namespace
{
	ShopLayer * instance(nullptr);
};

ShopLayer::ObserverOnPurchase ShopLayer::_observerOnPurchase;
ShopLayer::ObserverOnPurchase& ShopLayer::observerOnPurchase()
{
	return _observerOnPurchase;
}

ShopLayer::ShopLayer()
: _scaleFactor( 1 )
, _zeroPosition()
, _observerOnClose()
, _itemsValue()
, _queueDetails()
, _queueDetailsMutex()
, _autoClosing( false )
{
	//assert( !instance );
	instance = this;
	setName( "shoplayer" );
}

ShopLayer::~ShopLayer()
{
	assert(instance);
	instance = nullptr;
	AdsPlugin::shared().observerVideoResult.remove( _ID );
}

bool ShopLayer::init( const Params & params )
{
	return init( params.showFreeFuel, params.showFreeGold, params.showLevelScores, params.autoClosingOnPurchase );
}

bool ShopLayer::init( bool usefreeFuel, bool showFreeGold, bool asLevelScores, bool autoclose )
{
    if( k::configuration::useInapps == false ) {
		return false;
    }

    if( k::configuration::useFuel == false ) {
        usefreeFuel = true;
        usefreeFuel = false;
    
    }
    _autoClosing = autoclose;

    do
    {
        auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
        CC_BREAK_IF( !ScrollMenu::init() );
        CC_BREAK_IF( !NodeExt::init() );
        
        loadDefaulParams();
        
        setCascadeOpacityEnabled( true );
        setCascadeColorEnabled( true );
        setKeyboardEnabled( true );
        
        NodeExt::load( "ini/shop/shop.xml" );
        
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
            
        }
        auto caption = ImageManager::sprite( "images/shop/ui_window_shop_header.png" );
        if( caption && bg )
        {
            bg->addChild( caption, 1 );
            caption->setPosition( 1136 / 2, 570 );
        }
        
        Size grid;
        Size content;
        std::list< std::string > items;

		if( usefreeFuel )
			items.push_back( "free_fuel" );
		if( !asLevelScores && k::configuration::useFuel )
			items.push_back( k::configuration::kInappFuel1 );
		
		if( showFreeGold && k::configuration::useFreeGold )
			items.push_back( "free_gold" );
		
		if( asLevelScores )
        {
			items.push_back( k::configuration::kInappGear1 );
			items.push_back( k::configuration::kInappGear2 );
			items.push_back( k::configuration::kInappGear3 );
        }
        else
        {
			items.push_back( k::configuration::kInappGold1 );
			items.push_back( k::configuration::kInappGold2 );
			items.push_back( k::configuration::kInappGold3 );
			items.push_back( k::configuration::kInappGold4 );
			items.push_back( k::configuration::kInappGold5 );
        }
        
		
        std::string gift = UserData::shared().get_str( k::user::ShopGift );
        if( gift.empty() == false )
        {
            items.push_front( gift );
        }

        for( auto& item : items )
        {
            MenuItemPointer menuitem = buildItem( item );
            
            addItem( menuitem );
            
            menuitem->setScale( _scaleFactor );
            
            grid = menuitem->getContentSize();
            grid.width *= _scaleFactor;
            grid.height *= _scaleFactor;
            content.width += grid.width;
            content.height = grid.height;
        }
        
        if( gift.empty() == false )
        {
            auto iter = std::find( items.begin(), items.end(), gift );
            assert( iter != items.end() );
            if( iter != items.end() )
                items.erase( iter );
        }
        
        for( auto& item : items )
        {
            //std::thread thread( [this, item]()
            //{
            inapp::details( item, std::bind( &ShopLayer::details_ansfer, this, std::placeholders::_1 ) );
            //}
            //);
            //thread.detach();
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
            close->setCallback( std::bind( &ShopLayer::close, this, std::placeholders::_1 ) );
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
        schedule( schedule_selector( ShopLayer::details_dispather ) );
        
        return true;
    }
    while (false);
    
    return false;
}

bool ShopLayer::loadDefaulParams()
{
	pugi::xml_document doc;
	doc.load_file( "ini/shop/default_params.xml" );
	auto root = doc.root().first_child();

	FOR_EACHXML( root, child )
	{
		std::string name = child.attribute( "name" ).as_string();
		std::string desc = child.attribute( "price" ).as_string();
		bool inapp = child.attribute( "inapp" ).as_bool( true );
		int value = child.attribute( "value" ).as_int();

		if( inapp )
		{
			_itemsValue[ k::configuration::kInappPackage + name] = value;
			_itemsDescDefault[k::configuration::kInappPackage + name] = desc;
		}
		else
		{
			_itemsValue[name] = value;
			_itemsDescDefault[name] = desc;
		}
	}
	return root != nullptr;
}

MenuItemPointer ShopLayer::buildItem( const std::string & id )
{
	auto gift = UserData::shared().get_str( k::user::ShopGift );
	if( gift == id )
	{
		auto p = k::configuration::kInappPackage;
		xmlLoader::macros::set( "shopitem_caption", intToStr( _itemsValue[p + id] ) );
		xmlLoader::macros::set( "shopitem_cost", _itemsDescDefault[p + id] );
	}
	else
	{
		xmlLoader::macros::set( "shopitem_caption", intToStr( _itemsValue[id] ) );
		xmlLoader::macros::set( "shopitem_cost", _itemsDescDefault[id] );
	}

	std::string filename = id;
	if( k::configuration::kInappPackage.empty() == false &&
		filename.find( k::configuration::kInappPackage ) == 0)
	{
		filename = id.substr( k::configuration::kInappPackage.size() );
	}
	std::string path = "ini/shop/" + filename + ".xml";
	MenuItemPointer item = xmlLoader::load_node<MenuItem>( path );

	xmlLoader::macros::erase( "shopitem_caption" );
	xmlLoader::macros::erase( "shopitem_cost" );

	auto button = getNodeByPath<MenuItem>( item, "menu/buy" );
	auto callback = std::bind( &ShopLayer::request, this, std::placeholders::_1, id );

	bool enabled = id == gift;
	enabled = enabled || id == "free_gold";
	enabled = enabled || id == "free_fuel";

	item->setName( id );
	item->setEnabled( enabled );
	item->setCallback( callback );

	if( button )
	{
		button->setName( id );
		button->setEnabled( enabled );
		button->setCallback( callback );
	}

	return item;
}
/*
MenuItemPointer ShopLayer::buildItemFreeFuel()
{
	MenuItemPointer item = xmlLoader::load_node<MenuItem>( "ini/shop/item.xml" );
	assert( item );
	if( !item )return nullptr;

	auto caption = item->getChildByName<Label*>( "text" );
	auto icon = item->getChildByName<Sprite*>( "icon" );
	auto icontype = item->getChildByName<Sprite*>( "icon_type" );
	auto menu = item->getChildByName<Menu*>( "menu" );
	auto button = menu ? menu->getChildByName<MenuItem*>( "buy" ) : nullptr;
	auto image = button ? button->getChildByName( "normal" ) : nullptr;
	auto cost = image ? image->getChildByName<Label*>( "cost" ) : nullptr;
	auto text = image ? image->getChildByName<Label*>( "text" ) : nullptr;

	auto callback = std::bind( &ShopLayer::show_video, this, std::placeholders::_1 );

	item->setName( "free_fuel" );
	item->setCallback( callback );
	if( button )
	{
		button->setName( "free_fuel" );
		button->setCallback( callback );
	}
	if( icon )
	{
		std::string resource = kShopIcons + "free_fuel.png";
		auto frame = ImageManager::shared().spriteFrame( resource );
		if( frame ) icon->setSpriteFrame( frame );
		else xmlLoader::setProperty( icon, xmlLoader::kImage, resource );
	}

	if( caption )
		caption->setString(intToStr(10));//TODO: Free fuel count to consts
	if( cost )
		cost->setString( "" );
	if( text )
	{
		text->setString(WORD("shop_getfree"));
        text->setAnchorPoint(Point(0.5f, 0.5f));
		text->setPositionY( text->getPositionY() - 13 * _scaleFactor );
        text->setScale(0.6f);
        text->setAlignment(TextHAlignment::CENTER);
	}
	if( icontype )
	{
		xmlLoader::setProperty( icontype, xmlLoader::kImage, "images/shop/icon_fuel.png" );
	}
	if( icontype && caption )
	{
		float width = caption->getContentSize().width + icontype->getContentSize().width;
		float x = width / 2 - icontype->getContentSize().width * icontype->getScaleX();
		caption->setPositionX( caption->getPosition().x - x );
		icontype->setPositionX( icontype->getPosition().x - x );
	}

	return item;
}
*/
void ShopLayer::push_details( inapp::SkuDetails result )
{
	//_queueDetailsMutex.lock();
	_queueDetails.push( result );
	//_queueDetailsMutex.unlock();
}

void ShopLayer::details_dispather( float dt )
{
	//_queueDetailsMutex.lock( );
	while( _queueDetails.empty() == false )
	{
		inapp::SkuDetails details = _queueDetails.front();
		_queueDetails.pop();

		if( details.result == inapp::Result::Ok )
		{
			if( details.description.empty() == false )
				_itemsValue[details.productId] = strToInt( details.description );
			UserData::shared().write( k::user::PurchaseSavedValue + details.productId, details.description);
			
			auto item = getItemByName( details.productId );
			if( item )
			{
				auto text = item->getChildByName<Label*>( "text" );
				auto menu = item->getChildByName<Menu*>( "menu" );
				auto button = menu ? menu->getChildByName<MenuItem*>( details.productId ) : nullptr;
				auto image = button ? button->getChildByName( "normal" ) : nullptr;
				auto cost = image ? image->getChildByName<Label*>( "cost" ) : nullptr;
				if( cost )
					cost->setString( details.priceText );
				if( text && details.description.empty() == false )
					text->setString( intToStr(strToInt(details.description)) );
				item->setEnabled( true );
				button->setEnabled( true );
			}
		}
	}
	//_queueDetailsMutex.unlock( );
}

void ShopLayer::details_ansfer( inapp::SkuDetails result )
{
	push_details( result );
}

void ShopLayer::close( Ref*sender )
{
	auto func = [this]()
	{
		retain();
		_observerOnClose.pushevent();
		removeFromParent();
		release();
	};

	runAction( Sequence::createWithTwoActions(
		DelayTime::create( 0.5f ),
		CallFunc::create( func )
		) );
	fadeexit();
}

void ShopLayer::request( Ref*sender, const std::string & purchase )
{

	std::string gift = UserData::shared( ).get_str( k::user::ShopGift );
	if( purchase == "free_gold" )
	{
        AdsPlugin::shared().showOfferWall();
	}
	else if( purchase == "free_fuel" )
	{
		show_video( sender );
	}
	else if( purchase != gift )
	{
		_pause();
		inapp::purchase( purchase );
	}
	else
	{
		_pause();
		inapp::PurchaseResult result;
		result.errorcode = 0;
		result.productId = purchase;
		result.result = inapp::Result::Ok;
		request_answer( result );
		UserData::shared( ).write( k::user::ShopGift, std::string() );
		TutorialManager::shared().dispatch( "shop_getgift" );

		getItemByName( gift )->setVisible( false );
		if( _autoClosing == false )
			close(nullptr);
	}
}

void ShopLayer::request_answer( inapp::PurchaseResult aresult )
{
	const inapp::PurchaseResult result = aresult;
	log( "ShopLayer::request_answer" );

	while( result.result == inapp::Result::Ok || result.result == inapp::Result::Restored )
	{
		
		if( result.result == inapp::Result::Restored )
		{
			MessageBox( "Purchase was restored", "" );
		}
		
		log( "ShopLayer::request_answer Ok" );
		std::string purchase = result.productId;
		bool dispatch( true );

		int type = -1;
		int value(0);

		bool gift( false );

		if( purchase == k::configuration::kInappHero2 ||
			purchase == k::configuration::kInappHero3 )
		{
			std::string hero;
			if( k::configuration::kInappPackage.empty() == false )
			{
				hero = purchase.substr(k::configuration::kInappPackage.size());
			}
			else
			{
				hero = purchase;
			}
			
			HeroExp::shared().heroBought( hero );
			_observerOnPurchase.pushevent( 0, 0 );
			break;
		}
		if( purchase == k::configuration::kInappAllHeroes )
		{
			auto heroname = "hero1";
			auto exp = HeroExp::shared().getEXP( heroname );
			auto level = HeroExp::shared().getLevel( exp );
			if( level < HeroExp::shared().getMaxLevel() )
			{
				exp = HeroExp::shared().getHeroLevelExtValue( level );
				HeroExp::shared().setEXP( heroname, exp );
			}

			for( int i = 0; i < 3; ++i )
				HeroExp::shared().heroBought( "hero" + intToStr( i + 1 ) );
			_observerOnPurchase.pushevent( 0, 0 );
			break;
		}
		else if( purchase == k::configuration::kInappFuel1 ) type = kScoreFuel;
		else if( purchase == k::configuration::kInappGold1 ) type = kScoreCrystals;
		else if( purchase == k::configuration::kInappGold2 ) type = kScoreCrystals;
		else if( purchase == k::configuration::kInappGold3 ) type = kScoreCrystals;
		else if( purchase == k::configuration::kInappGold4 ) type = kScoreCrystals;
		else if( purchase == k::configuration::kInappGold5 ) type = kScoreCrystals;
		else if( purchase == k::configuration::kInappGear1 ) type = kScoreLevel;
		else if( purchase == k::configuration::kInappGear2 ) type = kScoreLevel;
		else if( purchase == k::configuration::kInappGear3 ) type = kScoreLevel;
		else if( purchase == "gift_gear" ) { type = kScoreLevel; gift = true; }
		else if( purchase == "gift_gold" ) { type = kScoreCrystals; gift = true; }
		else if( purchase == "gift_fuel" ) { type = kScoreFuel; gift = true; }
		else
		{
			log( "product not defined [%s]", purchase.c_str() );
			dispatch = false;
		}
		
		if( instance )
		{
			if( gift )
				value = instance->_itemsValue[k::configuration::kInappPackage + purchase];
			else
				value = instance->_itemsValue[purchase];
		}
		else
		{
			value = UserData::shared().get_int( k::user::PurchaseSavedValue + purchase);
		}

		if( dispatch )
		{
			assert( type != -1 );
			if( purchase == k::configuration::kInappFuel1 )
			{
				UserData::shared().write( k::user::MaxFuelValue, 250 );
				ScoreByTime::shared().checkMaxValue();
				ScoreCounter::shared().setMoney( kScoreFuel, value, true );
			}
			else
			{
				ScoreCounter::shared().addMoney( type, value, type != kScoreLevel );
			}

			if( gift == false )
			{
				std::string key = k::user::BoughtScores + intToStr( type );
				int boughtScores = UserData::shared().get_int( key, 0 ) + value;
				UserData::shared().write( key, boughtScores );
				UserData::shared().save();
				inapp::confirm( purchase );
			}
			_observerOnPurchase.pushevent( type, value );
		}

		auto call = CallFunc::create( []()
		{
			AudioEngine::shared().playEffect( kSoundShopPurchase );
		} );
		if( instance )
			instance->runAction( Sequence::createWithTwoActions( DelayTime::create( 0.1f ), call ) );
		break;
	}

	if( instance )
		instance->_resume();

	ParamCollection pc;
	pc["event"] = "Purchase";
	pc["level"] = intToStr( UserData::shared().level_getCountPassed() );
	pc["errormsg"] = result.errormsg;
	pc["errorсode"] = intToStr(result.errorcode);
	if( result.result == inapp::Result::Ok )
		pc["value"] = result.productId;
	else if( result.result == inapp::Result::Fail )
		pc["value"] = "failed";
	else
		pc["value"] = "canceled";

	flurry::logEvent( pc );

	if( instance && instance->_autoClosing && result.result == inapp::Result::Ok )
	{
		instance->close( nullptr );
	}
}

void ShopLayer::show_video( Ref * sender )
{
	AdsPlugin::shared().observerVideoResult.add( _ID, std::bind( &ShopLayer::show_video_finished, this, std::placeholders::_1 ) );
	AdsPlugin::shared().showVideo();
}

void ShopLayer::show_video_started( bool success )
{
	if( success )
	{
		CocosDenshion::SimpleAudioEngine::getInstance()->pauseAllEffects();
		CocosDenshion::SimpleAudioEngine::getInstance()->pauseBackgroundMusic();
	}
}

void ShopLayer::show_video_finished( bool successful )
{
	ParamCollection pc;
	pc["event"] = "Video";
	pc["value"] = successful ? "successful" : "failed";
	flurry::logEvent( pc );

	//_resume();
    CocosDenshion::SimpleAudioEngine::getInstance()->resumeAllEffects();
    CocosDenshion::SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
	if( successful )
	{
		//int max = ScoreByTime::shared().max_fuel();
		//int cur = ScoreCounter::shared().getMoney( kScoreFuel );
		//int val = cur + max * .5f;
		//val = std::min( val, max );
		//val = std::max( val, cur );
		//ScoreCounter::shared().setMoney( kScoreFuel, val, true );

		log("show_video_finished 5 ");
		int count = ScoreCounter::shared().getMoney( kScoreFuel );
		int ncount = count + 10;
		ncount = std::min( ncount, ScoreByTime::shared().max_fuel() );
		ncount = std::max( ncount, count );
		ScoreCounter::shared().setMoney( kScoreFuel, ncount, true );
		log("show_video_finished 6 ");
		//vungle::consume();
	}
	else
	{
		log("show_video_finished 7 ");
		if( AdsPlugin::shared().isVideoAvailabled() == false )
		{
			cocos2d::MessageBox( "No ads available. Please try again later.", "" );
			return;
		}

	}
	log("show_video_finished 8 ");
}

void ShopLayer::show_video_gold( int reward )
{
    CocosDenshion::SimpleAudioEngine::getInstance()->resumeAllEffects();
    CocosDenshion::SimpleAudioEngine::getInstance()->resumeBackgroundMusic();
    ScoreCounter::shared().addMoney( kScoreCrystals, reward, true );
}

void ShopLayer::_pause()
{
	SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
	_blockLayer = LayerExt::create();
	auto sprite = ImageManager::shared().sprite("images/loading.png");
	_blockLayer->addChild(sprite);
	sprite->runAction(RepeatForever::create(RotateBy::create(1, 360)));
	sprite->setPosition( Point(Director::getInstance()->getOpenGLView()->getDesignResolutionSize()/2) );
	if( scene )
		scene->pushLayer( _blockLayer, true );
}

void ShopLayer::_resume()
{
	if( _blockLayer )
	{
		_blockLayer->removeFromParent();
		_blockLayer.reset(nullptr);
	}
}

void ShopLayer::fadeexit()
{
	static auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	auto action = EaseBackIn::create( MoveTo::create( 0.5f, _zeroPosition + Point( 0, -dessize.height ) ) );
	runAction( action );
	AudioEngine::shared().playEffect( kSoundShopHide );
}

void ShopLayer::fadeenter()
{
	static auto dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	setPosition( _zeroPosition + Point( 0, -dessize.height ) );
	auto action = EaseBackOut::create( MoveTo::create( 0.5f, _zeroPosition ) );
	runAction( action );
	AudioEngine::shared().playEffect( kSoundShopShow );
}

void ShopLayer::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		close( nullptr );
}

#endif
NS_CC_END
