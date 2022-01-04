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
                localStorage.setItem('token', username.value);
                document.location = "/";
            }
        });
    });
}

function changeLoggedHeader()
{
    const logged = localStorage.getItem('token');
    if (logged)
    {
        var section_log = document.getElementById("login");
        var section_reg = document.getElementById("register");
        section_log.innerHTML = "<b>User: " + logged + "</b>";
        section_log.disabled = true;
        section_reg.style.display = "none";
    }
}

function isLoggedIn () {
   const logged = localStorage.getItem('token');
   if (!logged)
   {
       return false;
   }
}

function loggoutUsers() {

    fetch("login/user/auth", {
        method: 'GET'
    }).then(function(response) {
        response.json().then(function(text) {
        
            console.log(Object.entries(text));
            for(var el of text)
            {   
                console.log("fileusername: " + el.UserName);
                console.log("localStorage: "+ localStorage.getItem('token'));
                if(el.UserName == localStorage.getItem('token'))
                {
                    console.log("fileusername: " + el.UserName);
                    console.log("localStorage: "+ localStorage.getItem('token'));
                    return;
                }
            }   
            localStorage.removeItem('token');
        })
    })

    
}

function hideChildren()
{
    let prompt = document.getElementById("1");
    if(prompt)
    {
        prompt.remove();
    } 
}
