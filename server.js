const express = require("express");
const app = express();
const http = require("http").createServer(app);
const io = require("socket.io")(http);

// ✅ ONLY public folder serve
app.use(express.static("public"));

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("chat-message", (data) => {
    io.emit("chat-message", data);
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3000;
http.listen(PORT, () => {
  console.log("BmGapShap running on port", PORT);
});
