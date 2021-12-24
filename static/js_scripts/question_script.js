let QID = "-2";

function fetchJson() {
    var url_string = window.location.href;
    var url = new URL(url_string);

    // kinda dirty...
    const arr = url.pathname.split("/");
    QID = arr[arr.length - 1];

    const query_string = ("q/" + QID).toString();
    fetch(query_string).then(function(response) {
        response.json().then(function(json) {
            // TOD structure into different text-fields :/
            const qField = document.getElementById("question");
            qField.innerHTML = JSON.stringify(json, null, 2);
        })
     });
}

function submitAnswer() {
    const answer = document.getElementById("add-answer")
    if (!answer.value) {
        return;
    }

    // TODO extract userID, date, score, etc...
    // TODO find efficient way to generate new key

    let newAnswerJson = {};
    newAnswerJson["OwnerUserId"] = -1;
    newAnswerJson["CreationDate"] = -1;
    newAnswerJson["ParentId"] = QID;
    newAnswerJson["Score"] = -1;
    newAnswerJson["Body"] = answer.value;

    console.log(newAnswerJson);


    fetch("question/submit-answer", {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
        body: JSON.stringify(newAnswerJson)
    }).then(function(response) {
        console.log("done");
    });
}