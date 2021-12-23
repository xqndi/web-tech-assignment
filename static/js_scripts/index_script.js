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
      response.json().then(function(text) {
        let ID_COUNTER = 1;
        for (const [key, val] of Object.entries(text)) {
          let question = document.getElementById(ID_COUNTER.toString());
          if (!question) {
            question = document.createElement("P");
            question.id = ID_COUNTER.toString();
            question.innerText = val;
            document.body.appendChild(question);
          } else {
            question.innerText = val;
          }

          ID_COUNTER++;
        }
      });
     });

}