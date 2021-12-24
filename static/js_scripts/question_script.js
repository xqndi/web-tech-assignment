function fetchJson() {
    var url_string = window.location.href;
    var url = new URL(url_string);

    // kinda dirty...
    const arr = url.pathname.split("/");
    const qid = arr[arr.length - 1];

    const query_string = ("q/" + qid).toString();
    fetch(query_string).then(function(response) {
        response.json().then(function(json) {
            const qField = document.getElementById("question");
            document.write(JSON.stringify(json, null, 2));
        })
     });
}