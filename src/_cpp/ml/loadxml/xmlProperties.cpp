//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "ml/types.h"
#include "ml/common.h"
#include "ml/ScrollMenu.h"
#include "ml/MenuItemWithText.h"
#include "ml/ImageManager.h"
#include "ml/NodeExt.h"
#include "ml/Language.h"
#include "xmlProperties.h"

NS_CC_BEGIN;

namespace xmlLoader
{
	static NodeExt * _directory = nullptr;
	static std::map<std::string, const int> properties;
	struct __autogillproperties
	{
		void fill()
		{
			boolProperty( ksType, kType );
			boolProperty( ksVisible, kVisible );
			boolProperty( ksPos, kPos );
			boolProperty( ksScale, kScale  );
			boolProperty( ksStrech, kStrech ) ;
			boolProperty( ksSize, kSize );
			boolProperty( ksRotation, kRotation  );
			boolProperty( ksLocalZ, kLocalZ ) ;
			boolProperty( ksGlobalZ, kGlobalZ  );
			boolProperty( ksCenter, kCenter ) ;
			boolProperty( ksTag, kTag ) ;
			boolProperty( ksCascadeOpacity, kCascadeOpacity  );
			boolProperty( ksCascadeColor, kCascadeColor  );
			boolProperty( ksImage, kImage  );
			boolProperty( ksBlending, kBlending );
			boolProperty( ksOpacity, kOpacity );
			boolProperty( ksColor, kColor  );
			boolProperty( ksAnimation, kAnimation  );
			boolProperty( ksName, kName );
			boolProperty( ksAlignCols, kAlignCols ) ;
			boolProperty( ksImageNormal, kImageNormal ) ;
			boolProperty( ksImageSelected, kImageSelected  );
			boolProperty( ksImageDisabled, kImageDisabled  );
			boolProperty( ksText, kText  );
			boolProperty( ksFont, kFont  );
			boolProperty( ksMenuCallBack, kMenuCallBack  );
			boolProperty( ksTextWidth, kTextWidth  );
			boolProperty( ksTextAlign, kTextAlign );
			boolProperty( ksScaleEffect, kScaleEffect  );
			boolProperty( ksSound, kSound  );
			boolProperty( ksTemplate, kTemplate );
			boolProperty( ksPath, kPath );
			boolProperty( ksAlignStartPosition, kAlignStartPosition );
			boolProperty( ksGridSize, kGridSize );
			boolProperty( ksScissorRect, kScissorRect );
			boolProperty( ksScissorEnabled, kScissorEnabled );
			boolProperty( ksScrollEnabled, kScrollEnabled );
			boolProperty( ksAllowScrollByX, kAllowScrollByX );
			boolProperty( ksAllowScrollByY, kAllowScrollByY );
			boolProperty( ksProgressType, kProgressType );
			boolProperty( ksPercent, kPercent );
			boolProperty( ksMidPoint, kMidPoint );
			boolProperty( ksBarChangeRate, kBarChangeRate );
		}
	};

	void boolProperty( const std::string & name, const int iname )
	{
#ifdef _DEBUG
		for( auto& pair : properties )
		{
			int second = pair.second;
			assert( pair.second != iname );
			assert( pair.first != name );
		}
#endif
		properties.insert( std::pair<std::string, const int>( name, iname ) );
	}

	int strToPropertyType( const std::string &property )
	{
		static bool first( true );
		if( first )
		{
			__autogillproperties __autogillproperties;
			__autogillproperties.fill();
			first = false;
		}
		return properties[property];
	}

	void setProperty( Node* node, const std::string &property, const std::string &value )
	{
		if( property == ksTemplate )
			return;

		const int iproperty = strToPropertyType( property );
		if( false == setProperty( node, iproperty, value ) )
		{
			auto nodeext = dynamic_cast<NodeExt*>(node);
			if( nodeext)
				nodeext->setProperty( property, value );
		}
	}

	bool setProperty( Node* node, const int property, const std::string & rawvalue )
	{
		bool result( false );
		assert( node );
		static Language& language = Language::shared();

		Sprite * sprite = dynamic_cast<Sprite*>(node);
		ScrollMenu* scrollmenu = dynamic_cast<ScrollMenu*>(node);
		//Menu * menu = dynamic_cast<Menu*>(node);
		MenuItemImageWithText * menuitem = dynamic_cast<MenuItemImageWithText*>(node);
		Label* label = dynamic_cast<Label*>(node);
		ProgressTimer* progress = dynamic_cast<ProgressTimer*>(node);

		const std::string& value = xmlLoader::macros::parse( rawvalue );

		Point point;
		Size size;
		SpriteFrame* frame( nullptr );
		//Texture2D * texture( nullptr );
		NodeExt * nodeext( nullptr );

		nodeext = dynamic_cast<NodeExt*>(node);
		if( nodeext )
			result = nodeext->setProperty( property, value );
		
		if( result == false )
		{
			result = true;
			switch( property )
			{
				//for node:
				case kType:
					break;
				case kName:
					node->setName( value );
					break;
				case kVisible:
					node->setVisible( strToBool( value ) );
					break;
				case kPos:
					node->setPosition( strToPoint( value ) );
					break;
				case kScale:
					point = strToPoint( value );
					node->setScale( point.x, point.y );
					break;
				case kRotation:
					node->setRotation( strToFloat( value ) );
					break;
				case kCenter:
					node->setAnchorPoint( strToPoint( value ) );
					break;
				case kStrech:
					size = node->getContentSize();
					if( size.equals( Size::ZERO ) == false )
					{
						float sx( 0 );
						float sy( 0 );
						auto parce = [size, node, &sx, &sy]( const std::string&value ) mutable
						{
							std::string framepoint;
							std::string mode;
							size_t k = value.find_last_of( ":" );
                            if( k != std::string::npos )
							{
								framepoint = value.substr( 0, k );
								mode = value.substr( k + 1 );
							}
							Point s = strToPoint( framepoint );
							sx = s.x / size.width;
							sy = s.y / size.height;
							return mode;
						};

						auto mode = parce( value );
						if( mode == "x" )
							node->setScaleX( sx );
						else if( mode == "y" )
							node->setScaleY( sy );
						else if( mode == "xy" )
							node->setScale( sx, sy );
						else if( mode == "max" )
							node->setScale( std::max<float>( sx, sy ) );
						else if( mode == "min" )
							node->setScale( std::min<float>( sx, sy ) );
						else
							assert( !"TODO:" );
					}
					break;
				case kSize:
					size.width = strToPoint( value ).x;
					size.height = strToPoint( value ).y;
					node->setContentSize( size );
					break;
				case kTag:
					node->setTag( strToInt( value ) );
					break;
				case kCascadeColor:
					node->setCascadeColorEnabled( strToBool( value ) );
					break;
				case kCascadeOpacity:
					node->setCascadeOpacityEnabled( strToBool( value ) );
					break;
				case kLocalZ:
					node->setLocalZOrder( strToInt( value ) );
					break;
				case kGlobalZ:
					node->setGlobalZOrder( strToInt( value ) );
					break;
					//for sprite:
				case kImage:
					if( sprite )
					{
						frame = ImageManager::shared().spriteFrame( value );
						if( frame )
							sprite->setSpriteFrame( frame );
						else
							sprite->setTexture( value );
					}
					else if( progress )
					{
						auto sprite = ImageManager::sprite( value );
						if( sprite )
							progress->setSprite( sprite );
					}
					break;
					//for scroll menu:
				case kBlending:
					assert( sprite );
					sprite->setBlendFunc( strToBlendFunc(value) );
					break;
				case kOpacity:
					node->setOpacity( strToInt( value ) );
					break;
				case kColor:
					node->setColor( strToColor3B( value ) );
					break;
				case kAnimation:
					node->runAction( xmlLoader::load_action( value ) );
					break;
				case kAlignCols:
					assert( scrollmenu );
					scrollmenu->setAlignedColums( strToInt( value ) );
					break;
					//for MenuItemImageWithText:
				case kImageNormal:
					assert( menuitem );
					menuitem->setImageNormal( value );
					break;
				case kImageSelected:
					assert( menuitem );
					menuitem->setImageSelected( value );
					break;
				case kImageDisabled:
					assert( menuitem );
					menuitem->setImageDisabled( value );
					break;
				case kMenuCallBack:
					assert( menuitem );
					if( _directory )
						menuitem->setCallback( _directory->get_callback_by_description( value ) );
					break;
				case kSound:
					assert( menuitem );
					menuitem->setSound( value );
				case kText:
					assert( menuitem || label );
					if( label ) label->setString( language.string( value ) );
					else menuitem->setText( language.string( value ) ); break;
				case kFont:
					assert( menuitem || label );
					if( label ) label->setBMFontFilePath( value );
					else menuitem->setFont( value ); break;
				case kTextWidth:
					assert( label );
					if( label ) label->setWidth( strToFloat( value ) );
					break;
				case kTextAlign:
					assert( label );
					if( label )
					{
						TextHAlignment align;
						if( value == "center" ) align = TextHAlignment::CENTER;
						else if( value == "right" ) align = TextHAlignment::RIGHT;
						else align = TextHAlignment::LEFT;
						label->setAlignment( align );
					}
					break;
				case kScaleEffect:
					assert( menuitem );
					menuitem->useScaleEffect( strToBool( value ) );
					break;
				case kAlignStartPosition:
					assert( scrollmenu );
					scrollmenu->setAlignedStartPosition( strToPoint( value ) );
					break;
				case kGridSize:
					assert( scrollmenu );
					scrollmenu->setGrisSize( strToSize( value ) );
					break;
				case kScissorRect:
					assert( scrollmenu );
					scrollmenu->setScissorRect( strToRect( value ) );
					break;
				case kScrollEnabled:
					assert( scrollmenu );
					scrollmenu->setScrollEnabled( strToBool( value ) );
					break;
				case kScissorEnabled:
					assert( scrollmenu );
					scrollmenu->setScissorEnabled( strToBool( value ) );
					break;
				case kAllowScrollByX:
					assert( scrollmenu );
					scrollmenu->setAllowScrollByX( strToBool( value ) );
					break;
				case kAllowScrollByY:
					assert( scrollmenu );
					scrollmenu->setAllowScrollByY( strToBool( value ) );
					break;
				case kProgressType:
					assert( progress );
					progress->setType( value == "radial" ? ProgressTimer::Type::RADIAL : ProgressTimer::Type::BAR );
					break;
				case kPercent:
					assert( progress );
					progress->setPercentage( strToFloat( value ) );
					break;
				case kMidPoint:
					assert( progress );
					progress->setMidpoint( strToPoint( value ) );
					break;
				case kBarChangeRate:
					assert( progress );
					progress->setBarChangeRate( strToPoint( value ) );
					break;
				default:
					result = false;
					log_once( "property with name[%d] not dispathed node by name[%s]", property, node->getName().c_str() );
					break;
			}
		}
		return result;
	}

	void bookDirectory( NodeExt* node )
	{
		unbookDirectory();
		_directory = node;
		if( node && node->as_node_pointer() )
			node->as_node_pointer()->retain();
	}

	void unbookDirectory()
	{
		if( _directory && _directory->as_node_pointer() )
			_directory->as_node_pointer()->release();
		_directory = nullptr;
	}

};

NS_CC_END
