function createNewQuestion() {
    const loggedUser = localStorage.getItem('token');
    if (!loggedUser)
    {
        var title_field = document.getElementById("title-input");
        var q_body_field = document.getElementById("q-body-input");
        title_field.style.color = "red";
        q_body_field.style.color = "red";
        title_field.value = "";
        title_field.placeholder = "";
        title_field.placeholder = "log in before posting a question!";
        q_body_field.value = "";
        q_body_field.placeholder = "";
        q_body_field.placeholder = "log in before posting a question!";
        var button = document.getElementById("question_ASK");
        button.style.display= "none";
        return false;
    }
    

    var url_string = window.location.href;
    var url = new URL(url_string);

    // kinda dirty...
    const arr = url.pathname.split("/");
    UID = arr[arr.length - 1];

    console.log(UID);

    const title = document.getElementById("title-input")
    const body = document.getElementById("q-body-input")
    if (!title.value || !body.value) {
        return;
    }

    // https://tecadmin.net/get-current-date-time-javascript/
    const today = new Date();
    const date = today.getFullYear()+'-'+(today.getMonth()+1)+'-'+today.getDate();
    const time = today.getHours() + ":" + today.getMinutes() + ":" + today.getSeconds();
    const dateTime = date+"T"+time+"Z";

    // TODO extract userID, etc...
    let newQuestionJson = {};
    newQuestionJson["OwnerUserId"] = loggedUser;
    newQuestionJson["CreationDate"] = dateTime;
    newQuestionJson["Score"] = 0;
    newQuestionJson["Title"] = title.value;
    newQuestionJson["Body"] = body.value;

    fetch("question/submit-question", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify(newQuestionJson)
    }).then(function(response) {
        response.text().then(function(text) {
            if (text == "-1") {
                // here it was not possibly to create 
                // a vector representation for the question-body
                console.log("Couldn't create question");
                window.alert("Please reformulate your question");
                return;
            }
        // todo this is not speficied anywhere
        // redirct to question-page of the new question
        location.href = "/question/" + text;
        });
    });
}