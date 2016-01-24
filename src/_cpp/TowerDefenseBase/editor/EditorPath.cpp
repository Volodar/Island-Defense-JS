//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#if EDITOR==1
#include "EditorPath.h"
#include "support.h"
#include "gameboard.h"
#include "MenuItemTextBG.h"
#include "consts.h"
#include "resources.h"
#include "EditorDeclarations.h"
#include "ImageManager.h"
#include "MenuItemTextBG.h"
USING_NS_CC;


int kRenderQueue(0);

void drawLine( const Point & p0, const Point & p1, const Color4F & color, float weight = 1)
{
	DrawPrimitives::setDrawColor4F( color.r, color.g, color.b, color.a );
	DrawPrimitives::drawLine( p0, p1 );
}

PathEditor * PathEditor::create()
{
	PathEditor * ptr = new PathEditor;
	if( ptr && ptr->init() )
	{
		ptr->autorelease();
		return ptr;
	}
	CC_SAFE_DELETE( ptr );
	return nullptr;
}

bool PathEditor::init()
{
	if ( !Layer::init() )
	{
		return false;
	}

	
	Size visibleSize = Director::getInstance()->getVisibleSize();
	CCPoint position(kEditorLayersMenuPosX(), kEditorLayersMenuPosY_add);
	
	MenuItemTextBG * itemt = MenuItemTextBG::create("Map menu", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_1(PathEditor::menuHideMenu, this));
	itemt->setPosition( position ); position.y -= 60;

	m_menu = Menu::create(itemt, NULL);
	m_menu->setPosition(Point::ZERO);
	this->addChild(m_menu, 1);

	m_menuMaps = Menu::create();
	addChild(m_menuMaps);
	m_menuMaps->setPosition(Point::ZERO);

	auto item = MenuItemTextBG::create("Add route", Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_0(PathEditor::addNewRoute, this, UnitLayer::earth));
	item->setPosition(position); position.y -= 30;
	m_menuMaps->addChild(item);
	item = MenuItemTextBG::create( "Add fly route", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( PathEditor::addNewRoute, this, UnitLayer::sky ) );
	item->setPosition( position ); position.y -= 30;
	m_menuMaps->addChild( item );
	item = MenuItemTextBG::create( "Add sea route", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( PathEditor::addNewRoute, this, UnitLayer::sea ) );
	item->setPosition( position ); position.y -= 30;
	m_menuMaps->addChild( item );
	item = MenuItemTextBG::create( "Remove route", Color4F( 0.7f, 0.7f, 0.7f, 1 ), Color3B( 0, 0, 0 ), CC_CALLBACK_0( PathEditor::deleteCurrentRoute, this ) );
	item->setPosition(position); position.y -= 60;
	m_menuMaps->addChild(item);

	for ( unsigned i=0; i<10; ++i )
	{
		std::string text = "Route# " + intToStr(i);
		MenuItemTextBG * item = MenuItemTextBG::create(text, Color4F(0.7f, 0.7f, 0.7f, 1), Color3B(0,0,0), CC_CALLBACK_1(PathEditor::menuSelectRoute, this));
		item->setTag(i);
		item->setPosition( position ); position.y -= 30;
		m_menuMaps->addChild(item);
		m_routesButtons.push_back(item);
	}

	loadMap(0);
 
	schedule(schedule_selector(PathEditor::update));

	m_touchCounter = 0;
	m_timerDoubleClick = 0;

	m_labelStart = LabelTTF::create("START", "Arial", 20);
	m_labelFinish = LabelTTF::create("FINISH", "Arial", 20);
	addChild(m_labelStart);
	addChild(m_labelFinish);
	m_labelStart->setColor(Color3B(0, 0, 0));
	m_labelFinish->setColor(Color3B(0, 0, 0));
	if ( m_currentRoute != m_routes.end() )
	{
		m_labelStart->setPosition(m_currentRoute->main.front());
		m_labelFinish->setPosition(m_currentRoute->main.back());
	}

	m_circle.center = Point(512, 384);
	m_circle.radius = 50;

	setEnabled( false );
	return true;
}

void PathEditor::setEnabled( bool var )
{
	if( var )
		attachWithIME();
	else
		detachWithIME();
	m_enabled = var;
	m_menuMaps->setVisible( var );
	m_menu->setVisible( var );
	m_labelStart->setVisible( var );
	m_labelFinish->setVisible( var );
	setTouchMode(Touch::DispatchMode::ONE_BY_ONE);
	setTouchEnabled(var);
}

void PathEditor::insertText(const char * text, int len)
{
	if( len && text[0] == 'e' )
		deleteCurrentRoute();
}

void PathEditor::deleteBackward()
{
	deleteCurrentRoute();
}

void PathEditor::menuCloseCallback(Ref* pSender)
{
	Director::getInstance()->popScene();
}

void PathEditor::selectLevel(int level)
{
	int tag = level;
	loadMap(tag);
}

void PathEditor::menuSelectRoute(Ref* pSender)
{
	int tag = ((Node*)pSender)->getTag();
	
	tag = std::max<int>( std::min<int>(tag, m_routes.size() - 1 ), 0);
	m_currentRoute = m_routes.begin();
	while(tag--)
		++m_currentRoute;
	if( m_currentRoute != m_routes.end() )
	{
		m_labelStart->setPosition( m_currentRoute->main.front() );
		m_labelFinish->setPosition( m_currentRoute->main.back() );
	}
}

void PathEditor::autoSave(float dt)
{
	int i = m_map;
	m_map = -1;
	menuSave(nullptr);
	m_map = i;
}

void PathEditor::menuSave(Ref* pSender)
{
	std::string path = kDirectoryToMaps + intToStr(m_map) + ".xml";
	pugi::xml_document doc;
	doc.load_file(path.c_str());
	pugi::xml_node map = doc.child("map");
	pugi::xml_node routes = map.child("routes");
	pugi::xml_node flyroutes = map.child("flyroutes");
	if ( routes )
	{
		map.remove_child(routes);
		routes = map.append_child("routes");
	}
	if ( flyroutes )
	{
		map.remove_child(routes);
		routes = map.append_child("routes");
	}

	auto save = []( const std::list<TripleRoute> & routes, pugi::xml_node xmlNode )
	{
		unsigned index(0);
		for ( auto i : routes )
		{
			pugi::xml_node node = xmlNode.append_child("route");
			node.append_attribute("name").set_value(intToStr(index++).c_str());
			node.append_attribute( "type" ).set_value( unitLayerToStr( i.type ).c_str() );
			pugi::xml_node main = node.append_child("main");
			pugi::xml_node left = node.append_child("left");
			pugi::xml_node right = node.append_child("right");
			saveRoute(i.main, main);
			saveRoute(i.left, left);
			saveRoute(i.right, right);
		}
	};
	save( m_routes, routes );
	
	doc.save_file(path.c_str());
}

void PathEditor::saveRoute(const std::vector<Point> & array, pugi::xml_node & node)
{
	for ( auto i : array )
	{
		auto child = node.append_child("point");
		child.append_attribute("x").set_value( intToStr(i.x).c_str() );
		child.append_attribute("y").set_value( intToStr(i.y).c_str() );
	}
}

void PathEditor::menuAddRoute(UnitLayer type)
{
	addNewRoute(UnitLayer::earth);
}

void PathEditor::menuHideMenu(Ref* pSender)
{
	m_menuMaps->setVisible(!m_menuMaps->isVisible());
}

void PathEditor::update(float dt)
{
	m_timerDoubleClick += dt;
}

void PathEditor::clickByLink(const Point & point)
{
	if ( m_timerDoubleClick < 0.5f && m_touchCounter == 1 )
	{
		m_currentRoute->main.insert(m_touchedLink + 1, point);
		m_touchedLink = m_currentRoute->main.end();
		m_touchedNode = m_currentRoute->main.end();
	}
	if ( m_touchCounter )
		m_touchCounter = 0;
	else
		m_touchCounter = 1;
	m_timerDoubleClick = 0;
}

void PathEditor::visit( Renderer *renderer, const Mat4& transform, uint32_t flags )
{
	Layer::visit( renderer, transform, flags );
	
	renderer->render( );

	auto d = [](std::vector<Point>&v, const Color4F & color, int width)
	{
		glLineWidth( width );
		DrawPrimitives::setDrawColor4F( color.r, color.g, color.b, color.a );
		for( unsigned i = 0; i<v.size( ) - 1; ++i )
			DrawPrimitives::drawLine( v[i], v[i + 1] );
		if( width > 1 )
		{
			DrawPrimitives::setPointSize( 10 );
			DrawPrimitives::drawPoints( v.data(), v.size() );
		}
		DrawPrimitives::setPointSize( 1 );
		DrawPrimitives::setDrawColor4F( 1, 1, 1, 1 );
		return 0;
	};
	if( getIsEnabled() )
	{
		for( auto i : m_routes )
		{
			Color4F color;
			switch( i.type )
			{
				case UnitLayer::earth: color = Color4F::WHITE; break;
				case UnitLayer::sky: color = Color4F::BLUE; break;
				case UnitLayer::sea: color = Color4F::GREEN; break;
				default: color = Color4F::RED; break;
			}
			d( i.main, color, 1 );
		}
		if( m_currentRoute != m_routes.end() )
		{
			Color4F color;
			switch( m_currentRoute->type )
			{
				case UnitLayer::earth: color = Color4F::WHITE; break;
				case UnitLayer::sky: color = Color4F::BLUE; break;
				case UnitLayer::sea: color = Color4F::GREEN; break;
				default: color = Color4F::RED; break;
			}
			d( m_currentRoute->main, color, 2 );
			d( m_currentRoute->left, Color4F( 1, 0, 0, 0.5f ), 1 );
			d( m_currentRoute->right, Color4F( 1, 0, 0, 0.5f ), 1 );
		}
	}
	renderer->render();
}

bool PathEditor::onTouchBegan(Touch *touch, Event *event)
{
	m_touchedNode = m_currentRoute->main.end();
	m_touchedLink = m_currentRoute->main.end();
	for ( auto i=m_currentRoute->main.begin(); i!=m_currentRoute->main.end(); ++i )
	{
		float distance = i->getDistance(touch->getLocation());
		if ( distance<5 )
		{
			m_touchedNode = i;
			return true;
		}
	}
	float mindist(999999);
	int indexmin( -1 );
	int index( 0 );
	for ( auto i=m_currentRoute->main.begin(), j= i + 1; j != m_currentRoute->main.end(); i = j, ++j, ++index )
	{
		float distance = getDistance(touch->getLocation(), *i, *j);

		float A = touch->getLocation( ).getDistance( *i );
		float B = touch->getLocation( ).getDistance( *j );
		float distpoints = A + B;

		if( distance < 3 && distpoints < mindist )
		{
			indexmin = index;
			mindist = distpoints;
			m_touchedLink = i;
		}
	}
	return true;
}

void PathEditor::onTouchMoved(Touch *touch, Event *event)
{
	if ( m_touchedNode != m_currentRoute->main.end() )
	{
		*m_touchedNode = *m_touchedNode + touch->getDelta();
		buildSecondRoute();
	}
	if ( m_touchedLink != m_currentRoute->main.end() )
	{
		auto i = m_touchedLink;
		auto j = m_touchedLink + 1;
		assert(j != m_currentRoute->main.end());
		*i = *i + touch->getDelta();
		*j = *j + touch->getDelta();
		buildSecondRoute();
	}
	m_labelStart->setPosition(m_currentRoute->main.front());
	m_labelFinish->setPosition(m_currentRoute->main.back());
}

void PathEditor::onTouchEnded(Touch *touch, Event *event)
{
	if ( m_touchedLink != m_currentRoute->main.end() )
	{
		clickByLink(touch->getLocation());
	}
	m_touchedLink = m_currentRoute->main.end();
	m_touchedNode = m_currentRoute->main.end();

}

void PathEditor::onTouchCanceled(Touch *touch, Event *event)
{
	onTouchEnded( touch, event );
}

void PathEditor::loadMap(unsigned index)
{
	m_map = index;

	std::string pathToXML = std::string(kDirectoryToMaps) + intToStr(index) + ".xml";
	pugi::xml_document doc;
	doc.load_file(pathToXML.c_str());

	std::map<int, TripleRoute> routes;
	GameBoard::loadRoutes(routes, doc.root().first_child().child("routes") );
	m_routes.clear();
	if(routes.empty())
	{
		UnitLayer type = UnitLayer::earth;
		addNewRoute(type);
		buildSecondRoute();
	}
	else
	{
		for(auto i : routes)
		{
			m_currentRoute = m_routes.insert(m_routes.end(), i.second);
		}
	}

	updateRouteButtons();
}

void PathEditor::updateRouteButtons()
{
	auto route = m_routes.begin();
	for(unsigned i=0; i<m_routesButtons.size() ; ++ i)
	{
		std::string text = "Route# " + intToStr(i);
		if( route != m_routes.end() )
		{
			if( route->type == UnitLayer::sky )
				text += "(sky)";
			if( route->type == UnitLayer::sea )
				text += "(sea)";
			++route;
		}
		

		m_routesButtons[i]->setText( text );
		m_routesButtons[i]->setVisible( i < m_routes.size() );
	}
}

void PathEditor::addNewRoute(UnitLayer type)
{
	if( m_routes.size() == 10 )
		return;
	TripleRoute route;
	route.type = type;
	route.main.push_back(Point(100, 384));
	route.main.push_back(Point(900, 384));
	m_currentRoute = m_routes.insert(m_routes.end(), route);
	m_touchedLink = m_currentRoute->main.end();
	m_touchedNode = m_currentRoute->main.end();
	m_labelStart->setPosition( m_currentRoute->main.front( ) );
	m_labelFinish->setPosition( m_currentRoute->main.back( ) );
	buildSecondRoute( );

	updateRouteButtons();
}

void PathEditor::deleteCurrentRoute()
{
	m_routes.erase(m_currentRoute);
	m_currentRoute = m_routes.begin();
	if ( m_routes.empty() )
	{
		addNewRoute(UnitLayer::earth);
	}
	else
	{
		m_touchedLink = m_currentRoute->main.end();
		m_touchedNode = m_currentRoute->main.end();
		buildSecondRoute();
	}

	updateRouteButtons();
}

void PathEditor::buildSecondRoute()
{
	std::vector<Point> normalsL;
	std::vector<Point> normalsR;
	float halfWidth(25);
	Route& route = m_currentRoute->main;
	for ( unsigned i=0; i<route.size(); ++i )
	{
		int m = route.size()-1;
		Point v0 = i==0? route[1] - route[0] : route[i] - route[i-1];
		Point v1 = i==m? route[m] - route[m-1] : route[i+1] - route[i];
		Point normal0 = Point(-v0.y, v0.x).getNormalized() * halfWidth;
		Point normal1 = Point( -v1.y, v1.x ).getNormalized( ) * halfWidth;
		normalsL.push_back(  normal0 + route[i] );
		normalsL.push_back(  normal1 + route[i] );
		normalsR.push_back( -normal0 + route[i] );
		normalsR.push_back( -normal1 + route[i] );
	}
	
	auto d = [](const std::vector<Point> & p, const std::vector<Point> & n, float width)
	{
		std::vector<Point> result;
		for ( unsigned i=0; i<p.size(); ++i)
		{
			Point ns = (n[i*2] + n[i*2+1]) / 2.f;
			Point normal = (ns - p[i]).getNormalized( ) * width;
			normal.y /= k::IsometricValue;
			result.push_back(p[i] + normal);
		}
		return result;
	};
	m_currentRoute->left = d(route, normalsL, halfWidth);
	m_currentRoute->right = d(route, normalsR, halfWidth);
}
#endif