const express=require("express")
const mongoose=require("mongoose")
const path = require('path')
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const Recipe = require("./models/recipeModel")
const User = require("./models/userModel")
const Review = require("./models/reviewModel")
const { updateOne } = require("./models/recipeModel")
const app = express()

// app.use("/uploads", express.static("uploads"))
app.use(express.json({limit: '50mb'}));

const uri = "mongodb+srv://kobachef:kobachefmeowmeow@kobachef.jn4pidn.mongodb.net/?retryWrites=true&w=majority"
const jwtSecret = "66222f1b4e08b72b6deb3918e345bffa0d4e745e4a161c84bf581e7025b64423577e7d0d79d39d19591407c2b5528fe7f0da8831c445f311d397fc79b78df596"


app.get('/', function(req, res){

    var options = {
        root: path.join(__dirname, 'public')
    }

    res.sendFile('index.html', options)
})

app.use(express.static('public'))

app.use(express.urlencoded({ extended: false }))

app.get("/recipes", async(req, res)=> {
    
    try{
        const recipes = await Recipe.find({})
        res.status(200).json(recipes)
    }catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.get("/recipes/:id", async(req, res)=> {
    
    try{
        const id = req.params.id
        const recipe = await Recipe.find({"_id": id})
        res.status(200).json(recipe)
    }catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.get("/chef_recipes/:id", async(req, res)=> {
    
    try{
        const id = req.params.id
        const recipe = await Recipe.find({"chef": id})
        res.status(200).json(recipe)
    }catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.post("/recipes", async(req, res)=> {
    
    try{
        const recipe = await Recipe.create(req.body)
        res.status(200).json(recipe)
    }catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.post("/register", async(req, res)=> {
    
    try{
        const { username, password, gender, age, location, email, image, bio, favorites, cart, program, userType } = req.body

        const encryptedPassword = await bcrypt.hash(password, 10)
        const user = await User.create({

            username,
            password: encryptedPassword,
            gender,
            age,
            location,
            email,
            image,
            bio,
            favorites,
            cart,
            program,
            userType
        })
        res.status(200).json(user)
    }catch (error) {
        console.log(error.message)
        res.status(500).json({message: error.message})
    }
})

app.post("/login", async(req, res)=> {

    const { username, password } = req.body

    const user = await User.findOne({ username })
    if (!user) {

        return res.json({error: "User Not Found"})
    }
    if (await bcrypt.compare(password, user.password)) {

        const token = jwt.sign({username: user.username}, jwtSecret)

        res.json({status: "ok", data: token, userType: user.userType})
    }
})

app.post("/profile", async(req, res)=> {
    
    const { token } = req.body

    const user = jwt.verify(token, jwtSecret)

    const userUsername = user.username
    User.findOne({username: userUsername})
    .then((data)=> {

        res.send({status: "ok", data: data})
    })
})

app.get("/profile/:id", async(req, res)=> {

    const id = req.params.id
    const user = await User.find({"_id": id})
    res.status(200).json(user)
})

app.post("/addToCart", async(req, res)=> {

    const { token, name } = req.body

    const user = jwt.verify(token, jwtSecret)

    const userUsername = user.username
    User.findOne({username: userUsername}, {image: 0})
    .then(async(data)=> {

        let flag = false
        
        for (let i=0;i<data.cart.length;i++) {

            if (data.cart[i].name != name) {

                continue
            }else {

                flag = true
                break
            }
        }

        if (!flag) {

            await User.updateOne({"_id": data._id}, {$push: {cart: {name: name, quantity: 1}}})
        }else {

            await User.updateOne({"_id": data._id}, {$inc: {"cart.$[t].quantity": 1}}, {arrayFilters: [{"t.name": {$eq: name}}]})
        }
    })
})

app.post("/removeFromCart", async(req, res)=> {

    const { token, name } = req.body

    const user = jwt.verify(token, jwtSecret)

    const userUsername = user.username
    User.findOne({username: userUsername}, {image: 0})
    .then(async(data)=> {

        let flag = false
        
        for (let i=0;i<data.cart.length;i++) {

            if (data.cart[i].name == name) {

                if (data.cart[i].quantity == 1) {

                    await User.updateOne({"_id": data._id}, {$pull: {cart: {name: data.cart[i].name, quantity: data.cart[i].quantity}}})
                    res.send({name: data.cart[i].name, quantity: data.cart[i].quantity - 1})
                    break
                }else {
                    await User.updateOne({"_id": data._id}, {$inc: {"cart.$[t].quantity": -1}}, {arrayFilters: [{"t.name": {$eq: name}}]})
                    res.send({name: data.cart[i].name, quantity: data.cart[i].quantity - 1})
                    break
                }
            }
        }
    })
})

app.post("/cart", async(req, res)=> {

    const { token } = req.body

    const user = jwt.verify(token, jwtSecret)

    const userUsername = user.username
    User.findOne({username: userUsername}, {image: 0})
    .then((data)=> {

        res.send({status: "ok", data: data.cart})
    })
})

app.post("/addReview", async(req, res)=> {

    const { text, rating, userId, recipeId } = req.body

    if (!text) {

        Recipe.findOne({"_id": recipeId}, {image: 0})
        .then(async(data)=> {
    
            const newRating = (data.reviewsCount*data.rating + Number(rating)) / (data.reviewsCount + 1)
    
            await Recipe.updateOne({"_id": data._id}, {$set: {reviewsCount: data.reviewsCount + 1, rating: newRating}})
        })
    }else {

        await Review.create({
    
            text,
            rating,
            userId,
            recipeId
        })

        Recipe.findOne({"_id": recipeId}, {image: 0})
        .then(async(data)=> {
    
            const newRating = (data.reviewsCount*data.rating + Number(rating)) / (data.reviewsCount + 1)
    
            await Recipe.updateOne({"_id": data._id}, {$set: {reviewsCount: data.reviewsCount + 1, rating: newRating}})
        })
    }
})

app.get("/reviews/:id", async(req, res)=>{

    const reviews = await Review.find({recipeId: {$eq: req.params.id}})
    res.status(200).json(reviews)
})

app.post("/getUser", async(req, res)=> {

    const { userId } = req.body
    
    const user = await User.find({"_id": userId})
    res.status(200).json(user)
})

app.get("/allUsers", async(req, res)=> {

    const users = await User.find({userType: "user"}, {image: 0})
    res.status(200).json(users)
})

app.post("/addToFavorites", async(req, res)=> {

    const { token, id } = req.body
    
    const user = jwt.verify(token, jwtSecret)

    const userUsername = user.username

    User.findOne({username: userUsername}, {image: 0})
    .then(async(data)=> {

        if(data.favorites.includes(id)){

            return
        }else {

            await User.updateOne({username: userUsername}, {$push: {favorites: id}})
        }
    })
})

app.post("/addToProgram", async(req, res)=> {

    const { token, id, program } = req.body

    const user = jwt.verify(token, jwtSecret)

    const userUsername = user.username

    User.findOne({username: userUsername}, {image: 0})
    .then(async(data)=> {

        for (let i=0;i<program.length;i++) {

            if (program[i]) {

                await User.updateOne({username: userUsername}, {$push: {"program.$[t]": id}}, {arrayFilters: [{"t": i}]}) 
            }
        }
        // await User.updateOne({username: userUsername}, {$push: {favorites: id}})  
    })
})

app.get("/program", async(req, res)=> {

    for (let i=0;i<chats.length;i++) {

        for (let j=0;j<chats[i].length;j++) {

            if (chats[i][0].username == "Stamatis Tziantopoulos") {

                const user = await User.find({username: chats[i][1].username}, {image: 0})
                res.send({status: "ok", data: user})
                break
            }
            if (chats[i][1].username == "Stamatis Tziantopoulos") {
                
                const user = await User.find({username: chats[i][0].username}, {image: 0})
                res.send({status: "ok", data: user})
                break
            }
        }
    }
})

app.post("/programProfile", async(req, res)=> {

    const { username } = req.body
    
    User.findOne({username: username}, {image: 0})
    .then((data)=> {

        res.send({status: "ok", data: data})
    })
})

var usersLs = []
var chats = []

mongoose.set("strictQuery", false)
mongoose.connect(uri)
.then(()=> {
    console.log("Connected to MongoDB");
    const server = app.listen(8080, ()=> {console.log("Server started on port 8080")})
    const io = require("socket.io")(server)

    io.on("connection", function(socket) {

        socket.on("newuser", function(username) {
    
            // socket.broadcast.emit("update", username + " joined the conversation")
            // if (usersLs.length < 2) {

            //     usersLs.push(username)
            //     if (usersLs.length == 2) {

            //         chats.push([usersLs[0], username])
            //         socket.broadcast.to(usersLs[0].id).emit("update", username.username + " joined the conversation")
            //         usersLs = []
            //         console.log(chats)
            //     }
            // }
            usersLs.push(username)
        })
        socket.on("exituser", function(username) {
    
            // socket.broadcast.emit("update", username + " left the conversation")
            usersLs = []
            for (let i=0;i<chats.length;i++) {

                for (let j=0;j<chats[i].length;j++) {

                    if (chats[i][j].username == username) {

                        if (chats[i][0].username == username) {

                            socket.broadcast.to(chats[i][1].id).emit("update", username + " left the conversation")
                        }
        
                        if (chats[i][1].username == username) {
        
                            socket.broadcast.to(chats[i][0].id).emit("update", username + " left the conversation")
                        }

                        chats.splice(chats.indexOf(chats[i]), 1)
                        if (chats.length == 0) {

                            break
                        }
                    }
                }
            }
        })
        // socket.on("askForChat", function(username) {

        //     if (usersLs.includes(username.name)) {

        //         console.log("meoww")
        //     }else {

        //         socket.broadcast.to(username.id).emit("alert", username.name + " is not active right now")
        //         // socket.broadcast.emit("alert", username.name + " is not active right now")
        //     }
        // })
        socket.on("createChat", function(data) {

            for (let i=0;i<usersLs.length;i++) {

                if (usersLs[i].username == data.othername) {

                    chats.push([usersLs[i], {username: data.username, id: data.id}])
                    socket.broadcast.to(usersLs[i].id).emit("update", data.username + " joined the conversation")
                    usersLs.splice(usersLs.indexOf(usersLs[i]), 1)
                }
            }
        })
        socket.on("chat", function(message) {
    
            // socket.broadcast.emit("chat", message)
            for (let i=0;i<chats.length;i++) {

                if (chats[i][0].username == message.username) {

                    socket.broadcast.to(chats[i][1].id).emit("chat", message)
                }

                if (chats[i][1].username == message.username) {

                    socket.broadcast.to(chats[i][0].id).emit("chat", message)
                }
            }
        })
        socket.on("id", function(id) {
    
            console.log(id)
        })
    })
}).catch((error)=> {
    console.log(error)
})