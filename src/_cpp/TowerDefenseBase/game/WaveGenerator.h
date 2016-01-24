//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __WAVE_GENERATOR__
#define __WAVE_GENERATOR__
#include "cocos2d.h"
#include "ml/pugixml/pugixml.hpp"
#include "support.h"

NS_CC_BEGIN;

struct WaveInfo
{
	WaveInfo()
	: creeps()
	, delayOneUnit()
	, scores()
	, routeSubType()
	, routeIndex()
	, healthRate()
	, type( UnitLayer::any )
	, index( -1 )
	{}
	bool valid() const
	{
		return delayOneUnit.empty() == false;
	}
	std::list<std::string> creeps;
	std::list<float> delayOneUnit;
	std::list<unsigned> scores;
	std::list<RouteSubType> routeSubType;
	std::list<unsigned> routeIndex;
	std::list<float> healthRate;
	UnitLayer type;
	unsigned index;
public:
	void pop()
	{
		creeps.pop_front();
		delayOneUnit.pop_front();
		scores.pop_front();
		healthRate.pop_front();
		routeSubType.pop_front();
		routeIndex.pop_front();
	}
};

class WaveGenerator : public Singlton<WaveGenerator>
{
public:
	WaveGenerator();
public:
	void load( const pugi::xml_node & node );
	void clear();
	void start();
	void pause();
	void resume();
	void update( float dt );
	void generateCreep();
	void onPredelayWave( const WaveInfo & wave );
	void onStartWave( const WaveInfo & wave );
	void onFinishWave();
	void onFinishAllWaves();
protected:
	CC_SYNTHESIZE_READONLY( size_t, m_waveIndex, WaveIndex );
	CC_SYNTHESIZE_READONLY( size_t, m_wavesCount, WavesCount );
	std::list< WaveInfo > m_waves;
	std::list< WaveInfo >::iterator m_currentWave;

	TimeCounter m_delayUnits;
	TimeCounter m_delayWaves;
	bool m_delayWavesNow;
	bool m_isRunning;
};

NS_CC_END;

#endif