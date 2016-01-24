//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/ImageManager.h"
#include "ml/Animation.h"
#include "ml/loadxml/xmlProperties.h"
#include "TowerPlace.h"
#include "support.h"
#include "ScoreCounter.h"
#include "configuration.h"
NS_CC_BEGIN





TowerPlace::TowerPlace( )
{}
TowerPlace::~TowerPlace( )
{}

bool TowerPlace::init( const TowerPlaseDef & def )
{
	do
	{
		CC_BREAK_IF( !Sprite::init() );
		_active = def.isActive;
		changeView();
		setPosition( def.position );
		return true;
	}
	while( false );
	return false;
}

void TowerPlace::changeView( )
{
	if( _active )
	{
		float duration = 0.5f + CCRANDOM_MINUS1_1()*0.1f;

		std::vector<std::string> frames;
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_01.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_02.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_03.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_04.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_05.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_06.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_07.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_08.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_09.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_10.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_11.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_12.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_13.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_14.png" );
		frames.push_back( k::resourceGameSceneFolder + "active_slot/active_slot_15.png" );
		auto anim = createAnimation( frames, duration );
		assert( anim );

		auto animate = RepeatForever::create( Animate::create( anim ) );
		auto action = animate ;

		runAction( action );
	}
	else
	{
		std::string texturename = k::resourceGameSceneFolder + "unactive_slot.png";
		auto frame = ImageManager::shared( ).spriteFrame( texturename );
		if( frame )
		{
			setSpriteFrame( frame );
			return;
		}
		xmlLoader::setProperty( this, xmlLoader::kImage, texturename );
	}
}

bool TowerPlace::checkClick( const Point & location, float & outDistance )
{
	outDistance = getPosition( ).getDistance( location );
	return checkRadiusByEllipse( location, getPosition(), 50 );
}

void TowerPlace::selected( )
{
	//auto s0 = ScaleTo::create( 0.5f, 1.5f );
	//auto s1 = ScaleTo::create( 0.5f, 1.0f );
	//auto action = RepeatForever::create( Sequence::create( s0, s1, nullptr ) );
	//runAction( action );
}

void TowerPlace::unselected( )
{
	//stopAllActions( );
	//setScale( 1 );
}

bool TowerPlace::getActive( void )
{
	return _active;
}

void TowerPlace::setActive( bool var )
{
	assert( _active == false );

	_active = true;
	changeView();
}



NS_CC_END