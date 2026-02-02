const username = localStorage.getItem("username");
if (!username) window.location.href = "login.html";

document.getElementById("user").textContent = username;

document.getElementById("logout").onclick = () => {
  localStorage.removeItem("username");
  window.location.href = "login.html";
};

const socket = io();
const form = document.getElementById("chat-form");
const input = document.getElementById("msg");
const messages = document.getElementById("messages");

form.addEventListener("submit", (e) => {
  e.preventDefault();
  if (!input.value.trim()) return;

  socket.emit("chat-message", {
    user: username,
    text: input.value,
  });

  input.value = "";
});

socket.on("chat-message", (data) => {
  const div = document.createElement("div");
  div.classList.add("message");

  if (data.user === username) div.classList.add("me");

  div.innerHTML = `<strong>${data.user}:</strong> ${data.text}`;
  messages.appendChild(div);
  messages.scrollTop = messages.scrollHeight;
});
