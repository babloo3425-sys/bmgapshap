document.addEventListener("DOMContentLoaded", () => {
  const input = document.querySelector(".login-box input");
  const button = document.querySelector(".login-box button");

  button.addEventListener("click", () => {
    const name = input.value.trim();

    if (!name) {
      alert("Please enter your name");
      return;
    }

    // save username
    localStorage.setItem("username", name);

    // go to home page
    window.location.href = "/home.html";
  });
});
