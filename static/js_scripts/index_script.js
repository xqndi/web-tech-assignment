function processQuery() {
    hideMostPopular();
    hideMostSimilar();
    const q = document.getElementById("query-search");

    if (!q.value) {
        hideMostSimilar();
        displayMostPopular();
        return;
    }

    fetch("index-search", {
        method: "POST",
        body: q.value
    }).then(function(response) {
      response.json().then(function(text) {
        // couldn't find embedding for query / question
        if (text == "-1") {
          window.alert("Please reformulate your question");
          return;
        }
        const article = document.getElementById("similar-questions-article");
        document.getElementById("similar-questions-header").style.display = "Block";
        for (const [key, val] of Object.entries(text)) {
          const qid = key.substring(0, key.length - 1);
          question = document.createElement("a");
          question.innerText = val + "\n";
          question.className = "similarquestionclass";
          // TODO where does UID come from??
          question.href = "/question/" + qid;
          article.appendChild(question);
        }
      });
     });
}

function hideMostSimilar() {
  let links = document.getElementById("similar-questions-article").getElementsByTagName("a");
  Array.from(links).forEach(element => {
    element.remove();
  });
  let headers = document.getElementById("similar-questions-article").getElementsByTagName("h2");
  Array.from(headers).forEach(element => {
    element.style.display = "none";
  });
}

function hideMostPopular() {
  let links = document.getElementById("popular-questions-article").getElementsByTagName("a");
  Array.from(links).forEach(element => {
    element.remove();
  });
  let headers = document.getElementById("popular-questions-article").getElementsByTagName("h2");
  Array.from(headers).forEach(element => {
    element.style.display = "none";
  });
}


function displayMostPopular() {
  document.getElementById("similar-questions-header").style.display = "None";
  document.getElementById("popular-questions-header").style.display = "Block";
  var url_string = window.location.href;
  var url = new URL(url_string);

    // kinda dirty...
  const arr = url.pathname.split("/");

  const logged = localStorage.getItem('token');
  if (logged)
  {
    var section_log = document.getElementById("login");
    var section_reg = document.getElementById("register");
    section_log.innerHTML = "<b>User: " + logged + "</b>";
    section_log.disabled = true;
    section_reg.style.display = "none";
  }


  fetch("popular-articles", {
    method: "GET"
  }).then(function(response) {
    response.json().then(function(text) {
      const article = document.getElementById("popular-questions-article");
      for (const el of text)
      {
        question = document.createElement("a");
        question.innerText =  el.Title + "\n";

                              
        question.href = "/question/" + el.Key;
        question.className = "questions";

        question_body = document.createElement("small");
        question_body.innerHTML = el.Body.substring(0, 100) + "..." + "\n";
        question_body.className = "questions_body";

        question_score = document.createElement("small");
        question_score.innerText = "Score" + "\n" + el.Score;
        question_score.className = "questions_score";


        // question_frame = document.createElement("a");
        // question_frame.className = "questions_frame"
        // question_frame.appendChild(question);
        // question_frame.appendChild(question_body);
        article.appendChild(question);
        article.appendChild(question_body);
        article.appendChild(question_score);
      }
    })
  })
}

