const btn = document.getElementById("loginBtn");
const input = document.getElementById("username");

// already logged in → home
if (localStorage.getItem("username")) {
  window.location.href = "home.html";
}

btn.addEventListener("click", () => {
  const username = input.value.trim();
  if (!username) return alert("Username required");

  localStorage.setItem("username", username);
  window.location.href = "home.html";
});
