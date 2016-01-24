//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "tower.h"
#include "GameGS.h"
#include "ScoreCounter.h"
#include "effects.h"
#include "ml/Audio/AudioEngine.h"
#include "consts.h"
#include "UserData.h"
#include "ml/ImageManager.h"
#include "ml/Language.h"
NS_CC_BEGIN;

const float parameterMin( 1 );
const float parameterMax( 10 );


mlTowersInfo::mlTowersInfo()
: _max_dmg( 0 )
, _max_rng( 0 )
, _max_spd( 0 )
{
	load();
	checkAvailabledTowers();
}

void mlTowersInfo::fetch( std::list<std::string> & towers )const
{
	for( auto iter : m_towersInfo )
	{
		if( iter.first.empty() == false )
			towers.push_back( iter.first );
	}
	towers.sort(
		[this]( const std::string & l, const std::string & r )
	{
		auto a = m_towersInfo.find( l );
		auto b = m_towersInfo.find( r );
		if( a == m_towersInfo.end() || b == m_towersInfo.end() )
			return false;
		return a->second.order < b->second.order;
	} );

}

unsigned mlTowersInfo::getCost( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		if( iter->second.cost.size() < level )return 999;
		return iter->second.cost[level - 1];
	}
	return 0;
}

unsigned mlTowersInfo::getCostLab( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		if( iter->second.costlab.size() < level )return 999;
		return iter->second.costlab[level - 1];
	}
	return 0;
}

unsigned mlTowersInfo::getSellCost( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		auto& towerInfo = iter->second;
		if( level > towerInfo.cost.size() )
			return 0;
		return towerInfo.cost[level - 1] * towerInfo.sellRate;
	}
	return 0;
}

int mlTowersInfo::get_dmg( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		if( level == 0 )return 0;
		if( iter->second.dmg.size() < level )return 0;
		return iter->second.dmg[level - 1];
	}
	return 0;
}
int mlTowersInfo::get_rng( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		if( level == 0 )return 0;
		if( iter->second.rng.size() < level )return 0;
		return iter->second.rng[level - 1];
	}
	return 0;
}

int mlTowersInfo::get_spd( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		if( level == 0 )return 0;
		if( iter->second.spd.size() < level )return 0;
		return iter->second.spd[level - 1];
	}
	return 0;
}

std::string mlTowersInfo::get_desc( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		return iter->second.desc;
	}
	return "";
}

int mlTowersInfo::get_dmg_forlab( const std::string & name )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		return iter->second.lab.dmg;
	}
	return 0;
}

int mlTowersInfo::get_rng_forlab( const std::string & name )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		return iter->second.lab.rng;
	}
	return 0;
}

int mlTowersInfo::get_spd_forlab( const std::string & name )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		return iter->second.lab.spd;
	}
	return 0;
}

float mlTowersInfo::radiusInPixels( const std::string & name, unsigned level )const
{
	auto iter = m_towersInfo.find( name );
	if( iter != m_towersInfo.end() )
	{
		if( iter->second.rng.size() < level )return 0;
		float v = iter->second.rng[level - 1];

		return (v - parameterMin)* (_max_rng) / (parameterMax - parameterMin);
	}
	return 0;
}

void mlTowersInfo::load()
{
	pugi::xml_document doc; doc.load_file( "ini/towers.xml" );
	pugi::xml_node root = doc.root().first_child();

	_digcost = root.attribute( "digcost" ).as_int();

	std::string s = root.child( "laboratory_upgrade" ).attribute( "value" ).as_string();
	std::list<std::string>upgrades;
	split( upgrades, s );
	for( auto value : upgrades ) _labUpgrade.push_back( strToFloat( value ) );

	int order( 0 );
	for( auto node = root.first_child(); node; node = node.next_sibling() )
	{
		towerInfo info;
		std::string name = node.attribute( "name" ).value();
		pugi::xml_node costXml = node.child( "cost" );
		pugi::xml_node costlabXml = node.child( "costlab" );
		pugi::xml_node sellXml = node.child( "sell" );
		pugi::xml_node levelXml = node.child( "minlevel" );

		info.order = order++;
		info.sellRate = sellXml.attribute( "value" ).as_float();
		info.minlevel = levelXml.attribute( "value" ).as_int();

		{
			std::list<std::string> costs;
			split( costs, costXml.attribute( "value" ).as_string() );
			for( auto cost : costs )
				info.cost.push_back( strToInt( cost ) );
		}
		{
			std::list<std::string> costslab;
			split( costslab, costlabXml.attribute( "value" ).as_string() );
			for( auto cost : costslab )
				info.costlab.push_back( strToInt( cost ) );
		}

		info.desc = WORD( node.child( "desc" ).attribute( "value" ).as_string() );
		info.lab.dmg = node.child( "laboratories_params" ).attribute( "dmg" ).as_int();
		info.lab.rng = node.child( "laboratories_params" ).attribute( "rng" ).as_int();
		info.lab.spd = node.child( "laboratories_params" ).attribute( "spd" ).as_int();

		{//load tower info
			unsigned maxlevel( 1 );
			for( unsigned i = 1; i <= maxlevel; ++i )
			{
				pugi::xml_document doc;
				pugi::xml_document docTemplate;
				doc.load_file( ("ini/units/" + name + intToStr( i ) + ".xml").c_str() );
				pugi::xml_node root = doc.root().first_child();
				if( maxlevel == 1 )maxlevel = root.attribute( "maxlevel" ).as_int();

				if( root.attribute( "template" ) )
					docTemplate.load_file( root.attribute( "template" ).as_string() );

				auto xmlEffects = root.child( "effects" );
				auto xmlMachine = root.child( k::xmlTag::MachineUnit );

				if( !xmlEffects )
					xmlEffects = docTemplate.root().first_child().child( "effects" );
				if( !xmlMachine )
					xmlMachine = docTemplate.root().first_child().child( k::xmlTag::MachineUnit );

				auto xmlEffectsPositive = xmlEffects.child( "positive" );
				auto xmlMachineParams = xmlMachine.child( "params" );

				float delayfire = xmlMachineParams.child( "state_readyfire" ).attribute( "delay" ).as_float();
				float delaycharge = xmlMachineParams.child( "state_charging" ).attribute( "duration" ).as_float();
				unsigned volume = xmlMachineParams.child( "state_readyfire" ).attribute( "charge_volume" ).as_int();

				float radius = root.attribute( "radius" ).as_float();
				float damage = xmlEffectsPositive.attribute( "damage" ).as_float();
				float damageR = xmlEffectsPositive.attribute( "fireRate" ).as_float() *
					xmlEffectsPositive.attribute( "fireTime" ).as_float();
				float damageI = xmlEffectsPositive.attribute( "iceRate" ).as_float()*
					xmlEffectsPositive.attribute( "iceTime" ).as_float();
				float damageE = xmlEffectsPositive.attribute( "electroRate" ).as_float()*
					xmlEffectsPositive.attribute( "electroTime" ).as_float();
				damage += damageR;
				damage += damageI;
				damage += damageE;

				float speed = 1 / (delayfire*volume + delaycharge);
				float fps = volume * speed;
				damage *= fps;

				//log( "%s:%d fps = %f", name.c_str(), i, fps );
				//log( "%s:%d damage = %f", name.c_str(), i, damage );
				//log( "%s:%d radius = %f", name.c_str(), i, radius );
				//log( "%s:%d speed = %f", name.c_str(), i, speed );

				assert( damage > 0 );
				assert( radius > 0 );
				assert( speed > 0 );
				info.dmg.push_back( damage );
				info.rng.push_back( radius );
				info.spd.push_back( speed );
				_max_dmg = std::max<float>( _max_dmg, damage );
				_max_rng = std::max<float>( _max_rng, radius );
				_max_spd = std::max<float>( _max_spd, speed );
			}
		}
		m_towersInfo[name] = info;
	}

	for( auto & param : m_towersInfo )
	{
		for( auto& v : param.second.dmg ) v = v / _max_dmg * (parameterMax - parameterMin) + parameterMin;
		for( auto& v : param.second.rng ) v = v / _max_rng * (parameterMax - parameterMin) + parameterMin;
		for( auto& v : param.second.spd ) v = v / _max_spd * (parameterMax - parameterMin) + parameterMin;
	}


}

void mlTowersInfo::checkAvailabledTowers()const
{
	unsigned passed = UserData::shared().level_getCountPassed();
	for( auto iter : m_towersInfo )
	{
		if( iter.second.minlevel <= passed )
		{
			int level = UserData::shared().tower_upgradeLevel( iter.first );
			level = std::max( 1, level );
			UserData::shared().tower_upgradeLevel( iter.first, level );
		}
	}


}

const mlUnitInfo::Info& mlUnitInfo::info( const std::string & name )
{
	if( _info.find( name ) == _info.end() )
		fetch( name );
	if( _info.find( name ) != _info.end() )
		return _info.at( name );

	static Info info;
	return info;
}

void mlUnitInfo::fetch( const std::string & name )
{
	pugi::xml_document doc;
	doc.load_file( ("ini/units/" + name + ".xml").c_str() );
	auto root = doc.root().first_child();

	while( root.attribute( "template" ) )
	{
		pugi::xml_document doc;
		doc.load_file( root.attribute( "template" ).as_string() );
		root.remove_attribute( "template" );

		auto temp = doc.root().first_child();
		for( auto attr = temp.first_attribute(); attr; attr = attr.next_attribute() )
		{
			auto attrRoot = root.attribute( attr.name() );
			if( !attrRoot )
				attrRoot = root.append_attribute( attr.name() );
			attrRoot.set_value( attr.value() );
		}
	}

	Info info;
	info.layer = strToUnitLayer( root.attribute( "unitlayer" ).as_string() );
	info.type = strToUnitType( root.attribute( "unittype" ).as_string() );
	info.radius = root.attribute( "radius" ).as_float();

	_info.insert( std::pair<std::string, Info>( name, info ) );
}

NS_CC_END;