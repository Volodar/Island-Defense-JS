//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "WaveIcon.h"
#include "ml/ImageManager.h"
#include "GameGS.h"
#include "resources.h"
#include "ml/loadxml/xmlLoader.h"
#include "ml/Audio/AudioEngine.h"
#include "configuration.h"
NS_CC_BEGIN


WaveIcon::WaveIcon()
: _arrow()
, _icon()
, _callback()
, _wavestart()
, _elapsed( 0 )
, _cooldown( 0 )
, _duration( 0 )
, _runned( false )
{}

WaveIcon::~WaveIcon()
{}

bool WaveIcon::init( const Point & startwave, float delay, float cooldown, const CallBack & onclick, UnitLayer type )
{
	do
	{
		CC_BREAK_IF( !Menu::init() );
		setPosition( 0, 0 );

		_callback = onclick;
		assert( _callback );
		_cooldown = std::min<float>( delay, cooldown );
		_duration = delay;

		std::string WaveIconSky = k::resourceGameSceneFolder + "wave_direction0.png";
		std::string WaveIconEarth = k::resourceGameSceneFolder + "wave_direction1.png";
		std::string WaveIconArrow = k::resourceGameSceneFolder + "wave_direction2.png";
		std::string WaveIconTimer = k::resourceGameSceneFolder + "wave_direction3.png";

		std::string iconImage;
		if( type == UnitLayer::sky )
			iconImage = WaveIconSky;
		else
			iconImage = WaveIconEarth;

		auto callback = std::bind( &WaveIcon::on_click, this, std::placeholders::_1 );
		_icon = MenuItemImageWithText::create( iconImage, callback );
		_icon->setSelectedImage( nullptr );
		_icon->setSound( kSoundGameWaveIcon );
		_icon->setName( "icon" );
		_arrow = Node::create();
		auto arrowsprite = ImageManager::sprite( WaveIconArrow );
		_timer = ProgressTimer::create( ImageManager::sprite( WaveIconTimer ) );
		CC_BREAK_IF( !_icon );
		CC_BREAK_IF( !_arrow );
		CC_BREAK_IF( !arrowsprite );
		CC_BREAK_IF( !_timer );

		_wavestart = startwave;
		addChild( _icon );
		_icon->addChild( _arrow, -1 );
		_arrow->addChild( arrowsprite );
		_arrow->setPosition( Point( _icon->getNormalImage()->getContentSize().width / 2, _icon->getNormalImage()->getContentSize().height / 2 ) );
		arrowsprite->setPosition( 35, 0 );
		_icon->getNormalImage()->addChild( _timer, 1 );
		_timer->setPosition( Point( _icon->getNormalImage()->getContentSize() / 2 ) );

		auto mover = EaseInOut::create( MoveBy::create( 0.5f, Point( 10, 0 ) ), 2 );
		auto scaler = EaseInOut::create( ScaleBy::create( 0.5f, 1.05f ), 2 );
		auto actionarrow = Sequence::create( mover, mover->reverse(), nullptr );
		auto actionicon = Sequence::create( scaler, scaler->reverse(), nullptr );
		arrowsprite->runAction( RepeatForever::create( actionarrow ) );
		_icon->runAction( RepeatForever::create( actionicon ) );
		
		setVisible( false );

		update( 0 );
		scheduleUpdate();
		return true;
	}
	while( false );
	return false;
}

void WaveIcon::update( float dt )
{
	static Size dessize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	auto worldpoint = GameGS::getInstance()->getMainLayer()->convertToWorldSpace( _wavestart );
	auto point = worldpoint;
	float borderx = 150.f;
	float bordery = 120.f;
	point.x = std::max<float>( borderx, point.x );
	point.x = std::min<float>( dessize.width - borderx, point.x );
	point.y = std::max<float>( bordery, point.y );
	point.y = std::min<float>( dessize.height - bordery, point.y );

	auto rad = worldpoint - point;
	auto angle = getDirectionByVector( rad );
	_arrow->setRotation( angle );
	/*_icon->*/setPosition( point );


	bool visible = _elapsed > _cooldown;
	bool playsound = _elapsed < 0.000f && visible && (visible != isVisible( ));
	setVisible( visible );
	if( visible && _runned == false )
	{
		_runned = true;
		if( _duration > 0 )
		{
			auto actiontimer = ProgressFromTo::create( _duration, 0, 100 );
			auto call = CallFunc::create( std::bind( &WaveIcon::on_click, this, nullptr ) );
			auto actiontimer2 = Sequence::create( actiontimer, call, nullptr );
			_timer->runAction( actiontimer2 );
		}
		else
		{
			_timer->setPercentage( 100 );
		}

	}
	if( playsound )
	{
		auto sound = xmlLoader::macros::parse( "##sound_waveicon##" );
		AudioEngine::shared().playEffect( sound, false, 0 );
	}
	_elapsed += dt;
}

void WaveIcon::on_click( Ref* )
{
	if( _callback )
	{
		_callback( this, _elapsed, _duration );
	}
}

void WaveIcon::setActive( bool var )
{
	_elapsed = std::max( _cooldown, _elapsed );
}

NS_CC_END