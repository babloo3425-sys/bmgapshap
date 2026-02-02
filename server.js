const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

app.use(express.static("public"));

// 🧠 in-memory message store
const messages = [];

io.on("connection", (socket) => {
  console.log("User connected", socket.id);

  // send old messages to new user
  socket.emit("oldMessages", messages);

  socket.on("chat", (data) => {
    messages.push(data); // save
    io.emit("chat", data); // broadcast
  });

  socket.on("disconnect", () => {
    console.log("User disconnected", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => console.log("RUNNING"));
