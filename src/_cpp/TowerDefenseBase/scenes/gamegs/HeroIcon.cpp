#include "HeroIcon.h"
#include "configuration.h"
#include "ml/ImageManager.h"
#include "ml/loadxml/xmlProperties.h"
NS_CC_BEGIN


namespace
{
	const std::string ext( ".png" );
	const std::string empty( "" );
};


HeroIcon::HeroIcon()
{
}

HeroIcon::~HeroIcon( )
{
}

bool HeroIcon::init( const std::string & heroname, const ccMenuCallback & callback )
{
	do
	{
		CC_BREAK_IF( !MenuItemImageWithText::initWithNormalImage( empty, empty, empty, empty, empty, callback ) );
		std::string cancel = k::resourceGameSceneFolder + "icon_x_10.png";
		std::string normal = k::resourceGameSceneFolder + heroname + "_2" + ext;
		std::string selected = k::resourceGameSceneFolder + heroname + "_3" + ext;
		std::string disabled = k::resourceGameSceneFolder + heroname + "_1" + ext;

		_unselectedHero = normal;
		_selectedHero = selected;
		
		std::string timer = k::resourceGameSceneFolder + "hero_progressbar1" + ext;
		std::string timer_bg = k::resourceGameSceneFolder + "hero_progressbar2" + ext;

		setImageNormal( normal );
		setImageDisabled( disabled );

		auto progress = Node::create();
		Sprite * image = ImageManager::sprite( timer );
		CC_BREAK_IF( !image );
		_timer = ProgressTimer::create( image );
		CC_BREAK_IF( !_timer );

		image->setAnchorPoint( Point::ANCHOR_BOTTOM_LEFT );
		_timer->setType( ProgressTimer::Type::BAR );
		_timer->setMidpoint( Point( 0.0f, 0.5f ) );
		_timer->setBarChangeRate( Point( 1, 0 ) );
		_timer->setPercentage( 0 );
		
		progress->addChild( ImageManager::sprite( timer_bg ) );
		progress->addChild( _timer, 1 );

		addChild( progress );
		Point pos;
		pos.x = getNormalImage()->getContentSize().width / 2;
		pos.y = -image->getContentSize().height * 0.7f;
		progress->setPosition( pos );
		
		if( 0 )
		{
			_cancelImage = ImageManager::sprite( cancel );
			getNormalImage()->addChild( _cancelImage );
			_cancelImage->setPosition( Point( getNormalImage()->getContentSize() ) - Point( 5, 5 ) );
			_cancelImage->setVisible( false );
			_cancelImage->setScale( 1.5f );
			
			auto s1 = ScaleTo::create( 0.4f, 1.2f );
			auto s2 = ScaleTo::create( 0.4f, 1.0f );
			auto d = DelayTime::create( 1 );
			auto s = Sequence::create( s1, s2, d, nullptr );
			auto action = RepeatForever::create( EaseInOut::create( s, 0.5f ) );
			_cancelImage->runAction( action );
		}


		return true;
	}
	while( false );
	return false;
}

void HeroIcon::setHero( Hero::Pointer hero )
{
	assert( !_hero );
	assert( hero );
	_hero = hero;
	_hero->observerHealth.add( _ID, 
		[this]( float current, float health )
	{
		float percent = current / health * 100.f;
		_timer->setPercentage( percent );

		bool enabled = _hero->current_state().get_name() != Hero::State::state_death;
		unsigned char opacity = enabled ? 255 : 128;
		setEnabled( enabled );
		getNormalImage()->setOpacity( opacity );
		_timer->setOpacity( opacity );
	} );
}

void HeroIcon::showCancel( bool mode )
{
	if( _cancelImage )
	{
		_cancelImage->setVisible( mode );
	}

	if( _hero )
	{
		_hero->runEvent( mode ? "onselect" : "ondeselect" );
	}

	std::string image = mode ? _selectedHero : _unselectedHero;
	xmlLoader::setProperty( getNormalImage(), xmlLoader::kImage, image );
	//auto frame = ImageManager::shared().spriteFrame( image );
	//if( frame )
	//	static_cast<Sprite*>(getNormalImage())->setSpriteFrame( frame );
}



NS_CC_END