//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "WaveGenerator.h"
#include "gameboard.h"
#include "GameGS.h"
#include "Log.h"
NS_CC_BEGIN;

/*
samples:
<waves defaultdelayonewave="5">
    <wave index="0">
      <creep name="tank" delay="1" healthrate="1" score="10"/>
      <creep name="car" delay="0.5" healthrate="1" score="10"/>
      <creep name="car" delay="0.5" healthrate="1" score="10"/>
      <creep name="car" delay="0.5" healthrate="1" score="10"/>
      <creep name="car" delay="0.5" healthrate="1" score="10"/>
    </wave> 
    <wave index="0" defaultdelay="2.9" defaulthealthrate="1" defaultscore="10" defaultname="rotorplane0" count="5" />
</waves>
	
	*/

WaveGenerator::WaveGenerator()
: m_waveIndex()
, m_wavesCount()
, m_waves()
, m_currentWave()
, m_delayUnits()
, m_delayWaves()
, m_delayWavesNow(true)
, m_isRunning(true)
{
}

void WaveGenerator::load(const pugi::xml_node & node)
{
	m_delayWaves.set( node.attribute("defaultdelayonewave").as_float() );

	int index(0);
	FOR_EACHXML_BYTAG(node, waveXml, "wave")
	{
		m_waves.push_back(WaveInfo());
		WaveInfo & wave = m_waves.back();
		wave.index = index++;

		wave.type = strToUnitLayer( waveXml.attribute("routetype").as_string() );
		std::string dname = waveXml.attribute("defaultname").as_string();
		float dhealthRate = waveXml.attribute("defaulthealthrate").as_float();
		float dscore = waveXml.attribute("defaultscore").as_float();
		float ddelay = waveXml.attribute("defaultdelay").as_float();
		RouteSubType droutest = strToRouteSubType( waveXml.attribute("defaultroutesubtype").as_string() );
		int drouteindex = waveXml.attribute("defaultrouteindex").as_int();
		int count = waveXml.attribute("count").as_int();

		if ( count != 0 )
		{
			assert(dname.empty() == false );
			assert(dhealthRate != 0 );
			assert(dscore != 0 );
			assert(ddelay != 0 );
			while( count-- )
			{
				wave.creeps.push_back(dname);
				wave.healthRate.push_back(dhealthRate);
				wave.scores.push_back(dscore);
				wave.delayOneUnit.push_back(ddelay);
				wave.routeIndex.push_back( drouteindex );
				wave.routeSubType.push_back( droutest );
			}
		}
		else
		{
			FOR_EACHXML(waveXml, creep)
			{
				std::string name = creep.attribute("name").as_string();
				float healthRate = creep.attribute("healthrate").as_float();
				float score = creep.attribute("score").as_int();
				float delay = creep.attribute("delay").as_float();
				RouteSubType routest = strToRouteSubType( creep.attribute("routesubtype").value() );
				int routeindex = creep.attribute("routeindex").as_int();
				if ( name.empty() ) name = dname;
				if ( healthRate == 0 ) healthRate = dhealthRate;
				if ( score == 0 ) score = dscore;
				if ( delay == 0 ) delay = ddelay;
				if ( routest == RouteSubType::defaultvalue ) routest = droutest;
				if ( routeindex == 0 ) routeindex = drouteindex;
				wave.creeps.push_back(name);
				wave.healthRate.push_back(healthRate);
				wave.scores.push_back(score);
				wave.delayOneUnit.push_back(delay);
				wave.routeIndex.push_back( routeindex );
				wave.routeSubType.push_back( routest );
			}
		}
	}
}

void WaveGenerator::clear()
{
	m_waveIndex = 0;
	m_wavesCount = 0;

	m_waves.clear();
	m_currentWave = m_waves.end();
	
	m_delayUnits.set(0);
	m_delayWaves.set(0);
	
	m_delayWavesNow = false;
}

void WaveGenerator::start()
{
	m_delayUnits.reset();
	m_delayWaves.reset();
	m_currentWave = m_waves.end();
	
	m_delayUnits.set( 0 );

	m_waveIndex = 0;
	m_wavesCount = m_waves.size();
	m_delayWavesNow = false;
	GameGS::getInstance()->updateWaveCounter();
	resume();
}

void WaveGenerator::pause()
{
	m_isRunning = false;
}
void WaveGenerator::resume()
{
	m_isRunning = true;
}

void WaveGenerator::update(float dt)
{
	if( m_isRunning == false )
		return;

	if ( m_currentWave != m_waves.end() && m_currentWave->valid() == false )
	{
		m_waves.pop_front();
		m_currentWave = m_waves.end();
		onFinishWave();
	}
	else
	if ( m_currentWave != m_waves.end() && m_currentWave->valid() )
	{
		m_delayUnits.tick( dt );
		if( m_delayUnits )
		{
			generateCreep();
			if( m_currentWave->valid() )
			{
				float delay = m_currentWave->delayOneUnit.front();
				m_delayUnits.set( delay );
			}
			else
			{
				m_delayUnits.reset();
			}
		}
	}
	else
	{
		if( m_delayWavesNow == false )
		{
			m_delayWavesNow = true;
			if ( m_waves.empty() == false )
			{
				onPredelayWave( m_waves.front( ) );
			}
		}

		else
		{
			m_delayWaves.reset();
			m_delayWavesNow = false;
			if ( m_waves.empty() == false )
			{
				m_currentWave = m_waves.begin();
				assert( m_currentWave->valid() );
				onStartWave( *m_currentWave );
				float delay = m_currentWave->delayOneUnit.front();
				m_delayUnits.set( delay );
			}
		}
	}
}

void WaveGenerator::onPredelayWave( const WaveInfo & wave )
{
	GameGS::getInstance()->updateWaveCounter();
	GameGS::getInstance( )->getGameBoard( ).onPredelayWave( wave, (m_waveIndex != 0? m_delayWaves.value( ) : 0) );
}

void WaveGenerator::onStartWave( const WaveInfo & wave )
{
	m_waveIndex = std::min<unsigned>( m_waveIndex + 1, m_wavesCount );
	GameGS::getInstance( )->getGameBoard( ).onStartWave( wave );
}

void WaveGenerator::onFinishWave()
{
	GameGS::getInstance()->getGameBoard().onFinishWave();
	if ( m_waves.empty() )
	{
		onFinishAllWaves();
	}
}

void WaveGenerator::onFinishAllWaves()
{
	GameGS::getInstance()->getGameBoard().onFinishWaves();
}

void WaveGenerator::generateCreep()
{
	assert( m_currentWave != m_waves.end() );
	assert(m_currentWave->creeps.empty() == false );
	std::string name = m_currentWave->creeps.front();

	auto rst = m_currentWave->routeSubType.front();
	auto ri = m_currentWave->routeIndex.front();
	auto creep = GameGS::getInstance()->getGameBoard().createCreep(name, rst, ri);
	if ( creep )
	{
		unsigned cost = m_currentWave->scores.front();
		creep->setCost( cost );
		creep->setRate( m_currentWave->healthRate.front() );
	}
	m_currentWave->pop();
}


NS_CC_END;