const MAX_PAYLOAD_SIZE = 500 * 1024;
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

app.use(express.static("public"));

const messages = [];
let chats = {};
let activeUsers = new Set();
let onlineUsernames = new Set();
const userSockets = new Map();

// common chat key
function getChatKey(user1, user2) {
  return [user1, user2].sort().join("_");
}

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // send old messages
  socket.emit("chat-history", messages);

  socket.on("get-history", ({ from, to }) => {
    const key = getChatKey(from, to);
    if (!chats[key]) chats[key] = [];
    socket.emit("chat-history", chats[key]);
  });

  socket.on("send-message", (data) => {
    const message = {
      id: Date.now(),
      user: data.user || "User",
      text: data.text,
      time: new Date().toLocaleTimeString(),
    };

    messages.push(message);
    io.emit("chat-message", message);
    io.emit("receive-message", message);
  });

  socket.on("join", (username) => {
    socket.username = username;
    onlineUsernames.add(username);
    userSockets.set(username, socket.id);
    io.emit("users:list", Array.from(onlineUsernames));
  });

  socket.on("message-seen", () => {
    socket.broadcast.emit("message-seen");
  });

  socket.on("user-active", () => {
    activeUsers.add(socket.id);
  });

  socket.on("chat-message", (msg) => {
    const key = getChatKey(socket.username, msg.to);
    if (!chats[key]) chats[key] = [];
    chats[key].push({
      type: "text",
      from: msg.user,
      text: msg.text,
      time: msg.time,
    });

    socket.broadcast.emit("chat-message", msg);
  });

  socket.on("image-message", (img) => {
    if (!img || !img.img) return;
    if (img.img.length > MAX_PAYLOAD_SIZE) return;
    socket.broadcast.emit("image-message", img);
  });

  socket.on("audio-message", (msg) => {
    if (!msg || !msg.audio) return;
    if (msg.audio.length > MAX_PAYLOAD_SIZE) return;
    socket.broadcast.emit("audio-message", msg);
  });

  socket.on("typing", () => {
    socket.broadcast.emit("typing");
  });

  socket.on("stopTyping", () => {
    socket.broadcast.emit("stopTyping");
  });

  socket.on("disconnect", () => {
    activeUsers.delete(socket.id);
    if (socket.username) {
      onlineUsernames.delete(socket.username);
      userSockets.delete(socket.username);
      io.emit("users:list", Array.from(onlineUsernames));
    }
  });
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log("Server running on port", PORT));
