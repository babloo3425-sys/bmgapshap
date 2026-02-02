/* ================= BASIC CHECK ================= */
console.log("script.js loaded");

/* ================= USER CHECK ================= */
const username = localStorage.getItem("username");
if (!username) {
  window.location.href = "home.html";
}

/* ================= SOCKET ================= */
const socket = io();
socket.emit("join", username);

/* ========= CHAT LIST ========= */
const chatList = document.getElementById("chat-list");

socket.on("users:list", (users) => {
  if (!chatList) return;

  chatList.innerHTML = "";

  users.forEach((user) => {
    if (user === username) return;

    const div = document.createElement("div");
    div.className = "chat-item";
    div.textContent = user;

    div.onclick = () => {
      window.location.href = `chat.html?user=${user}`;
    };

    chatList.appendChild(div);
  });
});
/* ================= DOM ================= */
const messages = document.getElementById("messages");
const input = document.getElementById("messageInput");
const sendBtn = document.getElementById("sendBtn");
const micBtn = document.getElementById("micBtn");
const attachBtn = document.getElementById("attachBtn");
const imageInput = document.getElementById("imageInput");
const typingIndicator = document.getElementById("typingIndicator");

const emojiBtn = document.getElementById("emojiBtn");
const emojiPicker = document.getElementById("emojiPicker");

const imageModal = document.getElementById("imageModal");
const modalImg = document.getElementById("modalImage");
const downloadBtn = document.getElementById("downloadImageBtn");
// ================= HOME USERNAME =================
const storedUsername = localStorage.getItem("username");
const homeUserEl = document.getElementById("home-username");

if (homeUserEl && storedUsername) {
  homeUserEl.textContent = storedUsername;
}

const homeUser = document.getElementById("home-username");
if (homeUser && username) {
  homeUser.textContent = username;
}

/* ================= UTIL ================= */
function getCurrentTime() {
  return new Date().toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });
}

function scrollBottom() {
  messages.scrollTop = messages.scrollHeight;
}

/* ================= TEXT ================= */
function addText(text, side, time) {
  const div = document.createElement("div");
  div.className = `message ${side}`;

  const textDiv = document.createElement("div");
  textDiv.textContent = text;

  const timeSpan = document.createElement("span");
  timeSpan.className = "msg-time";
  timeSpan.textContent = time;

  div.appendChild(textDiv);
  div.appendChild(timeSpan);
  messages.appendChild(div);
  scrollBottom();
}

function sendMessage() {
  const text = input.value.trim();
  if (!text) return;

  const time = getCurrentTime();

  addText(text, "right", time);
  socket.emit("send-message", { text: text, user: username });

  input.value = "";
}

/* ================= IMAGE ================= */
function addImage(src, side, time) {
  const div = document.createElement("div");
  div.className = `message image ${side}`;

  const img = document.createElement("img");
  img.src = src;

  img.onclick = () => {
    modalImg.src = src;
    imageModal.style.display = "flex";
  };

  const timeSpan = document.createElement("span");
  timeSpan.className = "msg-time";
  timeSpan.textContent = time;

  div.appendChild(img);
  div.appendChild(timeSpan);
  messages.appendChild(div);
  scrollBottom();
}

/* ================= AUDIO ================= */
function addAudio(src, side, time) {
  const div = document.createElement("div");
  div.className = `message ${side}`;

  const audio = document.createElement("audio");
  audio.controls = true;
  audio.src = src;

  const timeSpan = document.createElement("span");
  timeSpan.className = "msg-time";
  timeSpan.textContent = time;
  div.appendChild(audio);
  div.appendChild(timeSpan);
  messages.appendChild(div);
  scrollBottom();
}

/* ================= EVENTS ================= */

/* ================= INPUT UI TOGGLE ================= */
function toggleSendMic() {
  if (!input || !sendBtn || !micBtn) return;

  if (input.value.trim()) {
    sendBtn.style.display = "flex";
    micBtn.style.display = "none";
  } else {
    sendBtn.style.display = "none";
    micBtn.style.display = "flex";
  }
}
// initial state
if (input) {
  toggleSendMic();
  input.addEventListener("input", toggleSendMic);
}

if (sendBtn && input) {
  sendBtn.onclick = sendMessage;
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") sendMessage();
  });
}

if (attachBtn && imageInput) {
  attachBtn.onclick = () => imageInput.click();
}

if (imageInput) {
  imageInput.onchange = () => {};

  const file = imageInput.files[0];
  if (fileInput) {
    fileInput.onchange = handleImage;
  }

  const reader = new FileReader();
  reader.onload = () => {
    const time = getCurrentTime();
    addImage(reader.result, "right", time);
    socket.emit("image-message", { img: reader.result, time });
  };
  reader.readAsDataURL(file);
  imageInput.value = "";
}

/* ================= MIC ================= */
let mediaRecorder;
let audioChunks = [];

if (micBtn) {
  micBtn.onpointerdown = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    audioChunks = [];
    mediaRecorder = new MediaRecorder(stream);

    mediaRecorder.ondataavailable = (e) => audioChunks.push(e.data);

    mediaRecorder.onstop = () => {
      const blob = new Blob(audioChunks, { type: "audio/webm" });
      const reader = new FileReader();
      reader.onloadend = () => {
        const time = getCurrentTime();
        addAudio(reader.result, "right", time);
        socket.emit("audio-message", { audio: reader.result, time });
      };
      reader.readAsDataURL(blob);
    };

    mediaRecorder.start();
  };

  micBtn.onpointerup = () => {
    if (mediaRecorder && mediaRecorder.state === "recording") {
      mediaRecorder.stop();
    }
  };
}

/* ================= EMOJI ================= */
if (emojiBtn && emojiPicker) {
  emojiBtn.onclick = () => {
    emojiPicker.style.display =
      emojiPicker.style.display === "flex" ? "none" : "flex";
  };

  emojiPicker.onclick = (e) => {
    if (e.target.tagName === "SPAN") {
      input.value += e.target.innerText;
      input.focus();
    }
  };
}

/* ================= SOCKET RECEIVE ================= */
socket.on("chat-message", (msg) => {
  addText(msg.text, "left", msg.time);
});

socket.on("image-message", (msg) => {
  addImage(msg.img, "left", msg.time);
});

socket.on("audio-message", (msg) => {
  addAudio(msg.audio, "left", msg.time);
});

socket.on("typing", () => {
  if (typingIndicator) typingIndicator.style.display = "block";
});

socket.on("stopTyping", () => {
  if (typingIndicator) typingIndicator.style.display = "none";
});

/* ================= MODAL ================= */
if (imageModal) {
  imageModal.onclick = () => (imageModal.style.display = "none");
}

if (downloadBtn) {
  downloadBtn.onclick = (e) => {
    e.stopPropagation();
    const link = document.createElement("a");
    link.href = modalImg.src;
    link.download = "image.jpg";
    link.click();
  };
}

socket.on("receive-message", (msg) => {
  if (msg.type === "text") {
    addText(msg.content, "left", msg.time);
  }

  if (msg.type === "image") {
    addImage(msg.content, "left", msg.time);
  }

  if (msg.type === "voice") {
    addAudio(msg.content, "left", msg.time);
  }
});

socket.on("chat-history", (messages) => {
  messages.forEach((msg) => {
    if (msg.type === "text") {
      addText(msg.content, "left", msg.time);
    }

    if (msg.type === "image") {
      addImage(msg.content, "left", msg.time);
    }

    if (msg.type === "voice") {
      addAudio(msg.content, "left", msg.time);
    }
  });
});
