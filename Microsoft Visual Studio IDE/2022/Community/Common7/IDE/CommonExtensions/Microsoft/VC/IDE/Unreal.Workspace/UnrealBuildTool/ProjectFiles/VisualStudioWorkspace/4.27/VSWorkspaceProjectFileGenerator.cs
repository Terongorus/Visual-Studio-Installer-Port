using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;
using System.Xml;
using Tools.DotNETCommon;

namespace UnrealBuildTool
{
	class VSWorkspaceMasterProjectFolder : MasterProjectFolder
	{
		public VSWorkspaceMasterProjectFolder(ProjectFileGenerator InitOwnerProjectFileGenerator, string InitFolderName) :
			base(InitOwnerProjectFileGenerator, InitFolderName)
		{
		}
	}

	class VSWorkspaceProjectFileGenerator : ProjectFileGenerator
	{
		public override string ProjectFileExtension => ".json";

		// These properties are used by Visual Studio to determine where to read the project files.
		// So they must remain constant.
		private const string VSUnrealWorkspaceFileName = ".vs-unreal-workspace";
		private const string ProjectFilesFolder = "VisualStudio";
		private const string WorkspaceGeneratorVersion = "1.0.1";

		private readonly CommandLineArguments Arguments;

		/// <summary>
		/// List of deprecated platforms.
		/// Don't generate project model for these platforms unless they are specified in "Platforms" console arguments.
		/// </summary>
		/// <returns></returns>
		private readonly HashSet<UnrealTargetPlatform> DeprecatedPlatforms = new HashSet<UnrealTargetPlatform>();

		/// <summary>
		/// Platforms to generate project files for
		/// </summary>
		[CommandLine("-Platforms=", ListSeparator = '+')]
		HashSet<UnrealTargetPlatform> Platforms = new HashSet<UnrealTargetPlatform>();

		/// <summary>
		/// Target types to generate project files for
		/// </summary>
		[CommandLine("-TargetTypes=", ListSeparator = '+')]
		HashSet<TargetType> TargetTypes = new HashSet<TargetType>();

		/// <summary>
		/// Target configurations to generate project files for
		/// </summary>
		[CommandLine("-TargetConfigurations=", ListSeparator = '+')]
		HashSet<UnrealTargetConfiguration> TargetConfigurations = new HashSet<UnrealTargetConfiguration>();

		/// <summary>
		/// Projects to generate project files for
		/// </summary>
		[CommandLine("-ProjectNames=", ListSeparator = '+')]
		HashSet<string> ProjectNames = new HashSet<string>();

		/// <summary>
		/// Should format JSON files in human readable form, or use packed one without indents
		/// </summary>
		[CommandLine("-Minimize", Value = "Compact")]
		private JsonWriterStyle Minimize = JsonWriterStyle.Readable;

		[CommandLine("-Query=")]
		private string Query = string.Empty;

		[CommandLine("-TargetDescriptionFile=")]
		private string TargetDescriptionFile = string.Empty;

		[CommandLine("-WorkspaceGeneratorVersion")]
		private bool ShowVersionInfo = false;

		/// <summary>
		/// The settings object
		/// </summary>
		protected VCProjectFileSettings Settings = new VCProjectFileSettings();

		public VSWorkspaceProjectFileGenerator(FileReference InOnlyGameProject,
			CommandLineArguments InArguments)
			: base(InOnlyGameProject)
		{
			Arguments = InArguments;
			Arguments.ApplyTo(this);
			XmlConfig.ApplyTo(Settings);
		}

		public override bool ShouldGenerateIntelliSenseData() => true;

		public override void CleanProjectFiles(DirectoryReference InPrimaryProjectDirectory, string InPrimaryProjectName,
			DirectoryReference InIntermediateProjectFilesDirectory)
		{
			DirectoryReference.Delete(InPrimaryProjectDirectory);
		}

		protected override void ConfigureProjectFileGeneration(string[] Arguments, ref bool IncludeAllPlatforms)
		{
			base.ConfigureProjectFileGeneration(Arguments, ref IncludeAllPlatforms);
		}

		protected override ProjectFile AllocateProjectFile(FileReference InitFilePath)
		{
			VSWorkspaceProjectFile projectFile = new VSWorkspaceProjectFile(InitFilePath, InitFilePath.Directory,
				TargetTypes, Arguments, Settings, bUsePrecompiled);
			return projectFile;
		}

		public override MasterProjectFolder AllocateMasterProjectFolder(ProjectFileGenerator OwnerProjectFileGenerator,
			string FolderName)
		{
			return new VSWorkspaceMasterProjectFolder(OwnerProjectFileGenerator, FolderName);
		}

		protected override bool WriteProjectFiles(PlatformProjectGeneratorCollection PlatformProjectGenerators)
		{
			AvailableTargetsConfigurations descriptions = ReadProjectGenerateDescriptionFilePath();
			Dictionary<string, AvailableConfiguration> ProjectGenerationDescriptionData = null;
			if (descriptions != null)
			{
				ProjectGenerationDescriptionData = descriptions.Targets;
			}

			using (ProgressWriter Progress = new ProgressWriter("Writing project files...", true))
			{
				List<ProjectFile> ProjectsToGenerate = new List<ProjectFile>(GeneratedProjectFiles);
				if (ProjectNames.Any())
				{
					ProjectsToGenerate = ProjectsToGenerate.Where(Project =>
						ProjectNames.Contains(Project.ProjectFilePath.GetFileNameWithoutAnyExtensions())).ToList();
				}

				int TotalProjectFileCount = ProjectsToGenerate.Count;

				HashSet<UnrealTargetPlatform> PlatformsToGenerate = new HashSet<UnrealTargetPlatform>(SupportedPlatforms);
				if (Platforms.Any())
				{
					PlatformsToGenerate.IntersectWith(Platforms);
				}

				List<UnrealTargetPlatform> FilteredPlatforms = PlatformsToGenerate.Where(Platform =>
				{
					// Skip deprecated unless explicitly specified in the command line.
					return (!DeprecatedPlatforms.Contains(Platform) || Platforms.Contains(Platform)) && UEBuildPlatform.IsPlatformAvailable(Platform);
				}).ToList();

				HashSet<UnrealTargetConfiguration> ConfigurationsToGenerate = new HashSet<UnrealTargetConfiguration>(SupportedConfigurations);
				if (TargetConfigurations.Any())
				{
					ConfigurationsToGenerate.IntersectWith(TargetConfigurations);
				}

				List<UnrealTargetConfiguration> Configurations = ConfigurationsToGenerate.ToList();
				VCProjectFileFormat VCFormat = GetVCProjectFileFormat();

				for (int ProjectFileIndex = 0; ProjectFileIndex < ProjectsToGenerate.Count; ++ProjectFileIndex)
				{
					VSWorkspaceProjectFile CurrentProject = ProjectsToGenerate[ProjectFileIndex] as VSWorkspaceProjectFile;
					if (CurrentProject == null)
					{
						return false;
					}

					if (!CurrentProject.WriteProjectFile(FilteredPlatforms, Configurations, PlatformProjectGenerators, Minimize, ProjectGenerationDescriptionData, VCFormat))
					{
						return false;
					}

					foreach (var Target in CurrentProject.ProjectTargets.OfType<ProjectTarget>())
					{
						if (!TargetTypes.Any() || (Target.TargetRules != null && TargetTypes.Contains(Target.TargetRules.Type)))
						{
							// Ignore errors.
							WriteVCProjectFileForTarget(CurrentProject.RootPath, Target, VCFormat, FilteredPlatforms, Configurations, PlatformProjectGenerators, ProjectGenerationDescriptionData);
						}
					}

					Progress.Write(ProjectFileIndex + 1, TotalProjectFileCount);
				}

				Progress.Write(TotalProjectFileCount, TotalProjectFileCount);
			}

			return true;
		}

		private bool WriteAvailableConfigurations(PlatformProjectGeneratorCollection PlatformProjectGenerators)
		{
			Dictionary<string, AvailableConfiguration> AvailableConfigurations = new Dictionary<string, AvailableConfiguration>();
			HashSet<UnrealTargetPlatform> PlatformsToGenerate = new HashSet<UnrealTargetPlatform>(SupportedPlatforms);
			List<UnrealTargetPlatform> FilteredPlatforms = PlatformsToGenerate.Where(Platform =>
			  {
				  // Skip deprecated unless explicitly specified in the command line.
				  return (!DeprecatedPlatforms.Contains(Platform) || Platforms.Contains(Platform))
						 && UEBuildPlatform.IsPlatformAvailable(Platform);
			  }).ToList();

			for (int ProjectFileIndex = 0; ProjectFileIndex < GeneratedProjectFiles.Count; ++ProjectFileIndex)
			{
				VSWorkspaceProjectFile CurrentProject = GeneratedProjectFiles[ProjectFileIndex] as VSWorkspaceProjectFile;

				if (CurrentProject == null)
				{
					return false;
				}

				CurrentProject.CollectAvailableConfigurations(AvailableConfigurations, FilteredPlatforms, new HashSet<UnrealTargetConfiguration>(SupportedConfigurations).ToList(), PlatformProjectGenerators, Minimize);
			}

			FileReference OutputFile = FileReference.Combine(IntermediateProjectFilesPath, ProjectFilesFolder, Query);
			DirectoryReference.CreateDirectory(OutputFile.Directory);

			var Result = new
			{
				Targets = AvailableConfigurations,
			};

			JsonSerializeOptions Options = Minimize == JsonWriterStyle.Readable
				? JsonSerializeOptions.PrettyPrint : JsonSerializeOptions.None;
			File.WriteAllText(OutputFile.FullName, Json.Serialize(Result, Options));

			return true;
		}

		public override bool GenerateProjectFiles(PlatformProjectGeneratorCollection PlatformProjectGenerators,
			string[] Arguments)
		{
			if (ShowVersionInfo)
			{
				Log.TraceInformation("Workspace Generator Version: {0}", WorkspaceGeneratorVersion);
				return true;
			}

			bool IncludeAllPlatforms = true;
			ConfigureProjectFileGeneration(Arguments, ref IncludeAllPlatforms);

			if (bGeneratingGameProjectFiles || UnrealBuildTool.IsEngineInstalled())
			{
				MasterProjectPath = OnlyGameProject.Directory;
				MasterProjectName = OnlyGameProject.GetFileNameWithoutExtension();

				IntermediateProjectFilesPath =
					DirectoryReference.Combine(MasterProjectPath, "Intermediate", "ProjectFiles");
			}

			string SupportedPlatformNames;
			SetupSupportedPlatformsAndConfigurations(IncludeAllPlatforms: true, SupportedPlatformNames: out SupportedPlatformNames);
			Log.TraceVerbose("Supported platforms: {0}", SupportedPlatformNames);

			List<FileReference> AllGames = FindGameProjects();

			{
				// Find all of the target files.
				List<FileReference> AllTargetFiles = DiscoverTargets(AllGames);

				// If there are multiple targets of a given type for a project, use the order to determine which one gets a suffix.
				AllTargetFiles = AllTargetFiles.OrderBy(x => x.FullName, StringComparer.OrdinalIgnoreCase).ToList();

				ProjectFile EngineProjects = null;
				ProjectFile EnterpriseProject = null;
				List<ProjectFile> GameProjects;
				Dictionary<FileReference, ProjectFile> ProgramProjects;

				AddProjectsForAllTargets(
					PlatformProjectGenerators,
					AllGames,
					AllTargetFiles,
					Arguments,
					out EngineProjects,
					out EnterpriseProject,
					out GameProjects,
					out ProgramProjects);

				AddAllGameProjects(GameProjects, SupportedPlatformNames, ProjectsFolder: null);
			}

			if (!string.IsNullOrEmpty(Query))
			{
				return WriteAvailableConfigurations(PlatformProjectGenerators);
			}

			WriteProjectFiles(PlatformProjectGenerators);
			WriteMasterProjectFile(UBTProject, PlatformProjectGenerators);

			return true;
		}

		protected override bool WriteMasterProjectFile(ProjectFile UBTProject,
			PlatformProjectGeneratorCollection PlatformProjectGenerators)
		{
			try
			{
				FileReference PrimaryProjectFile = FileReference.Combine(
					IntermediateProjectFilesPath, ProjectFilesFolder, VSUnrealWorkspaceFileName);
				DirectoryReference.CreateDirectory(PrimaryProjectFile.Directory);

				// Collect all the resulting project files and aggregate the target-level data
				var AggregatedProjectInfo = GeneratedProjectFiles
					.Where(Project => Project is VSWorkspaceProjectFile)
					.OfType<VSWorkspaceProjectFile>()
					.SelectMany(Project => Project.ExportedTargetProjects)
					.GroupBy(TargetProject => TargetProject.TargetName)
					.Select(g => new
					{
						g.Key,
						Target = new
						{
							TargetType = g.Select(i => i.TargetType).Distinct().Single(),
							TargetPath = g.Select(i => i.TargetPath).Distinct().Single(),
							ProjectPath = g.Select(i => i.ProjectPath).Distinct().Single(),
							Configurations = g.Select(i => i.Configuration).Distinct().ToList(),
							Platforms = g.Select(i => i.Platform).Distinct().ToList(),
						}
					});

				// The inner Targets object is needed for schema compatibility with the Query Mode API.
				var Result = new
				{
					Targets = AggregatedProjectInfo.ToDictionary(item => item.Key, item => item.Target)
				};

				JsonSerializeOptions Options = Minimize == JsonWriterStyle.Readable
						? JsonSerializeOptions.PrettyPrint : JsonSerializeOptions.None;
				File.WriteAllText(PrimaryProjectFile.FullName, Json.Serialize(Result, Options));
			}
			catch (Exception Ex)
			{
				Log.TraceWarning("Exception while writing root project file: {0}", Ex.ToString());
				return false;
			}

			return true;
		}

		/// <inheritdoc />
		protected override FileReference GetProjectLocation(string BaseName)
		{
			return FileReference.Combine(IntermediateProjectFilesPath, ProjectFilesFolder, BaseName + ProjectFileExtension);
		}

		private AvailableTargetsConfigurations ReadProjectGenerateDescriptionFilePath()
		{
			if (string.IsNullOrEmpty(TargetDescriptionFile))
			{
				return null;
			}

			var data = Json.Deserialize<AvailableTargetsConfigurations>(File.ReadAllText(TargetDescriptionFile));

			foreach (var target in data.Targets)
			{
				target.Value.Platforms = target.Value.Platforms.Distinct().ToList();
				target.Value.Configurations = target.Value.Configurations.Distinct().ToList();
			}

			return data;

		}

		private static readonly Dictionary<string, string> NodesToUpdate = new Dictionary<string, string>
		{
			{ "NMakeBuildCommandLine", "$(_UProjectNMakeBuildCommandLine)" },
			{ "NMakeCleanCommandLine", "$(_UProjectNMakeCleanCommandLine)" },
			{ "NMakeCompileFileCommandLine", "$(_UProjectNMakeCompileFileCommandLine)" },
			{ "NMakeOutput", "$(_UProjectNMakeOutput)" },
			{ "NMakeReBuildCommandLine", "$(_UProjectNMakeReBuildCommandLine)" }
		};

		private readonly static HashSet<string> NodesAllowList = new HashSet<string>
		{
			"CleanDependsOn",
			"Configuration",
			"CppCleanDependsOn",
			"Import",
			"ImportGroup",
			"ItemDefinitionGroup",
			"ItemGroup",
			"NMakeBuildCommandLine",
			"NMakeCleanCommandLine",
			"NMakeCompile",
			"NMakeCompileFileCommandLine",
			"NMakeOutput",
			"NMakeReBuildCommandLine",
			"Platform",
			"Project",
			"ProjectConfiguration",
			"ProjectGuid",
			"PropertyGroup",
			"RootNamespace",
			"xml"
		};

		private readonly static HashSet<string> NodesBlockedList = new HashSet<string>
		{
			"AdditionalOptions",
			"ClCompile",
			"ClInclude",
			"IncludePath",
			"Manifest",
			"NMakeAssemblySearchPath",
			"NMakeForcedIncludes",
			"NMakeForcedUsingAssemblies",
			"NMakePreprocessorDefinitions",
			"None",
			"ProjectForcedIncludeFiles",
			"PropertyPageSchema",
			"ResourceCompile",
			"SourcePath"
		};

		private static readonly List<Regex> BlockedNodesListRegEx = new List<Regex>()
		{
			new Regex("ClCompile_AdditionalIncludeDirectories*"),
			new Regex("ClCompile_AdditionalOptions*"),
			new Regex("ClCompile_ForcedIncludeFiles*"),
			new Regex("ProjectAdditionalIncludeDirectories*"),
			new Regex("ProjectForcedIncludeFiles*")
		};

		private static readonly Dictionary<string, bool> ProjectDirectoryPropertyTemplates = new Dictionary<string, bool>
		{
			{ "$(ProjectDir)", true},
			{ "$(MSBuildProjectDirectory)", false},
			{ "$(MSBuildProjectDirectoryNoRoot)", false},
			{ "$(MSBuildThisFileDirectory)", true},
			{ "$(MSBuildThisFileDirectoryNoRoot)", true}
		};

		private VCProjectFileFormat GetVCProjectFileFormat()
		{
			// Enumerate all the valid installations. This list is already sorted by preference.
			List<VisualStudioInstallation> Installations = WindowsPlatform.VisualStudioInstallations.Where(x => WindowsPlatform.HasCompiler(x.Compiler)).ToList();

			// Get the corresponding project file format
			VCProjectFileFormat Format = VCProjectFileFormat.Default;
			foreach (VisualStudioInstallation Installation in Installations)
			{
				if (Installation.Compiler == WindowsCompiler.VisualStudio2022)
				{
					Format = VCProjectFileFormat.VisualStudio2022;
					break;
				}
				else if (Installation.Compiler == WindowsCompiler.VisualStudio2019)
				{
					Format = VCProjectFileFormat.VisualStudio2019;
					break;
				}
			}

			return Format;
		}

		private bool IncludePlatform(AvailableConfiguration AvailableConfiguration, UnrealTargetPlatform Platform, IList<UnrealTargetPlatform> FilteredPlatforms)
		{
			if (AvailableConfiguration == null || AvailableConfiguration.Platforms.Contains(Platform.ToString()))
			{
				FilteredPlatforms.Add(Platform);
				return true;
			}

			return false;
		}

		private bool IncludeConfiguration(AvailableConfiguration AvailableConfiguration, UnrealTargetConfiguration Configuration, IList<UnrealTargetConfiguration> FilteredConfigurations)
		{
			if (AvailableConfiguration == null || AvailableConfiguration.Configurations.Contains(Configuration.ToString()))
			{
				FilteredConfigurations.Add(Configuration);
				return true;
			}

			return false;
		}

		private bool WriteVCProjectFileForTarget(
			DirectoryReference RootPath,
			ProjectTarget Target,
			VCProjectFileFormat Format,
			List<UnrealTargetPlatform> Platforms,
			List<UnrealTargetConfiguration> Configurations,
			PlatformProjectGeneratorCollection PlatformProjectGenerators,
			Dictionary<string, AvailableConfiguration> ProjectGenerationDescriptionData)
		{
			AvailableConfiguration AvailableConfiguration = null;
			List<UnrealTargetPlatform> FilteredPlatforms = Platforms;
			List<UnrealTargetConfiguration> FilteredConfigurations = Configurations;
			FileReference Output = FileReference.Combine(RootPath, $"{Target.TargetFilePath.GetFileNameWithoutAnyExtensions()}.proj");

			try
			{
				string relativeProjectFilesPath = IntermediateProjectFilesPath.MakeRelativeTo(RootPath);
				Dictionary<string, string> ProjectDirectoryProperties = new Dictionary<string, string>();

				if (!string.IsNullOrEmpty(relativeProjectFilesPath))
				{
					if (relativeProjectFilesPath[0] == '\\' || relativeProjectFilesPath[0] == '/')
					{
						relativeProjectFilesPath = relativeProjectFilesPath.Substring(1);
					}

					if (!string.IsNullOrEmpty(relativeProjectFilesPath) && (relativeProjectFilesPath[relativeProjectFilesPath.Length - 1] == '\\' || relativeProjectFilesPath[relativeProjectFilesPath.Length - 1] == '/'))
					{
						relativeProjectFilesPath = relativeProjectFilesPath.Substring(0, relativeProjectFilesPath.Length - 1);
					}

					if (!string.IsNullOrEmpty(relativeProjectFilesPath))
					{
						foreach (var template in ProjectDirectoryPropertyTemplates)
						{
							var replaceValue = template.Key + (template.Value ? "" : "\\") + relativeProjectFilesPath + (template.Value ? "\\" : "");
							ProjectDirectoryProperties[template.Key] = replaceValue;
						}
					}
				}

				if (ProjectGenerationDescriptionData != null)
				{
					if (!ProjectGenerationDescriptionData.TryGetValue(Target.Name, out AvailableConfiguration))
					{
						AvailableConfiguration = new AvailableConfiguration();
					}
				}

				if (Target.TargetRules != null)
				{
					if (Target.TargetRules.Type == TargetType.Program)
					{
						return true;
					}

					if (Target.TargetRules.Type == TargetType.Editor)
					{
						FilteredPlatforms = new List<UnrealTargetPlatform>();
						IncludePlatform(AvailableConfiguration, BuildHostPlatform.Current.Platform, FilteredPlatforms);

						FilteredConfigurations = new List<UnrealTargetConfiguration>();
						IncludeConfiguration(AvailableConfiguration, UnrealTargetConfiguration.Debug, FilteredConfigurations);
						IncludeConfiguration(AvailableConfiguration, UnrealTargetConfiguration.DebugGame, FilteredConfigurations);
						IncludeConfiguration(AvailableConfiguration, UnrealTargetConfiguration.Development, FilteredConfigurations);
					}
				}

				if (AvailableConfiguration != null && FilteredPlatforms == Platforms && FilteredConfigurations == Configurations)
				{
					FilteredPlatforms = new List<UnrealTargetPlatform>();
					FilteredConfigurations = new List<UnrealTargetConfiguration>();

					foreach (var Platform in Platforms)
					{
						IncludePlatform(AvailableConfiguration, Platform, FilteredPlatforms);
					}

					foreach (var Configuration in Configurations)
					{
						IncludeConfiguration(AvailableConfiguration, Configuration, FilteredConfigurations);
					}
				}

				if (FilteredPlatforms.Count == 0 || FilteredConfigurations.Count == 0)
				{
					return true;
				}

				var Settings = new VCProjectFileSettings();
				Settings.MaxSharedIncludePaths = 0;

				var VCProject = new VCProjectFile(Output, Format, false, null, Settings);
				VCProject.ProjectTargets.Add(Target);
				if (VCProject.WriteProjectFile(FilteredPlatforms, FilteredConfigurations, PlatformProjectGenerators))
				{
					XmlDocument XmlDoc = new XmlDocument();
					XmlDoc.Load(Output.FullName);

					List<XmlNode> RemovedChildNodes = new List<XmlNode>();

					Queue<XmlNode> Nodes = new Queue<XmlNode>();
					Nodes.Enqueue(XmlDoc);

					while (Nodes.Count != 0)
					{
						XmlNode Node = Nodes.Dequeue();
						using (var NodeList = Node.ChildNodes)
						{
							if (NodeList != null)
							{
								foreach (XmlNode ChildNode in NodeList)
								{
									if (ChildNode != null && ChildNode.NodeType != XmlNodeType.Text)
									{
										if (NodesAllowList.Contains(ChildNode.Name))
										{
											Nodes.Enqueue(ChildNode);
											continue;
										}
										else if (NodesBlockedList.Contains(ChildNode.Name))
										{
											RemovedChildNodes.Add(ChildNode);
											continue;
										}
										else
										{
											foreach (var RegEx in BlockedNodesListRegEx)
											{
												if (RegEx.Match(ChildNode.Name).Success)
												{
													RemovedChildNodes.Add(ChildNode);
													continue;
												}
											}

											Nodes.Enqueue(ChildNode);
											continue;
										}
									}
									else
									{
										string NewNodeValue;
										if (NodesToUpdate.TryGetValue(Node.Name, out NewNodeValue) && !string.IsNullOrEmpty(NewNodeValue))
										{
											Node.InnerText = NewNodeValue;
										}
										else
										{
											if (ProjectDirectoryProperties.Count != 0 && Node.InnerText.Contains("$("))
											{
												NewNodeValue = Node.InnerText;
												foreach (var projectDirectoryProperty in ProjectDirectoryProperties)
												{
													NewNodeValue =  ReplaceAllValuesIgnoreCase(NewNodeValue, projectDirectoryProperty.Key, projectDirectoryProperty.Value);
												}

												Node.InnerText = NewNodeValue;
											}
										}
									}
								}
							}
						}

						foreach (var ChildNode in RemovedChildNodes)
						{
							Node.RemoveChild(ChildNode);
						}

						if (Node.ChildNodes.Count == 0 && Node.Attributes?.Count == 0)
						{
							Node.ParentNode?.RemoveChild(Node);
						}

						RemovedChildNodes.Clear();
					}

					XmlDoc.Save(Output.FullName);
				}
				else
				{
					throw new BuildException("Failed to create workspace project file {0}", Output.FullName);
				}
			}
			catch (Exception)
			{
				Log.TraceWarning("Failed to create workspace project files. Disabling Visual Studio workspace MSBuild integration for target {0}.", Target.Name);
				if (File.Exists(Output.FullName))
				{
					File.Delete(Output.FullName);
				}

				return false;
			}

			return true;
		}

		private static string ReplaceAllValuesIgnoreCase(string currentValue, string oldValue, string newValue)
		{
			var result = new StringBuilder(currentValue.Length);
			bool hasDoneAnyReplacements = false;
			int currentIndex = 0;

			while (true)
			{
				int index = currentValue.IndexOf(oldValue, currentIndex, StringComparison.InvariantCultureIgnoreCase);
				if (index < 0)
				{
					break;
				}

				result.Append(currentValue.Substring(currentIndex, index - currentIndex));

				result.Append(newValue);

				currentIndex = index + oldValue.Length;
				hasDoneAnyReplacements = true;
			}

			if (!hasDoneAnyReplacements)
			{
				return currentValue;
			}

			result.Append(currentValue.Substring(currentIndex));
			return result.ToString();
		}
	}
}
