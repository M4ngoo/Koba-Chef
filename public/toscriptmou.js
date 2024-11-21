async function getRecipe() {

    showLoginProfile()
    getReviews()

    const searchKeys = window.location.search
    const urlParams = new URLSearchParams(searchKeys)
    const id = urlParams.get("id")
    const response = await fetch("http://localhost:8080/recipes/" + id)
    const data = await response.json()
    const name = document.getElementById("recipeName")
    name.innerHTML = data[0].name
    const img = document.getElementById("recipeImg")
    img.src = data[0].image

    const instructions = document.getElementById("instructions")
    if (data[0].recipe.includes("\n")) {

        const instructionsArray = data[0].recipe.split("\n")
        for (let i=0;i<instructionsArray.length;i++) {

            let p = document.createElement("p")
            p.innerHTML = instructionsArray[i]
            instructions.appendChild(p)
        }
    }else {

        instructions.innerHTML = data[0].recipe
    }

    const details = [data[0].servings, data[0].preppingTime, data[0].cookingTime]
    const ulDetails = document.querySelector("#basicDetails")
    const ulDetailsChildren = ulDetails.children
    let i = 0
    for(child of ulDetailsChildren) {

        let beforeHTML = child.innerHTML
        child.innerHTML = beforeHTML + " " + details[i++]
    }
    const nutrients = [data[0].calories, data[0].protein + "g", data[0].fat + "g", data[0].fiber + "g", 
                    data[0].carbohydrates + "g", data[0].sugars + "g"]
    const ul = document.querySelector("#nutrients")
    const ulChildren = ul.children
    i = 0
    for(child of ulChildren) {

        let beforeHTML = child.innerHTML
        child.innerHTML = beforeHTML + " " + nutrients[i++]
    }
    const ulIngredients = document.getElementById("ingredients")
    for(let i=0;i<data[0].ingredients.length;i++) {
        let li = document.createElement("li")
        li.innerHTML = data[0].ingredients[i]
        let button = document.createElement("button")
        let symbol = "+"
        button.innerHTML = symbol
        button.onclick = async function() {

            if (window.localStorage.getItem("loggedIn")) {

                await fetch("http://localhost:8080/addToCart", {
                    method: "POST",
                    headers: new Headers({"Content-Type": "application/json"}),
                    body: JSON.stringify({
                        token: window.localStorage.getItem("token"),
                        name: data[0].ingredients[i]
                    })
                })
            
            }else {

                alert("You must login first")
            }
        }
        li.appendChild(button)
        ulIngredients.appendChild(li)
    }
}

async function getAllRecipes() {
    
    showLoginProfile()

    const response = await fetch("http://localhost:8080/recipes")
    const data = shuffle(await response.json())
    let section = document.querySelector(".recipes-container")

    for (let i=0;i<data.length;i++) {

        const chefResponse = await fetch("http://localhost:8080/profile/" + data[i].chef)   
        const chefData = await chefResponse.json()

        const strMeal = data[i].category[0].join().replaceAll(",", "")
        const strVegan = data[i].category[1].join().replaceAll(",", "")
        const strCalories = data[i].category[2].join().replaceAll(",", "")
        const strFinal = strMeal + strVegan + strCalories

        const h4 = document.createElement("h4")             
        const p = document.createElement("p")                    
        const div_h4_p = document.createElement("div")         
        const a = document.createElement("a")                   
        a.href = "recipe.html?id=" + data[i]._id                    
        //                                                         
        h4.classList.add("recipe-name")                           
        h4.innerHTML = data[i].name
        p.innerHTML = chefData[0].username             
        a.appendChild(h4)                                          
        div_h4_p.appendChild(a)                                     
        div_h4_p.appendChild(p)                                     
        //                                                                                
        const imgChef = document.createElement("img")              
        const div_div_h4_p_img = document.createElement("div")      
        imgChef.classList.add("recipe-chef-img")                    
        imgChef.src = chefData[0].image                                           
        div_div_h4_p_img.appendChild(div_h4_p)
        div_div_h4_p_img.appendChild(imgChef)
        //
        const imgRecipe = document.createElement("img")
        const span = document.createElement("span")
        imgRecipe.src = data[i].image

        if (data[i].rating % 1 != 0) {

            span.innerHTML = data[i].rating.toFixed(2) + "★"
        }else {

            span.innerHTML = data[i].rating + "★"
        }
        //
        const divFinal = document.createElement("div")
        divFinal.classList.add(strFinal)
        divFinal.appendChild(imgRecipe)
        divFinal.appendChild(span)
        divFinal.appendChild(div_div_h4_p_img)
        section.appendChild(divFinal)
    }
}

async function filterData() {
    
    const inputs = document.querySelector(".filter").getElementsByTagName("input")
    const divs = document.querySelector(".recipes-container").querySelectorAll(".recipes-container > div")
    
    let args = []

    for (let i=0;i<inputs.length-1;i++) {

        args.push(inputs[i].checked)
    }

    for (let x=0;x<divs.length;x++) {

        let flag = false
        for (let i=0;i<args.length;i++) {

            if (args[i]) {

                if (divs[x].className[i] == args[i]) {
                    continue
                }else {

                    divs[x].classList.add("hidden")
                    flag = true
                    break
                }
            }
        }

        if (!flag) divs[x].classList.remove("hidden")

    }
}

async function unfilterData() {

    const inputs = document.querySelector(".filter").getElementsByTagName("input")
    const divs = document.querySelector(".recipes-container").querySelectorAll(".recipes-container > div")
    
    for (let i=0;i<inputs.length;i++) {

        inputs[i].checked = false
    }
    for (let i=0;i<divs.length;i++) {

        divs[i].classList.remove("hidden")
    }
}

async function registerAsUser(userType) {

    if (userType == "user") {

        var form = document.getElementById("userForm")
        var file = document.querySelector("#userFile")
    }else if (userType == "chef") {

        var form = document.getElementById("chefForm")
        var file = document.querySelector("#chefFile")
    }
    
    const formData = {

        username: form.username.value,
        password: form.new_password.value,
        gender: form.gender.value,
        age: form.age.value,
        location: form.location.value,
        email: form.email.value,
        bio: form.bio.value,
        favorites: [],
        cart: [],
        program: [[0], [1], [2], [3], [4], [5], [6]],
        userType: userType
    }

    const fileFinal = file.files[0]

    var reader = new FileReader();
        
    reader.onload = async function () {
        base64String = reader.result.replace("data:", "")
            .replace(/^.+,/, "");
    
        imageBase64Stringsep = base64String;
        
        formData.image = "data:image/png;base64, " + base64String
        await fetch("http://localhost:8080/register", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify(formData)
        })
    }
    reader.readAsDataURL(fileFinal)
    window.location.href = "./index.html"
}

async function login() {

    const username = document.getElementById("login-username").value
    const password = document.getElementById("login-password").value

    fetch("http://localhost:8080/login", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify({
                username: username,
                password: password
            })
        })
        .then((res)=> res.json())
        .then((data)=> {
            if (data.status == "ok") {

                window.localStorage.setItem("token", data.data)
                window.localStorage.setItem("loggedIn", true)
                if (data.userType == "user") {

                    window.localStorage.setItem("userType", "user")
                    window.location.href = "./profile.html"
                }else if(data.userType == "chef"){

                    window.localStorage.setItem("userType", "chef")
                    window.location.href = "./chef-profile.html"
                }else {

                    window.localStorage.setItem("userType", "nutritionist")
                    window.location.href = "./index.html"
                }
            }
        })
}

async function getProfile(userType) {
    
    const loggedIn = window.localStorage.getItem("loggedIn")

    if (!loggedIn) {

        window.location.href = "./index.html"
    }else {

        await fetch("http://localhost:8080/profile", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify({
                token: window.localStorage.getItem("token")
            })
        })
        .then((res)=> res.json())
        .then(async(data)=> {
            
            document.getElementById("contact").href = "./contact.html"

            const profileData = data.data

            const infoArray = [profileData.username, profileData.age, profileData.gender, profileData.location]

            document.getElementById("profileImage").src = profileData.image
            const infoLi = document.getElementById("personalInfo").querySelectorAll("li")
            for (let i=0;i<infoLi.length;i++) {

                infoLi[i].innerHTML += " " + infoArray[i]
            }
            document.getElementById("bio").innerHTML = profileData.bio

            if (profileData.favorites.length != 0) {

                for (let i=0;i<profileData.favorites.length;i++) {

                    const response = fetch("http://localhost:8080/recipes/" + profileData.favorites[i])
                    .then((res)=> res.json())
                    .then((data)=> { 
                        
                        createFavorites(data)
                    })
                }
            }

            if (userType == "user") {

                const weeklyNutrientsLs = document.getElementById("weekly-nutrients").querySelectorAll("li")
                const dailyNutrientsLs = document.getElementById("daily-nutrients").querySelectorAll("li")
                const programUl = document.getElementById("program")

                let userProgram = []
                for (let i=0;i<profileData.program.length;i++) {

                    userProgram.push(profileData.program[i].slice(1))
                }

                let weeklyCalories = 0
                let weeklyProtein = 0
                let weeklyFat = 0
                let weeklyCarbohydrates = 0
                let weeklyFiber = 0
                let weeklySugars = 0

                for (let i=0;i<userProgram.length;i++) {

                    for (let j=0;j<userProgram[i].length;j++) {

                        const response = await fetch("http://localhost:8080/recipes/" + userProgram[i][j])
                        const data = await response.json()

                        weeklyCalories += data[0].calories
                        weeklyProtein += data[0].protein
                        weeklyFat += data[0].fat
                        weeklyCarbohydrates += data[0].carbohydrates
                        weeklyFiber += data[0].fiber
                        weeklySugars += data[0].sugars

                        if (i == 0 && j == userProgram[i].length - 1) {

                            const h4 = document.getElementById("program-day")
                            h4.innerHTML = "Monday"

                            dailyNutrientsLs[0].innerHTML += weeklyCalories
                            dailyNutrientsLs[1].innerHTML += weeklyProtein + "g"
                            dailyNutrientsLs[2].innerHTML += weeklyFat + "g"
                            dailyNutrientsLs[3].innerHTML += weeklyCarbohydrates + "g"
                            dailyNutrientsLs[4].innerHTML += weeklyFiber + "g"
                            dailyNutrientsLs[5].innerHTML += weeklySugars + "g"
                        }

                        if (i == 0) {

                            const li = document.createElement("li")
                            const a = document.createElement("a")
                            a.href = "recipe.html?id=" + data[0]._id  
                            a.classList.add("recipe-h4") 
                            li.innerHTML = data[0].name
                            a.appendChild(li)
                            programUl.appendChild(a)
                        }
                    }
                }

                weeklyNutrientsLs[0].innerHTML += (weeklyCalories / 7) % 1 == 0 ? weeklyCalories / 7 : (weeklyCalories / 7).toFixed(2)
                weeklyNutrientsLs[1].innerHTML += (weeklyProtein / 7) % 1 == 0 ? weeklyProtein / 7 + "g": (weeklyProtein / 7).toFixed(2) + "g"
                weeklyNutrientsLs[2].innerHTML += (weeklyFat / 7) % 1 == 0 ? weeklyFat / 7 + "g": (weeklyFat / 7).toFixed(2) + "g"
                weeklyNutrientsLs[3].innerHTML += (weeklyCarbohydrates / 7) % 1 == 0 ? weeklyCarbohydrates / 7 + "g": (weeklyCarbohydrates / 7).toFixed(2) + "g"
                weeklyNutrientsLs[4].innerHTML += (weeklyFiber / 7) % 1 == 0 ? weeklyFiber / 7 + "g": (weeklyFiber / 7).toFixed(2) + "g"
                weeklyNutrientsLs[5].innerHTML += (weeklySugars / 7) % 1 == 0 ? weeklySugars / 7 + "g": (weeklySugars / 7).toFixed(2) + "g"
            }

            if (userType == "chef") {

                const response = fetch("http://localhost:8080/chef_recipes/" + profileData._id)
                .then((res)=> res.json())
                .then((data)=> {

                    const recipesLs = data

                    if (recipesLs.length != 0) {

                        for (let i=0;i<recipesLs.length;i++) {
                                
                            const section = document.getElementById("chef_recipes")
                            const finalDiv = document.createElement("div")
                            const firstDiv = document.createElement("div")
                            const secondDiv = document.createElement("div")
                            const img = document.createElement("img")
                            img.src = recipesLs[i].image
                            img.setAttribute("id", "fav-recipe")
                            firstDiv.appendChild(img)
                            secondDiv.setAttribute("id", "fav-name")
                            const recipeName = document.createElement("h4")
                            recipeName.classList.add("recipe-h4")
                            const a = document.createElement("a")
                            a.href = "recipe.html?id=" + recipesLs[i]._id
                            recipeName.innerHTML = recipesLs[i].name
                            a.appendChild(recipeName)
                            secondDiv.appendChild(a)
                            finalDiv.appendChild(firstDiv)
                            finalDiv.appendChild(secondDiv)
                            section.appendChild(finalDiv)
                        }                        
                    } 
                })
            }
        })
    }
}

async function createFavorites(data) {

    const section = document.getElementById("favoritesSection")
    const finalDiv = document.createElement("div")
    const firstDiv = document.createElement("div")
    const secondDiv = document.createElement("div")
    const img = document.createElement("img")
    img.src = data[0].image
    img.setAttribute("id", "fav-recipe")
    firstDiv.appendChild(img)
    secondDiv.setAttribute("id", "fav-name")
    const recipeName = document.createElement("h4")
    const a = document.createElement("a")
    a.href = "recipe.html?id=" + data[0]._id
    a.appendChild(recipeName)
    recipeName.classList.add("recipe-h4")
    recipeName.innerHTML = data[0].name
    secondDiv.appendChild(a)
    finalDiv.appendChild(firstDiv)
    finalDiv.appendChild(secondDiv)
    section.appendChild(finalDiv)
}

async function showLoginProfile() {

    const loggedIn = window.localStorage.getItem("loggedIn")
    const button = document.getElementById("login-profile")
    const contactLink = document.getElementById("contact")
    const cartLink = document.getElementById("cart")
        
    if (loggedIn) {

        if (window.localStorage.getItem("userType") == "nutritionist") {

            button.innerHTML = "Logout"
            button.onclick = function () { 
                window.localStorage.clear() 
                window.location.href = window.location.href
            }
            contactLink.href = "./contact.html"
        }else {

            button.innerHTML = "Profile"
            button.onclick = function () { checkLoggedIn() }
            contactLink.href = "./contact.html"
            cartLink.href = "./cart.html"
        }
    }else {

        button.innerHTML = "Login"
        button.onclick = function () { dialogOpen('login-dialog') }
    }
}

async function checkLoggedIn() {

    const loggedIn = window.localStorage.getItem("loggedIn")
    const userType = window.localStorage.getItem("userType")
    
    if (loggedIn) {

        if (userType == "user") {

            window.location.href = "./profile.html"
        }else if (userType == "chef") {

            window.location.href = "./chef-profile.html"
        }
    }
}

async function logOut() {

    window.localStorage.clear()
    window.location.href = "./index.html"
}

// async function loginDialogOpen() {

//     const dialogModal = document.getElementById('login-dialog')
//     dialogModal.showModal()

//     dialogModal.addEventListener("click", (e) => {
//         const dialogDimensions = dialogModal.getBoundingClientRect()
//         if (
//           e.clientX < dialogDimensions.left ||
//           e.clientX > dialogDimensions.right ||
//           e.clientY < dialogDimensions.top ||
//           e.clientY > dialogDimensions.bottom
//         ) {
//           dialogModal.close()
//         }
//       })
// }

async function reviewDialogOpen() {

    if (!window.localStorage.getItem("loggedIn")) {

        alert("you must login first")
        return
    }
    
    const reviewModal = document.getElementById('reviewDialog')
    reviewModal.showModal()

    reviewModal.addEventListener("click", (e) => {
        const dialogDimensions = reviewModal.getBoundingClientRect()
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
          reviewModal.close()
        }
      })
}

async function addRecipe() {

    const form = document.getElementById("add_recipe")

    const formData = {
        
        name: form.recipe_name.value,
        servings: Number(form.servings.value), 
        preppingTime: form.prep_time.value,
        cookingTime: form.cook_time.value,
        ingredients: form.ingredients.value.split(","),
        recipe: form.steps.value,
        rating: 0,
        reviewsCount: 0,
        calories: Number(form.calories.value),
        protein: Number(form.protein.value),
        fat: Number(form.fat.value),
        fiber: Number(form.fibers.value),
        carbohydrates: Number(form.carbs.value),
        sugars: Number(form.sugars.value)
    }

    const response = await fetch("http://localhost:8080/profile", {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({
            token: window.localStorage.getItem("token")
        })
    })

    const data = await response.json()
    formData.chef = data.data._id

    const mealTypeInputs = document.getElementById("meal-type").querySelectorAll("label > input")
    const veganOrNotInputs = document.getElementById("vegan-or-not").querySelectorAll("label > input")
    const caloriesTypeInputs = document.getElementById("calories-type").querySelectorAll("label > input")

    let tempMealType = []
    let tempVeganOrNot = []
    let tempCaloriesType = []

    for (let i=0;i<mealTypeInputs.length + veganOrNotInputs.length + caloriesTypeInputs.length;i++) {
        if (i < mealTypeInputs.length) {
            tempMealType.push(mealTypeInputs[i].checked ? 1 : 0)
        }else if (i < mealTypeInputs.length + veganOrNotInputs.length) {
            tempVeganOrNot.push(veganOrNotInputs[i - mealTypeInputs.length].checked ? 1 : 0)
        }else {
            tempCaloriesType.push(caloriesTypeInputs[i - mealTypeInputs.length - veganOrNotInputs.length].checked ? 1 : 0)
        }
    }

    formData.category = [tempMealType, tempVeganOrNot, tempCaloriesType]
    
    const file = document.querySelector("#recipe_img_upload")
    const fileFinal = file.files[0]

    var reader = new FileReader();
         
    reader.onload = async function () {
        base64String = reader.result.replace("data:", "")
            .replace(/^.+,/, "");
    
        imageBase64Stringsep = base64String;
        
        formData.image = "data:image/png;base64, " + base64String
        await fetch("http://localhost:8080/recipes", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify(formData)
        })
    }
    reader.readAsDataURL(fileFinal)

    window.location.href = "./chef-profile.html"
}

async function showCart() {

    showLoginProfile()

    await fetch("http://localhost:8080/cart", {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({
            token: window.localStorage.getItem("token")
        })
    })
    .then((res)=> res.json())
    .then((data)=> { 

        if (data.data.length == 0) {

            const noCartLs = document.getElementById("cartLs")
            const noLi = document.createElement("li")
            const noSpan = document.createElement("span")
            noSpan.innerHTML = "There are no items in your cart yet"
            noLi.appendChild(noSpan)
            noCartLs.appendChild(noLi)
        }

        for (let i=0;i<data.data.length;i++) {

            const cartLs = document.getElementById("cartLs")
            const li = document.createElement("li")
            const span = document.createElement("span")
            const button = document.createElement("button")
            span.innerHTML = data.data[i].quantity + " " + data.data[i].name
            button.innerHTML = "-"
            button.onclick = async function() {

                await fetch("http://localhost:8080/removeFromCart", {
                    method: "POST",
                    headers: new Headers({"Content-Type": "application/json"}),
                    body: JSON.stringify({
                        token: window.localStorage.getItem("token"),
                        name: data.data[i].name
                    })
                })
                .then((res)=> res.json())
                .then((data)=> {

                    if (data.quantity != 0) {
                        span.innerHTML = data.quantity + " " + data.name
                    }else {

                        span.remove()
                        button.remove()
                        li.remove()

                        if (document.getElementById("cartLs").querySelectorAll("li").length == 0) {

                            const noCartLs = document.getElementById("cartLs")
                            const noLi = document.createElement("li")
                            const noSpan = document.createElement("span")
                            noSpan.innerHTML = "There are no items in your cart yet"
                            noLi.appendChild(noSpan)
                            noCartLs.appendChild(noLi)
                        }
                    }
                })
            }
            li.appendChild(span)
            li.appendChild(button)
            cartLs.appendChild(li)
        }
    })
}

function shuffle(sourceArray) {
    for (var i = 0; i < sourceArray.length - 1; i++) {
        var j = i + Math.floor(Math.random() * (sourceArray.length - i));

        var temp = sourceArray[j];
        sourceArray[j] = sourceArray[i];
        sourceArray[i] = temp;
    }
    return sourceArray;
}

async function submitReview() {

    const reviewNumber = document.getElementById("reviewNumber").value
    const reviewText = document.getElementById("reviewText").value

    if(!reviewNumber || isNaN(reviewNumber)) {

        window.location.href = window.location.href
    }

    await fetch("http://localhost:8080/profile", {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({
            token: window.localStorage.getItem("token")
        })
    })
    .then((res)=> res.json())
    .then(async(data)=> {
    
        const searchKeys = window.location.search
        const urlParams = new URLSearchParams(searchKeys)

        const recipeId = urlParams.get("id")
        const userId = data.data._id

        window.location.href = window.location.href
        
        await fetch("http://localhost:8080/addReview", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify({
                text: reviewText,
                rating: reviewNumber,
                userId: userId,
                recipeId: recipeId
            })
        })
    })
}

async function getReviews() {

    const searchKeys = window.location.search
    const urlParams = new URLSearchParams(searchKeys)
    const id = urlParams.get("id")

    const response = await fetch("http://localhost:8080/reviews/" + id)
    const data = shuffle(await response.json())

    const section = document.getElementById("reviews-section")

    const recipeResponse = await fetch("http://localhost:8080/recipes/" + id)
    const recipeData = await recipeResponse.json()

    var overallRating = recipeData[0].rating

    for (let i=0;i<data.length;i++) {

        // overallRating += data[i].rating

        await fetch("http://localhost:8080/getUser", {
            method: "POST",
            headers: new Headers({"Content-Type": "application/json"}),
            body: JSON.stringify({
                userId: data[i].userId
            })
        })
        .then((res)=> res.json())
        .then(async(userData)=> {

            const div = document.createElement("div")
            const reviewDiv = document.createElement("div")
            const img = document.createElement("img")

            reviewDiv.classList.add("review-text")
            img.src = userData[0].image
            div.classList.add("review")

            reviewDiv.innerHTML = `
            <h4>${userData[0].username}</h4>
            <p>${data[i].text}</p>
            <span>${data[i].rating}★</span>
            `
            div.appendChild(img)
            div.appendChild(reviewDiv)
            section.appendChild(div)
        })
    }

    const span = document.getElementById("overallRating")

    if (overallRating == 0) {

        span.innerHTML = "(" + overallRating + "★)"
    }else {

        overallRating = overallRating / data.length

        if (overallRating % 1 != 0) {

            span.innerHTML = "(" + overallRating.toFixed(2) + "★)"
        }else {

            span.innerHTML = "(" + overallRating + "★)"
        }
    }
}

// async function programDialogOpen() {

//     const programModal = document.getElementById('programDialog')
//     programModal.showModal()

//     programModal.addEventListener("click", (e) => {
//         const dialogDimensions = programModal.getBoundingClientRect()
//         if (
//           e.clientX < dialogDimensions.left ||
//           e.clientX > dialogDimensions.right ||
//           e.clientY < dialogDimensions.top ||
//           e.clientY > dialogDimensions.bottom
//         ) {
//             programModal.close()
//         }
//       })
// }

async function dialogOpen(dialogId) {

    if ((!window.localStorage.getItem("loggedIn"))&&(dialogId === "reviewDialog")) {

        alert("you must login first")
        return
    }

    const Modal = document.getElementById(dialogId)
    Modal.showModal()

    Modal.addEventListener("click", (e) => {
        const dialogDimensions = Modal.getBoundingClientRect()
        if (
          e.clientX < dialogDimensions.left ||
          e.clientX > dialogDimensions.right ||
          e.clientY < dialogDimensions.top ||
          e.clientY > dialogDimensions.bottom
        ) {
            Modal.close()
        }
      })
}


async function addToFavorites() {

    if (!window.localStorage.getItem("loggedIn")) {

        alert("you must login first")
        return
    }
    
    const searchKeys = window.location.search
    const urlParams = new URLSearchParams(searchKeys)
    const id = urlParams.get("id")

    await fetch("http://localhost:8080/addToFavorites", {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({
            token: window.localStorage.getItem("token"),
            id: id
        })
    })

}

async function addToProgram() {

    if (!window.localStorage.getItem("loggedIn")) {

        window.location.href = window.location.href
        alert("you must login first")
        return
    }

    const searchKeys = window.location.search
    const urlParams = new URLSearchParams(searchKeys)
    const id = urlParams.get("id")
    
    const inputs = document.getElementById("program-container").querySelectorAll("input")
    let weekLs = []

    for (let i=0;i<inputs.length;i++) {

        weekLs.push(inputs[i].checked)
    }

    window.location.href = window.location.href

    await fetch("http://localhost:8080/addToProgram", {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify({
            token: window.localStorage.getItem("token"),
            id: id,
            program: weekLs
        })
    })
}

async function changeProgramDay(type) {
    console.log(document.getElementById("buttonNext").classList)
    if (window.localStorage.getItem("userType") == "user") {

        var sendData = {token: window.localStorage.getItem("token")}
        var url = "profile"
    }else {

        var sendData = {username: "evelina"}
        var url = "programProfile"
    }

    await fetch("http://localhost:8080/" + url, {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify(
            sendData
        )
    })
    .then((res)=> res.json())
    .then(async(data)=> {
    
        const profileData = data.data

        if (type == "next") {

            const h4 = document.getElementById("program-day")

            switch(h4.innerHTML) {

                case "Monday": 
                    h4.innerHTML = "Tuesday"
                    helpChangeProgram(profileData, 1)
                    break
                case "Tuesday": 
                    h4.innerHTML = "Wednesday"
                    helpChangeProgram(profileData, 2)
                    break
                case "Wednesday": 
                    h4.innerHTML = "Thursday"
                    helpChangeProgram(profileData, 3)
                    break
                case "Thursday": 
                    h4.innerHTML = "Friday"
                    helpChangeProgram(profileData, 4)
                    break
                case "Friday": 
                    h4.innerHTML = "Saturday"
                    helpChangeProgram(profileData, 5)
                    break
                case "Saturday": 
                    h4.innerHTML = "Sunday"
                    helpChangeProgram(profileData, 6)
                    break
                case "Sunday": 
                    h4.innerHTML = "Monday"
                    helpChangeProgram(profileData, 0)
                    break
            }
        }else {

            const h4 = document.getElementById("program-day")

            switch(h4.innerHTML) {

                case "Monday": 
                    h4.innerHTML = "Sunday"
                    helpChangeProgram(profileData, 6)
                    break
                case "Tuesday": 
                    h4.innerHTML = "Monday"
                    helpChangeProgram(profileData, 0)
                    break
                case "Wednesday": 
                    h4.innerHTML = "Tuesday"
                    helpChangeProgram(profileData, 1)
                    break
                case "Thursday": 
                    h4.innerHTML = "Wednesday"
                    helpChangeProgram(profileData, 2)
                    break
                case "Friday": 
                    h4.innerHTML = "Thursday"
                    helpChangeProgram(profileData, 3)
                    break
                case "Saturday": 
                    h4.innerHTML = "Friday"
                    helpChangeProgram(profileData, 4)
                    break
                case "Sunday": 
                    h4.innerHTML = "Saturday"
                    helpChangeProgram(profileData, 5)
                    break
            }
        }
    })
}

async function helpChangeProgram(data, index) {

    const dailyNutrientsLs = document.getElementById("daily-nutrients").querySelectorAll("li")
    const programUl = document.getElementById("program")
    
    let userProgram = []
    for (let i=0;i<data.program.length;i++) {

        userProgram.push(data.program[i].slice(1))
    }

    const aLs = programUl.querySelectorAll("a")
    for (let i=0;i<aLs.length;i++) {

        programUl.removeChild(aLs[i])
    }
    
    let dailyCalories = 0
    let dailyProtein = 0
    let dailyFat = 0
    let dailyCarbohydrates = 0
    let dailyFiber = 0
    let dailySugars = 0

    for (let i=0;i<userProgram[index].length;i++) {
                    
        const response = await fetch("http://localhost:8080/recipes/" + userProgram[index][i])
        const recipeData = await response.json()  

        dailyCalories += recipeData[0].calories
        dailyProtein += recipeData[0].protein
        dailyFat += recipeData[0].fat
        dailyCarbohydrates += recipeData[0].carbohydrates
        dailyFiber += recipeData[0].fiber
        dailySugars += recipeData[0].sugars

        if (i == userProgram[index].length - 1) {

            dailyNutrientsLs[0].innerHTML = "Calories: " + dailyCalories
            dailyNutrientsLs[1].innerHTML = "Protein: " + dailyProtein + "g"
            dailyNutrientsLs[2].innerHTML = "Fat: " + dailyFat + "g"
            dailyNutrientsLs[3].innerHTML = "Carbohydrates: " + dailyCarbohydrates + "g"
            dailyNutrientsLs[4].innerHTML = "Fiber:" + dailyFiber + "g"
            dailyNutrientsLs[5].innerHTML = "Sugars: " + dailySugars + "g"
        }

        const li = document.createElement("li")
        const a = document.createElement("a")
        a.href = "recipe.html?id=" + recipeData[0]._id 
        a.classList.add("recipe-h4") 
        li.innerHTML = recipeData[0].name
        a.appendChild(li)
        programUl.appendChild(a)
    }
}

async function getProgram() {
    
    await fetch("http://localhost:8080/program")
    .then((res)=> res.json())
    .then(async(data)=> {
        
        const weeklyNutrientsLs = document.getElementById("weekly-nutrients").querySelectorAll("li")
        const dailyNutrientsLs = document.getElementById("daily-nutrients").querySelectorAll("li")
        const programUl = document.getElementById("program")

        const profileData = data.data[0]

        const buttonPrev = document.getElementById("buttonPrevious")
        const buttonNext = document.getElementById("buttonNext")
        buttonPrev.classList.add(profileData.username)
        buttonNext.classList.add(profileData.username)

        let userProgram = []
        for (let i=0;i<profileData.program.length;i++) {

            userProgram.push(profileData.program[i].slice(1))
        }

        let weeklyCalories = 0
        let weeklyProtein = 0
        let weeklyFat = 0
        let weeklyCarbohydrates = 0
        let weeklyFiber = 0
        let weeklySugars = 0

        for (let i=0;i<userProgram.length;i++) {

            for (let j=0;j<userProgram[i].length;j++) {

                const response = await fetch("http://localhost:8080/recipes/" + userProgram[i][j])
                const data = await response.json()

                weeklyCalories += data[0].calories
                weeklyProtein += data[0].protein
                weeklyFat += data[0].fat
                weeklyCarbohydrates += data[0].carbohydrates
                weeklyFiber += data[0].fiber
                weeklySugars += data[0].sugars

                if (i == 0 && j == userProgram[i].length - 1) {

                    const h4 = document.getElementById("program-day")
                    h4.innerHTML = "Monday"

                    dailyNutrientsLs[0].innerHTML += weeklyCalories
                    dailyNutrientsLs[1].innerHTML += weeklyProtein + "g"
                    dailyNutrientsLs[2].innerHTML += weeklyFat + "g"
                    dailyNutrientsLs[3].innerHTML += weeklyCarbohydrates + "g"
                    dailyNutrientsLs[4].innerHTML += weeklyFiber + "g"
                    dailyNutrientsLs[5].innerHTML += weeklySugars + "g"
                }

                if (i == 0) {

                    const li = document.createElement("li")
                    const a = document.createElement("a")
                    a.href = "recipe.html?id=" + data[0]._id  
                    a.classList.add("recipe-h4") 
                    li.innerHTML = data[0].name
                    a.appendChild(li)
                    programUl.appendChild(a)
                }
            }
        }

        weeklyNutrientsLs[0].innerHTML += (weeklyCalories / 7) % 1 == 0 ? weeklyCalories / 7 : (weeklyCalories / 7).toFixed(2)
        weeklyNutrientsLs[1].innerHTML += (weeklyProtein / 7) % 1 == 0 ? weeklyProtein / 7 + "g": (weeklyProtein / 7).toFixed(2) + "g"
        weeklyNutrientsLs[2].innerHTML += (weeklyFat / 7) % 1 == 0 ? weeklyFat / 7 + "g": (weeklyFat / 7).toFixed(2) + "g"
        weeklyNutrientsLs[3].innerHTML += (weeklyCarbohydrates / 7) % 1 == 0 ? weeklyCarbohydrates / 7 + "g": (weeklyCarbohydrates / 7).toFixed(2) + "g"
        weeklyNutrientsLs[4].innerHTML += (weeklyFiber / 7) % 1 == 0 ? weeklyFiber / 7 + "g": (weeklyFiber / 7).toFixed(2) + "g"
        weeklyNutrientsLs[5].innerHTML += (weeklySugars / 7) % 1 == 0 ? weeklySugars / 7 + "g": (weeklySugars / 7).toFixed(2) + "g" 
    })
}