//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "UserData.h"
#include "consts.h"
#include "ScoreCounter.h"
#include "ml/pugixml/pugixml.hpp"

const bool kUseEncode( false );

NS_CC_BEGIN;
//namespace
//{
	const int MagicSquareSize( 6 );
	const int MagicSquareSizeSq( MagicSquareSize * MagicSquareSize );
	const int MagicSquare[MagicSquareSize][MagicSquareSize] =
	{
		{ 27, 29, 2, 4, 13, 36, },
		{ 9, 11, 20, 22, 31, 18, },
		{ 32, 25, 7, 3, 21, 23, },
		{ 14, 16, 34, 30, 12, 5 },
		{ 28, 6, 15, 17, 26, 19, },
		{ 1, 24, 33, 35, 8, 10 },
	};
	//const int MagicSquareSize( 4 );
	//const int MagicSquareSizeSq( MagicSquareSize * MagicSquareSize );
	//const int MagicSquare[MagicSquareSize][MagicSquareSize] =
	//{
	//	{16,3,2,13},
	//	{5,10,11,8},
	//	{9,6,7,12},
	//	{4,15,14,1},
	//};

	int MagicSquareIndexes[MagicSquareSizeSq];
	const char MagicSquareEmpty( 0x1 );

	int MagicSquareValue( int index )
	{
		assert( index < MagicSquareSize * MagicSquareSize );
		return MagicSquare[index / MagicSquareSize][index % MagicSquareSize];
	}

	void buildIndexes()
	{
		memset( MagicSquareIndexes, -1, sizeof(MagicSquareIndexes) );
		for( int i = 0; i < MagicSquareSizeSq; ++i )
		{
			int v = MagicSquareValue( i );
			MagicSquareIndexes[v-1] = i;
		}
		for( int i = 0; i < MagicSquareSizeSq; ++i )
		{
			log( "%02d %02d", i, MagicSquareIndexes[i] );
			assert( MagicSquareIndexes[i] != -1 );
		}
	}

	std::string encode( const std::string & string )
	{
		return string;
		assert( string.find( MagicSquareEmpty ) == std::string::npos );
		buildIndexes();

		std::string result;
		result.resize( MagicSquareSizeSq );
		for( int i = 0; i < MagicSquareSizeSq; ++i )
		{
			int v = MagicSquareValue( i )-1;
			result[i] = v < string.size( ) ? string[v] : MagicSquareEmpty;
		}
		return result;
	}

	std::string decode( const std::string & string )
	{
		return string;
		if( string.size( ) < MagicSquareSizeSq )
		{
			//assert( 0 );
			return string;
		}
		std::string result;
		buildIndexes();
		for( size_t i = 0; i < string.size(); ++i )
		{
			int index = MagicSquareIndexes[i];
			char value = string[index];
			if( value == MagicSquareEmpty )
				break;
			result.push_back( string[index] );
		}
		return result;
	}

	void testMagicSquare()
	{
		int sum( 0 );
		for( int i = 0; i < MagicSquareSize; ++i )
		{
			sum += MagicSquare[0][i];
		}
		for( int i = 0; i < MagicSquareSize; ++i )
		{
			int sumv( 0 );
			int sumh( 0 );
			int sumd0( 0 );
			int sumd1( 0 );
			for( int j = 0; j < MagicSquareSize; ++j )
			{
				sumv += MagicSquare[j][i];
				sumh += MagicSquare[i][j];
				sumd0 += MagicSquare[j][j];
				sumd1 += MagicSquare[j][MagicSquareSize - j - 1];
			}
			assert( sum == sumv );
			assert( sum == sumh );
			assert( sum == sumd0 );
			assert( sum == sumd1 );
		}
	}

	void test_encryption()
	{
		auto build_string = []()
		{
			return std::string("test string.");

			int size = rand() % MagicSquareSize;
			std::string result;
			for( int i = 0; i < size; ++i )
			{
				result += (char) (rand() % 128 + 32);
			}
			assert( result.size() == size );
			return result;
		};

		const auto& string = build_string();
		const auto& code = encode( string );
		const auto& dcode = decode( code );
		assert( dcode == string );
	}
//}


namespace UD
{
	static std::string kFile( "xmlfile_pugi.xml" );
	pugi::xml_document Doc;
	void open()
	{
		std::string path = FileUtils::getInstance()->getWritablePath();
		kFile = path + kFile;
	#ifdef _DEBUG
		//clear( );
	#endif
		if( FileUtils::getInstance()->isFileExist( kFile ) )
			Doc.load_file( kFile.c_str() );
	}

	void save()
	{
		Doc.save_file( kFile.c_str() );
	}
}

UserData::UserData()
{
	UD::open();

	//testMagicSquare();
	//test_encryption();
}

UserData::~UserData()
{}

void UserData::write( const std::string & key, int value ) { write( key, intToStr( value ) ); }
void UserData::write( const std::string & key, bool value ) { write( key, boolToStr( value ) ); }
void UserData::write( const std::string & key, float value ) { write( key, floatToStr( value ) ); }

void UserData::write( const std::string & key, const std::string & value )
{
	std::string V = kUseEncode ? encode( value ) : value;
	auto root = UD::Doc.root().child( "root" );
	if( !root )
		root = UD::Doc.root().append_child( "root" );
	auto node = root.child( key.c_str( ) );
	if( !node )
		node = root.append_child( key.c_str( ) );
	auto attr = node.attribute( "value" );
	if( !attr )
		attr = node.append_attribute( "value" );
	attr.set_value( V.c_str() );
	
}

int UserData::get_int( const std::string & key, int defaultvalue ) { return strToInt( get_str( key, intToStr( defaultvalue ) ) ); }
bool UserData::get_bool( const std::string & key, bool defaultvalue ) { return strToBool( get_str( key, boolToStr( defaultvalue ) ) ); }
float UserData::get_float( const std::string & key, float defaultvalue ) { return strToFloat( get_str( key, floatToStr( defaultvalue ) ) ); }
std::string UserData::get_str( const std::string & key, const std::string & defaultvalue )
{
	auto root = UD::Doc.root().child( "root" );
	auto node = root.child( key.c_str( ) );
	std::string value = node.attribute( "value" ).as_string( "" );
	if( value.empty() == false )
		value = kUseEncode ? decode( value ) : value;
	else
		value = defaultvalue;
	return value;
}


void UserData::clear()
{
	UD::Doc.reset();
	UD::Doc.save_file( UD::kFile.c_str() );
}

void UserData::save()
{
	UD::save();
}

void UserData::level_complite( unsigned index )
{
	std::string key = kUser_Level_prefix + intToStr( index ) + kUser_Complite_suffix;
	write( key, kUserValue_CompliteYes );

	int countPasses = level_getCountPassed();
	if( (int)index >= countPasses )
		level_incrementPassed();

}

int UserData::level_incrementPassed()
{
	int count = level_getCountPassed();
#ifdef DEMO_VERSION
	if( count >= 2 )
		return count;
#endif

	level_setCountPassed( count + 1 );

	return count + 1;
}

int UserData::level_getCountPassed()
{
	return get_int( kUser_passedLevels, 0 );
}

int UserData::level_getScoresByIndex( int levelIndex )
{
	std::string key = kUser_Level_prefix + intToStr( levelIndex ) + kUser_Scores_suffix;
	return get_int( key, 0 );
}

void UserData::level_setCountPassed( int value )
{
	write( kUser_passedLevels, value );
}

void UserData::level_setScoresByIndex( int levelIndex, int value )
{
	int saved = level_getScoresByIndex( levelIndex );
	if( value >= saved )
	{
		std::string key = kUser_Level_prefix + intToStr( levelIndex ) + kUser_Scores_suffix;
		write( key, value );
	}
}

/*********************************************************************/
//	tower upgrade
/*********************************************************************/
int UserData::tower_upgradeLevel( const std::string & name )
{
	std::string key = kUserTowerUpgradeLevel + name;
	return get_int( key, 0 );
}

void UserData::tower_upgradeLevel( const std::string & name, int level )
{
	assert( level >= 0 );
	std::string key = kUserTowerUpgradeLevel + name;
	write( key, level );
}

float UserData::tower_damage( const std::string & name )
{
	std::string key = kUserTowerUpgradeDamage + name;
	return get_float( key, 1.0f );
}

float UserData::tower_radius( const std::string & name )
{
	std::string key = kUserTowerUpgradeRadius + name;
	return get_float( key, 1.0f );
}

float UserData::tower_rateshoot( const std::string & name )
{
	std::string key = kUserTowerUpgradeRateShoot + name;
	return get_float( key, 1.0f );
}

void UserData::tower_damage( const std::string & name, float value )
{
	assert( value >= 1 );
	std::string key = kUserTowerUpgradeDamage + name;
	write( key, value );
}

void UserData::tower_radius( const std::string & name, float value )
{
	assert( value >= 1 );
	std::string key = kUserTowerUpgradeRadius + name;
	write( key, value );
}

void UserData::tower_rateshoot( const std::string & name, float value )
{
	assert( value >= 1 );
	std::string key = kUserTowerUpgradeRateShoot + name;
	write( key, value );
}

int UserData::bonusitem_add( unsigned index, int count )
{
	int have = bonusitem_count( index );
	have = std::max( 0, count + have );
	write( k::user::BonuseItem + intToStr( index ), have );
	return have;
}

int UserData::bonusitem_sub( unsigned index, int count )
{
	return bonusitem_add( index, -count );
}

int UserData::bonusitem_count( unsigned index )
{
	return get_int( k::user::BonuseItem + intToStr( index ) );
}

void UserData::hero_setCurrent( unsigned index )
{
	write( k::user::HeroCurrent, (int)index );
}

unsigned UserData::hero_getCurrent()
{
	return get_int( k::user::HeroCurrent );
}

#undef user
NS_CC_END;