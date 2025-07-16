---
description: Agents Toolkit 17.14 GA June release updates.
area: IDE
title: Microsoft 365 Agents Toolkit - June
thumbnailImage: ../media/ttk_da_create-thumb.png
featureId: TeamstoolkitJune

---


The June release contains several fixes for 17.14 GA release:

- Enable Custom Engine Agent launch and preview in Microsoft 365 Copilot.

There is a Custom Engine Agent template available in our toolkit which is called Weather Agent. We have updated this template to enable it to be launched and previewed in the Microsoft 365 Copilot chat. To try out, simply select the Copilot launch profile when you debug. 

- Fixed an error pop up when debug failed with installation of Microsoft 365 Agents playground. Now toolkit will pop up clear message and instructions on how to fix the issue.

- Templates upgrade [App manifest dependency to v1.21](https://developer.microsoft.com/json-schemas/teams/v1.22/MicrosoftTeams.schema.json).

- Several bugs in templates README file introduced by our new branding changes were fixed.

- Updated the toolkit icon in extension manager.

- Fixed the issue when launching Agents Playground, the required channel ID value only allows msteams and emulator. Now it allows other values like webchat.
