// const server =require('http').createServer();
//   const io= require('socket.io')(server,{
//     cors:{
//         origin:"*"
//     }
//   })

// const NEW_CHAT_MESSAGE_EVENT="newChatMessage"
// io.on('connection',(socket)=>{
//     console.log("socket id is ="+socket.id+"connected")
//     //join the socket in its own room
//     const {roomId} = socket.handshake.query
//     socket.join(roomId)
//     //listen for messages
//     socket.on(NEW_CHAT_MESSAGE_EVENT,(data)=>{
//         io.in(roomId).emit(NEW_CHAT_MESSAGE_EVENT,data)
//     })
//     //user disconnect
//     socket.on('disconnect',()=>{
//         socket.leave(roomId )
//     })
// })
// const port =4000;

// server.listen(port,()=>{
//     console.log("server started on port "+port)
// })

// ----------------------------------------------------------------
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const UserModel = require("./models/User");

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: ["https://mernfront-9iia.onrender.com"],
    methods: ["GET", "POST"],
    credentials: true,
  })
);
app.use(cookieParser());

mongoose.connect("mongodb+srv://saikrishnachintha06:sai123krishna@cluster0.i1yyaz8.mongodb.net/loca?retryWrites=true&w=majority");
console.log("mongodb connected");
const varifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        if (decoded.role === "admin") {
          next();
        } else {
          return res.json("not admin");
        }
      }
    });
  }
};

app.get("/dashboard", varifyUser, (req, res) => {
  res.json("Success");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt.hash(password, 10)
    .then(hash => {
      UserModel.create({ name, email, password: hash })
        .then(user => res.json("Success"))
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email })
    .then(user => {
      if (user) {
        bcrypt.compare(password, user.password, (err, response) => {
          if (response) {
            const token = jwt.sign(
              { email: user.email, role: user.role },
              "jwt-secret-key",
              { expiresIn: "1d" }
            );
            res.cookie("token", token);
            return res.json({ Status: "Success", role: user.role });
          } else {
            return res.json("The password is incorrect");
          }
        });
      } else {
        return res.json("No record existed");
      }
    });
});

const port = process.env.PORT || 3001; // Use the provided PORT or default to 3000
app.listen(port, () => {
  console.log("auth Server is Running")
})
