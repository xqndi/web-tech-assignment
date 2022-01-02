function loginUser()
{
    
    var prompt= document.getElementById("1");
    prompt = document.createElement("h1");
    prompt.id = "1";


    const username = document.getElementById("usr");
    const password = document.getElementById("pass_in");


    let UserJson = {};
    UserJson["UserName"] = username.value;
    UserJson["UserPassword"] = password.value;

    fetch("login/user", {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
            body: JSON.stringify(UserJson)
    }).then(function(response) {
        response.text().then(function(text) {
            hideChildren()
            prompt.innerText = text;
            document.body.appendChild(prompt);
            if (text == "Successfully logged in!")
            {
                document.location = "/" + username.value;
            }
        });
    });
}

function hideChildren()
{
    let prompt = document.getElementById("1");
    if(prompt)
    {
        prompt.remove();
    } 
}
