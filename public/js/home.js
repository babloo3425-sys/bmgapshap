const user = localStorage.getItem("username");
if (!user) location.replace("/");

document.getElementById("user") &&
  (document.getElementById("user").innerText = "Welcome " + user);
