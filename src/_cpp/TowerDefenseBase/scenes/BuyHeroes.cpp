#include "BuyHeroes.h"
#include "support.h"
#include "UserData.h"
#include "Hero.h"
#include "MenuItemWithText.h"
#include "ml/Language.h"
#include "ScoreCounter.h"
#include "shop/ShopLayer.h"
#include "ml/SmartScene.h"
#include "configuration.h"
NS_CC_BEGIN





BuyHeroes::BuyHeroes()
{}

BuyHeroes::~BuyHeroes()
{
#if PC == 1
#else
	ShopLayer::observerOnPurchase().remove( _ID );
#endif
}

bool BuyHeroes::init()
{
	do
	{
		CC_BREAK_IF( !Layer::init() );
		CC_BREAK_IF( !NodeExt::init() );

		load( "ini/promo/heroeslayer.xml" );


		auto callback = [this]( inapp::SkuDetails details )
		{
			if( details.result == inapp::Result::Ok )
			{
				_details = details;
				if( _details.result == inapp::Result::Ok )
				{
					std::string string = _details.priceText;
					auto costnode = getNodeByPath<Label>( this, "menu/buy/normal/cost" );
					if( costnode )
						costnode->setString( string );
				}
			}
		};
		if( k::configuration::useHeroRoom )
		{
			inapp::details( k::configuration::kInappAllHeroes, std::bind( callback, std::placeholders::_1 ) );
		}

		runEvent( "appearance" );

		return true;
	}
	while( false );
	return false;
}

ccMenuCallback BuyHeroes::get_callback_by_description( const std::string & name )
{
#define callback( x ) std::bind( [this]( Ref* ){ x; }, std::placeholders::_1 )
	if( name == "buy" )
		return callback( this->buy() );
	else if( name == "linktofullversion")
		return callback( this->openstore() );
	else  if( name == "close" )
		return std::bind( [this]( Ref* ){ runEvent( "disappearance" ); }, std::placeholders::_1 );
	return LayerExt::get_callback_by_description( name );
#undef callback
}

void BuyHeroes::buy()
{
#if PC == 1
#else
	if( _details.result == inapp::Result::Ok )
	{
		auto callback = [this]( int, int, BuyHeroes* inst )
		{
			runEvent( "disappearance" );
		};
		ShopLayer::observerOnPurchase().add( _ID, std::bind( callback, std::placeholders::_1, std::placeholders::_2, this ) );
		inapp::purchase( _details.productId );
	}
#endif
}

void BuyHeroes::openstore()
{
	openUrl( k::configuration::LinkToStorePaidVersion );
}

/************************************************************/
//MARK:	class BuyHeroMenu
/************************************************************/

time_t BuyHeroMenu::_duration = 60 * 60 * 24;

BuyHeroMenu::BuyHeroMenu()
	: _timestamp( 0 )
{}

BuyHeroMenu::~BuyHeroMenu()
{}

bool BuyHeroMenu::isShow()
{
	if( !k::configuration::useHeroesPromo )
		return false;

	auto levels = UserData::shared().level_getCountPassed();
	if( levels < 4 )
		return false;

	auto hero2Bought = HeroExp::shared().isHeroAvailabled( "hero2" );
	auto hero3Bought = HeroExp::shared().isHeroAvailabled( "hero3" );
	if( hero2Bought && hero3Bought )
		return false;

	time_t timestamp = UserData::shared().get_int( "BuyHeroMenutimestamp", 0 );
	if( timestamp > 0 )
	{
		time_t current;
		time( &current );
		time_t elapsed = current - timestamp;
		if( elapsed >= _duration )
			return false;
	}

	return true;
}

bool BuyHeroMenu::init()
{
	do
	{
		CC_BREAK_IF( !Menu::init() );
		CC_BREAK_IF( !NodeExt::init() );
		load( "ini/promo/heroesicon.xml" );

		_timestamp = UserData::shared().get_int( "BuyHeroMenutimestamp", 0 );
		if( _timestamp == 0 )
		{
			time( &_timestamp );
			UserData::shared().write( "BuyHeroMenutimestamp", (int)_timestamp );

			runAction( Sequence::create(
				DelayTime::create( 1 ),
				CallFunc::create( [this](){openPromo( nullptr ); } ),
				nullptr ) );
				
		}

		scheduleUpdate();
		update( 0 );
		return true;
	}
	while( false );
	return false;
}

ccMenuCallback BuyHeroMenu::get_callback_by_description( const std::string & name )
{
	if( name == "open" ) return std::bind( &BuyHeroMenu::openPromo, this, std::placeholders::_1 );
	else return NodeExt::get_callback_by_description( name );
}

void BuyHeroMenu::openPromo( Ref* )
{
	auto layer = BuyHeroes::create();
	auto scene = dynamic_cast<SmartScene*>(getScene());
	if( scene && layer )
		scene->pushLayer( layer, true );
}

void BuyHeroMenu::update( float dt )
{
	time_t current;
	time( &current );
	auto elapsed = current - _timestamp;
	auto timeleft = _duration - elapsed;
	if( timeleft > 0 )
	{
		std::string time;

		int hrs = int( timeleft ) / 3600;
		int min = (int( timeleft ) - hrs * 3600) / 60;
		int sec = int( timeleft ) - hrs * 3600 - min * 60;

		std::stringstream ss;
		if( hrs != 0 ) ss << hrs << "h ";
		if( min != 0 ) ss << min << "m ";
		if( sec != 0 ) ss << sec << "s";
		time = ss.str();

		auto timer = getNodeByPath<Label>( this, "timer" );
		if( timer )
			timer->setString( time );
	}
	else
	{
		removeFromParent();
	}
}


NS_CC_END
