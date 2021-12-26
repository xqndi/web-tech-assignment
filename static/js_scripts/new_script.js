function createNewQuestion() {
    console.log("yea");
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
    newQuestionJson["OwnerUserId"] = -1;
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
        console.log("done");
        document.location.reload();
    });
}