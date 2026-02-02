const username = localStorage.getItem("username");

if (!username) {
  window.location.href = "login.html";
}

document.getElementById("user").textContent = username;

document.getElementById("logout").addEventListener("click", () => {
  localStorage.removeItem("username");
  window.location.href = "login.html";
});
