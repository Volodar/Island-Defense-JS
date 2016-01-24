//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
// AStar.cpp: определяет точку входа для консольного приложения.
//

#include "AStar.h"
#include <algorithm>
#include <cmath>
namespace AStar
{

	Map::Cells find( Map & map, Map::Cell_ptr start, Map::Cell_ptr goal )
	{
		Map::Cells closedset;
		Map::Cells openset;
		support::add( openset, start );

		start->g = 0;
		start->h = map.heuristic_cost_estimate( start, goal );
		start->f = start->g + start->h;

		while( openset.empty() == false )
		{
			support::sort_f( openset );
			Map::Cell_ptr x = openset.front();
			if( x == goal )
				return reconstruct_path( start, goal );

			support::remove( openset, x );
			support::add( closedset, x );

			Map::Cells neighbors = map.neighbors( x );
			for( auto y : neighbors )
			{
				if( support::exist( closedset, y ) )
					continue;

				bool tentative_is_better( false );
				auto tentative_g_score = x->g + map.heuristic_cost_estimate( x, y );
				if( support::exist( openset, y ) == false )
				{
					support::add( openset, y );
					tentative_is_better = true;
				}
				else
				{
					tentative_is_better = tentative_g_score < y->g;
				}

				if( tentative_is_better == true )
				{
					y->came_from = x;
					y->g = tentative_g_score;
					y->h = map.heuristic_cost_estimate( y, goal );
					y->f = y->g + y->h;
				}
			}
		}

		if( closedset.empty() == false )
		{
			support::sort_h( closedset );
			auto agoal = closedset.front();
			return reconstruct_path( start, agoal );
		}
		return Map::Cells();
	}

	Map::Cells reconstruct_path( Map::Cell_ptr start, Map::Cell_ptr goal )
	{
		Map::Cell_ptr current_node = goal;
		Map::Cells path_map;
		while( current_node )
		{
			support::add( path_map, current_node );
			current_node = current_node->came_from.lock();
		}

		std::reverse( path_map.begin(), path_map.end() );
		return path_map;
	}

	Map::Map( int width, int height )
	: _width( width )
	, _height( height )
	{
		for( int i = 0; i < _width * _height; ++i )
		{
			Cell_ptr c = std::make_shared<Cell>( i / _width, i % height );
			_data.push_back( c );
		}
	}


	Map::Cell_ptr Map::cell( int x, int y )
	{
		assert( x < _width );
		assert( y < _height );
		return _data[x * _width + y];
	}

	Map::Cells Map::neighbors( Cell_ptr cell )
	{
		Cells Cells;

		int array[][2] = {
			{ -1, -1 },
			{ -1, +0 },
			{ -1, +1 },
			{ +0, -1 },
			{ +0, +1 },
			{ +1, -1 },
			{ +1, +0 },
			{ +1, +1 },
		};

		for( auto c : array )
		{
			int x = cell->x + c[0];
			int y = cell->y + c[1];
			if( x < 0 || x > _width - 1 ) continue;
			if( y < 0 || y > _height - 1 ) continue;
			auto cell = _data[x * _width + y];
			if( cell->passed == false ) continue;
			Cells.push_back( cell );
		}

		return Cells;
	}

	float Map::heuristic_cost_estimate( Cell_ptr a, Cell_ptr b )
	{
		int x = a->x - b->x;
		int y = a->y - b->y;
		return std::sqrt( float( x*x + y*y ) );
	}

	Cell::Cell( int _x, int _y ) 
	: x( _x )
	, y( _y )
	, g( 0 )
	, h( 0 )
	, f( 0 )
	, came_from()
	, passed( 0 ) 
	{}

	void Cell::setPassed( bool value )
	{
		this->passed = value;
	}

	void support::remove( Map::Cells & Cells, Map::Cell_ptr cell )
	{
		auto i = std::find( Cells.begin(), Cells.end(), cell );
		if( i != Cells.end() ) Cells.erase( i );
	}

	void support::add( Map::Cells & Cells, Map::Cell_ptr cell )
	{
		Cells.push_back( cell );
	}

	bool support::exist( Map::Cells & Cells, Map::Cell_ptr cell )
	{
		auto i = std::find( Cells.begin(), Cells.end(), cell );
		return i != Cells.end();
	}

	void support::sort_g( Map::Cells & Cells )
	{
		std::sort( Cells.begin( ), Cells.end( ), Cell::compare_g ); 
	}

	void support::sort_h( Map::Cells & Cells )
	{
		std::sort( Cells.begin( ), Cells.end( ), Cell::compare_h ); 
	}

	void support::sort_f( Map::Cells & Cells )
	{
		std::sort( Cells.begin( ), Cells.end( ), Cell::compare_f ); 
	}
}
