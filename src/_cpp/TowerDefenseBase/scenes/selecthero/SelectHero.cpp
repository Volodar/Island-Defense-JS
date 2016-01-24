#include "SelectHero.h"
#include "support.h"
#include "UserData.h"
#include "Hero.h"
#include "MenuItemWithText.h"
#include "ml/Language.h"
#include "ScoreCounter.h"
#include "shop/ShopLayer.h"
#include "Tutorial.h"
#include "ml/ImageManager.h"
#include "ml/SmartScene.h"
#include "consts.h"
#include "configuration.h"
NS_CC_BEGIN





SelectHero::SelectHero()
: _currentHero(0)
{
}

SelectHero::~SelectHero( )
{
#if PC == 1
#else
	ShopLayer::observerOnPurchase().remove( _ID );
#endif
}

bool SelectHero::init()
{
	do
	{
		CC_BREAK_IF( !Layer::init() );
		CC_BREAK_IF( !NodeExt::init() );

		load( "ini/selecthero/layer.xml" );
		
		auto content = getChildByName( "content" );
		_itemHero[0] = getNodeByPath<MenuItem>( content, "menu/hero1" );
		_itemHero[1] = getNodeByPath<MenuItem>( content, "menu/hero2" );
		_itemHero[2] = getNodeByPath<MenuItem>( content, "menu/hero3" );
		_level = getNodeByPath<Label>( content, "level" );
		_levelTimer = getNodeByPath<ProgressTimer>( content, "level_timer" );

		setKeyDispatcherBackButton( this );

		auto currentHero = UserData::shared().hero_getCurrent();
		fetch( currentHero );
		appearance();

		float scale = Director::getInstance()->getOpenGLView()->getDesignResolutionSize().height / 850.f;
		content->setScale( scale );
		return true;
	}
	while( false );
	return false;
}

void SelectHero::onEnter()
{
	LayerExt::onEnter();
	fetch( _currentHero );
	TutorialManager::shared().dispatch( "heroroom_open" );
}

ccMenuCallback SelectHero::get_callback_by_description( const std::string & name )
{
#define callback( x ) std::bind( [this]( Ref* ){ x; }, std::placeholders::_1 )
	if( name == "close" )
		return callback( this->disappearance() );
	else if( name == "hero1" )
		return callback( this->fetch( 0 ); );
	else if( name == "hero2" )
		return callback( this->fetch( 1 ); TutorialManager::shared().dispatch( "hero_herochanged" ); );
	else if( name == "hero3" )
		return callback( this->fetch( 2 ); TutorialManager::shared().dispatch( "hero_herochanged" ); );
	else if( name == "skill1" )
		return callback( this->selectSkill(0) );
	else if( name == "skill2" )
		return callback( this->selectSkill(1) );
	else if( name == "skill3" )
		return callback( this->selectSkill(2) );
	else if( name == "skill4" )
		return callback( this->selectSkill(3) );
	else if( name == "skill5" )
		return callback( this->selectSkill(4) );
	else if( name == "select" )
		return callback( this->select() );
	else if( name == "train" )
		return callback( this->train() );
	else if( name == "reset" )
		return callback( this->reset() );
	else if( name == "buylevel" )
		return callback( this->buylevel() );
	else if( name == "buyhero" )
		return callback( this->buyHero() );
	else if( name == "restore" )
		return callback( this->restore() );
	return LayerExt::get_callback_by_description( name );
#undef callback
}

void SelectHero::fetch( unsigned index )
{
	_currentHero = index;
	auto content = getChildByName( "content" );
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	auto exp = HeroExp::shared().getEXP( heroname );
	auto herolevel = HeroExp::shared().getLevel( exp );

	auto heroIcons = [this, content]()
	{
		_itemHero[0]->setEnabled( _currentHero != 0 );
		_itemHero[1]->setEnabled( _currentHero != 1 );
		_itemHero[2]->setEnabled( _currentHero != 2 );
	};
	auto level = [this, content, heroname, herolevel]()
	{
		auto progress = herolevel - (int)herolevel;
		_level->setString( "Level: " + intToStr( herolevel ) );
		_levelTimer->setPercentage( progress * 100.f );
	};
	auto skin = [this, content]()
	{
		auto skin = getNodeByPath<Sprite>( content, "skin" );
		auto name = getNodeByPath<Label>( content, "heroname" );
		std::string image = "heroroom::hero" + intToStr( _currentHero + 1 ) + "/skin.png";
		auto frame = ImageManager::shared().spriteFrame( image );
		skin->setSpriteFrame( frame );
		if( name )name->setString( WORD( ("heroname_" + intToStr( _currentHero )) ) );
	};
	auto skillItem = [this, content]()
	{
		for( int i = 0; i < 5; ++i )
		{
			auto item = getNodeByPath<mlMenuItem>( content, "menu/skill" + intToStr( i ) );
			assert( item );
			std::string imageN = "heroroom::hero" + intToStr( _currentHero + 1 ) + "/i" + intToStr( i + 1 ) + "1.png";
			std::string imageD = "heroroom::hero" + intToStr( _currentHero + 1 ) + "/i" + intToStr( i + 1 ) + "2.png";
			item->setImageNormal( imageN );
			item->setImageDisabled( imageD );
		}
	};
	auto skillDegree = [this, content, heroname]()
	{
		std::vector<unsigned> skills;
		HeroExp::shared().skills( heroname, skills );
		int i = 0;
		for( auto skill : skills )
		{
			std::vector<std::string> frames =
			{
				"heroroom::skill_progress_0.png",
				"heroroom::skill_progress_1.png",
				"heroroom::skill_progress_2.png",
				"heroroom::skill_progress_3.png",
			};

			std::string framename;
			if( i == 4 ) framename = (skill == 3 ? frames[3] : frames[2]);
			else framename = (skill == 3 ? frames[1] : frames[0]);

			auto node = getNodeByPath<Node>( content, "skills/skill" + intToStr( i ) );
			for( unsigned k = 0; k < 3; ++k )
			{
				auto degree = node->getChildByName<Sprite*>( "degree" + intToStr( k ) );
				degree->setVisible( k < skill );
				auto frame = ImageManager::shared().spriteFrame( framename );
				degree->setSpriteFrame( frame );
			}
			auto level = node->getChildByName<Sprite*>( "level" );
			if( skill > 0 )
			{
				std::string image = "heroroom::j" + intToStr(skill) + ".png";
				auto frame = ImageManager::shared().spriteFrame( image );
				level->setVisible( true );
				level->setSpriteFrame( frame );
			}
			else
			{
				level->setVisible( false );
			}
			++i;
		}
	};
	auto skillPoints = [this, content, heroname]()
	{
		auto points = HeroExp::shared().skillPoints( heroname );
		auto nodepoint = getNodeByPath<Label>( content, "points" );
		nodepoint->setString( intToStr( points ) );
	};
	auto setCostBuyLevel = [this]()
	{
		bool isCurrentHeroSelected = UserData::shared().hero_getCurrent() == _currentHero;
		auto cost = this->getBuyLevelCost();
		auto select = getNodeByPath( this, "content/menu/select" );
		auto costNode0 = getNodeByPath<Label>( this, "content/menu/buylevel/normal/cost" );
		auto costNode1 = getNodeByPath<Label>( this, "content/menu/buylevel/disabled/cost" );
		if( costNode0 ) costNode0->setString( intToStr( cost ) );
		if( costNode1 ) costNode1->setString( intToStr( cost ) );
		if( select ) select->setVisible( !isCurrentHeroSelected );
	};
	auto checkAvailabled = [this, heroname, herolevel]()
	{
		bool isCurrentHeroSelected = UserData::shared().hero_getCurrent() == _currentHero;
		bool isBought = HeroExp::shared().isHeroAvailabled( heroname );
		bool asInapp = HeroExp::shared().isHeroAsInapp( heroname );
		unsigned level = HeroExp::shared().getLevelForUnlockHero( heroname );
		auto select = getNodeByPath( this, "content/menu/select" );
		auto buyhero = getNodeByPath( this, "content/menu/buyhero" );
		auto restore = getNodeByPath( this, "content/menu/restore" );
		auto buylevel = getNodeByPath<MenuItem>( this, "content/menu/buylevel" );
		auto levelnumbertext = getNodeByPath<Label>( this, "content/levelnumbertext" );
		auto train = getNodeByPath<MenuItem>( this, "content/menu/train" );
		auto reset = getNodeByPath<MenuItem>( this, "content/menu/reset" );

		if( select )select->setVisible( isBought && !isCurrentHeroSelected );
		if( buylevel )buylevel->setVisible( isBought && isCurrentHeroSelected && herolevel < HeroExp::shared().getMaxLevel() );
		if( train )train->setVisible( isBought );
		if( reset )reset->setVisible( isBought );
		if( buyhero )buyhero->setVisible( !isBought && asInapp );
		if( restore )restore->setVisible( !isBought && asInapp );
		if( levelnumbertext )levelnumbertext->setVisible( !isBought && !asInapp && level > 0 );
		
		if( isBought == false )
		{
			if( asInapp )
			{
				auto details = HeroExp::shared().getHeroSkuDetails( heroname );
				if( details.result == inapp::Result::Ok )
				{
					std::string string = details.priceText;
					auto costnode = getNodeByPath<Label>( this, "content/menu/buyhero/normal/cost" );
					if( costnode )costnode->setString( string );
				}
			}
			else if( level > 0 )
			{
				if( levelnumbertext )
				{
					std::string text = "#complitelevelforunlock_" + intToStr( level ) + "#";
					levelnumbertext->setString( WORD(text) );
				}
			}
		}
	};

	heroIcons();
	level();
	skin();
	skillItem();
	skillDegree();
	skillPoints();
	setCostBuyLevel();
	checkAvailabled();

	selectSkill( 0 );
}

void SelectHero::selectSkill( unsigned index )
{
	_currentSkill = index;
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	std::vector<unsigned> skills;
	HeroExp::shared().skills( heroname, skills );
	auto points = HeroExp::shared().skillPoints( heroname );

	auto content = getChildByName( "content" );
	auto icon = [this, content]()
	{
		auto nodeicon = getNodeByPath<Sprite>( content, "skills/icon" );
		std::string image = "heroroom::hero" + intToStr( _currentHero + 1 ) + "/i" + intToStr( _currentSkill + 1 ) + "1.png";
		auto frame = ImageManager::shared().spriteFrame( image );
		nodeicon->setSpriteFrame( frame );
	};
	auto desc = [this, content, heroname]()
	{
		auto nodename = getNodeByPath<Label>( content, "skills/name" );
		auto nodedesc = getNodeByPath<Label>( content, "skills/desc" );
		std::string skillname = "skill" + intToStr( _currentSkill + 1 );
		std::string nameID = "#heroskill_" + heroname + "_" + skillname + "_name#"; //heroskill_heroN_skillM_name
		std::string descID = "#heroskill_" + heroname + "_" + skillname + "_desc#"; //heroskill_heroN_skillM_desc
		std::string name = Language::shared().string( nameID );
		std::string desc = Language::shared().string( descID );
		nodename->setString( name );
		nodedesc->setString( desc );
	};
	auto enable = [this, content]()
	{
		for( int i = 0; i < 5; ++i )
		{
			auto item = getNodeByPath<MenuItem>( content, "menu/skill" + intToStr( i ) );
			item->setEnabled( i != _currentSkill );
		}
	};
	auto enableTrain = [this, content, skills, points]()
	{
		auto item = getNodeByPath<MenuItem>( content, "menu/train" );
		bool enabled = skills[_currentSkill] < 3;
		enabled = enabled && points > 0;
		item->setEnabled( enabled );
	};

	icon();
	desc();
	enable();
	enableTrain();
	TutorialManager::shared().dispatch( "hero_skillselect" );
}

void SelectHero::reset()
{
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	std::vector<unsigned> skills( 5 );
	HeroExp::shared().setSkills( heroname, skills );

	auto skill = _currentSkill;
	fetch( _currentHero );
	selectSkill( skill );
}

void SelectHero::train()
{
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	std::vector<unsigned> skills;
	HeroExp::shared().skills( heroname, skills );
	skills[_currentSkill]++;
	HeroExp::shared().setSkills( heroname, skills );

	auto skill = _currentSkill;
	fetch( _currentHero );
	selectSkill( skill );

	TutorialManager::shared().dispatch( "hero_skilltrain" );
}

void SelectHero::select()
{
	UserData::shared().hero_setCurrent( _currentHero );
	fetch( _currentHero );
}

void SelectHero::buylevel()
{
	auto cost = getBuyLevelCost();
	auto scores = ScoreCounter::shared().getMoney( kScoreCrystals );
	if( cost <= scores )
	{
		ScoreCounter::shared().subMoney( kScoreCrystals, cost, true );
		auto heroname = "hero" + intToStr( _currentHero + 1 );
		auto exp = HeroExp::shared().getEXP( heroname );
		auto level = HeroExp::shared().getLevel( exp );
		exp = HeroExp::shared().getHeroLevelExtValue( level );
		HeroExp::shared().setEXP( heroname, exp );
		fetch( _currentHero );
	}
	else
	{
#if PC == 1
#else
		auto shop = ShopLayer::create( false, true, false, true );
		if( shop )
		{
			SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
			scene->pushLayer( shop, true );
		}
#endif
	}
}

void SelectHero::appearance()
{
	runEvent( "onenter" );
}

void SelectHero::disappearance()
{
	runEvent( "onexit" );
}

void SelectHero::buyHero()
{
#if PC == 1
#else
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	auto skuDetails = HeroExp::shared().getHeroSkuDetails( heroname );
	if( skuDetails.result == inapp::Result::Ok )
	{
		auto callback = [this]( int, int, SelectHero* selectHero)
		{
			selectHero->fetch( selectHero->_currentHero );
		};
		ShopLayer::observerOnPurchase().add( _ID, std::bind( callback, std::placeholders::_1, std::placeholders::_2, this ) );
		inapp::purchase( skuDetails.productId );
	}
#endif
}

void SelectHero::restore()
{
#if PC == 1
#else
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	auto skuDetails = HeroExp::shared().getHeroSkuDetails( heroname );
	if( skuDetails.result == inapp::Result::Ok )
	{
		auto callback = [this]( int, int, SelectHero* selectHero)
		{
			selectHero->fetch( selectHero->_currentHero );
		};
		ShopLayer::observerOnPurchase().add( _ID, std::bind( callback, std::placeholders::_1, std::placeholders::_2, this ) );
		inapp::restore( skuDetails.productId );
	}
#endif
}

unsigned SelectHero::getBuyLevelCost()const
{
	unsigned maxlevel = HeroExp::shared().getMaxLevel();
	auto heroname = "hero" + intToStr( _currentHero + 1 );
	auto exp = HeroExp::shared().getEXP( heroname );
	unsigned level = HeroExp::shared().getLevel( exp );
	return level < maxlevel ? HeroExp::shared().getCostLevelup(level) : 0;
}

NS_CC_END
