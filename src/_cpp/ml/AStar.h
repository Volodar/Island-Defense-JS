//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
// AStar.cpp: определяет точку входа для консольного приложения.
//

#include <vector>
#include <algorithm>
#include <iostream>
#include <memory>
#include <assert.h>

namespace AStar
{

	class Cell;

	class Map
	{
	public:
		typedef std::shared_ptr<Cell> Cell_ptr;
		typedef std::vector< Cell_ptr > Cells;
	public:
		Map( int width, int height );
		Cell_ptr cell( int x, int y );
		Cells neighbors( Cell_ptr cell );
		float heuristic_cost_estimate( Cell_ptr a, Cell_ptr b );
		
	private:
		Cells _data;
		int _width;
		int _height;
	};

	class Cell
	{
	public:
		Cell( int _x = 0, int _y = 0 );
		static bool compare_g( const Map::Cell_ptr a, const Map::Cell_ptr b ) { return a->g < b->g; }
		static bool compare_h( const Map::Cell_ptr a, const Map::Cell_ptr b ) { return a->h < b->h; }
		static bool compare_f( const Map::Cell_ptr a, const Map::Cell_ptr b ) { return a->f < b->f; }
		void setPassed( bool value );
		int X()const { return x; }
		int Y()const { return y; }
	private:
		friend class Map;
		friend Map::Cells reconstruct_path( Map::Cell_ptr start, Map::Cell_ptr goal );
		friend Map::Cells find( Map & map, Map::Cell_ptr start, Map::Cell_ptr goal );
		int x;
		int y;

		float g; //стоимость пути из начальной вершины
		float h; //стоимость пути до конечной цели
		float f; //общая стоимость

		std::weak_ptr<Cell> came_from;
		bool passed;

		bool operator == (const Cell & c) { return c.x == x && c.y == y; }
		bool operator != (const Cell & c) { return !(*this == c); }

	};

	Map::Cells reconstruct_path( Map::Cell_ptr start, Map::Cell_ptr goal );
	Map::Cells find( Map & map, Map::Cell_ptr start, Map::Cell_ptr goal );

	namespace support
	{
		void sort_g( Map::Cells & Cells );
		void sort_h( Map::Cells & Cells );
		void sort_f( Map::Cells & Cells );
		void remove( Map::Cells & Cells, Map::Cell_ptr cell );
		void add( Map::Cells & Cells, Map::Cell_ptr cell );
		bool exist( Map::Cells & Cells, Map::Cell_ptr cell );
	}
};
