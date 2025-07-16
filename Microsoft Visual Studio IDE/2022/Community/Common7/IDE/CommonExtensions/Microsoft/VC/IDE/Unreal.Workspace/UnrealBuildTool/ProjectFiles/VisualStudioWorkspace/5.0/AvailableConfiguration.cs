using System.Collections.Generic;

namespace UnrealBuildTool
{
	internal class AvailableConfiguration
	{
		public HashSet<string> Configurations { get; set; } = new HashSet<string>();

		public HashSet<string> Platforms { get; set; } = new HashSet<string>();

		public string TargetPath { get; set; } = string.Empty;

		public string ProjectPath { get; set; } = string.Empty;

		public string TargetType { get; set; } = string.Empty;
	}
}
