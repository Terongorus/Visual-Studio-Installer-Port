---
description: You can now let Copilot adjust your pasted code to fit the context of your existing code.
area: GitHub Copilot
title: Adaptive paste
thumbnailImage: ../media/adaptive-paste-suggestion.png
featureId: adaptive-paste

---


When you're pasting code into Visual Studio, there are often additional steps required to make it work seamlessly. Parameters may need to be adjusted to match those already used in your solution, or the syntax and styling may not align with the rest of your document.

Adaptive paste is here to save you time and reduce effort by automatically adjusting the pasted code to fit the context of your existing code, minimizing the need for manual modifications. This feature also supports scenarios such as minor error fixes, code styling, formatting, human and code language translation, and fill-in-the-blank or continue-the-pattern tasks.

For instance, if you have a `Math` class that implements the `IMath` interface, copying and pasting the implementation for the `Ceiling` method into the same file will adapt it to implement the not yet implemented interface member `Floor`.

![Adapt pasted method to complete the interface](../media/adaptive-paste-complete-interface.mp4)

The adaptive paste UI will appear when you perform a regular paste {KeyboardShortcut:Edit.Paste}. Simply press the `TAB` key to request a suggestion, and you'll be shown a diff comparing the original pasted code with the adjusted code.

Try it out today by enabling the option **Tools > Options > GitHub > Copilot > Editor > Enable Adaptive Paste**.

### Want to try this out?
Activate GitHub Copilot Free and unlock this AI feature, plus many more.
No trial. No credit card. Just your GitHub account. [Get Copilot Free](https://github.com/settings/copilot).
