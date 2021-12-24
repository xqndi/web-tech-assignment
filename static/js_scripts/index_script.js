function processQuery() {
    const q = document.getElementById("query-search");

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
          const qid = key.substring(0, key.length - 1);
          let question = document.getElementById(ID_COUNTER.toString());

          if (!question) {
            question = document.createElement("a");
            question.id = ID_COUNTER.toString();
            question.innerText = val + "\n";
            question.href = "question/" + qid;
            document.body.appendChild(question);
          } else {
            question.innerText = val + "\n";
            question.href = "question/" + qid;
          }

          ID_COUNTER++;
        }
      });
     });

}