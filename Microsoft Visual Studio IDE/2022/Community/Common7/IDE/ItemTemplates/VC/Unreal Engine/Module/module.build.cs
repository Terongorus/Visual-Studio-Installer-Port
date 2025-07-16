using UnrealBuildTool;

public class $module_name$: ModuleRules
{
    public $module_name$(ReadOnlyTargetRules Target) : base(Target)
    {
        PrivateDependencyModuleNames.AddRange(new string[] {"Core", "CoreUObject", "Engine"});
    }
}
