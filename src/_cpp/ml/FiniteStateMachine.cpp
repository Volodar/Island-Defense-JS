//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#include "FiniteStateMachine.h"

#define FSM_BEGIN namespace FiniteState{
#define FSM_END }

FSM_BEGIN

/*****************************************************************************/
//MARK:	class State
/*****************************************************************************/

State::State( Machine & machine, const CallBack & cb )
: _machine( machine )
, _string_name()
, _name( Tag( InvalidTag ) )
, _transitions()
, _inherited_transitions()
, _onActivate()
, _onDeactivate()
, _onUpdate()
{
	add_onActivateCallBack( cb );
}

State::~State()
{}

bool State::add_transition( const Tag & onEvent, const Tag & toState )
{
	Event& event = _machine.event( onEvent );
	State& state = _machine.state( toState );
	auto pair = std::pair<Event*, Tag>( &event, state.get_name() );
	auto insertRes = _transitions.insert( pair );
	//assert( insertRes.second == true );
	return insertRes.second;
}

void State::inherit_transitions( const Tag & state )
{
	_inherited_transitions.push_back( state );
}

Tag State::process( const Event & event )const
{
	auto result = InvalidTag;
	auto i = _transitions.find( &event );
	if( i != _transitions.end() )
	{
		result = i->second;
	}
	else
	{
		auto rend = _inherited_transitions.rend();
		auto rbegin = _inherited_transitions.rbegin();
		for( auto ri = rend; ri != rbegin; ++ri )
		{
			auto tag = *(ri.base());
			auto state = _machine.state( tag );
			auto state_next = state.process( event );
			if( state_next != InvalidTag )
			{
				result = state_next;
				break;
			}
		}
	}
	return result;
}

void State::set_name( const Tag & name )
{
	assert( _machine.is_exist_state( name ) == false );
	_name = name;
}

void State::set_string_name( const std::string & name )
{
	assert( _machine.is_exist_state( name ) == false );
	_string_name = name;
}

const Tag& State::get_name()const
{
	return _name;
}

const std::string& State::get_string_name()const
{
	return _string_name;
}

void State::update( void * data )
{
	if( _onUpdate )
		_onUpdate( data );
}

void State::onActivate()
{
	_execute( _onActivate );
}

void State::onDeactivate()
{
	_execute( _onDeactivate );
}

void State::add_onActivateCallBack( const CallBack & function )
{
	_add_callback( _onActivate, function );
}

void State::add_onDeactivateCallBack( const CallBack & function )
{
	_add_callback( _onDeactivate, function );
}

void State::set_updateCallback( const CallBackUpdate & function )
{
	_onUpdate = function;
}

void State::clear_onActivateCallBack()
{
	_onActivate.clear();
}

void State::clear_onDeactivateCallBack()
{
	_onDeactivate.clear();
}

void State::_execute( const CallBacksList & list )
{
	for( auto callback : list )
	{
		assert( callback );
		callback();
	}
}

void State::_add_callback( CallBacksList & list, const CallBack & function )
{
	if( function )
	{
		list.push_back( function );
	}
}

/*****************************************************************************/
//MARK:	class Event
/*****************************************************************************/

Event::Event( Machine & machine )
: _machine( machine )
{}

void Event::set_name( const Tag & name )
{
	assert( _machine.is_exist_event( name ) == false );
	_name = name;
}

void Event::set_string_name( const std::string & name )
{
	assert( _machine.is_exist_event( name ) == false );
	_string_name = name;
}

const Tag& Event::get_name()const
{
	return _name;
}

const std::string& Event::get_string_name()const
{
	return _string_name;
}

/*****************************************************************************/
//MARK:	class Machine
/*****************************************************************************/

Machine::Machine()
: _currentState( nullptr )
, _states()
, _events()
, _mutexQueueEvents()
, _eventsQueue()
{}

Machine::~Machine()
{
	for( auto i : _states )
		delete i;
	for( auto i : _events )
		delete i;
}

void Machine::start( const Tag & nameState )
{
	_set_state( &state( nameState ) );
}

bool Machine::is_exist_state( const Tag & name )const
{
	return _isvalid( _state( name ) );
}

bool Machine::is_exist_state( const std::string & name )const
{
	for( auto& state : _states )
	{
		if( state->get_string_name() == name )
			return true;
	}
	return false;
}

bool Machine::is_exist_event( const Tag & name )const
{
	return _isvalid( _event( name ) );
}

bool Machine::is_exist_event( const std::string & name )const
{
	for( auto& event : _events )
	{
		if( event->get_string_name() == name )
			return true;
	}
	return false;
}

Event& Machine::add_event( const Tag & nameEvent )
{
	assert( _isvalid( _event( nameEvent ) ) == false );

	auto event = new Event( *this );
	event->set_name( nameEvent );
	_events.push_back( event );

	return *_events.back();
}

Event& Machine::event( const Tag & name )
{
	auto i = _event( name );
	assert( _isvalid( i ) );
	return *(*i);
}

Event& Machine::event( const std::string & name )
{
	auto begin = _events.begin();
	auto end = _events.end();
	for( EventsIterator iterator = begin; iterator != end; ++iterator )
	{
		if( (*iterator)->get_string_name() == name )
			return *(*iterator);
	}
	assert( 0 );
	static Event dummy( *this );
	dummy.set_name( -1 );
	dummy.set_string_name( "dummy" );
	return dummy;
}

State& Machine::add_state( const Tag & nameState, const CallBack & onActivate )
{
	assert( _isvalid( _state( nameState ) ) == false );

	return add_state<State>( nameState, onActivate );
}

State& Machine::state( const Tag & name )
{
	auto i = _state( name );
	assert( _isvalid( i ) );
	return **i;
}

State& Machine::state( const std::string & name )
{
	auto begin = _states.begin();
	auto end = _states.end();
	for( StatesIterator iterator = begin; iterator != end; ++iterator )
	{
		if( (*iterator)->get_string_name() == name )
			return *(*iterator);
	}
	assert( 0 );
	static State dummy( *this, nullptr );
	dummy.set_name( -1 );
	dummy.set_string_name( "dummy" );
	return dummy;
}

State& Machine::current_state()
{
	return *_currentState;
}

const State& Machine::current_state()const
{
	return *_currentState;
}

void Machine::process()
{
	std::unique_lock<std::mutex> lock( _mutexQueueEvents );
	auto queue = _eventsQueue;
	while( _eventsQueue.empty() == false )
		_eventsQueue.pop();
	lock.unlock();

	while( queue.size() > 0 )
	{
		Event& event = *queue.front();
		Tag nextState = _currentState->process( event );
		auto iState = _state( nextState );
		if( _isvalid( iState ) )
		{
			_set_state( *iState );
		}
		queue.pop();
	}
}

void Machine::push_event( const Tag & event )
{
	std::unique_lock<std::mutex> lock( _mutexQueueEvents );
	Event * eventPtr = &this->event( event );
	_eventsQueue.push( eventPtr );
}

bool Machine::_isvalid( const EventsCIterator & iterator )const
{
	return iterator != _events.end();
}

bool Machine::_isvalid( const StatesCIterator & iterator )const
{
	return iterator != _states.end();
}

EventsIterator Machine::_event( Tag tag )
{
	auto begin = _events.begin();
	auto end = _events.end();
	for( EventsIterator iterator = begin; iterator != end; ++iterator )
	{
		if( (*iterator)->get_name() == tag )
			return iterator;
	}
	return _events.end();
}

StatesIterator Machine::_state( Tag tag )
{
	auto begin = _states.begin();
	auto end = _states.end();
	for( StatesIterator iterator = begin; iterator != end; ++iterator )
	{
		if( (*iterator)->get_name() == tag )
			return iterator;
	}
	return _states.end();
}

EventsCIterator Machine::_event( Tag name )const
{
	auto begin = _events.begin();
	auto end = _events.end();
	for( EventsCIterator iterator = begin; iterator != end; ++iterator )
	{
		if( (*iterator)->get_name() == name )
			return iterator;
	}
	return _events.end();
}

StatesCIterator Machine::_state( Tag name )const
{
	auto begin = _states.begin();
	auto end = _states.end();
	for( StatesCIterator iterator = begin; iterator != end; ++iterator )
	{
		if( (*iterator)->get_name() == name )
			return iterator;
	}
	return _states.end();
}

void Machine::_set_state( State * state )
{
	assert( state );
	if( _currentState )
		_currentState->onDeactivate();
	_currentState = state;
	_currentState->onActivate();
}

FSM_END