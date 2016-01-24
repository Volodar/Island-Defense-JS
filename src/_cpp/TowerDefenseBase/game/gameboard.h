//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __GAMEBOARD__
#define __GAMEBOARD__

#include "support/support.h"
#include "ml/pugixml/pugixml.hpp"
#include "WaveGenerator.h"
#include "unit/Unit.h"
#include "Hero.h"
#include "TowerPlace.h"
NS_CC_BEGIN;

class mlBullet;


struct FinishLevelParams
{
	FinishLevelParams() : crystalscount( 0 ), scores( 0 ), spentscores( 0 ), livecurrent( 0 ), livetotal( 0 ), stars( 0 ) {}
	int crystalscount;
	int scores;
	int spentscores;
	int livecurrent;
	int livetotal;
	int stars;
};

struct SkillParams
{
	float cooldownDesant;
	float cooldownAirplane;
	float cooldownLandmine;
	float cooldownSwat;
	float cooldownHero3Bot;
	float lifetimeDesant;
	float distanceToRoute;
	float swatCount;
	float swatLifetime;
	float hero3BotCount;
	float hero3BotLifetime;

	struct Swat
	{
		float rateCooldown;
		float rateLifetime;
	};
	struct Hero3Bot
	{
		float rateCooldown;
		float rateLifetime;
	};
	struct Landmine
	{
		float rateCooldown;
		unsigned count;
	};
	std::vector<Swat> swatLevels;
	std::vector<Hero3Bot> hero3BotLevels;
	std::vector<Landmine> landmineLevels;
};

enum class GameMode
{
	normal = 1,
	hard,
	_default = normal,
};

class GameBoard
{
	friend class GameGS;
	GameBoard();
public:
	~GameBoard();
	void loadLevel( int index, GameMode mode );
	void loadLevelParams( pugi::xml_node & node );
	void update( float dt );
	void updateSkills( float dt );

	void clear();

	static void loadRoute( Route & route, pugi::xml_node & node );
	static void loadRoutes( std::map<int, TripleRoute> & routes, const pugi::xml_node & node );
	static void loadTowerPlaces( std::vector<TowerPlaseDef> & places, const pugi::xml_node & node );

	void startGame();

	//void onDamage( mlObject * target, mlObject * damager, float rate );
	void onPredelayWave( const WaveInfo & wave, float delay );
	void onStartWave( const WaveInfo & wave );
	void onFinishWave();
	void onFinishWaves();
	void onFinishGame();
	bool isGameStarted();
	void onDamage( Unit* damager, Unit*target, float damage );
	void onKill( Unit* damager, Unit*target );

	//bool isTower( const mlObject * object );
	//bool isCreep( const mlObject * object );
	//bool isBullet( const mlObject * object );
	bool isTowerPlace( Point & location );

	Unit::Pointer createCreep( const std::string & name, const Route & route, const Point & position );
	Unit::Pointer createCreep( const std::string & name, RouteSubType rst, unsigned routeIndex );

	Unit::Pointer createTower( const std::string & name );
	Unit::Pointer createDesant( const std::string & name, const Point & position, float lifetime );
	Unit::Pointer createBomb( const Point & position );
	Unit::Pointer createLandMine( const Point & position, unsigned count );
	Unit::Pointer createBonusItem( const Point & position, const std::string & name );
	void addUnit( Unit::Pointer tower );
	Unit::Pointer upgradeTower( Unit::Pointer tower );
	void removeTower( Unit::Pointer tower );

	Hero* getHero();

	void remove( Unit::Pointer creep );
	void preDeath( Unit::Pointer creep );
	void death( Unit::Pointer creep );

	bool checkWaveFinished();
	bool checkGameFinished();

	//void addBullet( mlBullet * bullet );
	//void removeBullet( mlBullet * bullet );
	void activateTowerPlace( TowerPlace::Pointer place );

	//	void setPriorityTarget( mlCreep * target );
	//	mlCreep * getPriorityTarget() { return m_priorityTarget; };

	size_t getRoutesCount()const { return m_creepsRoutes.size(); }
	const Route getRandomRoute( UnitLayer layer, int index, RouteSubType type = RouteSubType::random ) const;
	const TripleRoute getRoute( UnitLayer layer, const Point & position, float & distance )const;

	void getTargetsByRadius( std::vector<Unit*> & out, const Point & center, float radius )const;
	void applyDamageBySector( Unit* base )const;
protected:
	Hero::Pointer createHero();
	Unit::Pointer buildTower( const std::string & name, int level, Unit* unit );
	Unit::Pointer buildCreep( const std::string & name );
	Unit::Pointer creepFromReserve( const std::string & name );
	void refreshTargetsForTowers();
	//void getAvailableTargets( std::vector<mlObject*> & out, mlObject * base );
	//void getCreepsInArea( std::vector<mlObject*> & out, const Point & center, float radius );
	bool checkAvailableTarget( const Unit* target, const Unit* base )const;
	bool checkTargetByArea( const Unit* target )const;
	bool checkTargetByUnitType( const Unit* target, const Unit* base )const;
	bool checkTargetByUnitLayer( const Unit* target, const Unit* base )const;
	bool checkTargetByRadius( const Unit* target, const Point & center, float radius )const;
	bool checkTargetBySector( const Unit* target, const  Unit* base )const;
	void dispatchDamagers();
	void dispatchKillers();
public:
	void event_towerBuild( TowerPlace::Pointer place, Unit::Pointer unit );
	void event_towerUpgrade( Unit::Pointer unit );
	void event_towerSell( Unit::Pointer unit );
	void event_levelFinished();
	void event_startwave( int index );
private:
	std::vector<Unit::Pointer> m_units;
	std::set<Unit::Pointer> m_death;
	std::list<Unit::Pointer> m_reserve;
	Hero::Pointer m_hero;

	std::map<Unit::Pointer, float> m_damagers;
	std::map<Unit::Pointer, std::list<Unit::Pointer>> m_killers;
	CC_SYNTHESIZE_PASS_BY_REF( std::vector<TripleRoute>, m_creepsRoutes, CreepsRoutes );

	FinishLevelParams m_statisticsParams;
	CC_SYNTHESIZE_READONLY( GameMode , m_gameMode, GameMode);
	CC_SYNTHESIZE_READONLY( unsigned, m_levelIndex, CurrentLevelIndex );
	CC_SYNTHESIZE_READONLY( SkillParams, m_skillParams, SkillParams );
private:
	bool m_isGameStarted;
	bool m_isFinihedWaves;
	bool m_isFinihedGame;
	bool m_isFinishedWave;
	int m_heartsForStar1;
	int m_heartsForStar2;
	int m_heartsForStar3;
	int _leaderboardScores;

	std::list< std::pair< Unit::Pointer, float > > _desants;
};

NS_CC_END;

#endif
