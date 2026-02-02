document.getElementById("btn").onclick = () => {
  const name = document.getElementById("username").value.trim();
  if (!name) return alert("Enter username");

  localStorage.setItem("username", name);

  // 🔥 ALWAYS GO THROUGH INDEX
  location.replace("/");
};
