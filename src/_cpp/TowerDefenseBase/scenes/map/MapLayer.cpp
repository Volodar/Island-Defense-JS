//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "MapLayer.h"
#include "UserData.h"
#include "ml/ImageManager.h"
#include "ml/MenuItemWithText.h"
#include "ml/Audio/AudioEngine.h"
#include "ml/loadxml/xmlProperties.h"
#include "ShopLayer.h"
#include "GameGS.h"
#include "ScoreCounter.h"
#include "resources.h"
#include "support.h"
#include "Laboratory.h"
#include "ScoreLayer.h"
#include "Tutorial.h"
#include "configuration.h"
#include "consts.h"
#include "tower.h"
#include "scenes/itemshop/ItemShop.h"
#include "selecthero/SelectHero.h"
#include "RateMeLayer.h"
#include "Language.h"
#include "MenuItemWithText.h"
#include "LoadLevelScene.h"
#include "BuyHeroes.h"
#include "MenuItemTextBG.h"
#include "AutoPlayer.h"
#include "playservices/playservices.h"

NS_CC_BEGIN

auto setKeyDispatcher = []( LayerExt* layer )
{
	EventListenerKeyboard * event = EventListenerKeyboard::create();
	event->onKeyReleased = std::bind(
									 [layer](EventKeyboard::KeyCode key, Event*)mutable
									 {
										 if( key == EventKeyboard::KeyCode::KEY_BACK )
											 layer->runEvent( "onexit" );
									 }, std::placeholders::_1, std::placeholders::_2);
	
	layer->getEventDispatcher()->addEventListenerWithSceneGraphPriority(event, layer);
};


SmartScene::Pointer MapLayer::scene()
{
	do
	{
		auto layer = MapLayer::create();
		auto score = ScoreLayer::create();
		CC_BREAK_IF( !layer );
		CC_BREAK_IF( !score );
		auto scene = SmartScene::create( layer );
		scene->setName( "MapScene" );
		scene->addChild( score, 999 );
		
		return scene;
	}
	while( false );
	return nullptr;
}

void MapLayer::prepairNodeByConfiguration( NodeExt* nodeext )
{
	if( nodeext == nullptr )
		return;
	auto node = nodeext->as_node_pointer();
	auto pathto_leaderboards = nodeext->getParamCollection().get( "pathto_leaderboards", "unknowpath" );
	
	auto leaderboards = getNodeByPath( node, pathto_leaderboards );
	if( leaderboards )
		leaderboards->setVisible( k::configuration::useLeaderboards );
}

MapLayer::MapLayer()
: _updateLocations( true )
, _showLaboratoryOnEnter( false )
, _selectedLevelIndex( -1 )
, _isTouching(false)
#ifdef WIN32
, _editMode(false)
, _editPoint(nullptr)
#endif
{
	setName( "maplayer" );
}

MapLayer::~MapLayer()
{
	MouseHoverScroll::shared().setNode( nullptr );
	MouseHoverScroll::shared().setScroller( nullptr );
}

bool MapLayer::init()
{
	do
	{
		CC_BREAK_IF( !Layer::init() );
		CC_BREAK_IF( !NodeExt::init() );
		setKeyboardEnabled( true );
		
		NodeExt::load( "ini/map", "maplayer.xml" );
		prepairNodeByConfiguration( this );
		
		_map = getChildByName( "map" );
		CC_BREAK_IF( !_map );
	
		_scrollInfo = make_intrusive<ScrollTouchInfo>();
		_scrollInfo->node = _map;
		
		//        removeChild(_map);
		//
		//        auto sv = ScrollView::create(Director::getInstance()->getWinSize(), _map);
		//        sv->setClippingToBounds(true);
		//        sv->setBounceable(false);
		//
		//        _scrollView = sv;
		//        addChild(_scrollView);
		
		_menuLocations = ScrollMenu::create();
		_menuLocations->setName( "locations" );
		_menuLocations->setPosition( Point::ZERO );
		_map->addChild( _menuLocations, 1 );

		float scale = Director::getInstance()->getOpenGLView()->getDesignResolutionSize().height /
			_map->getContentSize().height;
		_map->setScale( scale );
		
		removeUnUsedButtons();
		
		auto touchL = EventListenerTouchAllAtOnce::create();
		touchL->onTouchesBegan = CC_CALLBACK_2( MapLayer::scrollBegan, this );
		touchL->onTouchesMoved = CC_CALLBACK_2( MapLayer::scrollMoved, this );
		touchL->onTouchesEnded = CC_CALLBACK_2( MapLayer::scrollEnded, this );
		_eventDispatcher->addEventListenerWithSceneGraphPriority( touchL, this );
		
		activateLocations();

		createDevMenu();

#if PC == 1
		MouseHoverScroll::shared().setScroller( _scrollInfo );
		MouseHoverScroll::shared().setNode( _map );
#endif
		return true;
	}
	while( false );
	return false;
}

void MapLayer::displayLeaderboardScore()
{
	auto pathto_score = getParamCollection().get( "pathto_leaderboardsscore", "unknowpath" );
	auto scoreNode = getNodeByPath<Label>( this, pathto_score );
	if( scoreNode )
	{
		auto score = Leaderboard::shared().getScoreGlobal();
		auto string = intToStr( score );
		size_t k = string.size();
		while( k > 3 )
		{
			k -= 3;
			string.insert( k, " " );
		}

		scoreNode->setString( WORD("leaderboard_score") + string );
	}
}

void MapLayer::removeUnUsedButtons()
{
	auto menu = getChildByName( "menu" );
	if( menu )
	{
		auto shop = menu->getChildByName<MenuItem*>( "shop" );
		auto paid = menu->getChildByName<MenuItem*>( "paid" );
		auto heroes = menu->getChildByName<MenuItem*>("heroes");
		
		if( paid && k::configuration::useLinkToPaidVersion == false )
			paid->setVisible( false );
		if( shop && k::configuration::useInapps == false ) {
			shop->setVisible( false );
			auto ishop = menu->getChildByName<MenuItem*>("itemshop");
			ishop->setPosition(shop->getPosition());
		}
		if (heroes && k::configuration::useHero == false)
			heroes->setVisible(false);
	}
}

void MapLayer::onEnter()
{
	Layer::onEnter();

	this->scheduleUpdate();
#if PC == 1
	MouseHoverScroll::shared().enable();
#endif
	
	AudioEngine::shared().playMusic( kMusicMap );
	//else if( _updateLocations )
	//{
	//	activateLocations();
	//}
	
	if (k::configuration::useInapps == false) {
		SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
		auto scores = scene->getChildByName("scorelayer");
		if(scores)
		{
			auto menu = scores->getChildByName("menu");
			auto shop = menu->getChildByName("shop");
			if (shop) {
				shop->setVisible(false);
				shop->setPositionY(-9999);
			}
		}
	}
	
	int result = UserData::shared().get_int( k::user::LastGameResult, k::user::GameResultValueNone );
	if( result == k::user::GameResultValueWin )
		activateLocations();
	
	if( _menuLocations )
		_menuLocations->setEnabled( true );
	
	
	auto notifyOnEnter = []() {
		TutorialManager::shared().dispatch( "map_onenter" );
	};
	auto notifyGameResult = [this](){
		
		bool dispatched( false );
		
		int countlose = UserData::shared().get_int( "lose_counter", 0 );
		int result = UserData::shared().get_int( k::user::LastGameResult, k::user::GameResultValueNone );
		
		if( result == k::user::GameResultValueWin )
		{
			countlose = 0;

			std::list<std::string> towers;
			mlTowersInfo::shared().fetch( towers );
			std::string towername = towers.front();
			int level = UserData::shared().tower_upgradeLevel( towername );
			int scores = ScoreCounter::shared().getMoney( kScoreCrystals );
			int cost = mlTowersInfo::shared().getCostLab( towername, level + 1 );
			if(level < 3 && cost <= scores )
			{
				dispatched = TutorialManager::shared().dispatch( "map_afterwin" );
			}
			if( dispatched == false )
			{
				dispatched = TutorialManager::shared().dispatch( "map_showheroroom" );
			}
			if( dispatched == false ) {
				if (k::configuration::useInapps) {
					//prevent showing lab when shop is not able
					dispatched = TutorialManager::shared().dispatch( "map_afterwin_force" );
				} else {
					dispatched = true;
				}
			}
		}
		if( result == k::user::GameResultValueFail )
		{
			countlose++;
			dispatched = TutorialManager::shared().dispatch( "map_afterlose" );
		}
		if( countlose > 0 )
		{
			if( TutorialManager::shared().dispatch( "map_losenumber" + intToStr( countlose ) ) )
			{
				dispatched = true;
				countlose = 0;
			}
			UserData::shared().write( "lose_counter", countlose );
		}
		UserData::shared().write( k::user::LastGameResult, k::user::GameResultValueNone );
		
		
		if( !dispatched && _showLaboratoryOnEnter )
		{
			_showLaboratoryOnEnter = false;
			auto run = [this]()
			{
				bool maxlevel = true;
				std::list<std::string> towers;
				mlTowersInfo::shared().fetch( towers );
				for( auto tower : towers )
					maxlevel = maxlevel && UserData::shared().tower_upgradeLevel(tower) == 5;
				if( !maxlevel )
				{
					cb_lab( nullptr );
				}
			};
			runAction( CallFunc::create( std::bind( run ) ) );
		}
		
	};
	
	runAction( CallFunc::create( notifyOnEnter ) );
	
	int levelResult = UserData::shared().get_int( k::user::LastGameResult, k::user::GameResultValueNone );
	bool leveFinished =
	levelResult == k::user::GameResultValueWin ||
	levelResult == k::user::GameResultValueFail;
	if( leveFinished )
	{
		runAction( CallFunc::create( notifyGameResult ) );
	}
	
	if (levelResult == k::user::GameResultValueWin) {
		openRateMeWindowIfNeeded();
	}
	
	displayLeaderboardScore();
	createPromoMenu();
}

void MapLayer::onExit()
{
	Layer::onExit();
	this->unscheduleUpdate();
#if PC == 1
	MouseHoverScroll::shared().disable();
#endif
}

void MapLayer::load( const pugi::xml_node & root )
{
	NodeExt::load( root );
	
	auto xmlLocations = root.child( "locations" );
	FOR_EACHXML( xmlLocations, xmlLocation )
	{
		Location loc;
		loc.pos = strToPoint( xmlLocation.attribute( "pos" ).as_string() );
		loc.posLock = strToPoint( xmlLocation.attribute( "poslock" ).as_string() );
		loc.a = strToPoint( xmlLocation.attribute( "controlA" ).as_string() );
		loc.b = strToPoint( xmlLocation.attribute( "controlB" ).as_string() );
		loc.starsForUnlock = xmlLocation.attribute( "stars" ).as_int( 0 );
		loc.unlockFrame = xmlLocation.attribute( "unlockframe" ).as_string();
		loc.unlockText = xmlLocation.attribute( "unlocktext" ).as_string();
		
		//temp
		_locations.push_back( loc );
	}
}

ccMenuCallback MapLayer::get_callback_by_description( const std::string & name )
{
	if( name == "back" )
		return CC_CALLBACK_1( MapLayer::cb_back, this );
	else if( name == "laboratory" )
		return CC_CALLBACK_1( MapLayer::cb_lab, this );
	else if( name == "itemshop" )
		return CC_CALLBACK_1( MapLayer::cb_itemshop, this );
	else if( name == "shop" )
		return CC_CALLBACK_1( MapLayer::cb_shop, this );
	else if( name == "heroes" )
	{
		auto cb = [this](Ref*)
		{
			auto window = SelectHero::create();
			if( window )
			{
				SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
				scene->pushLayer( window, true );
				TutorialManager::shared().dispatch( "map_openheroes" );
			}
		};
		return std::bind( cb, std::placeholders::_1 );
	}
	else if( name == "paidversion" )
		return CC_CALLBACK_1( MapLayer::cb_paidversion, this );
	else if( name == "pushgame_normalmode" )
		return std::bind( &MapLayer::cb_game, this, std::placeholders::_1, GameMode::normal );
	else if( name == "pushgame_hardmode" )
		return std::bind( &MapLayer::cb_game, this, std::placeholders::_1, GameMode::hard );
	else if( name == "unlock" )
		return std::bind( &MapLayer::cb_unlock, this, std::placeholders::_1 );
	else if( name == "leaderboard" )
		return std::bind( []( Ref* ){Leaderboard::shared().openGLobal(); }, std::placeholders::_1 );
	else if( name == "leaderboard_level" )
		return std::bind( [this]( Ref* ){Leaderboard::shared().openLevel( _selectedLevelIndex ); }, std::placeholders::_1 );
	return nullptr;
}

void MapLayer::scrollBegan( const std::vector<Touch*> & touches, Event * event )
{
#ifdef WIN32
	_editMode = (GetAsyncKeyState( VK_SPACE ) != 0);
	if( _editMode )
	{
		touchEditModeBegan( touches, event );
		return;
	}
#endif
	Touch* touch = touches[0];
	_scrollInfo->node = _map;
	_scrollInfo->nodeposBegan = _map->getPosition();
	_scrollInfo->touchBegan = touch->getLocation();
	_scrollInfo->touchID = touch->getID();
	
	_isTouching = true;
}

void MapLayer::scrollMoved( const std::vector<Touch*> & touches, Event * event )
{
#ifdef WIN32
	_editMode = (GetAsyncKeyState( VK_SPACE ) != 0);
	if( _editMode )
	{
		touchEditModeMoved( touches, event );
		return;
	}
#endif
#if PC != 1
	Touch* touch = touches[0];
	if( touch && _scrollInfo->node )
	{
		Point location = touch->getLocation();
		Point shift = location - _scrollInfo->touchBegan;
		Point pos = _scrollInfo->nodeposBegan + shift;
		Size winsize = Director::getInstance()->getWinSize();
		Point fitpos = _scrollInfo->fitPosition( pos, winsize );
		
		_scrollInfo->lastShift = Point( 0, 0 );
		_scrollInfo->node->setPosition( fitpos );
		
		_unfilteredVelocity = shift;
	}
#endif
}

void MapLayer::scrollEnded( const std::vector<Touch*> & touches, Event * event )
{
#ifdef WIN32
	if( _editMode )
	{
		touchEditModeEnded( touches, event );
		return;
	}
#endif
	_isTouching = false;
	_velocity *= 0.2f;
}

void MapLayer::mouseHover(Event*event)
{
}

#ifdef WIN32
void MapLayer::touchEditModeBegan( const std::vector<Touch*> & touch, Event * event )
{
	_editPoint = nullptr;
	for( auto& loc : _locations )
	{
		auto p = _map->getPosition();
		
		if( (loc.pos * _map->getScale() + p).getDistance( touch.front()->getLocation() ) < 10 )
			_editPoint = &loc.pos;
		else if( (loc.a * _map->getScale() + p).getDistance( touch.front()->getLocation() ) < 10 )
			_editPoint = &loc.a;
		else if( (loc.b * _map->getScale() + p).getDistance( touch.front()->getLocation() ) < 10 )
			_editPoint = &loc.b;
	}
}

void MapLayer::touchEditModeMoved( const std::vector<Touch*> & touch, Event * event )
{
	if( _editPoint )
	{
		*_editPoint += touch.front()->getDelta() * _map->getScale();
		
		
		for( auto node : _curveMarkers )
			node->removeFromParent();
		_curveMarkers.clear();
		for( unsigned i = 0; i < _locations.size(); ++i )
			buildCurve( i, false );
	}
}

void MapLayer::touchEditModeEnded( const  std::vector<Touch*> & touch, Event * event )
{
	_editPoint = nullptr;
	activateLocations();
	
	auto doc = std::make_shared<pugi::xml_document>();
	doc->load_file( "ini/map/maplayer.xml" );
	auto root = doc->root().first_child();
	root.remove_child( "locations" );
	root = root.append_child( "locations" );
	for( auto& loc : _locations )
	{
		auto node = root.append_child( "location" );
		node.append_attribute( "pos" ).set_value( pointToStr( loc.pos ).c_str() );
		node.append_attribute( "controlA" ).set_value( pointToStr( loc.a ).c_str() );
		node.append_attribute( "controlB" ).set_value( pointToStr( loc.b ).c_str() );
	}
	
	doc->save_file( "ini/map/maplayer.xml" );
}

void MapLayer::visit( Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags )
{
	Layer::visit( renderer, parentTransform, parentFlags );
	if( isTestModeActive() )
	{
		_editMode = (GetAsyncKeyState( VK_SPACE ) != 0);

		std::vector<Point> points;
		if( _editMode )
		{
			renderer->render();
			for( auto loc : _locations )
			{
				auto p = _map->getPosition();
				DrawPrimitives::drawCircle( loc.pos * _map->getScale() + p, 5, 0, 4, false );
				DrawPrimitives::drawCircle( loc.a * _map->getScale() + p, 5, 0, 4, false );
				DrawPrimitives::drawCircle( loc.b * _map->getScale() + p, 5, 0, 4, false );
				points.push_back( loc.pos * _map->getScale() + p );
				points.push_back( loc.a * _map->getScale() + p );
				points.push_back( loc.b * _map->getScale() + p );
			}
			DrawPrimitives::drawPoly( points.data(), points.size(), false );
			renderer->render();
		}
		_menuLocations->setEnabled( !_editMode );
	}
}
#endif

void MapLayer::update(float delta)
{
	if (_isTouching)
	{
		//        if ((_velocity.x < 0 && _unfilteredVelocity.x > 0) ||
		//            (_velocity.x > 0 && _unfilteredVelocity.x < 0)) {
		//            _velocity.x = 0;
		//        }
		//        if ((_velocity.y < 0 && _unfilteredVelocity.y > 0) ||
		//            (_velocity.y > 0 && _unfilteredVelocity.y < 0)) {
		//            _velocity.y = 0;
		//        }
#if PC != 1
		const float kFilterAmount = 0.25f;
		_velocity = (_velocity * kFilterAmount) + (_unfilteredVelocity * (1.0f - kFilterAmount));
		_unfilteredVelocity = Point(0,0);
#endif
	}
	else
	{
		if (!_scrollInfo->node) return;
		_velocity *= 0.95f;
		Size winsize = Director::getInstance()->getOpenGLView()->getDesignResolutionSize();
		
		if (_velocity.getLength() > 0.01f)
		{
			Point pos = _scrollInfo->node->getPosition() + _velocity;
			Point fitpos = _scrollInfo->fitPosition(pos, winsize);
			_scrollInfo->node->setPosition(fitpos);
		}
	}
#if PC == 1
	MouseHoverScroll::shared().update( delta );
#endif
}

void MapLayer::showWindow( NodePointer window )
{
	auto gl = Director::getInstance()->getOpenGLView();
	auto dessize = gl->getDesignResolutionSize();
	
	auto scene = getScene();
	scene->addChild( window, getLocalZOrder() + 2 );
	onExit();
	
	auto shadow = ImageManager::sprite( kPathSpriteSquare );
	if( shadow )
	{
		shadow->setName( "shadow" );
		shadow->setScaleX( dessize.width );
		shadow->setScaleY( dessize.height );
		shadow->setColor( Color3B( 0, 0, 0 ) );
		shadow->setOpacity( 0 );
		shadow->setPosition( Point( dessize / 2 ) );
		scene->addChild( shadow, getLocalZOrder() + 1 );
		shadow->runAction( FadeTo::create( 0.2f, 204 ) );
	}
}

void MapLayer::windowDidClosed()
{
	onEnter();
	
	auto scene = getScene();
	auto shadow = scene->getChildByName( "shadow" );
	if( shadow )
	{
		auto destroyer = std::bind( &Node::removeFromParent, shadow );
		auto a0 = FadeTo::create( 0.2f, 0 );
		auto a1 = CallFunc::create( destroyer );
		shadow->runAction( Sequence::createWithTwoActions( a0, a1 ) );
	}
}

void MapLayer::openRateMeWindowIfNeeded()
{
	if (!k::configuration::useRateMe) return;
	
	int wincounter = UserData::shared().get_int(k::user::GameWinCounter);
	if (wincounter % 3) return;
	
	//open RateMe with delay
	auto call = CallFunc::create([this](){
		auto scene = static_cast<SmartScene*>(getScene());
		auto layer = RateMeLayer::create();
		if (layer) {
			scene->pushLayer(layer, true);
		}
	});
	auto delay = DelayTime::create(0.3f);
	runAction(Sequence::createWithTwoActions(delay, call));
}

void MapLayer::cb_back( Ref*sender )
{
	Director::getInstance()->popScene();
}

void MapLayer::cb_shop( Ref*sender )
{
#if PC != 1
	auto shop = ShopLayer::create(k::configuration::useFreeFuel, true, false, false);
	if( shop )
	{
		SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
		scene->pushLayer( shop, true );
		
		TutorialManager::shared().dispatch( "map_openshop" );
	}
#endif
}

void MapLayer::cb_paidversion( Ref*sender )
{
	//openUrl( k::configuration::paidVersionUrl );
	auto layer = BuyHeroes::create();
	auto scene = dynamic_cast<SmartScene*>(getScene());
	if( scene && layer )
		scene->pushLayer( layer, true );
}

void MapLayer::cb_lab( Ref*sender )
{
	SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
	auto layer = Laboratory::create();
	scene->pushLayer( layer, true );
	
	TutorialManager::shared().dispatch( "map_openlab" );
}

void MapLayer::cb_itemshop( Ref*sender )
{
	SmartScene * scene = dynamic_cast<SmartScene*>(getScene());
	auto layer = ItemShop::create();
	scene->pushLayer( layer, true );
	
	TutorialManager::shared().dispatch( "map_openitemshop" );
}

void MapLayer::cb_game( Ref*sender, GameMode mode )
{
	auto choose = getScene()->getChildByName<LayerExt*>( "choose" );
	
	if( _menuLocations )
		_menuLocations->setEnabled( false );
	
	int cost = LevelParams::shared().getFuel( _selectedLevelIndex, false );
	int fuel = ScoreCounter::shared().getMoney( kScoreFuel );
	if( fuel < cost )
	{
		if(!k::configuration::useInapps || !TutorialManager::shared().dispatch( "map_haventfuel" ) )
		{
			cb_shop( sender );
			if( k::configuration::useInapps == false )
			{
				_menuLocations->setEnabled( true );
			}
		}
		if( choose )
			choose->runEvent( "onexit" );
	}
	else
	{
		TutorialManager::shared().dispatch( "map_rungame" );
		_updateLocations = true;
		
		//auto game = GameGS::createScene();
		//GameGS::getInstance()->getGameBoard().loadLevel( _selectedLevelIndex, mode );
		//Director::getInstance()->pushScene( game );
		
		runLevel( _selectedLevelIndex, mode );

		if( choose )
			choose->removeFromParent();
		
		_showLaboratoryOnEnter = true;
	}
	
}

void MapLayer::cb_gamelock( Ref*sender, int index )
{
	_selectedLevelIndex = index;
	
	auto layer = buildUnlockWindow( index );
	SmartScene * scene = static_cast<SmartScene*>(getScene());
	assert( scene );
	scene->pushLayer( layer, true );
}

void MapLayer::cb_showChoose( Ref*sender, int index )
{
	_selectedLevelIndex = index;
	
	auto layer = buildChooseWindow( index );
	if( layer )
	{
		SmartScene * scene = static_cast<SmartScene*>(getScene());
		assert( scene );
		scene->pushLayer( layer, true );
		
		TutorialManager::shared().dispatch( "map_onchoose" );
	}
	else
	{
		cb_game( sender, GameMode::normal );
	}
}

void MapLayer::cb_unlock( Ref*sender )
{
	UserData::shared().write( k::user::LevelUnlocked + intToStr( _selectedLevelIndex ), true );
	ScoreCounter::shared().subMoney( kScoreStars, _locations[_selectedLevelIndex].starsForUnlock, true );
	activateLocations();
	auto choose = getScene()->getChildByName<LayerExt*>( "choose" );
	if( choose )
	{
		choose->runEvent( "onexit" );
	}
}

void MapLayer::runLevel( int levelIndex, GameMode mode )
{
	if( levelIndex < static_cast<int>(_locations.size()) )
	{
		auto loadScene = LoadLevelScene::create( levelIndex, mode );
		Director::getInstance()->pushScene( loadScene );
	}
	else
	{
		auto player = AutoPlayer::getInstance();
		if( player )
		{
			Director::getInstance()->getScheduler()->unscheduleAllForTarget( player );
			player->release();
		}
	}
	UserData::shared().save();
}

void MapLayer::activateLocations()
{
	for( auto node : _curveMarkers )
	{
		node->removeFromParent();
	}
	_curveMarkers.clear();
	
	unsigned passed = UserData::shared().level_getCountPassed();
	_menuLocations->removeAllItems();
	
	bool showpath( false );
	std::string key = "map_level_" + intToStr( passed ) + "_pathshowed";
	showpath = UserData::shared().get_int( key ) == 0;
	
	float predelayLastFlagAppearance = (showpath && passed > 0) ? 4 : 0.5f;
	xmlLoader::macros::set( "flag_delay_appearance", floatToStr( predelayLastFlagAppearance ) );
	
	for( unsigned i = 0; i < _locations.size() && i <= passed; ++i )
	{
		int fuel = LevelParams::shared().getFuel( i, false );
		xmlLoader::macros::set( "fuel_for_level", intToStr( fuel ) );
		auto flag = createFlag( i );
		_menuLocations->addItem( flag );
		buildCurve( i, showpath && i == passed );
		
		if( _locations[i].starsForUnlock > 0 )
		{
			TutorialManager::shared().dispatch( "unlocked_location" );
		}
	}
	
	xmlLoader::macros::erase( "flag_delay_appearance" );
	UserData::shared().write( key, 1 );
	
	_updateLocations = false;
}

std::vector<Point> buildPoints( Point a, Point b, Point c, Point d )
{
	std::vector<Point> points;
	std::vector<float> times;
	auto push = [&points, &times]( float time, Point point )mutable
	{
		points.push_back( point );
		times.push_back( time );
	};
	auto insert = [&points, &times]( int pos, float time, Point point )mutable
	{
		points.insert( points.begin() + pos, point );
		times.insert( times.begin() + pos, time );
	};
	auto K = []( Point L, Point R, Point S )
	{
		auto d0 = S - L;
		auto d1 = R - S;
		if( d0.length() < 5 )
			return false;
		float k0 = d0.y == 0 ? 0 : d0.x / d0.y;
		float k1 = d1.y == 0 ? 0 : d1.x / d1.y;
		return fabs( k0 - k1 ) > 0.2f;
	};
	push( 0.00, compute_bezier( a, b, c, d, 0.00 ) );
	push( 0.25, compute_bezier( a, b, c, d, 0.25 ) );
	push( 0.50, compute_bezier( a, b, c, d, 0.50 ) );
	push( 0.75, compute_bezier( a, b, c, d, 0.75 ) );
	push( 1.00, compute_bezier( a, b, c, d, 1.00 ) );
	
	bool exit2( false );
	unsigned currentIndex( 0 );
	while( currentIndex < points.size() - 1 )
	{
		exit2 = true;
		Point L = points[currentIndex];
		Point R = points[currentIndex + 1];
		float Ltime = times[currentIndex];
		float Rtime = times[currentIndex + 1];
		do
		{
			float t = (Ltime + Rtime) / 2.f;
			Point p = compute_bezier( a, b, c, d, t );
			if( K( L, R, p ) )
			{
				insert( currentIndex + 1, t, p );
				exit2 = false;
			}
			else
			{
				exit2 = true;
			}
			Rtime = t;
			R = p;
		}
		while( !exit2 );
		++currentIndex;
	}
	
	std::vector<Point> points2;
	Point P = points[0];
	unsigned index = 1;
	float D = 18;
	float E = 0;
	for( ; index < points.size(); ++index )
	{
		Point r = points[index] - P;
		while( r.getLength() > D - E )
		{
			Point rn = r.getNormalized();
			P = P + rn * (D);
			points2.push_back( P );
			E = 0;
			r = points[index] - P;
		}
		E += r.getLength();
	}
	
	return points2;
}

void MapLayer::buildCurve( int index, bool showpath )
{
	int passed = UserData::shared().level_getCountPassed();
	bool availabled = index <= passed;
	if( index == 0 ) return;
	if( availabled == false ) return;
	Point a = _locations[index - 1].pos;
	Point b = _locations[index - 1].a;
	Point c = _locations[index - 1].b;
	Point d = _locations[index].pos;
	
	
	auto points = buildPoints( a, b, c, d );
	int iteration( 0 );
	float kdelay = 2.f / points.size();
	for( auto point : points )
	{
		auto pointSprite = ImageManager::sprite( "images/map/point.png" );
		pointSprite->setPosition( point );
		_map->addChild( pointSprite );
		_curveMarkers.push_back( pointSprite );
		
		if( showpath )
		{
			auto delay = DelayTime::create( static_cast<float>(iteration)* kdelay + 2 );
			auto scale = EaseBackOut::create( ScaleTo::create( 0.2f, 1 ) );
			auto action = Sequence::createWithTwoActions( delay, scale );
			
			pointSprite->setScale( 0 );
			pointSprite->runAction( action );
		}
		++iteration;
	}
	
}

MenuItemImageWithText::Pointer MapLayer::createFlag( int index )
{
	const auto& location = _locations[index];
	Point position = location.pos;
	int passed = UserData::shared().level_getCountPassed();
	int levelStars = UserData::shared().level_getScoresByIndex( index );
	int levelStartIncludeHardMode = UserData::shared().get_int( k::user::LevelStars + intToStr( index ) );
	bool levelLocked = location.starsForUnlock > 0;
	levelLocked = levelLocked && (UserData::shared().get_bool( k::user::LevelUnlocked + intToStr( index ) ) == false);
	if( k::configuration::useStarsForUnlock == false )
	{
		levelLocked = false;
	}
	
	std::string path;
	ccMenuCallback callback;
	bool buildIndicator( false );
	std::string flagResource;
	flagResource = "flag_" + (levelStartIncludeHardMode <= 3 ? intToStr( levelStartIncludeHardMode ) : std::string( "hard" ));
	if( index < passed )
	{
		path = "ini/map/flag.xml";
	}
	else if( levelLocked )
	{
		buildIndicator = true;
		path = "ini/map/flag_locked.xml";
		position = location.posLock;
	}
	else
	{
		path = "ini/map/flag2.xml";
	}
	
	if( levelLocked == false )
	{
		callback = std::bind( &MapLayer::cb_showChoose, this, std::placeholders::_1, index );
	}
	else
	{
		callback = std::bind( &MapLayer::cb_gamelock, this, std::placeholders::_1, index );
	}
	
	xmlLoader::macros::set( "flag_position", pointToStr( position ) );
	xmlLoader::macros::set( "flag_image", flagResource );
	auto flagnode = xmlLoader::load_node( path );
	xmlLoader::macros::erase( "flag_position" );
	xmlLoader::macros::erase( "flag_image" );
	
	flagnode->setName( "flag" + intToStr( index ) );
	MenuItemImageWithText::Pointer flag;
	flag.reset( static_cast<MenuItemImageWithText*>(flagnode.ptr()) );
	flag->setCallback( callback );
	
	if( UserData::shared().get_int( "map_level_appearance" + intToStr( index ) + "_" + intToStr( levelStars ) ) == 0 )
	{
		if( index != passed )
		{
			UserData::shared().write( "map_level_appearance" + intToStr( index ) + "_" + intToStr( levelStars ), 1 );
		}
		flag->runEvent( "star" + intToStr( levelStars ) + "_show" );
	}
	else
	{
		flag->runEvent( "star" + intToStr( levelStars ) );
	}
	
	flag->setPosition( position );
	
	return flag;
}

LayerPointer MapLayer::buildChooseWindow( int level )
{
	auto load = [this]()
	{
		xmlLoader::bookDirectory( this );
		auto layer = xmlLoader::load_node<LayerExt>( "ini/map/choose.xml" );
		xmlLoader::unbookDirectory();
		return layer;
	};
	
	auto buildCloseMenu = [this]( LayerExt * layer )
	{
		auto item = MenuItemImage::create( "images/square.png", "images/square.png", 
			std::bind( [layer]( Ref* )mutable
			{
				layer->runEvent( "onexit" );
			},
			std::placeholders::_1 ) );
		item->getNormalImage()->setOpacity( 1 );
		item->getSelectedImage()->setOpacity( 1 );
		item->setScale( 9999 );
		auto menu = Menu::create( item, nullptr );
		layer->addChild( menu, -9999 );
	};
	
	auto buildPreviewLevel = [this, level]( Layer * layer )
	{
		const float kWidthPreview = 280;
		const float kHeightPreview = 270;
		auto sprite = ImageManager::sprite( "images/maps/map" + intToStr( level + 1 ) + ".jpg" );
		auto sx = kWidthPreview / sprite->getContentSize().width;
		auto sy = kHeightPreview / sprite->getContentSize().height;
		sprite->setScale( sx, sy );
		auto preview = getNodeByPath( layer, "preview" );
		preview->addChild( sprite, -1 );
	};
	
	auto setMacroses = [level]()
	{
		int costNormal = LevelParams::shared().getFuel( level, false );
		int costHard = LevelParams::shared().getFuel( level, true );
		int goldNorm = LevelParams::shared().getAwardGold( level, 3, false );
		int goldHard = LevelParams::shared().getAwardGold( level, 1, true );
		int gearNorm = LevelParams::shared().getStartGear( level, false );
		int gearHard = LevelParams::shared().getStartGear( level, true );
		int wavesNorm = LevelParams::shared().getWaveCount( level, false );
		int wavesHard = LevelParams::shared().getWaveCount( level, true );
		int livesNorm = LevelParams::shared().getLives( level, false );
		int livesHard = LevelParams::shared().getLives( level, true );
		std::string excludeNorm = "";
		std::string excludeHard = LevelParams::shared().getExclude(level, true);
		std::string caption = WORD("gamechoose_level") + intToStr( level + 1 );
		xmlLoader::macros::set( "cost_normalmode", intToStr( costNormal ) );
		xmlLoader::macros::set( "cost_hardmode", intToStr( costHard ) );
		xmlLoader::macros::set( "gold_normalmode", intToStr( goldNorm ) );
		xmlLoader::macros::set( "gold_hardmode", intToStr( goldHard ) );
		xmlLoader::macros::set( "gear_normalmode", intToStr( gearNorm ) );
		xmlLoader::macros::set( "gear_hardmode", intToStr( gearHard ) );
		xmlLoader::macros::set( "waves_normalmode", intToStr( wavesNorm ) );
		xmlLoader::macros::set( "waves_hardmode", intToStr( wavesHard ) );
		xmlLoader::macros::set( "lives_normalmode", intToStr( livesNorm ) );
		xmlLoader::macros::set( "lives_hardmode", intToStr( livesHard ) );
		xmlLoader::macros::set( "exclude_normalmode", excludeNorm );
		xmlLoader::macros::set( "exclude_hardmode", excludeHard );
		xmlLoader::macros::set( "preview_caption", caption );
		xmlLoader::macros::set( "use_fuel", boolToStr( k::configuration::useFuel ) );
		xmlLoader::macros::set( "unuse_fuel", boolToStr( !k::configuration::useFuel ) );
	};
	
	auto unsetMacroses = [level]()
	{
		xmlLoader::macros::erase( "cost_hardmode" );
		xmlLoader::macros::erase( "cost_normalmode" );
		xmlLoader::macros::erase( "gold_hardmode" );
		xmlLoader::macros::erase( "gold_normalmode" );
		xmlLoader::macros::erase( "gear_normalmode" );
		xmlLoader::macros::erase( "gear_hardmode" );
		xmlLoader::macros::erase( "waves_normalmode" );
		xmlLoader::macros::erase( "waves_hardmode" );
		xmlLoader::macros::erase( "lives_normalmode" );
		xmlLoader::macros::erase( "lives_hardmode" );
		xmlLoader::macros::erase( "exclude_normalmode" );
		xmlLoader::macros::erase( "exclude_hardmode" );
		xmlLoader::macros::erase( "preview_caption" );
	};
	
	auto buldStars = [level]( Layer * layer )
	{
		int starsN = 3;
		int starsH = LevelParams::shared().getMaxStars( level, true );
		std::list< std::string > normal;
		std::list< std::string > hard;
		auto pNormal = dynamic_cast<NodeExt*>(layer->getChildByName( "normal" ));
		auto pHard = dynamic_cast<NodeExt*>(layer->getChildByName( "hard" ));
		std::string image = pNormal->getParamCollection().at( "starimage" );
		split( normal, pNormal->getParamCollection().at( "star" + intToStr( starsN ) ) );
		split( hard, pHard->getParamCollection().at( "star" + intToStr( starsH ) ) );
		assert( normal.size() == starsN );
		assert( hard.size() == starsH );
		auto it = normal.begin();
		for( int i = 0; i < starsN; ++i )
		{
			Point pos = strToPoint( *(it++) );
			Sprite * star = ImageManager::sprite( image );
			assert( star );
			star->setPosition( pos );
			pNormal->getChildByPath( "stars" )->addChild( star );
		}
		it = hard.begin();
		for( int i = 0; i < starsH; ++i )
		{
			Point pos = strToPoint( *(it++) );
			Sprite * star = ImageManager::sprite( image );
			assert( star );
			star->setPosition( pos );
			pHard->getChildByPath( "stars" )->addChild( star );
		}
	};
	
	auto checkHardMode = [level]( LayerExt*layer )
	{
		int pass = UserData::shared().level_getCountPassed();
		bool locked = pass <= level;
		auto hard = layer->getChildByName( "hard" );
		auto hardlock = layer->getChildByName( "hard_lock" );
		hard->setVisible( !locked );
		hardlock->setVisible( locked );
		
	};
	
	setMacroses();
	auto layer = load();
	unsetMacroses();
	if( layer )
	{
		prepairNodeByConfiguration( layer );
		buildCloseMenu(layer);
		buildPreviewLevel(layer);
		buldStars(layer);
		checkHardMode(layer);
		setKeyDispatcher(layer);
		layer->runEvent("onenter");
	}
	return layer;
}

LayerPointer MapLayer::buildUnlockWindow( int level )
{
	auto load = [this]()
	{
		xmlLoader::bookDirectory( this );
		auto layer = xmlLoader::load_node<LayerExt>( "ini/map/unlock.xml" );
		xmlLoader::unbookDirectory();
		return layer;
	};
	auto buildCloseMenu = [this]( LayerExt * layer )
	{
		auto item = MenuItemImage::create( "images/square.png", "images/square.png", std::bind( [layer]( Ref* )mutable
																							   {
																								   layer->runEvent( "onexit" );
																							   },
																							   std::placeholders::_1 ) );
		item->getNormalImage()->setOpacity( 1 );
		item->getSelectedImage()->setOpacity( 1 );
		item->setScale( 9999 );
		auto menu = Menu::create( item, nullptr );
		layer->addChild( menu, -9999 );
	};
	auto buildIndicator = [this, level]( LayerExt*layer )
	{
		auto indicator = layer->getChildByName<Sprite*>( "progress_frame" );
		assert( indicator );
		Rect rect = indicator->getTextureRect();
		float defaultWidth = rect.size.width;
		int needStar = _locations[level].starsForUnlock;
		int stars = ScoreCounter::shared().getMoney( kScoreStars );
		float progress = std::min( 1.f, float( stars ) / float( needStar ) );
		float width = defaultWidth * progress;
		rect.size.width = width;
		indicator->setTextureRect( rect );
		
		auto label = layer->getChildByName<Label*>( "progress_text" );
		assert( label );
		label->setString( intToStr( stars ) + "/" + intToStr( needStar ) );
		
		auto cost = static_cast<Label*>(layer->getChildByPath( "menu/unlock/normal/text" ));
		auto cost2 = static_cast<Label*>(layer->getChildByPath( "menu/unlock_gray/normal/text" ));
		cost->setString( intToStr( needStar ) );
		cost2->setString( intToStr( needStar ) );
		
		auto button = static_cast<MenuItem*>(layer->getChildByPath( "menu/unlock" ));
		auto button_gray = static_cast<MenuItem*>(layer->getChildByPath( "menu/unlock_gray" ));
		if( stars < needStar )
		{
			button->setVisible( false );
			button_gray->setVisible( true );
		}
	};
	auto setMacroses = [level,this]()
	{
		xmlLoader::macros::set( "unlock_image", this->_locations[level].unlockFrame );
		xmlLoader::macros::set( "unlock_text", this->_locations[level].unlockText );
	};
	
	auto unsetMacroses = [level]()
	{
		xmlLoader::macros::erase( "unlock_image" );
		xmlLoader::macros::erase( "unlock_text" );
	};
	
	setMacroses();
	auto layer = load();
	unsetMacroses();
	if( layer )
	{
		buildCloseMenu( layer );
		buildIndicator( layer );
		layer->runEvent( "onenter" );
		setKeyDispatcher( layer );
	}
	return layer;
}

void MapLayer::onKeyReleased( EventKeyboard::KeyCode keyCode, Event* event )
{
	if( keyCode == EventKeyboard::KeyCode::KEY_BACK )
		Director::getInstance()->popScene();
 
	if( isTestDevice() && isTestModeActive() )
	{
		if( keyCode == EventKeyboard::KeyCode::KEY_F1 )
		{
			size_t pass = static_cast<size_t>(UserData::shared().level_getCountPassed());
			if( pass < _locations.size() )
			{
				pass = _locations.size();
				UserData::shared().level_setCountPassed( pass );
				for( size_t i = 0; i < pass; ++i )
				{
					UserData::shared().level_setScoresByIndex( i, 1 );
				}
				activateLocations();
			}
		}
		if( keyCode == EventKeyboard::KeyCode::KEY_F2 )
		{
			ScoreCounter::shared().addMoney( kScoreCrystals, 1000, true );
		}
		if( keyCode == EventKeyboard::KeyCode::KEY_F3 )
		{
			ScoreCounter::shared().addMoney( kScoreFuel, 50, true );
		}
		if( keyCode == EventKeyboard::KeyCode::KEY_1 ) { auto player = AutoPlayer::create( true, true, 1, false ); player->retain(); }
		if( keyCode == EventKeyboard::KeyCode::KEY_2 ) { auto player = AutoPlayer::create( true, false, 3, false ); player->retain(); }
		if( keyCode == EventKeyboard::KeyCode::KEY_3 ) { auto player = AutoPlayer::create( false, false, 99, true ); player->retain(); }
		if( keyCode == EventKeyboard::KeyCode::KEY_4 ) { auto player = AutoPlayer::create( false, false, 99, true ); player->retain(); player->setGameMode( GameMode::hard ); }
	}
}

void MapLayer::createPromoMenu()
{
	auto menu = getChildByName( "promomenu" );
	if( menu == nullptr && BuyHeroMenu::isShow() )
	{
		auto menu = BuyHeroMenu::create();
		if( menu )
			addChild( menu, 999 );
	}
	else if( menu && BuyHeroMenu::isShow() == false )
	{
		menu->removeFromParent();
	}
}

void MapLayer::createDevMenu()
{
	if( isTestDevice() && isTestModeActive() )
	{
		auto item = [this]( Menu * menu, std::string text, EventKeyboard::KeyCode key, Point pos )
		{
			auto sendKey = [this]( Ref* sender, EventKeyboard::KeyCode key )mutable
			{
				this->onKeyReleased( key, nullptr );
			};

			auto i = MenuItemTextBG::create( text, Color4F::GRAY, Color3B::BLACK, std::bind( sendKey, std::placeholders::_1, key ) );
			menu->addChild( i );
			i->setPosition( pos );
			i->setScale( 1.5f );
		};

		auto menu = Menu::create();
		menu->setPosition( 0, 0 );
		addChild( menu, 9999 );
		Point pos( 150, 300 );
		float Y( 45 );
		item( menu, "Open All", EventKeyboard::KeyCode::KEY_F1, pos ); pos.y += Y;
		item( menu, "Gold", EventKeyboard::KeyCode::KEY_F2, pos ); pos.y += Y;
		item( menu, "Fuel", EventKeyboard::KeyCode::KEY_F3, pos ); pos.y += Y;
		
		item( menu, "play current level", EventKeyboard::KeyCode::KEY_1, pos ); pos.y += Y;
		item( menu, "play all game", EventKeyboard::KeyCode::KEY_2, pos ); pos.y += Y;
		item( menu, "fast test all levels", EventKeyboard::KeyCode::KEY_3, pos ); pos.y += Y;
		item( menu, "fast test all hards", EventKeyboard::KeyCode::KEY_4, pos ); pos.y += Y;
	}
}

NS_CC_END
