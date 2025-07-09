Do a research on how to implement this feature. Save gathered information as a PRP into PRP/TRADITIONAL.md file, as detailed instructions to be executed later. Do not implement any code in this step. Make sure the PRP file is complete and accurate, so it can be used as a prompt to implement this feature without any further research.

## FEATURE:

- Extend the current chinese characters dataset in src/data.json to contain a traditional version of each character. To do this, search the internet for an appropriate source to download traditional characters (3000 most common) in a way that can be mapped to simplified. Only worry about the 3000 most common to avoid running out of resources.
- Extend the application so that it contains a toggle between traditional and simplified view. There should also be an option to show both versions alongside each other
- Extend the application functionality so that there's an input field to type in pinyin representation of the current character. This input should be case insensitive and accept letters without tone notation as correct. When pressing the next button, an evaluation feature should decide if the inputted pinyin was correctly corresponding to the shown character.
- Add a field showing how many of shown characters were answered correctly.
