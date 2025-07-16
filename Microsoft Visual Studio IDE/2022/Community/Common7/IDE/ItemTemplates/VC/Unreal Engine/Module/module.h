#pragma once

#include "CoreMinimal.h"
#include "Modules/ModuleInterface.h"

class $prefixed_module_name$ : public FDefaultModuleImpl
{
public:
	virtual void StartupModule() override;
	virtual void ShutdownModule() override;
};