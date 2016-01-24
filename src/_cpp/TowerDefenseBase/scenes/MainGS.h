//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __MAINGS__
#define __MAINGS__
#include "cocos2d.h"
#include "ml/Audio/AudioMenu.h"
#include "ml/ScrollMenu.h"
#include "ml/NodeExt.h"
#include "ml/ParamCollection.h"
#include "ml/types.h"

NS_CC_BEGIN;

class MainGS : public Layer, public NodeExt
{
public:
	MainGS();
	virtual bool init();  
	static ScenePointer scene();
	CREATE_FUNC(MainGS);
	
	virtual void onEnter();
    virtual void onKeyReleased(EventKeyboard::KeyCode keyCode, Event* event);
	
protected:
	virtual void load( const pugi::xml_node & root )override;
	virtual ccMenuCallback get_callback_by_description( const std::string & name );

	void fadeIn();
	void fadeOut();
	void rateme();

	void pushGame(Ref* );
	void loadResources( std::function<void( )> callback );
	void onResourcesDidLoaded( );
	void onResourcesDidLoaded_runMap( );
	void closeRedeemMsg(Ref*);
	void appGratis_onRedeem(const ParamCollection & pc );
	void createDevMenu();
protected:
	struct loading
	{
		std::vector< std::pair<std::string, std::string> > atlases;
		std::vector< std::string > resources;
	}m_loadingList;
	MenuPointer m_menu;
	AudioMenu::Pointer m_menuAudio;
	bool m_resourceIsLoaded;
	LayerPointer _redeemLayer;
	LayerExt::Pointer _blockLayer;
};

NS_CC_END;

#endif