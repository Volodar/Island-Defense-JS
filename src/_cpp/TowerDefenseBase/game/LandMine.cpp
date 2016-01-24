#include "LandMine.h"
NS_CC_BEGIN





LandMine::LandMine()
{
}

LandMine::~LandMine( )
{
}

bool LandMine::init( const std::string & path, const std::string & iniFile )
{
	do
	{
		CC_BREAK_IF( !Unit::init( path, iniFile, nullptr ) );

		return true;
	}
	while( false );
	return false;

}




NS_CC_END