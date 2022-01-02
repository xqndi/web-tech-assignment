function createNewUser()
{
    
    var failed_pass = document.getElementById("1");
    failed_pass = document.createElement("h1");
    failed_pass.id = "1";
    failed_pass.innerText = "password input doesn't match!";

    var success = document.getElementById("2"); //flo replace h1 with something green
    success = document.createElement("h1");
    success.id = "2";
    success.innerText = "new user created successfully!";

    const email = document.getElementById("email_in");
    const username = document.getElementById("usr");
    const password = document.getElementById("pass_in");
    const password_check = document.getElementById("pass_re");


    if (password.value != password_check.value)
    {
         //flo replace h1 with something red
        hideChildren()
        document.body.appendChild(failed_pass);
        return;
    }

    let newUserJson = {};
    newUserJson["UserEmail"] = email.value;
    newUserJson["UserName"] = username.value;
    newUserJson["UserPassword"] = password.value;

    fetch("register/new-user", {
        method: 'POST', 
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'},
            body: JSON.stringify(newUserJson)
    }).then(function(response) {
        response.text().then(function(text) {
            hideChildren()
            success.innerText = text;
            document.body.appendChild(success);
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
    prompt = document.getElementById("2");
    if(prompt)
    {
        prompt.remove();
    }
}
