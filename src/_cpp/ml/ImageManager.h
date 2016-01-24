//
//  ImageManager.h
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 03.03.14.
//
//

#ifndef __TowerDefence__ImageManager__
#define __TowerDefence__ImageManager__
#include "cocos2d.h"
#include "Singlton.h"
NS_CC_BEGIN;

/*
load resources 
textures and *.plist atlases
*/

class ImageManager : public Singlton<ImageManager>
{
	friend class Singlton<ImageManager>;
private:
	ImageManager();
	~ImageManager();
	ImageManager( const ImageManager& );
	const ImageManager& operator = ( const ImageManager& );
public:
	void load_plist( const std::string & path, const std::string & name );
	void unload_plist( const std::string & name );
	void addUnloadPlist( const std::string & name );
	void unloadReservedPlists();
	Texture2D * textureForPLIST( const std::string & path );
	SpriteFrame* spriteFrame( const std::string & frame );
	static Texture2D * texture( const std::string & texture );
	static Sprite * sprite( const std::string & frameOrTexture );
private:
	std::map< std::string, SpriteFrame* > m_frames;
	std::map< std::string, Texture2D* > m_textures;
	std::set< std::string > _plistOnUnload;
};

NS_CC_END;
#endif /* defined(__TowerDefence__ImageManager__) */
