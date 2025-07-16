---
description: Configuring include completion allows you to control which headers appear in the include completion list.
area: C++
title: Configurable Include Completion
thumbnailImage: ../media/IncludeStyleSuggestionsSetting-thumb.png
featureId: ConfigurableIncludeCompletion
devComUrl: https://developercommunity.visualstudio.com/t/Include--is-now-behaving-the-same-as-/10538420

---


You can now control which headers appear in the include completion list when you type `#include`.

The dropdown setting in **Tools > Options > Text Editor > C/C++ > IntelliSense > Include style for suggestions** now affects both include suggestions and include completion, with the following refined behaviors:

- **Core Guidelines (Default)**: Uses quotes for relative paths and angle brackets for everything else.
- **Quotes mode**: Uses quotes for all headers except standard headers, which use angle brackets.
- **Angle brackets mode**: Uses angle brackets for all headers that are part of the include path.

![Include Style for Suggestions Setting](../media/IncludeStyleSuggestionsSetting.png)

Previously, all headers (except relative ones) appeared in suggestions regardless of the syntax used. With this update, you can refine how header suggestions appear when using `#include <> and #include ""`.
