function normalSearch(searchValue, searchField, targetList) {
  const searchResult = targetList.find(
    (element) => element[searchField] === searchValue
  );
  return searchResult;
}

export { normalSearch };