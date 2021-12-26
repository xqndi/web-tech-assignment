
let QID = "-2";

function fetchJson() {
    var url_string = window.location.href;
    var url = new URL(url_string);

    // kinda dirty...
    const arr = url.pathname.split("/");
    QID = arr[arr.length - 1];

    const elem = document.getElementById("add-answer");

    let query_string = ("q/" + QID).toString();
    console.log(query_string);
    fetch(query_string).then(function(response) {
        response.json().then(function(json) {
            let isQuestion = true;
            for (const [k, v] of Object.entries(json)) {
                const field = document.createElement("p");
                field.innerHTML = JSON.stringify({[k]: v}, null, 2) + "\n\n";
                document.body.appendChild(field);
                // very inefficient...     
                elem.before(field);
                if (isQuestion) {
                    const answersHeader = document.getElementById("answers-h2");
                    answersHeader.before(field);
                    isQuestion = false;
                }
            }
        })
     });

     query_string = ("question/similar-questions/" + QID).toString();
     fetch(query_string).then(function(response) {
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
        })
     });

}

function submitAnswer() {
    const answer = document.getElementById("add-answer")
    if (!answer.value) {
        return;
    }

    // https://tecadmin.net/get-current-date-time-javascript/
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date+"T"+time+"Z";

    // TODO extract userID, etc...
    let newAnswerJson = {};
    newAnswerJson["OwnerUserId"] = -1;
    newAnswerJson["CreationDate"] = dateTime;
    newAnswerJson["ParentId"] = QID;
    newAnswerJson["Score"] = 0;
    newAnswerJson["Body"] = answer.value;

    fetch("question/submit-answer", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify(newAnswerJson)
    }).then(function(response) {
        console.log("done");
        document.location.reload();
    });
}