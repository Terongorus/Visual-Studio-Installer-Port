using System.Collections.Generic;

namespace UnrealBuildTool
{
	internal class AvailableTargetsConfigurations
	{
		public Dictionary<string, AvailableConfiguration> Targets { get; set; } = new Dictionary<string, AvailableConfiguration>();
	}
}
