const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// 🧠 in-memory message store
const messages = [];

const onlineUsers = new Map(); // socket.id -> username

io.on("connection", (socket) => {
  // jab client apna naam bataye
  socket.on("join", (username) => {
    onlineUsers.set(socket.id, username);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });

  socket.on("chat", (data) => {
    messages.push(data);
    io.emit("chat", data);
  });

  socket.on("disconnect", () => {
    onlineUsers.delete(socket.id);
    io.emit("onlineUsers", Array.from(onlineUsers.values()));
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("RUNNING"));
