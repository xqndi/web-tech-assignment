
let QID = "-2";

async function fetchJson() {
    var url_string = window.location.href;
    var url = new URL(url_string);

    // kinda dirty...
    const arr = url.pathname.split("/");
    QID = arr[arr.length - 1];

    let query_string = ("q/" + QID).toString();
    console.log(query_string);
    await fetch(query_string).then(function(response) {
        response.json().then(function(json) {
            const q_header = document.createElement("h1");
            q_header.innerText = "Question:";
            document.body.appendChild(q_header);
            let isQuestion = true;

            for (const [k, v] of Object.entries(json)) {
                const field = document.createElement("p");
                field.id = k;
                field.innerHTML = JSON.stringify({[k]: v}, null, 2) + "\n\n";
                document.body.appendChild(field);

                const btn = document.createElement("button");
                btn.innerHTML = "like";
                if (isQuestion) { btn.value = [k, "QUESTION"]; }
                else { btn.value = [k, "ANSWER"]; }
                btn.addEventListener("click", likeElementById);
                document.body.appendChild(btn);

                if (isQuestion) {
                    const a_header = document.createElement("h2");
                    a_header.innerText = "Answers:";
                    document.body.appendChild(a_header);
                    isQuestion = false;
                }
                btn.before(field);
            }

            const own_answer_header = document.createElement("h3");
            own_answer_header.innerText = "Do you have a better answer?:";
            document.body.appendChild(own_answer_header);     
            const inp = document.createElement("INPUT");
            inp.id = "add-answer";
            inp.setAttribute("type", "text");
            document.body.appendChild(inp);

            const submitBtn = document.createElement("button");
            submitBtn.innerHTML = "Submit Answer";
            submitBtn.addEventListener("click", submitAnswer);
            document.body.appendChild(submitBtn);
            
            const similar_header = document.createElement("h2");
            similar_header.innerText = "Similar questions:";
            document.body.appendChild(similar_header);       
        })
     });


     query_string = ("question/similar-questions/" + QID).toString();
     await fetch(query_string).then(function(response) {
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

    var url_string = window.location.href;
    var url = new URL(url_string);

    const arr = url.pathname.split("/");
    UID = arr[arr.length - 3];

    if (UID == "")
    {
        return;
    }


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

function likeElementById() {
    // not quite sure whether this always works :)
    var url_string = window.location.href;
    var url = new URL(url_string);

    const arr = url.pathname.split("/");
    UID = arr[arr.length - 3];

    if (UID == "")
    {
        return;
    }
    
    console.log(this.value);

    fetch("like-by-id", {
        method: 'POST',
        body: this.value
    }).then(function(response) {
        console.log("done with liking");
        document.location.reload();
    });
}