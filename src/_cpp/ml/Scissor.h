//
//  IslandDefense
//
//  Created by Vladimir Tolmachev on 27.09.14.
//
//
#ifndef __Scissor_h__
#define __Scissor_h__


#include "cocos2d.h"
#include "ml/macroses.h"
#include "ml/common.h"

NS_CC_BEGIN;

template <class T>
class Scissor : public T
{
public:
	Scissor()
		: _conteiner( nullptr )
		, _frame()
		, _parentScissorRect()
		, _scissorRestored( false )
		, _beforeDrawCommand()
		, _afterDrawCommand()
		, _scissorEnabled( false )
		, _childAddToConteiner( true )
	{
		_conteiner.reset( Node::create() ); 
		assert( _conteiner );
		_conteiner->setParent( this );

		T::setCascadeColorEnabled( true );
		T::setCascadeOpacityEnabled( true );
		_conteiner->setCascadeColorEnabled( true );
		_conteiner->setCascadeOpacityEnabled( true );
	};

	virtual void onEnter()
	{
		T::onEnter();
		_conteiner->onEnter();
	}

	virtual void onExit()
	{
		T::onExit();
		_conteiner->onExit();
	}

	virtual void visit( Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags )
	{
		if( Node::isVisible() )
		{
			Node::visit( renderer, parentTransform, parentFlags );

			if( _scissorEnabled ) visit_scissor( renderer, parentTransform, parentFlags );
			else visit_normal( renderer, parentTransform, parentFlags );
		}
	}

	bool isScissorEnabled()const { return _scissorEnabled; };
	void setScissorEnabled( bool mode ) { _scissorEnabled = mode; }

	void setScissorRect( const Rect & rect )
	{
		setScissorRect( rect.origin, rect.size );
		assert( _frame.size.width >= 0 );
		assert( _frame.size.height >= 0 );
	}

	void setScissorRect( const Point & origin, const Size & area )
	{
		_frame.origin = origin;
		_frame.size = area;
		assert( _frame.size.width >= 0 );
		assert( _frame.size.height >= 0 );
		_conteiner->setContentSize( area );
	}

	Rect getScissorRect()const
	{
		return _frame;
	}


	virtual void addChild( Node * child ) override
	{
		_childAddToConteiner ? _conteiner->addChild( child ) : Node::addChild( child );
	}
	virtual void addChild( Node * child, int zOrder ) override
	{
		_childAddToConteiner ? _conteiner->addChild( child, zOrder ) : Node::addChild( child, zOrder );
	}
	virtual void addChild( Node * child, int zOrder, int tag ) override
	{
		_childAddToConteiner ? _conteiner->addChild( child, zOrder, tag ) : Node::addChild( child, zOrder, tag );
	}
	virtual void addChild( Node * child, int zOrder, const std::string &name ) override
	{
		_childAddToConteiner ? _conteiner->addChild( child, zOrder, name ) : Node::addChild( child, zOrder, name );
	}

	virtual void addChildNotScissor( Node * child )
	{
		_childAddToConteiner = false;
		Node::addChild( child );
		_childAddToConteiner = true;
	}
	virtual void addChildNotScissor( Node * child, int zOrder )
	{
		_childAddToConteiner = false;
		Node::addChild( child, zOrder );
		_childAddToConteiner = true;

	}
	virtual void addChildNotScissor( Node * child, int zOrder, int tag )
	{
		_childAddToConteiner = false;
		Node::addChild( child, zOrder, tag );
		_childAddToConteiner = true;
	}
	virtual void addChildNotScissor( Node * child, int zOrder, const std::string &name )
	{
		_childAddToConteiner = false;
		Node::addChild( child, zOrder, name );
		_childAddToConteiner = true;
	}

	virtual Vector<Node*>& getChildren() { return _conteiner->getChildren(); }
	virtual const Vector<Node*>& getChildren() const { return _conteiner->getChildren(); }
	virtual ssize_t getChildrenCount() const { return _conteiner->getChildrenCount(); }

	bool checkTouchInScissorArea( const Point & point )
	{
		Point point_ = point - _frame.origin;
		bool result = checkPointInNode( _conteiner, point_, _scissorEnabled ? 0 : -1 );
		return result;
	}
	NodePointer getScissorConteiner() { return _conteiner; }
	const NodePointer getScissorConteiner()const { return _conteiner; }
protected:
	void updateDisplayedOpacity( GLubyte parentOpacity )
	{
		T::_displayedOpacity = T::_realOpacity * parentOpacity / 255.0;
		T::updateColor( );

		if( T::_cascadeOpacityEnabled )
		{
			for( auto child : T::_children )
			{
				child->updateDisplayedOpacity( T::_displayedOpacity );
			}
			for( auto child : _conteiner->getChildren() )
			{
				child->updateDisplayedOpacity( T::_displayedOpacity );
			}
		}
	}
private:
	void visit_scissor( Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags )
	{
		auto check_null_rotate = [this]()
		{
			Node* node = this;
			while( node )
			{
				if( node->getRotation() != 0 )
					return false;
				node = node->getParent();
			}
			return true;
		};
		assert( check_null_rotate() );

		_conteiner->setVisible( false );
		this->beforeDraw();
		_conteiner->setVisible( true );
		visit_normal( renderer, parentTransform, parentFlags );
		this->afterDraw();
	}
	void visit_normal( Renderer *renderer, const Mat4& parentTransform, uint32_t parentFlags )
	{
		Director* director = Director::getInstance( );
		director->pushMatrix( MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW );
		director->loadMatrix( MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW, T::_modelViewTransform );
		
		_conteiner->visit( renderer, parentTransform * T::_transform, parentFlags | Node::FLAGS_TRANSFORM_DIRTY );
		
		director->popMatrix( MATRIX_STACK_TYPE::MATRIX_STACK_MODELVIEW );
	}

	void beforeDraw()
	{
		_beforeDrawCommand.init( T::getGlobalZOrder() );
		_beforeDrawCommand.func = CC_CALLBACK_0( Scissor::onBeforeDraw, this );
		Director::getInstance()->getRenderer()->addCommand( &_beforeDrawCommand );
	}

	void afterDraw()
	{
		_afterDrawCommand.init( T::getGlobalZOrder() );
		_afterDrawCommand.func = CC_CALLBACK_0( Scissor::onAfterDraw, this );
		Director::getInstance()->getRenderer()->addCommand( &_afterDrawCommand );
	}

	void onBeforeDraw()
	{
		auto glview = Director::getInstance()->getOpenGLView();
		Rect frame;

		frame.origin = Node::convertToWorldSpace( _frame.origin );
		frame.size = _frame.size;

		_scissorRestored = false;

		if( glview->isScissorEnabled() )
		{
			_scissorRestored = true;
			_parentScissorRect = glview->getScissorRect();
			if( frame.intersectsRect( _parentScissorRect ) )
			{
				float x = std::max( frame.origin.x, _parentScissorRect.origin.x );
				float y = std::max( frame.origin.y, _parentScissorRect.origin.y );
				float xx = std::min( frame.origin.x + frame.size.width, _parentScissorRect.origin.x + _parentScissorRect.size.width );
				float yy = std::min( frame.origin.y + frame.size.height, _parentScissorRect.origin.y + _parentScissorRect.size.height );
				glview->setScissorInPoints( x, y, xx - x, yy - y );
			}
		}
		else
		{
			glEnable( GL_SCISSOR_TEST );
			glview->setScissorInPoints( frame.origin.x, frame.origin.y, frame.size.width, frame.size.height );
		}
	}

	void onAfterDraw()
	{
		auto glview = Director::getInstance()->getOpenGLView();
		if( _scissorRestored )
		{//restore the parent's scissor rect
			glview->setScissorInPoints( _parentScissorRect.origin.x, _parentScissorRect.origin.y, _parentScissorRect.size.width, _parentScissorRect.size.height );
		}
		else
		{
			glDisable( GL_SCISSOR_TEST );
		}
	}
private:
	NodePointer _conteiner;
	Rect _frame;
	Rect _parentScissorRect;
	bool _scissorRestored;
	CustomCommand _beforeDrawCommand;
	CustomCommand _afterDrawCommand;
	bool _scissorEnabled;
	bool _childAddToConteiner;
};

NS_CC_END;

#endif