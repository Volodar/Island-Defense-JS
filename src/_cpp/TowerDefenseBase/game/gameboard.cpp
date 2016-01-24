//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "gameboard.h"
#include "tower.h"
#include "GameGS.h"
#include "support.h"
#include "ScoreCounter.h"
#include "ml/pugixml/pugixml.hpp"
#include "consts.h"
#include "ml/Animation.h"
#include "UserData.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/ImageManager.h"
#include "Log.h"
#include "Achievements.h"
#include "MenuCreateTower.h"
#include "flurry/flurry_.h"
#include "UnitWithFadeEffects.h"
#include "UnitDesant.h"
#include "Airbomb.h"
#include "LandMine.h"
#include "configuration.h"
#include "LoadLevelScene.h"
#include "playservices/playservices.h"

NS_CC_BEGIN;

auto isExistCreep = []( const std::vector<Unit::Pointer> & units )
{
	for( auto& unit : units )
	{
		if( unit->getType() == UnitType::creep )
			return true;
	}
	return false;
};

void checkDefaultBonusesItems()
{
	std::string id = "bonusitemdefaultgetted";
	if( UserData::shared().get_bool( id, true ) )
	{
#if CC_TARGET_PLATFORM != CC_PLATFORM_ANDROID
		try
		{
#endif
			pugi::xml_document doc;
			doc.load_file( "ini/bonusitems.xml" );
			auto root = doc.root().first_child();

			UserData::shared().bonusitem_add( 3, root.child( "bonusitem_dynamit" ).attribute( "default" ).as_int() );
			UserData::shared().bonusitem_add( 2, root.child( "bonusitem_ice" ).attribute( "default" ).as_int() );
			UserData::shared().bonusitem_add( 1, root.child( "bonusitem_laser" ).attribute( "default" ).as_int() );

			UserData::shared().write( id, false );
#if CC_TARGET_PLATFORM != CC_PLATFORM_ANDROID
		}
		catch( ... )
		{
			UserData::shared().bonusitem_add( 1, 1 );
			UserData::shared().bonusitem_add( 2, 1 );
			UserData::shared().bonusitem_add( 3, 1 );
		}
#endif
	}
}

GameBoard::GameBoard()
: m_units()
, m_damagers()
, m_creepsRoutes()
, m_statisticsParams()
, m_gameMode(GameMode::normal)
, m_levelIndex( 0 )
, m_isGameStarted( false )
, m_isFinihedWaves( false )
, m_isFinihedGame( false )
, m_isFinishedWave( false )
, m_heartsForStar1( 0 )
, m_heartsForStar2( 0 )
, m_heartsForStar3( 0 )
, _leaderboardScores( 0 )
{
#if CC_TARGET_PLATFORM != CC_PLATFORM_ANDROID
	try
	{
#endif
		pugi::xml_document doc;
		doc.load_file( "ini/skills.xml" );
		auto root = doc.root().first_child();

		m_skillParams.cooldownDesant = root.child( "desant_colldown" ).attribute( "value" ).as_float();
		m_skillParams.lifetimeDesant = root.child( "desant_lifetime" ).attribute( "value" ).as_float();
		m_skillParams.cooldownAirplane = root.child( "airplane_colldown" ).attribute( "value" ).as_float();
		m_skillParams.distanceToRoute = root.child( "distance_to_road" ).attribute( "value" ).as_float();

		m_skillParams.cooldownLandmine = root.child( "landmine_colldown" ).attribute( "value" ).as_float();
		m_skillParams.cooldownSwat = root.child( "swat_colldown" ).attribute( "value" ).as_float();
		m_skillParams.cooldownHero3Bot = root.child( "hero3bot_colldown" ).attribute( "value" ).as_float();
		m_skillParams.swatCount = root.child( "swat_count" ).attribute( "value" ).as_float();
		m_skillParams.swatLifetime = root.child( "swat_lifetime" ).attribute( "value" ).as_float();
		m_skillParams.hero3BotCount = root.child( "hero3bot_count" ).attribute( "value" ).as_float();
		m_skillParams.hero3BotLifetime = root.child( "hero3bot_lifetime" ).attribute( "value" ).as_float();

		m_skillParams.cooldownDesant = UserData::shared().get_float( k::user::DesantCooldown, m_skillParams.cooldownDesant );
		m_skillParams.lifetimeDesant = UserData::shared().get_float( k::user::DesantLifeTime, m_skillParams.lifetimeDesant );
		m_skillParams.cooldownAirplane = UserData::shared().get_float( k::user::AirplaneCooldown, m_skillParams.cooldownAirplane );
		m_skillParams.cooldownLandmine = UserData::shared().get_float( k::user::LandmineCooldown, m_skillParams.cooldownLandmine );
		m_skillParams.cooldownSwat = UserData::shared().get_float( k::user::SwatCooldown, m_skillParams.cooldownSwat );
		m_skillParams.swatCount = UserData::shared().get_int( k::user::SwatCount, m_skillParams.swatCount );
		m_skillParams.swatLifetime = UserData::shared().get_int( k::user::SwatLifetime, m_skillParams.swatLifetime );
		m_skillParams.cooldownHero3Bot = UserData::shared().get_float( k::user::Hero3BotCooldown, m_skillParams.cooldownHero3Bot );
		m_skillParams.hero3BotCount = UserData::shared().get_int( k::user::Hero3BotCount, m_skillParams.hero3BotCount );
		m_skillParams.hero3BotLifetime = UserData::shared().get_int( k::user::Hero3BotLifetime, m_skillParams.hero3BotLifetime );

		m_skillParams.swatLevels.resize( 4 );
		m_skillParams.hero3BotLevels.resize( 4 );
		m_skillParams.landmineLevels.resize( 4 );

		for( int i = 0; i < 4; ++i )
		{
			m_skillParams.swatLevels[i].rateCooldown = root.child( "swat" ).child( ("level" + intToStr( i )).c_str() ).attribute( "cooldownrate" ).as_float( 1 );
			m_skillParams.swatLevels[i].rateLifetime = root.child( "swat" ).child( ("level" + intToStr( i )).c_str() ).attribute( "lifitimerate" ).as_float( 1 );

			m_skillParams.hero3BotLevels[i].rateCooldown = root.child( "hero3bot" ).child( ("level" + intToStr( i )).c_str() ).attribute( "cooldownrate" ).as_float( 1 );
			m_skillParams.hero3BotLevels[i].rateLifetime = root.child( "hero3bot" ).child( ("level" + intToStr( i )).c_str() ).attribute( "lifitimerate" ).as_float( 1 );

			m_skillParams.landmineLevels[i].rateCooldown = root.child( "landmine" ).child( ("level" + intToStr( i )).c_str() ).attribute( "cooldownrate" ).as_float( 1 );
			m_skillParams.landmineLevels[i].count = root.child( "landmine" ).child( ("level" + intToStr( i )).c_str() ).attribute( "count" ).as_uint( 1 );
		}

		checkDefaultBonusesItems();
#if CC_TARGET_PLATFORM != CC_PLATFORM_ANDROID
	}
	catch( ... )
	{
		m_skillParams.cooldownDesant = 30;
		m_skillParams.lifetimeDesant = 30;
		m_skillParams.cooldownAirplane = 30;
	}
#endif
};

GameBoard::~GameBoard()
{}

void GameBoard::clear()
{
	__push_auto_check( "GameBoard::clear" );
	auto desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();

	m_units.clear();

	m_creepsRoutes.clear();

	WaveGenerator::shared().clear();

	m_statisticsParams.crystalscount = 0;
	m_statisticsParams.scores = 0;
	m_statisticsParams.spentscores = 0;
	m_statisticsParams.livecurrent = 0;
	m_statisticsParams.livetotal = 0;

	m_levelIndex = -1;
	m_isFinihedWaves = false;
	m_isFinihedGame = false;
	m_isFinishedWave = false;
	m_heartsForStar1 = 1;
	m_heartsForStar2 = 1;
	m_heartsForStar3 = 1;

	m_damagers.clear();
}

void GameBoard::loadLevel( int index, GameMode mode )
{
	m_levelIndex = index;
	m_gameMode = mode;

	std::string pathToFile = FileUtils::getInstance()->fullPathForFilename( kDirectoryToMaps + intToStr( m_levelIndex ) + ".xml" );
	pugi::xml_document doc;
	doc.load_file( pathToFile.c_str() );
	auto root = doc.root().first_child();
	if( !root )
		log( "cannot parce file" );
	
	std::string xmlTagWaves;
	std::string xmlTagParams;
	switch( mode )
	{
		case GameMode::normal:
			xmlTagParams = k::xmlTag::LevelParams;
			xmlTagWaves = k::xmlTag::LevelWaves;
			break;
		case GameMode::hard:
			xmlTagParams = k::xmlTag::LevelParamsHard;
			xmlTagWaves = k::xmlTag::LevelWavesHard;
			break;
	}
	
	auto routesXml = root.child( k::xmlTag::LevelRoutes );
	auto placesXml = root.child( k::xmlTag::LevelTowerPlaces );
	auto wavesXml = root.child( xmlTagWaves.c_str() );
	auto paramsXml = root.child( xmlTagParams.c_str() );
	if( !paramsXml ) paramsXml = root;
	
	if( !routesXml )log( "routesXml Node not found" );
	if( !placesXml )log( "placesXml Node not found" );
	if( !wavesXml ) log( "wavesXml Node not found" );

	std::map<int, TripleRoute>routesload;
	std::vector<TripleRoute>routes;
	std::vector<TowerPlaseDef>places;

	loadLevelParams(paramsXml);
	loadRoutes( routesload, routesXml );
	loadTowerPlaces( places, placesXml );
	WaveGenerator::shared().load( wavesXml );

	GameGS::getInstance()->loadLevel( index, root );

	for( auto i : routesload )
		routes.push_back( i.second );
	setCreepsRoutes( routes );

	for( auto i : places )
		GameGS::getInstance()->addTowerPlace( i );

	int minlevel = k::configuration::minLevelHero;
	if( minlevel <= index )
	{
		std::list<std::string> excluded;
		split( excluded, paramsXml.attribute( "exclude" ).as_string() );
		if( std::find( excluded.begin(), excluded.end(), "hero" ) == excluded.end() )
			createHero();
	}
}

void GameBoard::loadLevelParams( pugi::xml_node & node )
{
	int startscore = node.attribute( k::xmlAttr::LevelStartScore ).as_int();
	int healths = node.attribute( k::xmlAttr::LevelHealth ).as_int();
	m_heartsForStar1 = node.attribute( k::xmlAttr::LevelStartStar1 ).as_int();
	m_heartsForStar2 = node.attribute( k::xmlAttr::LevelStartStar2 ).as_int();
	m_heartsForStar3 = node.attribute( k::xmlAttr::LevelStartStar3 ).as_int();
	std::list<std::string> exclude;
	split( exclude, node.attribute( "exclude" ).as_string() );
	
	if( k::configuration::useBoughtLevelScoresOnEveryLevel )
	{
		std::string key = k::user::BoughtScores + intToStr( kScoreLevel );
		int boughtScores = UserData::shared().get_int( key, 0 );
		startscore += boughtScores;
	}

	for( const auto& tower : exclude )
	{
		GameGS::getInstance()->excludeTower( tower );
	}
	
	ScoreCounter::shared().setMoney( kScoreLevel, startscore, false );
	ScoreCounter::shared().setMoney( kScoreHealth, healths, false );
	m_statisticsParams.livetotal = healths;
}

void GameBoard::startGame()
{
	{
		WaveGenerator::shared().start();
		GameGS::getInstance()->startGame();
	}
	LevelParams::shared().onLevelStarted( m_levelIndex );
}

void GameBoard::loadRoutes( std::map<int, TripleRoute> & routes, const pugi::xml_node & node )
{
	routes.clear();
	for( auto child = node.first_child(); child; child = child.next_sibling() )
	{
		int index = child.attribute( k::xmlAttr::name ).as_int();
		auto unitLayer = strToUnitLayer( child.attribute( k::xmlAttr::type ).as_string() );
		auto i = routes.insert( std::pair<int, TripleRoute>( index, TripleRoute() ) );
		if( i.second )
		{
			pugi::xml_node main = child.child( "main" );
			pugi::xml_node left = child.child( "left" );
			pugi::xml_node right = child.child( "right" );
			loadRoute( i.first->second.main, main );
			loadRoute( i.first->second.left, left );
			loadRoute( i.first->second.right, right );

			i.first->second.type = unitLayer;
		}
		else
		{
			log( "duplicate routes by index. index[%d]", index );
		}
	}
}

void GameBoard::loadRoute( Route & route, pugi::xml_node & node )
{
	route.clear();
	for( auto child = node.first_child(); child; child = child.next_sibling() )
	{
		Point point;
		point.x = child.attribute( "x" ).as_float() * DesignScale;
		point.y = child.attribute( "y" ).as_float() * DesignScale;
		route.push_back( point );
	}
}

void GameBoard::loadTowerPlaces( std::vector<TowerPlaseDef> & places, const pugi::xml_node & node )
{
	places.clear();
	for( pugi::xml_node place = node.first_child(); place; place = place.next_sibling() )
	{
		TowerPlaseDef def;
		def.position.x = place.attribute( "x" ).as_float() * DesignScale;
		def.position.y = place.attribute( "y" ).as_float() * DesignScale;
		def.isActive = place.attribute( "active" ).as_bool();
		places.push_back( def );
	}
}

void GameBoard::onPredelayWave( const WaveInfo & wave, float delay )
{
	for( auto i : m_creepsRoutes )
	{
		if( i.type == wave.type )
		{
			GameGS::getInstance()->createRoutesMarkers( i.main, i.type );
		}
	}

	for( size_t i = 0; i < m_creepsRoutes.size(); ++i )
	{
		const auto& route = m_creepsRoutes[i];
		auto routeindex = wave.routeIndex.begin();
		auto creep = wave.creeps.begin();
		bool create( false );
		for( ; routeindex != wave.routeIndex.end(); ++routeindex, ++creep )
		{
			if( *routeindex == i )
			{
				if( mlUnitInfo::shared().info( *creep ).layer == route.type )
				{
					create = true;
				}
			}
		}
		if( create )
		{
			GameGS::getInstance()->createIconForWave( route.main, wave, route.type, std::list<std::string>(), delay );
		}
	}
	WaveGenerator::shared().pause();

}

void GameBoard::onStartWave( const WaveInfo & wave )
{
	m_isGameStarted = true;
	GameGS::getInstance()->updateWaveCounter();
	GameGS::getInstance()->onStartWave( wave );
	auto sound = xmlLoader::macros::parse( "##sound_wavestart##" );
	AudioEngine::shared().playEffect( sound, false, 0 );
	int index = WaveGenerator::shared().getWaveIndex();
	event_startwave( index );
}

void GameBoard::onFinishWave()
{
	m_isFinishedWave = true;
}

void GameBoard::onFinishWaves()
{
	m_isFinihedWaves = true;
}

void GameBoard::onFinishGame()
{
	if( m_isFinihedGame )
		return;
	//std::list< std::pair<std::string, float> > damagers;
	//for( auto i : m_damagers )
	//	damagers.push_back( i );
	//damagers.sort( []( const std::pair<std::string, float> & A, const std::pair<std::string, float> & B )
	//{
	//	return A.second < B.second;
	//} );

	for( auto& unit : m_units )
	{
		unit->stop();
	}

	dispatchDamagers();
	dispatchKillers();

	if( m_hero )
	{
		float exp = HeroExp::shared().getEXP( m_hero->getName() );
		exp += HeroExp::shared().getExpOnLevelFinished( m_levelIndex );
		HeroExp::shared().setEXP( m_hero->getName(), exp );
	}

	m_isFinihedGame = true;
	m_statisticsParams.livecurrent = ScoreCounter::shared().getMoney( kScoreHealth );
	m_statisticsParams.stars = 0;
	if( m_statisticsParams.livecurrent >= m_heartsForStar1 ) m_statisticsParams.stars = 1;
	if( m_statisticsParams.livecurrent >= m_heartsForStar2 ) m_statisticsParams.stars = 2;
	if( m_statisticsParams.livecurrent >= m_heartsForStar3 ) m_statisticsParams.stars = 3;

	if( m_statisticsParams.livecurrent > 0 )
	{
		UserData::shared().level_complite( m_levelIndex );
		UserData::shared().level_getScoresByIndex( m_levelIndex );

		UserData::shared().level_setScoresByIndex( m_levelIndex, m_statisticsParams.stars );
		//dispatchEvent( "finishgame" );

		if( this->m_gameMode == GameMode::normal  )
		{
			if( UserData::shared().get_bool( "level_successfull" + intToStr( m_levelIndex ) ) == false )
			{
				Achievements::shared().process( "level_successfull", 1 );
				UserData::shared().write( "level_successfull" + intToStr( m_levelIndex ), true );
			}
			if( m_statisticsParams.stars >= 3 && UserData::shared().get_bool( "level_star3normal" + intToStr( m_levelIndex ) ) == false )
			{
				Achievements::shared().process( "level_star3normal", 1 );
				UserData::shared().write( "level_star3normal" + intToStr( m_levelIndex ), true );
			}
		}
		else
		{
			if( UserData::shared().get_bool( "level_successfull_hard" + intToStr( m_levelIndex ) ) == false )
			{
				Achievements::shared().process( "level_successfull_hard", 1 );
				UserData::shared().write( "level_successfull_hard" + intToStr( m_levelIndex ), true );
			}
			if( m_statisticsParams.stars >= 3 && UserData::shared().get_bool( "level_star3hard" + intToStr( m_levelIndex ) ) == false )
			{
				Achievements::shared().process( "level_star3hard", 1 );
				UserData::shared().write( "level_star3hard" + intToStr( m_levelIndex ), true );
			}
		}
	
		if( m_statisticsParams.stars >= 3 && UserData::shared().get_bool( "level_3star" + intToStr( m_levelIndex ) ) == false )
		{
			Achievements::shared().process( "level_3star", 1 );
			UserData::shared().write( "level_3star" + intToStr( m_levelIndex ), true );
		}
	}
	else
	{
		Achievements::shared().process( "level_failed", 1 );
	}
	event_levelFinished();

	GameGS::getInstance()->onFinishGame( &m_statisticsParams );
	LevelParams::shared().onLevelFinished( m_levelIndex, m_statisticsParams.stars );
	mlTowersInfo::shared().checkAvailabledTowers();
	HeroExp::shared().checkUnlockedHeroes();
	Leaderboard::shared().fix( m_levelIndex, _leaderboardScores * m_statisticsParams.livecurrent );
}

bool GameBoard::isGameStarted()
{
	return m_isGameStarted;
}

void GameBoard::onDamage( Unit* damager, Unit*target, float damage )
{
	m_damagers[damager] += damage;
}

void GameBoard::onKill( Unit* damager, Unit*target )
{
	m_killers[damager].push_back( target );
}

bool GameBoard::isTowerPlace( Point & location )
{
	auto index = GameGS::getInstance()->getTowerPlaceIndex( location );
	return index != -1;
}

Unit::Pointer GameBoard::createTower( const std::string & name )
{
	auto place = GameGS::getInstance()->getSelectedTowerPlaces();
	if( !place )
	{
		return nullptr;
	}

	int cost = mlTowersInfo::shared().getCost( name, 1 );
	if( cost > ScoreCounter::shared().getMoney( kScoreLevel ) )
	{
		AudioEngine::shared().playEffect( kSoundGameTowerBuyCancel );
		return nullptr;
	}

	auto tower = buildTower( name, 1, nullptr );
	tower->setPosition( place->getPosition() );
	tower->setCurrentHealth( 100 );

	addUnit( tower );

	AudioEngine::shared().playEffect( kSoundGameTowerBuy );
	ScoreCounter::shared().subMoney( kScoreLevel, cost, false );
	GameGS::getInstance()->createSubMoneyNode( cost, place->getPosition() );
	GameGS::getInstance( )->eraseTowerPlace( place );
	GameGS::getInstance( )->onCreateUnit( tower );
	Achievements::shared( ).process( "spend_gold", cost );
	Achievements::shared().process( "build_tower", 1 );
	m_statisticsParams.spentscores += cost;

	event_towerBuild( place, tower );

	return tower;
}

Unit::Pointer GameBoard::createDesant( const std::string & name, const Point & position, float lifetime )
{
	std::string xmlfile = name + ".xml";
	UnitDesant::Pointer unit;
	float dummy(0);
	if( checkPointOnRoute( position, m_skillParams.distanceToRoute, UnitLayer::earth, &dummy ) )
		unit = UnitDesant::create( "ini/units", xmlfile );
	if( unit )
	{
		unit->setBasePosition( position );
		unit->setPosition( position );
		addUnit( unit );
		_desants.push_back( std::pair< Unit::Pointer, float >( unit, lifetime ) );
	}
	return unit;
}

Unit::Pointer GameBoard::createBomb( const Point & position )
{
	std::string name;
	float dist_water( 9999 );
	float dist_earth( 9999 );

	if( checkPointOnRoute( position, m_skillParams.distanceToRoute, UnitLayer::sea, &dist_water ) )
		name = "airplane_water.xml";
	else if( checkPointOnRoute( position, m_skillParams.distanceToRoute, UnitLayer::earth, &dist_earth ) )
		name = "airplane_earth.xml";

	if( name == "airplane_water.xml" && dist_earth < dist_water )
		name = "airplane_earth.xml";
	if( name == "airplane_earth.xml" && dist_water < dist_earth )
		name = "airplane_water.xml";

	if( name.empty() == false )
	{
		auto bomb = Airbomb::create( "ini/units", name, position );
		GameGS::getInstance()->addObject( bomb, 9999 );
		return bomb;
	}

	return nullptr;
}

Unit::Pointer GameBoard::createLandMine( const Point & position, unsigned count )
{
	float dist_earth( 9999 );
	if( !checkPointOnRoute( position, m_skillParams.distanceToRoute, UnitLayer::earth, &dist_earth ) )
		return nullptr;

	Unit::Pointer result;
	for (unsigned i = 0; i < count; ++i)
	{
		auto pos = getRandPointInPlace( position, mlUnitInfo::shared().info("landmine").radius / 2 );
		auto mine = LandMine::create( "ini/units", "landmine.xml" );
		mine->setPosition( pos );
		addUnit( mine );
		result = mine;
	}

	return result;
}

Unit::Pointer GameBoard::createBonusItem( const Point & position, const std::string & name )
{
	float dist( 9999 );
	auto layer = mlUnitInfo::shared().info( name ).layer;
	if( !checkPointOnRoute( position, m_skillParams.distanceToRoute, layer, &dist ) )
		return nullptr;

	Unit::Pointer item;
	item = Unit::create( "ini/units", name + ".xml" );
	item->setPosition( position );
	addUnit( item );

	return item;
}

void GameBoard::addUnit( Unit::Pointer tower )
{
	m_units.push_back( tower );
	GameGS::getInstance()->addObject( tower, zorder::tower );
}

Hero::Pointer GameBoard::createHero()
{
	auto decorations = GameGS::getInstance()->getDecorations( "base_point" );
	size_t min( -1 );
	float dist_min( 99999999.f );
	size_t index( 0 );
	for( auto decor : decorations )
	{
		assert( decor );
		float dist(0);
		checkPointOnRoute( decor->getPosition(), dist_min, UnitLayer::earth, &dist );
		if( dist < dist_min )
		{
			min = index;
			dist_min = dist;
		}
		++index;
	}
	if( min != -1 )
	{
		int index = UserData::shared().hero_getCurrent() + 1;
		auto decor = decorations[min];
		m_hero = xmlLoader::load_node<Hero>( "ini/units/hero/hero" + intToStr( index ) + ".xml" );
		m_hero->initSkills();
		m_hero->setPosition( decor->getPosition() );
		m_hero->moveTo( decor->getPosition() );
		addUnit( m_hero );
		GameGS::getInstance()->onCreateUnit( m_hero );
	}

	return m_hero;
}

Unit::Pointer GameBoard::buildTower( const std::string & name, int level, Unit* unit )
{
	std::string resource = name + intToStr(level);
	if( LoadLevelScene::getInstance() )
		LoadLevelScene::getInstance()->loadInGameResources(resource);
	
	std::string xmlfile = name + intToStr( level ) + ".xml";
	Unit::Pointer tower = Unit::create( "ini/units", xmlfile, unit );
	assert( tower );
	return tower;
}

Unit::Pointer GameBoard::buildCreep( const std::string & name )
{
	Unit::Pointer creep;
	creep = creepFromReserve( name );
	if( !creep )
		creep = UnitWithFadeEffects::create( "ini/units", name + ".xml" );
	assert( creep );
	creep->setName( name );

	assert( creep );
	return creep;
}

Unit::Pointer GameBoard::upgradeTower( Unit::Pointer  tower )
{
	if( tower == nullptr )
		return nullptr;
	std::string name = tower->getName();
	unsigned level = tower->getLevel();
	unsigned maxlevel = tower->getMaxLevel();
	unsigned maxlevel2 = tower->getMaxLevelForLevel();
    if( level >= maxlevel )
		return nullptr;
	if( level >= maxlevel2 )
		return nullptr;
	unsigned cost = mlTowersInfo::shared().getCost( name, level + 1 );
	unsigned score = ScoreCounter::shared().getMoney( kScoreLevel );
	if( score < cost )
		return nullptr;

	auto iter = std::find( m_units.begin(), m_units.end(), tower );
	if( iter == m_units.end() )
		return nullptr;

	std::string resource = name + intToStr(level+1);
	if( LoadLevelScene::getInstance() )
		LoadLevelScene::getInstance()->loadInGameResources(resource);
	
	auto newTower = buildTower( name, level + 1, tower );
	newTower->setLevel( level + 1 );
	newTower->setMaxLevel( maxlevel );
	newTower->setMaxLevelForLevel( maxlevel2 );
	newTower->setPosition( tower->getPosition() );
	m_units.erase( iter );
	m_units.push_back( newTower );

	AudioEngine::shared().playEffect( kSoundGameTowerUpgrade );
	GameGS::getInstance()->removeObject( tower );
	GameGS::getInstance()->addObject( newTower, zorder::tower );
	ScoreCounter::shared().subMoney( kScoreLevel, cost, false );
	GameGS::getInstance()->createSubMoneyNode( cost, tower->getPosition() );

	if( (level + 1) == maxlevel ) Achievements::shared().process( "upgrade_towermax", 1 );
	m_statisticsParams.spentscores += cost;

	event_towerUpgrade( tower );

	std::string nameevent = "tower_upgrade_" + newTower->getName() + intToStr( newTower->getLevel() );
	Achievements::shared().process( nameevent, 1 );
	return newTower;
}

void GameBoard::removeTower( Unit::Pointer  tower )
{
	auto i = std::find( m_units.begin(), m_units.end(), tower );
	if( i != m_units.end() )
	{
		unsigned costSell = mlTowersInfo::shared().getSellCost( tower->getName(), tower->getLevel() );
		m_units.erase( i );
		TowerPlaseDef def;
		def.position = tower->getPosition();
		def.isActive = true;
		tower->stopAllLoopedSounds();
		ScoreCounter::shared().addMoney( kScoreLevel, costSell, false );
		//GameGS::getInstance()->createAddMoneyNode( costSell, tower->getPosition() );
		GameGS::getInstance()->addTowerPlace( def );
		GameGS::getInstance()->removeObject( tower );

		m_statisticsParams.spentscores -= costSell;
		Achievements::shared().process( "collect_gold", costSell );
		Achievements::shared().process( "sell_tower", 1 );

		event_towerSell( tower );
	}
}

Hero* GameBoard::getHero()
{
	return m_hero;
}

Unit::Pointer GameBoard::createCreep( const std::string & name, const Route & route, const Point & position )
{
	auto creep = buildCreep( name );
	creep->getMover().setRoute( route );
	creep->move();
	creep->getMover().setLocation( position );

	m_units.push_back( creep );
	GameGS::getInstance( )->onCreateUnit( creep );
	GameGS::getInstance( )->addObject( creep, creep->getLocalZOrder( ) );
	return creep;
}

Unit::Pointer GameBoard::createCreep( const std::string & name, RouteSubType rst, unsigned routeIndex )
{
	auto creep = buildCreep( name );
	UnitLayer layer = creep->getUnitLayer();
	creep->getMover( ).setRoute( getRandomRoute( layer, routeIndex, rst ) );
	creep->move( );

	m_units.push_back( creep );
	GameGS::getInstance( )->onCreateUnit( creep );
	GameGS::getInstance()->addObject( creep, creep->getLocalZOrder() );

	return creep;
}

Unit::Pointer GameBoard::creepFromReserve( const std::string & name )
{
	//for( auto iter = m_reserve.begin(); iter != m_reserve.end(); ++iter )
	//{
	//	auto creep = *iter;
	//	if( creep->getName() == name )
	//	{
	//		creep->getEffect().clear();
	//		m_reserve.erase( iter );
	//		return creep;
	//	}
	//}
	return nullptr;
}

void GameBoard::remove( Unit::Pointer unit )
{
	unit->stopAllLoopedSounds();
	int cost = unit->getLifeCost();
	if( cost > 0 )
	{
		auto sound = xmlLoader::macros::parse( "##sound_gameplayerdamage##" );
		AudioEngine::shared().playEffect( sound, false, 0 );
		ScoreCounter::shared().subMoney( kScoreHealth, cost, false );
		Achievements::shared().process( "skip_enemies", 1 );
	}
	GameGS::getInstance()->removeObject( unit );

	for( auto& base : m_units )
	{
		std::vector<Unit::Pointer> targets;
		base->get_targets( targets );
		for( auto& target : targets )
		{
			if( target == unit )
			{
				base->capture_targets( std::vector<Unit::Pointer>() );
				break;
			}
		}
	}
	//m_reserve.push_back( unit );
}

void GameBoard::preDeath( Unit::Pointer unit )
{
	unsigned cost = unit->getCost();
	ScoreCounter::shared().addMoney( kScoreLevel, cost, false );
	Achievements::shared().process( "collect_gold", cost );
	Achievements::shared().process( "kill_enemies", 1 );
	GameGS::getInstance()->onDeathUnit( unit );
	m_statisticsParams.scores += cost;
	//tut_onColectMoney( ScoreCounter::shared().getMoney( kScoreLevel ) );

	switch( unit->getBodyType() )
	{
		case BodyType::equipment:
			GameGS::getInstance()->createExplosion( unit->getPosition() );
			GameGS::getInstance()->createFragments( unit->getPosition() );
			GameGS::getInstance()->createExplosionSpot( unit->getPosition() );
			break;
		case BodyType::meat:
			GameGS::getInstance()->createCloud( unit->getPosition() );
			break;
	}

	for( auto i : m_units )
	{
		if( i->get_target() == unit )
			i->capture_target( nullptr );
	}
	for( auto iter = _desants.begin(); iter != _desants.end(); ++iter )
	{
		if( iter->first == unit )
		{
			_desants.erase( iter );
			break;
		}
	}
	unit->capture_targets( std::vector<Unit::Pointer>() );
	unit->stop();
	unit->die();
	m_death.insert( unit );


	//if( creep->getUseWavesExplosion() )
	//{
	//	GameGS::getInstance()->createExplosionWave( creep->getPosition() );
	//}
	//if( creep->getCurrentDamager() )
	//{
	//	std::string event = "kill_enemies_" + creep->getCurrentDamager()->getName();
	//	Achievements::shared().process( event, 1 );
	//}
}

void GameBoard::death( Unit::Pointer creep )
{
	auto iter = std::find( m_death.begin(), m_death.end(), creep );
	if( iter != m_death.end() )
	{
		auto damager = creep->getCurrentDamager();
		int scores = creep->getHealth() * creep->getRate();
		if( damager )
			scores = scores / ( damager->getLevel() + 1 ) * 3;
		_leaderboardScores += scores;

		creep->stopAllLoopedSounds();
		GameGS::getInstance()->removeObject( creep );

		creep->removeFromParent();

		//m_reserve.push_back( creep );
		m_death.erase( iter );
	}
}

bool GameBoard::checkWaveFinished()
{
	bool result = m_isFinishedWave && isExistCreep( m_units ) == false;
	if( result )
	{
		GameGS::getInstance()->onWaveFinished();
	}
	return result;
}

bool GameBoard::checkGameFinished()
{
	bool finishGame( false );
	finishGame = finishGame || (ScoreCounter::shared().getMoney( kScoreHealth ) <= 0);
	finishGame = finishGame || (isExistCreep( m_units ) == false && m_isFinihedWaves == true);
	if( finishGame )
	{
		onFinishGame();
	}

	return finishGame;
}

void GameBoard::activateTowerPlace( TowerPlace::Pointer place )
{
    if( !place ) return;
    if( place->getActive() ) return;
	assert( place );
	assert( place->getActive() == false );
	unsigned cost = mlTowersInfo::shared().getCostFotDig();
	ScoreCounter::shared().subMoney( kScoreLevel, cost, false );
	GameGS::getInstance()->createSubMoneyNode( cost, place->getPosition() );
	AudioEngine::shared().playEffect( kSoundGameTowerPlaceActivate );
	place->setActive( true );
}

void GameBoard::update( float dt )
{
	updateSkills( dt );
	WaveGenerator::shared().update( dt );

	if( !m_isFinihedGame )
		refreshTargetsForTowers();

	std::vector<Unit::Pointer> units = m_units;
	std::vector<Unit::Pointer> death;
	std::vector<Unit::Pointer> removed;
	units.insert( units.end(), m_death.begin(), m_death.end() );
	for( auto i : units )
	{
		i->update( dt );

		if( (i->getCurrentHealth() <= 0) &&
			(m_death.find( i ) == m_death.end()) )
		{
			death.push_back( i );
		}
		else if( i->getMoveFinished() == true && i->getType() == UnitType::creep )
		{
			removed.push_back( i );
		}
	}

	for( auto& i : death )
	{
		auto it = std::find( m_units.begin(), m_units.end(), i );
		if( it != m_units.end() )
		{
			m_units.erase( it );
			preDeath( i );
		}
	}

	for( std::set<Unit::Pointer>::iterator iter = m_death.begin(); iter != m_death.end(); )
	{
		Unit::Pointer unit = *iter;
		//unit->update( dt );
		if( (*iter)->getCurrentHealth() > 0 )
		{
			GameGS::getInstance()->onDeathCanceled( unit );
			m_units.push_back( unit );
			iter = m_death.erase( iter );
		}
		else
		{
			++iter;
		}
	}

//	m_death.erase( revived, m_death.end() );

	for( auto& i : removed )
	{
		auto it = std::find( m_units.begin(), m_units.end(), i );
		if( it != m_units.end() )
		{
			m_units.erase( it );
			remove( i );
		}
	}

	checkWaveFinished();
	checkGameFinished();
}

void GameBoard::updateSkills( float dt )
{
	for( auto iter = _desants.begin(); iter != _desants.end(); )
	{
		iter->second -= dt;
		if( iter->second <= 0 )
		{
			auto iUnit = std::find( m_units.begin(), m_units.end(), iter->first );
			assert( iUnit != m_units.end() );
			if( iUnit != m_units.end() ) m_units.erase( iUnit );

			remove( iter->first );
			iter = _desants.erase( iter );
		}
		else
		{
			++iter;
		}
	}
}

void GameBoard::refreshTargetsForTowers()
{
	for( auto& tower : m_units )
	{
		unsigned max = tower->getMaxTargets();

		std::vector<Unit::Pointer> targets;
		tower->get_targets( targets );
		for( unsigned i = 0; i < targets.size(); )
		{
			assert( targets[i] );
			if( checkAvailableTarget( targets[i], tower ) )
				++i;
			else
				targets.erase( targets.begin() + i );
		}

		for( unsigned i = 0; i < m_units.size() && targets.size() < max; ++i )
		{
			auto& creep = m_units[i];
			if( std::find( targets.begin(), targets.end(), creep ) != targets.end() ) continue;

			bool availabled = checkAvailableTarget( creep, tower );
			if( availabled )
			{
				targets.push_back( creep );
			}
		}

		tower->capture_targets( targets );
	}
}

bool GameBoard::checkAvailableTarget( const Unit* target, const Unit* base )const
{
	bool result = target != base;
	result = result && base != nullptr;
	result = result && target != nullptr;
	result = result && target->getCurrentHealth() > 0;
	result = result && target->current_state().get_name() != MachineUnit::State::state_enter;
	result = result && checkTargetByArea( target );
	result = result && checkTargetByUnitType( target, base );
	result = result && checkTargetByUnitLayer( target, base );
	result = result && base->checkTargetByRadius( target );
	result = result && checkTargetByRadius( target, base->getPosition(), base->getRadius() );
	//result = result && checkTargetBySector( target, base );

	return result;
}

bool GameBoard::checkTargetByArea( const Unit* target )const
{
	//TODO: Its size game map
	Size size = k::configuration::LevelMapSize;
	float border = 30;

	float lx = border;
	float rx = size.width - border;
	float ty = size.height - border;
	float by = border;
	const Point& pos = target->getPosition();
	bool result( true );
	result = result && pos.x > lx;
	result = result && pos.y > by;
	result = result && pos.x < rx;
	result = result && pos.y < ty;
	return result;
}

bool GameBoard::checkTargetByUnitType( const Unit* target, const Unit* base )const
{
	static std::multimap< UnitType, UnitType > allowes;
	static bool first( true );
	if( first )
	{
		first = false;
		allowes.insert( std::pair<UnitType, UnitType>( UnitType::creep, UnitType::desant ) );
		allowes.insert( std::pair<UnitType, UnitType>( UnitType::creep, UnitType::hero ) );
		allowes.insert( std::pair<UnitType, UnitType>( UnitType::tower, UnitType::creep ) );
		allowes.insert( std::pair<UnitType, UnitType>( UnitType::desant, UnitType::creep ) );
		allowes.insert( std::pair<UnitType, UnitType>( UnitType::hero, UnitType::creep ) );
		allowes.insert( std::pair<UnitType, UnitType>( UnitType::other, UnitType::other ) );
	}

	UnitType targetType = target->getType();
	UnitType baseType = base->getType();

	bool result( false );
	auto range = allowes.equal_range( baseType );
	for( auto iter = range.first; iter != range.second; ++iter )
		result = result || iter->second == targetType;
	return result;
}

bool GameBoard::checkTargetByUnitLayer( const Unit* target, const  Unit* base )const
{
	UnitLayer target_layer = target->getUnitLayer();
	const std::vector<UnitLayer>& allow_targets = base->getAllowTargets();
	bool result = true;
	for( auto target : allow_targets )
	{
		result = (target == UnitLayer::any) || (target == target_layer);
		if( result ) break;
	}

	return result;
}

bool GameBoard::checkTargetByRadius( const Unit* target, const Point & center, float radius )const
{
	assert( target );
	Point a = center;
	Point b = target->getPosition();
	bool byradius = checkRadiusByEllipse( a, b, radius );
	return byradius;
}

bool GameBoard::checkTargetBySector( const Unit* target, const Unit* base )const
{
	bool result( true );
	if( base->getDamageBySector() )
	{
		float direction = (float)base->getDirection();
		float radius = getDirectionByVector( target->getPosition() - base->getPosition() );

		float sector = base->getDamageBySectorAngle();
		while( direction < 0 ) direction += 360;
		while( radius < 0 ) radius += 360;

		result = fabsf( direction - radius ) <= sector;
	}
	return result;
}

void GameBoard::dispatchDamagers()
{
	//if( m_hero )
	//{
	//	auto iter = m_damagers.find( m_hero );
	//	if( iter != m_damagers.end() )
	//	{
	//		float exp = HeroExp::shared().getEXP( m_hero->getName() );
	//		exp += iter->second;
	//		HeroExp::shared().setEXP( m_hero->getName(), exp );
	//	}
	//}
}

void GameBoard::dispatchKillers()
{
	if( m_hero )
	{
		auto iter = m_killers.find( m_hero );
		if( iter != m_killers.end() )
		{
			float exp = HeroExp::shared().getEXP( m_hero->getName() );
			for( auto& target : iter->second )
			{
				exp += target->getExp();
			}
			HeroExp::shared().setEXP( m_hero->getName(), exp );
		}
	}
}

void GameBoard::getTargetsByRadius( std::vector<Unit*> & out, const Point & center, float radius )const
{
	for( auto target : m_units )
	{
		bool checked = true;
		checked = checked && checkTargetByRadius(target, center, radius);
		if( checked )
			out.push_back(target);
	}
}

void GameBoard::applyDamageBySector( Unit* base )const
{
	assert( base );
	for( auto target : m_units )
	{
		bool result = true;
		result = result && checkTargetByUnitType( target, base );
		result = result && checkTargetByUnitLayer( target, base );
		result = result && checkTargetByRadius( target, base->getPosition(), base->getRadius() );
		result = result && checkTargetBySector( target, base );
		if( result )
		{
			target->applyDamage( base );
			GameGS::getInstance()->createEffect( base, target, base->getEffectOnShoot() );
		}
	}
}

const Route GameBoard::getRandomRoute( UnitLayer layer, int index, RouteSubType type )const
{
	std::vector<TripleRoute> routes;
	if( index < (int)m_creepsRoutes.size() &&
		m_creepsRoutes[index].type == layer )
	{
		routes.push_back( m_creepsRoutes[index] );
	}
	else
	{
		for( unsigned i = 0; i < m_creepsRoutes.size(); ++i )
		{
			if( layer == m_creepsRoutes[i].type )
			{
				routes.push_back( m_creepsRoutes[i] );
			}
		}
	}
	int random = rand() % static_cast<int>(RouteSubType::max);
	int nindex = index % routes.size();
	assert( nindex < (int)routes.size() );
	switch( type )
	{
		case RouteSubType::random: return getRandomRoute( layer, index, static_cast<RouteSubType>(random) );
		case RouteSubType::main:   return routes[nindex].main;
		case RouteSubType::left0:  return routes[nindex].left;
		case RouteSubType::right0: return routes[nindex].right;
		case RouteSubType::max: assert( 0 );
	};
	assert( 0 );
	return routes[index].main;
}

const TripleRoute GameBoard::getRoute( UnitLayer layer, const Point & position, float & distance )const
{
	const TripleRoute* result( nullptr );
	for( auto& route : m_creepsRoutes )
	{
		bool check = checkPointOnRoute( position, route, distance, &distance );
		if( check )
		{
			result = &route;
		}
	}
	if( result )
		return *result;
	return TripleRoute();
}

void GameBoard::event_towerBuild( TowerPlace::Pointer place, Unit::Pointer unit )
{
	ParamCollection p;
	p["event"] = "TurretAtPlace";
	p["tower"] = unit->getName();
	p["level"] = intToStr( unit->getLevel() );
	p["mode"] = m_gameMode == GameMode::hard?"hard" : "normal";
	flurry::logEvent( p );
}

void GameBoard::event_towerUpgrade( Unit::Pointer unit )
{
	ParamCollection p;
	p["event"] = "TurretUpgrade";
	p["tower"] = unit->getName();
	p["level"] = intToStr( unit->getLevel() );
	p["mode"] = m_gameMode == GameMode::hard?"hard" : "normal";
	flurry::logEvent( p );
}
void GameBoard::event_towerSell( Unit::Pointer unit )
{
	ParamCollection p;
	p["event"] = "TurretSell";
	p["tower"] = unit->getName();
	p["level"] = intToStr( unit->getLevel() );
	p["mode"] = m_gameMode == GameMode::hard?"hard" : "normal";
	flurry::logEvent( p );
}
void GameBoard::event_levelFinished()
{
	ParamCollection p;
	if( ScoreCounter::shared().getMoney( kScoreHealth ) > 1 )
		p["event"] = "LevelComplete";
	else
		p["event"] = "LevelFailed";

	p["level"] = intToStr( m_levelIndex );
	p["mode"] = m_gameMode == GameMode::hard?"hard" : "normal";
	p["stars"] = intToStr( m_statisticsParams.stars );
	p["health"] = intToStr( ScoreCounter::shared().getMoney( kScoreHealth ) );
	p["gear"] = intToStr( ScoreCounter::shared().getMoney( kScoreLevel ) );
	flurry::logEvent( p );

//	bool logevent = true;
//	logevent = logevent && UserData::shared().level_getCountPassed() == 5;
//	logevent = logevent && UserData::shared().get_int( "appsflyer_level" ) == 0;
//	if( logevent )
//	{
//		p.clear();
//		p["event"] = "Level";
//		p["value"] = "5";
//		appsflyer::logEvent( p );
//	}
}
void GameBoard::event_startwave( int index )
{
	ParamCollection p;
	p["event"] = "WaveStart";
	p["level"] = intToStr( m_levelIndex );
	p["mode"] = m_gameMode == GameMode::hard?"hard" : "normal";
	p["waveindex"] = intToStr( index );
	flurry::logEvent( p );
}

NS_CC_END;
