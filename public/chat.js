(async function() {

    const app = document.querySelector(".app")
    const socket = io()

    const response = await fetch("http://localhost:8080/profile", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify({
                token: window.localStorage.getItem("token")
            })
        })

    const data = await response.json()
    
    if (window.localStorage.getItem("userType") == "nutritionist") {

        app.querySelector(".join-screen").classList.add("active") 
        app.querySelector(".chat-screen").classList.remove("active")

        const div = document.getElementById("contactDiv")
        
        const response = await fetch("http://localhost:8080/allUsers")
        const users = await response.json()

        for (let i=0;i<users.length;i++) {

            const button = document.createElement("button")
            button.innerHTML = users[i].username
            button.onclick = function() {

                app.querySelector(".join-screen").classList.remove("active") 
                app.querySelector(".chat-screen").classList.add("active")
                // socket.emit("askForChat", {name :button.innerHTML, id: socket.id})
                socket.emit("createChat", {username: data.data.username, id: socket.id, othername: button.innerHTML})
                uname = data.data.username
            }
            div.appendChild(button)
        }
    }else {

        // const response = await fetch("http://localhost:8080/profile", {
        //     method: "POST",
        //     headers: new Headers({"Content-Type": "application/json"}),
        //     body: JSON.stringify({
        //         token: window.localStorage.getItem("token")
        //     })
        // })

        // const data = await response.json()
        let sendData = {
            username: data.data.username,
            id: socket.id
        }
        socket.emit("newuser", sendData)
        uname = data.data.username
        app.querySelector(".chat-screen").classList.add("active")
    }

    document.getElementById("message-input").addEventListener("keypress", function(event) {

        if (event.key === "Enter") {

            document.getElementById("send-message").click()
        }
    })

    // app.querySelector(".join-screen #join-user").addEventListener("click", function() {
        
    //     let username = app.querySelector(".join-screen #username").value 
    //     if (username.length == 0) {
    //         return
    //     }
    //     let data = {
    //         username: username,
    //         id: socket.id
    //     }
    //     socket.emit("newuser", data)
    //     uname = username
    //     app.querySelector(".join-screen").classList.remove("active") 
    //     app.querySelector(".chat-screen").classList.add("active")
    // })

    app.querySelector(".chat-screen #send-message").addEventListener("click", function() {

        let message = app.querySelector(".chat-screen #message-input").value
        if (message.length == 0) {

            return 
        }
        renderMessage("my", {

            username:uname,
            text:message
        })
        socket.emit("chat", {

            username:uname,
            text:message
        })
        app.querySelector(".chat-screen #message-input").value = ""
    })

    app.querySelector(".chat-screen #exit-chat").addEventListener("click", function() {

        socket.emit("exituser", uname)
        window.location.href = "./index.html"
    })

    socket.on("update", function(update) {

        renderMessage("update", update)
    })

    socket.on("chat", function(message) {

        renderMessage("other", message)
    })

    // socket.on("alert", function(message) {

    //     console.log("meowww")
    //     renderMessage("alert", message)
    // })

    function renderMessage(type, message) {

        let messageContainer = app.querySelector(".chat-screen .messages")
        if (type == "my") {

            let el = document.createElement("div")
            el.setAttribute("class", "message my-message")
            el.innerHTML = `
                <div>
                    <div class="name">You</div>
                    <div class="text">${message.text}</div>
                </div>
            `
            messageContainer.appendChild(el)
        }else if (type == "other") {

            let el = document.createElement("div")
            el.setAttribute("class", "message other-message")
            el.innerHTML = `
                <div>
                    <div class="name">${message.username}</div>
                    <div class="text">${message.text}</div>
                </div>
            `
            messageContainer.appendChild(el)
        }else if (type == "update") {

            let el = document.createElement("div")
            el.setAttribute("class", "update")
            el.innerText = message
            messageContainer.appendChild(el)
        }
        messageContainer.scrollTop = messageContainer.scrollHeight - messageContainer.clientHeight
    }

})()

async function getProgram() {

    if (window.localStorage.getItem("userType") == "user") {

        alert("no access")
    }else {

        window.location.href = "./program.html"
    }
}