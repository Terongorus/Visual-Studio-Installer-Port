using UnityEngine;
using UnityEditor;

namespace $rootnamespace$
{
	public class $safeitemname$ : ScriptableObject
	{
		[MenuItem("Tools/MyTool/Do It in C#")]
		static void DoIt()
		{
			EditorUtility.DisplayDialog("MyTool", "Do It in C# !", "OK", "");
		}
	}
}