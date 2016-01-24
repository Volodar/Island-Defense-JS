//
//  ImageManager.cpp
//  TowerDefence
//
//  Created by Vladimir Tolmachev on 03.03.14.
//
//

#include "ImageManager.h"
NS_CC_BEGIN;

class __SpriteFrameCache2 : public SpriteFrameCache
{
public:
	std::map< std::string, SpriteFrame* > getFramesList( )
	{
		std::map< std::string, SpriteFrame* > map;
		for( auto frame : _spriteFrames )
		{
			map[frame.first] = frame.second;
		}
		return map;
	}
};

ImageManager::ImageManager()
{
}

ImageManager::~ImageManager()
{
	for( auto iter : m_frames )
		iter.second->release();
}

ImageManager::ImageManager( const ImageManager& )
{
	assert( 0 );
}

const ImageManager& ImageManager::operator = ( const ImageManager& )
{
	assert( 0 );
	return *this;
}

void ImageManager::load_plist( const std::string & path, const std::string & _name )
{
	if( m_textures.find( path ) != m_textures.end() )
		return;
	__SpriteFrameCache2 cache;
	cache.init();
	cache.addSpriteFramesWithFile( path );

	std::string nameplist = _name.empty() ? path : _name;

	auto frames = cache.getFramesList();
	for( auto it : frames )
	{
		std::string name = it.first;
		SpriteFrame * frame = it.second;
		std::string key = nameplist + "::" + name;
			
		auto result = m_frames.insert( std::pair<std::string, SpriteFrame*>(key, frame) );
		if( result.second )
			result.first->second->retain();
		else
			assert( 0 );
	}
	if(frames.size() > 0 )
	{
		m_textures[path] = frames.begin()->second->getTexture();
	}
}

void ImageManager::addUnloadPlist( const std::string & name )
{
	_plistOnUnload.insert( name );
}

void ImageManager::unloadReservedPlists()
{
	for( auto plist : _plistOnUnload )
	{
		unload_plist( plist );
		auto it = m_textures.find( plist );
		if( it != m_textures.end() )
			m_textures.erase( it );
	}
	_plistOnUnload.clear();

	Director::getInstance()->getTextureCache()->removeUnusedTextures();
}

void ImageManager::unload_plist( const std::string & plist )
{
	Texture2D* texture( nullptr );
	for( auto iter = m_frames.begin(); iter != m_frames.end(); )
	{
		auto name = iter->first;
		if( name.find( plist + "::" ) == 0 )
		{
			log( "unload: [%s]", iter->first.c_str() );
			if( iter->second )
			{
				texture = iter->second->getTexture();
				iter->second->release();
			}
			m_frames.erase( iter++ );
		}
		else
		{
			++iter;
		}

	}

	if( texture != nullptr )
	{
		for( auto iter = m_textures.begin(); iter != m_textures.end(); ++iter )
		{
			if( iter->second == texture )
			{
				m_textures.erase( iter );
				break;
			}
		}
	}
}

Texture2D * ImageManager::textureForPLIST( const std::string & path )
{
	auto iter = m_textures.find(path);
	if( iter == m_textures.end() )
	{
		log( "texture for plist[%s] not found", path.c_str() );
		return nullptr;
	}
	
	return iter->second;
}

SpriteFrame* ImageManager::spriteFrame( const std::string & key )
{
	auto it = m_frames.find( key );
	SpriteFrame* frame = it == m_frames.end() ? nullptr : it->second;
	return frame;
}

Texture2D * ImageManager::texture( const std::string & texture )
{
	auto texturecache = Director::getInstance( )->getTextureCache( );
	assert( texturecache );
	assert( shared( ).spriteFrame( texture ) == nullptr );
	return texturecache->addImage( texture );
}

Sprite * ImageManager::sprite( const std::string & key )
{
    ImageManager& manager = ImageManager::shared();
    
	Sprite * sprite(nullptr);
	auto frame = manager.spriteFrame( key );
	if( frame )
	{
		sprite = Sprite::createWithSpriteFrame( frame );
	}
	else
	{
		sprite = Sprite::create( key );
	}

	if( !sprite )
	{
		log( "Sprite with resource [%s] not created.", key.c_str() );
	}
	assert( sprite );
	return sprite;
}


NS_CC_END;
