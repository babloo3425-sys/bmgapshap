document.addEventListener("DOMContentLoaded", () => {
  const chatList = document.getElementById("chatList");
  const myName = localStorage.getItem("username");

  const username = localStorage.getItem("username");
  if (!username) {
    window.location.href = "/login.html";
  }

  // 🔌 socket connect
  const socket = io();

  // 🔴 ADD: unread counter store
  const unreadCount = {};

  // ✅ STEP 1: server ko batao main kaun hoon
  socket.emit("join", myName);

  // ✅ STEP 2: server se users list lo
  socket.on("users:list", (users) => {
    chatList.innerHTML = "";

    users.forEach((user) => {
      if (user === myName) return; // apna naam mat dikhao

      const div = document.createElement("div");
      div.className = "chat-item";

      // 🔗 ADD: identify chat item
      div.setAttribute("data-user", user);

      // ✅ Last message preview (from localStorage)
      const last = localStorage.getItem("lastChat_" + user);

      let previewText = "";
      let previewTime = "";

      if (last) {
        try {
          const data = JSON.parse(last);

          if (data.type === "image") {
            previewText = "📷 Photo";
          } else if (data.type === "audio") {
            previewText = "🎤 Voice message";
          } else {
            previewText = data.text || "";
          }

          previewTime = data.time || "";
        } catch (e) {}
      }

      div.innerHTML = `
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;">
            <strong>${user}</strong>
            <span class="chat-time" style="font-size:11px;color:#999;">
              ${previewTime || ""}
            </span>
          </div>

          <div style="display:flex;justify-content:space-between;align-items:center;">
            <span style="font-size:13px;color:#555;">
              ${previewText || ""}
            </span>

            <!-- 🔴 ADD: unread badge -->
            <span class="unread-badge"
              style="
                display:none;
                background:#25D366;
                color:white;
                border-radius:50%;
                padding:2px 6px;
                font-size:12px;
                margin-left:8px;
              ">0</span>
          </div>
        </div>
      `;

      div.addEventListener("click", () => {
        // unread reset on open
        unreadCount[user] = 0;

        const badge = div.querySelector(".unread-badge");
        if (badge) badge.style.display = "none";

        localStorage.setItem("chatWith", user);
        window.location.href = "index.html";
      });

      chatList.appendChild(div);
    });
  });

  // 🔔 ADD: REAL-TIME HOME UNREAD LISTENER
  socket.on("home-unread", (data) => {
    const { from, text, time, type } = data;

    // save last message
    localStorage.setItem(
      "lastChat_" + from,
      JSON.stringify({
        text,
        time,
        type,
      }),
    );

    // increment unread count
    unreadCount[from] = (unreadCount[from] || 0) + 1;

    // update UI if chat item exists
    const chatItem = document.querySelector(`[data-user="${from}"]`);
    if (chatItem) {
      const badge = chatItem.querySelector(".unread-badge");
      const preview = chatItem.querySelector("span");

      if (preview) preview.innerText = text;
      if (badge) {
        badge.innerText = unreadCount[from];
        badge.style.display = "inline-block";
      }
    }
  });
});
