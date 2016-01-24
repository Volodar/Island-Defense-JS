//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __TOWER__
#define __TOWER__

#include "ml/pugixml/pugixml.hpp"
#include "support.h"

NS_CC_BEGIN;

class mlCreep;

class mlTowersInfo : public Singlton<mlTowersInfo>
{
public:
	mlTowersInfo();

	void fetch( std::list<std::string> & towers )const;
	
	unsigned getCost( const std::string & name, unsigned level )const;
	unsigned getCostLab( const std::string & name, unsigned level )const;
	unsigned getSellCost( const std::string & name, unsigned level )const;

	int get_dmg( const std::string & name, unsigned level )const;
	int get_rng( const std::string & name, unsigned level )const;
	int get_spd( const std::string & name, unsigned level )const;
	int get_dmg_forlab( const std::string & name )const;
	int get_rng_forlab( const std::string & name )const;
	int get_spd_forlab( const std::string & name )const;
	std::string get_desc( const std::string & name, unsigned level )const;

	float radiusInPixels( const std::string & name, unsigned level )const;
	int getCostFotDig( )const { return _digcost; }
	
	//float rate( const std::string & tower );
	void checkAvailabledTowers()const;
protected:
	void load();
protected:
	struct towerInfo
	{
		float sellRate;
		unsigned minlevel;
		std::vector<unsigned>cost;
		std::vector<unsigned>costlab;
		std::vector<float> dmg;
		std::vector<float> rng;
		std::vector<float> spd;
		std::string desc;
		int order;
		struct
		{
			float dmg;
			float rng;
			float spd;
		}lab;
	};
	unsigned _digcost;
	std::map<std::string,towerInfo> m_towersInfo;
	std::vector< float > _labUpgrade;

	float _max_dmg;
	float _max_rng;
	float _max_spd;
};


class mlUnitInfo : public Singlton < mlUnitInfo >
{
public:
	struct Info
	{
		UnitLayer layer;
		UnitType type;
		float radius;
	};
	const Info& info(const std::string & name );
protected:
	void fetch( const std::string & name );
private:
	std::map<std::string, Info > _info;
};

NS_CC_END;
#endif