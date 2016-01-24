//
//  SceneLoader.h
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 26.05.14.
//
//

#ifndef __JungleDefense__LayerLoader__
#define __JungleDefense__LayerLoader__
#include "cocos2d.h"
NS_CC_BEGIN;


class LayerLoader : public Layer
{
public:
	static LayerLoader* create(const std::vector<std::string> & resources, const std::function<void()> & callback );
	
	void addPlists(const std::vector< std::pair<std::string, std::string> > & resources);
    void loadCurrentTexture();
private:
	LayerLoader();
	void start();
	void progress(Texture2D * texture, const std::string & resourcename);

	void checkLoadedPlist( const std::string & resourcename );

	void on_load_textures();
	void on_finished_loading();
private:
    std::vector< std::pair<std::string, std::string> > m_resources;
	std::vector< std::pair<std::string, std::string> > m_plists;
	unsigned m_progress;
	std::function<void()> m_callback;
	Sprite* m_barBG;
	ProgressTimer * m_barTimer;
};


NS_CC_END;
#endif /* defined(__JungleDefense__LayerLoader__) */
