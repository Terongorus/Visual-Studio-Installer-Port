using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using Tools.DotNETCommon;
using static UnrealBuildTool.VCProjectFile;

namespace UnrealBuildTool
{
	public class AvailableConfiguration
	{
		public List<string> Configurations { get; set; } = new List<string>();

		public List<string> Platforms { get; set; } = new List<string>();

		public string TargetPath { get; set; } = string.Empty;

		public string ProjectPath { get; set; } = string.Empty;

		public string TargetType { get; set; } = string.Empty;
	}

	public class AvailableTargetsConfigurations
	{
		public Dictionary<string, AvailableConfiguration> Targets { get; set; } = new Dictionary<string, AvailableConfiguration>();
	}

	internal class VSWorkspaceProjectFile : ProjectFile
	{
		private readonly HashSet<TargetType> TargetTypes;
		private readonly CommandLineArguments Arguments;
		private VCProjectFileSettings Settings;
		private bool bUsePrecompiled;

		/// <summary>
		/// Collection of output files for this project
		/// </summary>
		public List<ExportedTargetInfo> ExportedTargetProjects { get; set; } = new List<ExportedTargetInfo>();

		public DirectoryReference RootPath { get; }

		public VSWorkspaceProjectFile(FileReference InProjectFilePath,
			DirectoryReference RootPath, HashSet<TargetType> TargetTypes, CommandLineArguments Arguments, VCProjectFileSettings Settings, bool bUsePrecompiled)
			: base(InProjectFilePath)
		{
			this.RootPath = RootPath;
			this.TargetTypes = TargetTypes;
			this.Arguments = Arguments;
			this.Settings = Settings;
			this.bUsePrecompiled = bUsePrecompiled;
		}

		/// <summary>
		/// Collect available configurations for the project storing it at <c>availableConfigurations</c> dictionary.
		/// </summary>
		/// <remarks>
		/// Keys for the dictionary are available project names.
		/// </remarks>
		/// <param name="availableConfigurations"></param>
		/// <param name="InPlatforms"></param>
		/// <param name="InConfigurations"></param>
		/// <param name="PlatformProjectGenerators"></param>
		/// <param name="Minimize"></param>
		public void CollectAvailableConfigurations(Dictionary<string, AvailableConfiguration> availableConfigurations,
			List<UnrealTargetPlatform> InPlatforms,
			List<UnrealTargetConfiguration> InConfigurations,
			PlatformProjectGeneratorCollection PlatformProjectGenerators,
			JsonWriterStyle Minimize)
		{
			ProcessProjectFiles(
				InPlatforms,
				InConfigurations,
				PlatformProjectGenerators,
				// always provide null in here as we want to collect all available data.
				null,
				(UnrealTargetConfiguration Configuration, UnrealTargetPlatform Platform, ProjectTarget ProjectTarget) =>
				{
					AvailableConfiguration availableConfiguration;

					if (!availableConfigurations.ContainsKey(ProjectTarget.Name))
					{
						availableConfiguration = new AvailableConfiguration();
						availableConfigurations.Add(ProjectTarget.Name, availableConfiguration);
					}

					availableConfiguration = availableConfigurations[ProjectTarget.Name];
					availableConfiguration.TargetType = ProjectTarget.TargetRules?.Type.ToString() ?? string.Empty;
					if (!availableConfiguration.Configurations.Contains(Configuration.ToString()))
					{
						availableConfiguration.Configurations.Add(Configuration.ToString());
					}
					if (!availableConfiguration.Platforms.Contains(Platform.ToString()))
					{
						availableConfiguration.Platforms.Add(Platform.ToString());
					}
					availableConfiguration.TargetPath = ProjectTarget.TargetFilePath.FullName;
					availableConfiguration.ProjectPath = ProjectTarget.UnrealProjectFilePath?.FullName ?? string.Empty;
				});
		}

		/// <summary>
		/// Write project file info in JSON file.
		/// For every combination of <c>UnrealTargetPlatform</c>, <c>UnrealTargetConfiguration</c> and <c>TargetType</c>
		/// will be generated separate JSON file.
		/// </summary>
		public bool WriteProjectFile(List<UnrealTargetPlatform> InPlatforms,
			List<UnrealTargetConfiguration> InConfigurations,
			PlatformProjectGeneratorCollection PlatformProjectGenerators,
			JsonWriterStyle Minimize,
			Dictionary<string, AvailableConfiguration> ProjectGenerationDescriptionData,
			VCProjectFileFormat VCFormat)
		{
			DirectoryReference ProjectRootFolder = RootPath;
			Dictionary<FileReference, Tuple<UEBuildTarget, bool>> FileToTarget = new Dictionary<FileReference, Tuple<UEBuildTarget, bool>>();

			ProcessProjectFiles(
				InPlatforms,
				InConfigurations,
				PlatformProjectGenerators,
				ProjectGenerationDescriptionData,
				(UnrealTargetConfiguration Configuration, UnrealTargetPlatform Platform, ProjectTarget ProjectTarget) =>
				{
					bool bBuildByDefault = ShouldBuildByDefaultForSolutionTargets && ProjectTarget.SupportedPlatforms.Contains(Platform);
					string DefaultArchitecture = UEBuildPlatform
											   .GetBuildPlatform(Platform)
											   .GetDefaultArchitecture(ProjectTarget.UnrealProjectFilePath);

					TargetDescriptor TargetDesc = new TargetDescriptor(ProjectTarget.UnrealProjectFilePath, ProjectTarget.Name,
						Platform, Configuration, DefaultArchitecture, Arguments);

					try
					{
						FileReference OutputFile = FileReference.Combine(ProjectRootFolder,
							$"{ProjectTarget.TargetFilePath.GetFileNameWithoutAnyExtensions()}_{Configuration}_{Platform}.json");

						UEBuildTarget BuildTarget = UEBuildTarget.Create(TargetDesc, false, false);
						FileToTarget.Add(OutputFile, new Tuple<UEBuildTarget, bool>(BuildTarget, bBuildByDefault));
					}
					catch (Exception Ex)
					{
						Log.TraceWarning("Exception while generating include data for Target:{0}, Platform: {0}, Configuration: {0}", TargetDesc.Name, Platform.ToString(), Configuration.ToString());
						Log.TraceWarning("{0}", Ex.ToString());
					}
				});


			foreach (var Entry in FileToTarget)
			{
				var OutputFile = Entry.Key;
				var BuildTarget = Entry.Value.Item1;
				var bBuildByDefault = Entry.Value.Item2;

				try
				{
					BuildTarget.PreBuildSetup();

					ExportedTargetInfo TargetInfo = ExportTarget(BuildTarget, bBuildByDefault, PlatformProjectGenerators, VCFormat);

					// Need a workaround to escape the keys of the DirToModule dictionary, which is not done automatically
					// when serializing, resulting in an invalid JSON content.
					TargetInfo.DirToModule = TargetInfo.DirToModule.ToDictionary(x => Json.EscapeString(x.Key), x => x.Value);

					DirectoryReference.CreateDirectory(OutputFile.Directory);
					JsonSerializeOptions Options = Minimize == JsonWriterStyle.Readable
						? JsonSerializeOptions.PrettyPrint : JsonSerializeOptions.None;
					File.WriteAllText(OutputFile.FullName, Json.Serialize(TargetInfo, Options));

					ExportedTargetProjects.Add(TargetInfo);
				}
				catch (Exception Ex)
				{
					Log.TraceWarning("Exception while generating include data for Target:{0}, Platform: {1}, Configuration: {2}",
						BuildTarget.AppName, BuildTarget.Platform.ToString(), BuildTarget.Configuration.ToString());
					Log.TraceWarning("{0}", Ex.ToString());
				}
			}

			return true;
		}

		/// <summary>
		/// Filter configurations based on what is supported by the project.
		/// </summary>
		/// <param name="InPlatforms"></param>
		/// <param name="InConfigurations"></param>
		/// <param name="PlatformProjectGenerators"></param>
		/// <param name="ProjectGenerationDescriptionData"></param>
		/// <param name="Handler"></param>
		private void ProcessProjectFiles(List<UnrealTargetPlatform> InPlatforms,
			List<UnrealTargetConfiguration> InConfigurations,
			PlatformProjectGeneratorCollection PlatformProjectGenerators,
			Dictionary<string, AvailableConfiguration> ProjectGenerationDescriptionData,
			Action<UnrealTargetConfiguration, UnrealTargetPlatform, ProjectTarget> Handler)
		{
			DirectoryReference ProjectRootFolder = RootPath;
			foreach (UnrealTargetPlatform Platform in InPlatforms)
			{
				foreach (UnrealTargetConfiguration Configuration in InConfigurations)
				{
					foreach (ProjectTarget ProjectTarget in ProjectTargets.OfType<ProjectTarget>())
					{
						if (TargetTypes.Any() && !TargetTypes.Contains(ProjectTarget.TargetRules.Type))
						{
							continue;
						}

						// Skip Programs for all configs except for current platform + Development & Debug configurations
						if (ProjectTarget.TargetRules.Type == TargetType.Program &&
							(BuildHostPlatform.Current.Platform != Platform ||
							 !(Configuration == UnrealTargetConfiguration.Development || Configuration == UnrealTargetConfiguration.Debug)))
						{
							continue;
						}

						// Skip Editor for all platforms except for current platform
						if (ProjectTarget.TargetRules.Type == TargetType.Editor &&
							(BuildHostPlatform.Current.Platform != Platform ||
							(Configuration == UnrealTargetConfiguration.Test || Configuration == UnrealTargetConfiguration.Shipping)))
						{
							continue;
						}


						if (ShouldSkipConfiguration(ProjectGenerationDescriptionData, Configuration, Platform, ProjectTarget))
						{
							continue;
						}

						Handler(Configuration, Platform, ProjectTarget);
					}
				}
			}
		}

		private static bool ShouldSkipConfiguration(Dictionary<string, AvailableConfiguration> ProjectGenerationDescriptionData,
				UnrealTargetConfiguration Configuration,
				UnrealTargetPlatform Platform,
				ProjectTarget ProjectTarget)
		{
			// No restrictions were provided, we should not skip anything.
			if (ProjectGenerationDescriptionData == null)
			{
				return false;
			}

			// Configs were provided, but we could not find it in the dictionary, so we should not skip it.
			if (!ProjectGenerationDescriptionData.ContainsKey(ProjectTarget.Name))
			{
				return true;
			}

			AvailableConfiguration availableConfiguration = ProjectGenerationDescriptionData[ProjectTarget.Name];

			return !availableConfiguration.Configurations.Contains(Configuration.ToString()) || !availableConfiguration.Platforms.Contains(Platform.ToString());
		}

		private ExportedTargetInfo ExportTarget(
			UEBuildTarget Target, bool bBuildByDefault, PlatformProjectGeneratorCollection PlatformProjectGenerators, VCProjectFileFormat VCFormat)
		{
			ExportedTargetInfo TargetInfo = new ExportedTargetInfo()
			{
				TargetName = Target.TargetName,
				TargetPath = Target.TargetRulesFile.FullName,
				ProjectPath = Target.ProjectFile?.FullName ?? String.Empty,
				TargetType = Target.TargetType.ToString(),
				Platform = Target.Platform.ToString(),
				VCPlatform = GetVCPlatform(Target, PlatformProjectGenerators, VCFormat),
				Configuration = Target.Configuration.ToString(),
				VCConfiguration = GetVCConfiguration(Target, PlatformProjectGenerators, VCFormat),
				BuildInfo = ExportBuildInfo(Target, PlatformProjectGenerators, bBuildByDefault)
			};

			UEToolChain TargetToolChain = Target.CreateToolchain(Target.Platform);
			CppCompileEnvironment GlobalCompileEnvironment = Target.CreateCompileEnvironmentForProjectFiles();

			HashSet<string> ModuleNames = new HashSet<string>();
			foreach (UEBuildBinary Binary in Target.Binaries)
			{
				CppCompileEnvironment BinaryCompileEnvironment = Binary.CreateBinaryCompileEnvironment(GlobalCompileEnvironment);
				IEnumerable<UEBuildModuleCPP> CandidateModules = Binary.Modules.Where(x => x is UEBuildModuleCPP).Cast<UEBuildModuleCPP>();

				foreach (var ModuleCpp in CandidateModules)
				{
					if (!ModuleNames.Add(ModuleCpp.Name))
					{
						continue;
					}

					CppCompileEnvironment ModuleCompileEnvironment = ModuleCpp.CreateCompileEnvironmentForIntellisense(Target.Rules, BinaryCompileEnvironment);
					TargetInfo.ModuleToCompileSettings.Add(ModuleCpp.Name, ExportModule(ModuleCpp, TargetToolChain, ModuleCompileEnvironment));

					foreach (DirectoryReference ModuleDirectory in ModuleCpp.ModuleDirectories)
					{
						if (!TargetInfo.DirToModule.ContainsKey(ModuleDirectory.FullName))
						{
							TargetInfo.DirToModule.Add(ModuleDirectory.FullName, ModuleCpp.Name);
						}
					}

					if (ModuleCpp.GeneratedCodeDirectory != null)
					{
						if (!TargetInfo.DirToModule.ContainsKey(ModuleCpp.GeneratedCodeDirectory.FullName))
						{
							TargetInfo.DirToModule.Add(ModuleCpp.GeneratedCodeDirectory.FullName, ModuleCpp.Name);
						}
					}
				}
			}

			return TargetInfo;
		}

		private static ExportedModuleInfo ExportModule(UEBuildModuleCPP Module, UEToolChain TargetToolChain, CppCompileEnvironment ModuleCompileEnvironment)
		{
			ExportedModuleInfo Result = new ExportedModuleInfo()
			{
				Name = Module.Name,
				Directory = Module.ModuleDirectory.FullName,
				Rules = Module.RulesFile.FullName,
				GeneratedCodeDirectory = Module.GeneratedCodeDirectory != null ? Module.GeneratedCodeDirectory.FullName : String.Empty,
				Standard = ModuleCompileEnvironment.CppStandard.ToString(),
			};

			Result.IncludePaths.AddRange(Module.PublicIncludePaths.Select(x => x.FullName));
			Result.IncludePaths.AddRange(Module.PublicSystemIncludePaths.Select(x => x.FullName));
			Result.IncludePaths.AddRange(Module.LegacyPublicIncludePaths.Select(x => x.FullName));
			Result.IncludePaths.AddRange(Module.PrivateIncludePaths.Select(x => x.FullName));

			Result.IncludePaths.AddRange(ModuleCompileEnvironment.UserIncludePaths.Select(x => x.FullName));

			Result.IncludePaths.AddRange(Module.PublicSystemLibraryPaths.Select(x => x.FullName));
			Result.IncludePaths.AddRange(Module.PublicSystemLibraries.Concat(Module.PublicLibraries.Select(x => x.FullName)));

			VCToolChain TargetVCToolChain = TargetToolChain as VCToolChain;
			if (TargetToolChain != null)
			{
				string VCIncludePaths = VCToolChain.GetVCIncludePaths(ModuleCompileEnvironment.Platform, WindowsCompiler.VisualStudio2022, null);
				Result.IncludePaths.AddRange(VCIncludePaths.Split(';'));
			}

			Result.Defines.AddRange(Module.PublicDefinitions);
			Result.Defines.AddRange(Module.Rules.PrivateDefinitions);
			Result.Defines.AddRange(Module.Rules.bTreatAsEngineModule ? Array.Empty<string>() : Module.Rules.Target.ProjectDefinitions);
			Result.Defines.AddRange(Module.GetEmptyApiMacros());

			var ForcedIncludes = ModuleCompileEnvironment.ForceIncludeFiles.ToList();
			if (ModuleCompileEnvironment.PrecompiledHeaderAction == PrecompiledHeaderAction.Include)
			{
				FileItem IncludeHeader = FileItem.GetItemByFileReference(ModuleCompileEnvironment.PrecompiledHeaderIncludeFilename);
				ForcedIncludes.Insert(0, IncludeHeader);

				Result.PrecompiledHeader = IncludeHeader.FullName;
			}

			Result.ForcedIncludes.AddRange(ForcedIncludes.Select(x => x.FullName));

			Result.CompilerPath = TargetToolChain.GetCppCompilerPath()?.ToString();
			Result.CompilerArgs.AddRange(TargetToolChain.GetGlobalCommandLineArgs(ModuleCompileEnvironment));
			Result.CompilerAdditionalArgs.Add("c", TargetToolChain.GetCCommandLineArgs(ModuleCompileEnvironment).ToList());
			Result.CompilerAdditionalArgs.Add("cpp", TargetToolChain.GetCPPCommandLineArgs(ModuleCompileEnvironment).ToList());

			return Result;
		}

		private TargetBuildInfo ExportBuildInfo(UEBuildTarget Target, PlatformProjectGeneratorCollection PlatformProjectGenerators, bool bBuildByDefault)
		{
			if (!BuildHostPlatform.Current.Platform.IsInGroup(UnrealPlatformGroup.Windows))
			{
				Log.TraceWarning("Unsupported platform for Build Information: {Platform}", BuildHostPlatform.Current.Platform.ToString());
				return null;
			}

			if (IsStubProject)
			{
				return null;
			}

			ProjectTarget ProjectTarget = ProjectTargets.OfType<ProjectTarget>().Single(It => Target.TargetRulesFile == It.TargetFilePath);
			UnrealTargetPlatform Platform = Target.Platform;
			UnrealTargetConfiguration Configuration = Target.Configuration;

			string UProjectPath = "";
			if (IsForeignProject)
			{
				UProjectPath = String.Format("\"{0}\"", ProjectTarget.UnrealProjectFilePath.FullName);
			}

			PlatformProjectGenerator ProjGenerator = PlatformProjectGenerators.GetPlatformProjectGenerator(Platform, true);

			string BuildArguments = GetBuildArguments(ProjGenerator, ProjectTarget, Target, UProjectPath);

			return new TargetBuildInfo()
			{
				BuildCmd = $"{GetBuildScript("Build")} {BuildArguments}",
				RebuildCmd = $"{GetBuildScript("Rebuild")} {BuildArguments}",
				CleanCmd = $"{GetBuildScript("Clean")} {BuildArguments}",
				PrimaryOutput = Target.Binaries[0].OutputFilePath.FullName,
				BuildByDefault = bBuildByDefault,
			};
		}

		private string GetBuildScript(string Cmd)
		{
			DirectoryReference BatchFilesDirectory = DirectoryReference.Combine(UnrealBuildTool.EngineDirectory, "Build", "BatchFiles");
			return EscapePath(FileReference.Combine(BatchFilesDirectory, $"{Cmd}.bat").FullName);
		}

		private string GetBuildArguments(
			PlatformProjectGenerator ProjGenerator, ProjectTarget ProjectTarget, UEBuildTarget Target, string UProjectPath)
		{
			UnrealTargetConfiguration Configuration = Target.Configuration;
			UnrealTargetPlatform Platform = Target.Platform;
			string TargetName = ProjectTarget.TargetFilePath.GetFileNameWithoutAnyExtensions();
			TargetRules TargetRulesObject = ProjectTarget.TargetRules;

			// This is the standard UE based project NMake build line:
			//	..\..\Build\BatchFiles\Build.bat <TARGETNAME> <PLATFORM> <CONFIGURATION>
			//	ie ..\..\Build\BatchFiles\Build.bat BlankProgram Win64 Debug

			StringBuilder BuildArguments = new StringBuilder();

			BuildArguments.AppendFormat("{0} {1} {2}", TargetName, Configuration, Platform);
			if (IsForeignProject)
			{
				BuildArguments.AppendFormat(" -Project={0}", UProjectPath);
			}

			List<string> ExtraTargets = new List<string>();
			if (!bUsePrecompiled)
			{
				if (TargetRulesObject.Type == TargetType.Editor && Settings.bEditorDependsOnShaderCompileWorker && !UnrealBuildTool.IsEngineInstalled())
				{
					ExtraTargets.Add("ShaderCompileWorker Win64 Development");
				}
				if (TargetRulesObject.bWithLiveCoding && Settings.bBuildLiveCodingConsole && !UnrealBuildTool.IsEngineInstalled() && TargetRulesObject.Name != "LiveCodingConsole")
				{
					ExtraTargets.Add(TargetRulesObject.bUseDebugLiveCodingConsole ? "LiveCodingConsole Win64 Debug" : "LiveCodingConsole Win64 Development");
				}
			}

			if (ExtraTargets.Count > 0)
			{
				BuildArguments.Replace("\"", "\\\"");
				BuildArguments.Insert(0, "-Target=\"");
				BuildArguments.Append("\"");
				foreach (string ExtraTarget in ExtraTargets)
				{
					BuildArguments.AppendFormat(" -Target=\"{0} -Quiet\"", ExtraTarget);
				}
			}

			if (bUsePrecompiled)
			{
				BuildArguments.Append(" -UsePrecompiled");
			}

			// Always wait for the mutex between UBT invocations, so that building the whole solution doesn't fail.
			BuildArguments.Append(" -WaitMutex");

			// Always include a flag to format log messages for MSBuild
			BuildArguments.Append(" -FromMsBuild");

			if (Settings.bAddFastPDBToProjects)
			{
				// Pass Fast PDB option to make use of Visual Studio's /DEBUG:FASTLINK option
				BuildArguments.Append(" -FastPDB");
			}

			if (ProjGenerator != null)
			{
				BuildArguments.Append(ProjGenerator.GetExtraBuildArguments(Platform, Configuration));
			}

			return BuildArguments.ToString();
		}

		private string GetVCPlatform(UEBuildTarget Target, PlatformProjectGeneratorCollection Generators, VCProjectFileFormat VCFormat)
		{
			PlatformProjectGenerator Generator = Generators.GetPlatformProjectGenerator(Target.Platform, true);
			if (Generator != null)
			{
				if (Generator.HasVisualStudioSupport(Target.Platform, Target.Configuration, VCFormat))
				{
					return Generator.GetVisualStudioPlatformName(Target.Platform, Target.Configuration);
				}

				return DefaultPlatformName;
			}

			return string.Empty;
		}

		private string GetVCConfiguration(UEBuildTarget Target, PlatformProjectGeneratorCollection Generators, VCProjectFileFormat VCFormat)
		{
			PlatformProjectGenerator Generator = Generators.GetPlatformProjectGenerator(Target.Platform, true);
			string configuration = string.Empty;

			if (Generator != null)
			{
				if (Generator.HasVisualStudioSupport(Target.Platform, Target.Configuration, VCFormat))
				{
					configuration = Target.Configuration.ToString();
				}

				if (string.IsNullOrEmpty(configuration))
				{
					configuration = Target.Platform + "_" + Target.Configuration.ToString();
				}

				if (Target.TargetType != TargetType.Game)
				{
					configuration += "_" + Target.TargetType.ToString();
				}
			}

			return configuration;
		}


		internal class ExportedTargetInfo
		{
			public string TargetName { get; set; } = String.Empty;
			public string TargetPath { get; set; } = String.Empty;
			public string ProjectPath { get; set; } = String.Empty;
			public string TargetType { get; set; } = String.Empty;
			public string Platform { get; set; } = String.Empty;
			public string VCPlatform { get; set; } = String.Empty;
			public string Configuration { get; set; } = String.Empty;
			public string VCConfiguration { get; set; } = String.Empty;
			public TargetBuildInfo BuildInfo { get; set; }
			public Dictionary<string, ExportedModuleInfo> ModuleToCompileSettings { get; set; } = new Dictionary<string, ExportedModuleInfo>();
			public Dictionary<string, string> DirToModule { get; set; } = new Dictionary<string, string>();
		}

		internal class ExportedModuleInfo
		{
			public string Name { get; set; } = String.Empty;
			public string Directory { get; set; } = String.Empty;
			public string Rules { get; set; } = String.Empty;
			public string GeneratedCodeDirectory { get; set; } = String.Empty;
			public List<string> IncludePaths { get; set; } = new List<string>();
			public List<string> Defines { get; set; } = new List<string>();
			public string Standard { get; set; }
			public string PrecompiledHeader { get; set; }
			public List<string> ForcedIncludes { get; set; } = new List<string>();
			public string CompilerPath { get; set; }
			public List<string> CompilerArgs { get; set; } = new List<string>();
			public Dictionary<string, List<string>> CompilerAdditionalArgs { get; set; } = new Dictionary<string, List<string>>();
			public string WindowsSdkVersion { get; set; }
		}

		internal class TargetBuildInfo
		{
			public string BuildCmd { get; set; } = String.Empty;
			public string RebuildCmd { get; set; } = String.Empty;
			public string CleanCmd { get; set; } = String.Empty;
			public string PrimaryOutput { get; set; } = String.Empty;
			public bool BuildByDefault { get; internal set; }
		}
	}
}
