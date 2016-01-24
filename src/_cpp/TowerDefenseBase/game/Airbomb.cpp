#include "Airbomb.h"
#include "ml/loadxml/xmlLoader.h"
#include "GameGS.h"

NS_CC_BEGIN

Airbomb::Airbomb()
{}

Airbomb::~Airbomb()
{}

bool Airbomb::init( const std::string & path, const std::string & xmlFile, const Point & position )
{
	do
	{
		CC_BREAK_IF( !NodeExt::init() );

		_targetPoint = position;

		int count( 3 );
		std::vector<Point> positions;
		for( int i = 0; i < count; ++i )
		{
			float dx = CCRANDOM_MINUS1_1() * 50;
			float dy = CCRANDOM_MINUS1_1() * 50;
			Point pos = position + Point( dx, dy );
			positions.push_back( pos );
			xmlLoader::macros::set( "airplane_bomb_posx" + intToStr( i+1 ), floatToStr( pos.x ) );
			xmlLoader::macros::set( "airplane_bomb_posy" + intToStr( i+1 ), floatToStr( pos.y ) );
		}

		Unit::init( path, xmlFile );

		for( int i = 0; i < count; ++i )
		{
			xmlLoader::macros::erase( "airplane_bomb_posx" + intToStr( i + 1 ) );
			xmlLoader::macros::erase( "airplane_bomb_posy" + intToStr( i + 1 ) );

			Point pos = positions[i];
			auto actionBomb = dynamic_cast<FiniteTimeAction*>(getAction( intToStr( i + 1 ) + "_bomb_move" ).ptr( ));
			float expl = actionBomb->getDuration( );
			auto exp = Sequence::createWithTwoActions( DelayTime::create( expl ), CallFunc::create( [this, pos]( ){this->explosion( pos ); } ) );
			runAction( exp );
		}

		auto actionPlace = dynamic_cast<FiniteTimeAction*>(getAction( "3_place" ).ptr());
		float life = actionPlace->getDuration();
		auto die = Sequence::createWithTwoActions( DelayTime::create( life ), CallFunc::create( [this](){this->die(); } ) );
		runAction( die );

		runEvent( "run" );

		return true;
	}
	while( false );
	return false;
}

void Airbomb::explosion( const Point & position )
{
	Point pos = getPosition();
	int z = getLocalZOrder();
	setPosition( position );
	const auto& board = GameGS::getInstance()->getGameBoard();
	board.applyDamageBySector( this );
	setPosition( pos );
	setLocalZOrder( z );
	GameGS::getInstance()->shake();
}

void Airbomb::die()
{
	removeFromParent();
}





NS_CC_END