- read this first to understand the assignment
- do not execute any changes on the codebase in this step
- output of this step is a FEATURE.md file, containing a comprehensive steps how to achieve the objective described in this planning file.
- do all research, whole app analysis, and prepare stages and steps to take. Specify these in a form of a PRP in the FEATURE.md file
- create the PRP file thoroughly, so that it is complete and can be used as a source of truth for implementation of this whole assignment.
- do not assume things. Always verify the code or this file. Ask for clarification before outputting the PRP.

ASSIGNMENT:
- refactor the projects, pay attention to:
    - file structure, and structure of business logic in the files
    - names of files, components, classes, test files, hooks, utilities etc.
    - test files, and tests. check that they do what their description says, and that this test is relevant to the current application business logic
    - if there are tests that are outdated, illogical, or are testing something that doesn't make sense, come up with more appropriate test cases
- check for values. avoid hardcoding string, and use enums instead
- check for duplicate code. unify everything, so that things are referenced properly
- check for UI components that could be merged, or styled components definitions that repeat.
- unify the look and feel of the whole application and UI elements across the tool.
- consider whether a separate color and theme definition should be created.
- at the end, do a proper update of the readme file, so that it is up to date.

CODE CONSIDERATIONS:
- use best practices for React apps
- make sure the test suite is complete, makes sense logically, and is passing
- make sure the build runs
- fix any eslint errors
- if dependencies need to be adjusted, update them.
