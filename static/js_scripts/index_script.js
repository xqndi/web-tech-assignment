function processQuery() {
    console.log("nice");
    const q = document.getElementById("query-search");
    console.log(q.value);

    if (!q.value) {
        return;
    }

    fetch("index-search", {
        method: "POST",
        body: q.value
    }).then(function(response) {
        response.text().then(function(text) {
          console.log(text);
        });
      });

}