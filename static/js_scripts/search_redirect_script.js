function onLoadDo() {
  const searchInput = document.getElementById("header_search");
  searchInput.addEventListener("keyup", function(event) {
    if (event.key !== "Enter") {
      return;
    }
    const qValue = searchInput.value;
    if (!qValue) {
      return;
    }
    // redirect to index page and enter query in respective field
    window.localStorage.setItem("redirectedSearchQuery", qValue);
    location.href = "/";
  });
}

function checkForLocalQuery() {
  const requestedQuery = localStorage.getItem("redirectedSearchQuery");
  if (!requestedQuery) {
    console.log("no query");
    displayMostPopular();
    return;
  }
  localStorage.removeItem("redirectedSearchQuery");
  console.log(requestedQuery);

  const queryElement = document.getElementById("query-search");
  queryElement.value = requestedQuery;
  document.getElementById("header_search").value = requestedQuery;
  processQuery();
}
