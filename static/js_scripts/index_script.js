const { response } = require("express");

function processQuery() {
    hideArticles();
    const q = document.getElementById("query-search");

    if (!q.value) {
        displayArticles();
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
            question.href = UID + "/question/" + qid;
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

function hideArticles() {
  fetch("popular-articles", {
    method: "GET"
  }).then(function(response) {
    response.json().then(function(text) {
      let ID_COUNTER = 1;
      for (const el of text)
      {
        let question = document.getElementById(ID_COUNTER.toString());
        question.remove();
        ID_COUNTER++;
      }
    })
  })
}


function displayArticles() {
  var url_string = window.location.href;
  var url = new URL(url_string);

    // kinda dirty...
  const arr = url.pathname.split("/");
  UID = arr[arr.length - 1];
    
  if (UID != "")
  {
    var section = document.getElementById("login/register");
    section.innerHTML = "User: " + UID;
  }

  fetch("popular-articles", {
    method: "GET"
  }).then(function(response) {
    response.json().then(function(text) {
      let ID_COUNTER = 1;
      for (const el of text)
      {
        let question = document.getElementById(ID_COUNTER.toString());

        question = document.createElement("a");
        question.id = ID_COUNTER.toString();
        question.innerText = el.Title + "\n";
        question.href = UID + "/question/" + el.Key;
        document.body.appendChild(question);
        ID_COUNTER++;
      }
    })
  })
}

function registerNewUser() {
  
}

