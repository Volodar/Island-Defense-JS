/******************************************************************************
 * Copyright 2014-2016 Vladimir Tolmachev
 * Copyright 2016 Visionarity AG
 * Vladimir Tolmachev and Visionarity AG have unlimited commercial
 * licenses for commercial use and customization
 *
 * Author: Vladimir Tolmachev (tolm_vl@hotmail.com)
 * Ported C++ to Javascript: Visionarity AG / Vladimir Tolmachev
 * Project: Island Defense (JS)
 * If you received the code not from the author, please contact us
 ******************************************************************************/

//Define namespace
var EU = EU || {};

EU.ImageManager  = {
    frames: {},

    build: function(type) {
    },
    //void ImageManager::load_plist( const std::string & path, const std::string & _name )
    //{
    //    if( m_textures.find( path ) != m_textures.end() )
    //        return;
    //    __SpriteFrameCache2 cache;
    //    cache.init();
    //    cache.addSpriteFramesWithFile( path );
    //
    //    std::string nameplist = _name.empty() ? path : _name;
    //
    //    auto frames = cache.getFramesList();
    //    for( auto it : frames )
    //    {
    //        std::string name = it.first;
    //        SpriteFrame * frame = it.second;
    //        std::string key = nameplist + "::" + name;
    //
    //        auto result = m_frames.insert( std::pair<std::string, SpriteFrame*>(key, frame) );
    //        if( result.second )
    //            result.first->second->retain();
    //        else
    //            assert( 0 );
    //    }
    //    if(frames.size() > 0 )
    //    {
    //        m_textures[path] = frames.begin()->second->getTexture();
    //    }
    //}
    //void ImageManager::addUnloadPlist( const std::string & name )
    //{
    //    _plistOnUnload.insert( name );
    //}
    //
    //void ImageManager::unloadReservedPlists()
    //{
    //    for( auto plist : _plistOnUnload )
    //    {
    //        unload_plist( plist );
    //        auto it = m_textures.find( plist );
    //        if( it != m_textures.end() )
    //            m_textures.erase( it );
    //    }
    //    _plistOnUnload.clear();
    //
    //    Director::getInstance()->getTextureCache()->removeUnusedTextures();
    //}
    //
    //void ImageManager::unload_plist( const std::string & plist )
    //{
    //    Texture2D* texture( nullptr );
    //    for( auto iter = m_frames.begin(); iter != m_frames.end(); )
    //    {
    //        auto name = iter->first;
    //        if( name.find( plist + "::" ) == 0 )
    //        {
    //            log( "unload: [%s]", iter->first.c_str() );
    //            if( iter->second )
    //            {
    //                texture = iter->second->getTexture();
    //                iter->second->release();
    //            }
    //            m_frames.erase( iter++ );
    //        }
    //        else
    //        {
    //            ++iter;
    //        }
    //
    //    }
    //
    //    if( texture != nullptr )
    //    {
    //        for( auto iter = m_textures.begin(); iter != m_textures.end(); ++iter )
    //        {
    //            if( iter->second == texture )
    //            {
    //                m_textures.erase( iter );
    //                break;
    //            }
    //        }
    //    }
    //}
    //
    //Texture2D * ImageManager::textureForPLIST( const std::string & path )
    //{
    //    auto iter = m_textures.find(path);
    //    if( iter == m_textures.end() )
    //    {
    //        log( "texture for plist[%s] not found", path.c_str() );
    //        return nullptr;
    //    }
    //
    //    return iter->second;
    //}
    //
    //SpriteFrame* ImageManager::spriteFrame( const std::string & key )
    //{
    //    auto it = m_frames.find( key );
    //    SpriteFrame* frame = it == m_frames.end() ? nullptr : it->second;
    //    return frame;
    //}
    //
    //Texture2D * ImageManager::texture( const std::string & texture )
    //{
    //    auto texturecache = Director::getInstance( )->getTextureCache( );
    //    assert( texturecache );
    //    assert( shared( ).spriteFrame( texture ) == nullptr );
    //    return texturecache->addImage( texture );
    //}
    //
    sprite: function( spriteFrameOrTexture )
    {
        var sprite = null;
        var frame = null;
        if( spriteFrameOrTexture in this.frames )
            frame = this.frames[spriteFrameOrTexture];
        if( frame )
        {
            sprite = new cc.Sprite( frame );
        }
        else
        {
            var path = spriteFrameOrTexture.indexOf( EU.xmlLoader.resourcesRoot ) == 0 ?
                spriteFrameOrTexture :
            EU.xmlLoader.resourcesRoot + spriteFrameOrTexture;
            sprite = new cc.Sprite( path );
        }
        if( !sprite )
        {
            cc.log( "Sprite with resource not created: " + spriteFrameOrTexture );
        }
        EU.assert( sprite );
        return sprite;
    }
};
