#include "UnitInfo.h"
#include "Tutorial.h"
//#include "ml/loadxml/xmlLoader.h"
NS_CC_BEGIN





UnitInfo::UnitInfo()
{
}

UnitInfo::~UnitInfo( )
{
}

bool UnitInfo::init( const std::string & unitName )
{
	do
	{
		CC_BREAK_IF( !Menu::init( ) );
		CC_BREAK_IF( !NodeExt::init( ) );

		_unitName = "ini/tutorial/units/" + unitName + ".xml";

		const std::string path = "ini/tutorial/units/";
		const std::string namefile = "unitinfoicon.xml";
		load( path,namefile );

		runEvent( "oninit" );

		return true;
	}
	while( false );
	return false;
}

ccMenuCallback UnitInfo::get_callback_by_description( const std::string & name )
{
	if( name == "showinfo" )
		return std::bind( &UnitInfo::cb_click, this, std::placeholders::_1 );
	return nullptr;
}

void UnitInfo::cb_click( Ref * )
{
	auto info = Tutorial::create( _unitName );
	info->enter( );
	removeFromParent();
}




NS_CC_END