* Read this file first to understand the assignment
* Analyze the entire project to understand it
* Do not modify the codebase at all at this point. This is a planning phase.
* Perform an analysis of the task, search the codebase, and generate specific implementation steps that needs to be taken to achieve this goal.
* Output these steps as a structured FEATURE.md PRP document to be used as a prompt.
* Make the PRP complete, so that the feature can be feasibly implemented by an agent after reading the PRP, without further research.
* Do not assume things. Always verify by checking the md files or ask for clarification.
* If anything in this file needs clarification before generating the PRP, ask for additional information before continuing.

Code standards
* Add comprehensive unit tests for business logic and any UI change that would reasonably benefit from a test.
* Split code into components, and split those in separate files accordingly.
* Do not use inline styling. Use styled-components approach.
* Explaing any complex code with comments, try to avoid complex code if possible.

UI specs
* All UI modifications and additions will follow current color scheme and visual feel of the application
* New button controls will be accessible through hotkeys, but these hotkeys must not be any letters, to not interfere with the answer input.

Other considerations
* After implementing the feature, update README so that is contains up to date information about usage, features and any oother relevant information.
* If expecting to modify llarge datasets, e.g. the json containing characters, do not process it directly. Instead generate a helper script files which can generate helper outputs, then run those. Afterwards delete these helper files.

Feature
* Add different flashcard modes to the application, on top of the current character => pinyin mode
* The new modes will be (1) the current one, titled 拼音, (2) a mode showing traditional annd requiring user to input simplified, titled 简体, and (3) reverse of the previous mode. Showing simplified, and expecting input in traditional, titled 繁体.
* Toggling between these modes will be done through three buttons located on top of the app, outside tha main contained. These buttons will be on the same vertical level, next to each other, together occupying the full width of the game container, but not being in any visual container themselves.
* When a mode is switched, flashcard stats will reset, as if the page was reloaded
* The modes 2 and 3 will have different character range limit, between 50 and the maximum possible for the current dataset. Only use characters that differ in simplified and traditional for these 2 modes. Ignore the ones that are the same, and adjust the maximum range accordingly.
* The incorrect answer UI will retain its format in all modes, only the submitted column will contain whatever the user submitted, colored based on whether that answer was correct or not for given mode.
* As this change will increase the overall height of the application, reduce vertical empty space wherever appropriate, e.g. above and below the answer input field, but maintain the UI easily readable.
* Default mode will be 拼音
