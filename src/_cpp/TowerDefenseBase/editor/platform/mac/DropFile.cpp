#include "CCDirector.h"
#include "DropFileProtocol.h"

USING_NS_CC;

DropFileProtocol * DropFileProtocol::m_instance(NULL);

bool DropFileProtocol::init()
{
	return true;
}

void DropFileProtocol::cleanup()
{
}
