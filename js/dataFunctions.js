export const getSearchTerm = () => {
  const rawSearchTerm = document.getElementById('search').value.trim();
  // regex finds if there are more than 1 blank spaces
  const regex = /[ ]{2,}/gi;
  // if more than 1 blank space, replaces it with 1 blank space
  const searchTerm = rawSearchTerm.replaceAll(regex, ' ');
  return searchTerm;
};

export const retrieveSearchResults = async searchTerm => {
  const wikiSearchString = getWikiSearchString(searchTerm);
  const wikiSearchResults = await requestData(wikiSearchString);
  let resultArray = [];
  if (wikiSearchResults.hasOwnProperty('query')) {
    // APi gives back each result as key within query.pages
    resultArray = processWikiResults(wikiSearchResults.query.pages);
  }
  return resultArray;
};

const getWikiSearchString = searchTerm => {
  const maxChars = getMaxChars();
  const rawSearchString = `https://en.wikipedia.org/w/api.php?action=query&generator=search&gsrsearch=${searchTerm}&gsrlimit=20&prop=pageimages|extracts&exchars=${maxChars}&exintro&explaintext&exlimit=max&format=json&origin=*`;
  // encodes URI (spaces become %20 for example) but preserves reserved chars (like ~!$&@#*()=:/,;?)
  const searchString = encodeURI(rawSearchString);
  return searchString;
};

const getMaxChars = () => {
  // tells wikipedia how many chars we want the extract to be long
  const width = window.innerWidth || document.body.clientWidth;
  let maxChars;

  if (width < 414) maxChars = 65;
  if (width >= 414 && width < 1400) maxChars = 100;
  if (width >= 1400) maxChars = 130;
  return maxChars;
};

const requestData = async searchString => {
  try {
    const response = await fetch(searchString);
    const data = await response.json();
    return data;
  } catch (err) {
    console.log(err);
  }
};

const processWikiResults = results => {
  const resultArray = [];
  Object.keys(results).forEach(key => {
    const id = key;
    const title = results[key].title;
    const text = results[key].extract;
    const img = results[key].hasOwnProperty('thumbnail')
      ? results[key].thumbnail.source
      : null;
    const item = {
      id: id,
      title: title,
      img: img,
      text: text,
    };
    resultArray.push(item);
  });
  return resultArray;
};
