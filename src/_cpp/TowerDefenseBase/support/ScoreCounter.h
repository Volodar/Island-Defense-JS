//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __SCORE_COUNTER__
#define __SCORE_COUNTER__

#include "support.h"
#include "ml/Observer.h"

NS_CC_BEGIN;

const int kScoreLevel(0);
const int kScoreCrystals(1);
const int kScoreHealth( 2 );
const int kScoreFuel( 3 );
const int kScoreTime( 4 );
const int kScoreStars( 5 );


class ScoreCounter : public Singlton<ScoreCounter>
{
	friend class Singlton<ScoreCounter>;
	typedef ObServer< ScoreCounter, std::function<void( int )> > Observer_OnChangeScore;
protected:
	ScoreCounter(void);
	~ScoreCounter(void);
	virtual void onCreate( );
public:
	void setMoney(int id, int value, bool saveValueToUserData);
	void addMoney(int id, int value, bool saveValueToUserData);
	void subMoney(int id, int value, bool saveValueToUserData);
	int getMoney(int id)const;
	Observer_OnChangeScore& observer( int id );
private:
	void change(int id, int value, bool saveValueToUserData);
protected:
	std::map<unsigned, int> m_scores;

	std::map<int, Observer_OnChangeScore> _onChangeScores;
};

class ScoreByTime : public Singlton<ScoreByTime>, public Ref
{
protected:
	friend class Singlton<ScoreByTime>;
	ScoreByTime( );
	~ScoreByTime();
	virtual void onCreate( );
public:
	int gettime( )const;
	int getinterval()const;
	void checktime( );
	void savetime( );

	void checkMaxValue();
	int max_fuel()const { return _max; }
protected:
	void update( float dt );
	void changeTime( int score );
	void changeFuel( int score );
private:
	float _timer;
	int _time;
	int _interval;
	int _max;
};


class LevelParams : public Singlton<LevelParams>
{
	friend class Singlton<LevelParams>;
	virtual void onCreate( );
public:
	void onLevelFinished( int levelIndex, int stars );
	void onLevelStarted( int levelIndex );

	int getMaxStars( int level, bool forhard )const;
	int getAwardGold( int levelIndex, int stars, bool forhard )const;
	int getFuel( int levelIndex, bool forhard )const;
	int getStartGear( int level, bool forhard )const;
	int getWaveCount( int level, bool forhard )const;
	int getLives( int level, bool forhard )const;
	std::string getExclude( int level, bool forhard )const;
protected:
	void loadRealParams();
	void loadLevelParams();
	void parceLevel( int index );
private:
	struct Level
	{
		struct 
		{
			std::vector<int> stars;
			int fuel;
			int waves;
			int lifes;
			int gear;
			std::string exclude;
		}normal;
		struct hard
		{
			int stars;
			int award;
			int fuel;
			int waves;
			int lifes;
			int gear;
			std::string exclude;
		}hard;
	};
	std::map<int, Level> _params;
	int _goldOnFirstRun;

};
NS_CC_END;
#endif