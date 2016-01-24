#ifndef __LoadLevelScene_h__
#define __LoadLevelScene_h__
#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/NodeExt.h"
#include "game/gameboard.h"
NS_CC_BEGIN





class LoadLevelScene : public Scene, public NodeExt
{
	DECLARE_BUILDER( LoadLevelScene );
	bool init( int level, GameMode mode );
public:
	static LoadLevelScene* getInstance();
	void loadInGameResources( const std::string& pack );
	
	virtual void onEnter();
protected:
	virtual bool loadXmlEntity( const std::string & tag, const pugi::xml_node & xmlnode )override;
	void parceLevel();
	void createLoading();
	
	void onLoadingFinished();
private:
	int _levelIndex;
	GameMode _levelMode;
	bool _popSceneOnEnter;

	std::set<std::string> _units;
	std::map<std::string, std::vector< std::pair<std::string, std::string> > >_resourcePacks;
};




NS_CC_END
#endif // #ifndef LoadLevelScene