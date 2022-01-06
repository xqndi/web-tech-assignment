
let QID = "-2";
like_params = [];
let user_likes = [];

async function fetchJson() {
    var url_string = window.location.href;
    var url = new URL(url_string);

    // kinda dirty...
    const arr = url.pathname.split("/");
    QID = arr[arr.length - 1];

    getUserLikes();

    let query_string = ("q/" + QID).toString();
    console.log(query_string);
    
    await fetch(query_string).then(function(response) {
        response.json().then(function(json) {
            const q_header = document.createElement("h1");
            q_header.innerText = "Question:";
            q_header.id = "question_header"
            document.body.appendChild(q_header);
            let isQuestion = true;
            
            
            for (const [k, v] of Object.entries(json)) {
                const titleString = v["Title"];
                if (titleString) {
                    const title = document.createElement("h3");
                    title.innerHTML = v["Title"];
                    title.className = "TitleOfQuestion";
                    document.body.appendChild(title);
                }
                const date = document.createElement("h4");
                let datename =  v["CreationDate"];
                let test = datename.replace('T',' ').replace('Z', '');
                date.innerHTML = "Created on: " + test;
                date.className = "DateOfQuestionAndAnswers";
                document.body.appendChild(date);

                const userId = document.createElement("h4");
                userId.innerHTML = "User: " + v["OwnerUserId"];
                userId.className = "UserIdOfQuestionAndAnswers";
                document.body.appendChild(userId);

                const score = document.createElement("h3");
                score.id = "score" + k;
                score.innerHTML = "Score: " + v["Score"];
                score.className = "ScoreOfQuestionAndAnswers";
                document.body.appendChild(score);

                const body = document.createElement("p");
                body.className = "BodyOfQuestionAndAnswers";
                body.id = k;
                //field.innerHTML = JSON.stringify({[k]: v}, null, 2)
                body.innerHTML = JSON.stringify(v["Body"], null, 2)
                                        .replace(/\\n/g, '')
                                        .replace(/\"/g, " ")
                                        .replace(/\\/g, " ");
                document.body.appendChild(body);
                const logged = localStorage.getItem('token');
                if (logged)
                {
                    var type = "NONE";
                    var liked = false;
                    if (isQuestion)
                    {
                        type = "QUESTION";
                    }
                    else
                    {
                        type = "ANSWER";
                    }
                    const btn = document.createElement("button");
                    btn.id = "like/dislike";
                    //btn.innerHTML = "like/dislike";
                    for(el of user_likes)
                    {
                        // console.log(el.User);
                        // console.log("el.Type: "+ el.Type);
                        // console.log("type: " + type);
                        // console.log("ElementId " + el.ElementId);
                        // console.log("k: " + k);
                        if (el.Type == type && el.ElementId == k)
                        {
                            
                            liked = true;
                        }
                    }
                    if (liked)
                    {
                        btn.innerHTML = '<img id="liked_img" src="../images/liked.png"  alt="liked"/>';
                    }
                    else
                    {
                        btn.innerHTML = '<img id="unliked_img" src="../images/unliked.png"  alt="unliked"/>';
                    }
                    

                
                
                    btn.value = [k, type, localStorage.getItem('token')];
                   
                    btn.addEventListener("click", function() {
                        likeElementById(this);
                    }, false);
                    document.body.appendChild(btn);
                    btn.before(body);
                }
                if (isQuestion) {
                    const a_header = document.createElement("h2");
                    a_header.innerText = "Answers:";
                    a_header.id = "Answerheader";
                    document.body.appendChild(a_header);
                    isQuestion = false;
                }
                
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
            submitBtn.id = "Submitbuttonclass"
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
                question.className = "similarquestion"
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

    first_load = true;
}

function getUserLikes() {
    fetch("question/get-user-likes", {
        method: "GET"
    }).then(function(response) {
        response.json().then(function(text) {
            new_text = [];
            getUserLikes = [];
            for (var el of text)
            {
                if (el.User == localStorage.getItem('token'))
                {
                    //console.log(el.User);
                    //console.log(el.Type);
                    new_text.push(el);
                }
            }
            user_likes = new_text;
        })
    })
}

function submitAnswer() {


    const logged = localStorage.getItem('token');
    if (!logged)
    {
        var input_field = document.getElementById("add-answer")
        input_field.style.color = "red";
        input_field.value = "Log in before posting an answer!";
        return false;
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



function likeElementById(btn) {
    // not quite sure whether this always works :)

    //btn.style.background = "#00FF00";
    console.log(btn.value)
    const logged = localStorage.getItem('token');
    if (!logged)
    {
        return false;
    }
    
    fetch("like-by-id", {
        method: 'POST',
        body: btn.value
    }).then(function(response) {
        response.text().then(function(text) {
            if (text == "liked") {
                console.log("hi");
                //btn.style.background = "#00FF00";
                //btn.innerHTML = "LIKED :)";
                btn.innerHTML = '<img id="liked_img" src="../images/liked.png"  alt="liked"/>';
                var score_element = document.getElementById("score" + (btn.value).split(',')[0])
                var old_score = parseInt(score_element.innerHTML.split(' ')[1]);
                var new_score = old_score + 1;
                score_element.innerHTML = "Score: " + new_score;
            }
            else if (text == "disliked") {
                //btn.style.background = "#FF0000";
                //btn.innerHTML = "DISLIKED :(";
                btn.innerHTML = '<img id="unliked_img" src="../images/unliked.png"  alt="unliked"/>';
                var score_element = document.getElementById("score" + (btn.value).split(',')[0])
                var old_score = parseInt(score_element.innerHTML.split(' ')[1]);
                var new_score = old_score - 1;
                score_element.innerHTML = "Score: " + new_score;
            }
        })
        
    });
}
