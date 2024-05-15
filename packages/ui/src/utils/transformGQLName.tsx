interface TransformGQLNameOptions {
  delimiters?: {
    oldDelimiter: string;
    newDelimiter: string;
  };
  firstLetterTransform?: (c: string) => string;
  addSpacesBetweenWords?: boolean;
}

/**
 * Transforms strings replacing the delimiters and first letters.
 * This is primarily used to transform the names of types and fields in GraphQL
 * schemas.
 */
export const transformGQLName = (
  word: string,
  options: TransformGQLNameOptions,
) => {
  const { delimiters, firstLetterTransform, addSpacesBetweenWords } = options;

  if (!word) {
    return "";
  }

  let newWord = "";
  if (firstLetterTransform) {
    newWord += firstLetterTransform(word[0]);
  }

  let i = newWord.length;
  while (i < word.length) {
    const character = word[i];
    const nextCharacter = word[i + 1];
    const previousCharacter = word[i - 1];

    const isDelimiter = delimiters && character === delimiters.oldDelimiter;

    if (addSpacesBetweenWords && !isDelimiter) {
      const isCharacterUppercase = character === character.toUpperCase();
      const isPreviousCharacterUppercase =
        previousCharacter &&
        previousCharacter === previousCharacter.toUpperCase();

      // Add a space if the capital letter is not in an acronym like "OSK"
      if (isCharacterUppercase && !isPreviousCharacterUppercase) {
        newWord += " ";
      }
      newWord += character;
    } else if (isDelimiter) {
      newWord += delimiters.newDelimiter;

      // Handle transforming first letter of word
      if (firstLetterTransform && nextCharacter) {
        newWord += firstLetterTransform(nextCharacter);
        // Move cursor ahead another character
        i += 1;
      }
    } else {
      newWord += character;
    }

    i += 1;
  }

  return newWord;
};
