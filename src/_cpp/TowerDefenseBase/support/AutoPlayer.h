#ifndef __AutoPlayer_h__
#define __AutoPlayer_h__
#include "cocos2d.h"
#include "macroses.h"
#include "Unit.h"
#include "gameboard.h"
NS_CC_BEGIN





class AutoPlayer : public Ref
{
	DECLARE_BUILDER( AutoPlayer );
	bool init( bool runCurrentLevel, bool onlyOnceLevel, float rate, bool withoutDefeat );
public:
	static AutoPlayer* getInstance();
	void setGameMode( GameMode mode ) { _mode = mode; }
protected:
	void state_selectLevel( float dt );
	void state_waitLoading( float dt );
	void state_play( float dt );
	void state_victory( float dt );
	void state_waitMap( float dt );
	void state_loop( float dt );
private:
	int _currentLevel;
	std::string _currentTowerForBuild;
	std::string _previuosTowerForBuild;
	std::string _previuosTowerForBuild2;
	std::vector<Unit::Pointer> _towers;
	std::vector<Unit::Pointer> _towerUpgraded;
	 
	bool _runCurrentLevel;
	bool _onlyOnceLevel;
	bool _withoutDefeat;
	GameMode _mode;
};




NS_CC_END
#endif // #ifndef AutoPlayer