//
//  SceneLoader.cpp
//  JungleDefense
//
//  Created by Vladimir Tolmachev on 26.05.14.
//
//

#include "LayerLoader.h"
#include "resources.h"
#include "support.h"
#include "ImageManager.h"
NS_CC_BEGIN

LayerLoader* LayerLoader::create(const std::vector<std::string> & resources, const std::function<void()> & callback )
{
	auto layer = new LayerLoader;
    for( auto res : resources )
        layer->m_resources.emplace_back(res, res);
	layer->m_callback = callback;
	layer->start();
	layer->autorelease();
	return layer;
}

LayerLoader::LayerLoader()
: m_resources()
, m_progress(0)
, m_callback()
, m_barBG( nullptr )
, m_barTimer( nullptr )
{
	auto desSize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
	setPosition( desSize.width / 2, desSize.height / 3 );
	
	m_barBG = ImageManager::sprite( "images/maings/progbar1.png" );
	m_barTimer = ProgressTimer::create( ImageManager::sprite( "images/maings/progbar2.png" ) );
	m_barTimer->setBarChangeRate( Point( 1, 0 ) );
	m_barTimer->setMidpoint( Point( 0, 0.5f ) );
	m_barTimer->setType( ProgressTimer::Type::BAR );
	Node* node = Node::create();
	node->addChild( m_barBG );
	node->addChild( m_barTimer, 1 );
	addChild( node );
	node->setPosition( strToPoint( "frame:0x-0.1" ) );
}

void LayerLoader::addPlists( const std::vector< std::pair<std::string, std::string> > & resources )
{
	m_plists.insert( m_plists.end(), resources.begin(), resources.end() );
	for( auto plist : resources )
	{
		if( plist.second.empty() ) plist.second = plist.first;
		auto k = plist.first.find( ".plist" );
		if( k == plist.first.size( ) - 6 )
		{
			std::string texture = plist.first.substr( 0, k ) + ".png";
			m_resources.emplace_back(plist.second, texture);
			//textureCache->addImageAsync( texture, std::bind( &LayerLoader::progress, this, std::placeholders::_1, plist.second ) );
		}
	}
}

void LayerLoader::start()
{
	m_progress = 0;
	//auto textureCache = Director::getInstance()->getTextureCache();
	//for( auto resource : m_resources )
	//{
	//	textureCache->addImageAsync(resource.second, std::bind( &LayerLoader::progress, this, std::placeholders::_1, resource.first) );
	//}
}

void LayerLoader::loadCurrentTexture()
{
    if( m_progress >= m_resources.size() )
        return;
    
    Texture2D::setDefaultAlphaPixelFormat(Texture2D::PixelFormat::RGBA4444);
    auto resource = m_resources[m_progress];
    auto textureCache = Director::getInstance()->getTextureCache();
#if USE_CHEATS == 1
	if( FileUtils::getInstance()->isFileExist( resource.second ) == false )
	{
		MessageBox( resource.second.c_str(), "Cannot load" );
	}
#endif

    textureCache->addImageAsync( resource.second, std::bind( &LayerLoader::progress, this, std::placeholders::_1, resource.first) );
}

void LayerLoader::progress(Texture2D * texture, const std::string & resourcename)
{
	retain();
	checkLoadedPlist( resourcename );
    
	if( ++m_progress >= m_resources.size() )
	{
        Texture2D::setDefaultAlphaPixelFormat(Texture2D::PixelFormat::RGBA8888);
		on_load_textures();
	}
    else
    {
        loadCurrentTexture();
    }
	float percent = ((m_progress + 1) / (float)m_resources.size()) * 100.f;
	m_barTimer->setPercentage( percent );
	release();
}

void LayerLoader::checkLoadedPlist( const std::string & resourcename )
{
	for( auto & plist : m_plists )
	{
		if( plist.second == resourcename )
		{
			ImageManager::shared( ).load_plist( plist.first, plist.second );
		}
	}
}

void LayerLoader::on_load_textures()
{
	on_finished_loading();
}

void LayerLoader::on_finished_loading()
{
	if( m_callback )m_callback();
}




NS_CC_END;