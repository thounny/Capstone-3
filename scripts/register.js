document.addEventListener("DOMContentLoaded", () => {
  // Dynamically render taskbar links based on login status
  const taskbarItems = document.getElementById("taskbar-items");
  taskbarItems.innerHTML = ""; // Clear any existing links

  if (isLoggedIn()) {
    // Links for logged-in users
    taskbarItems.innerHTML = `
            <div class="taskbar-item"><a href="posts.html">Posts</a></div>
            <div class="taskbar-item"><a href="profile_page.html">Profile</a></div>
            <div class="taskbar-item"><a href="profile.html">Settings</a></div>
            <div class="taskbar-item"><a href="#" onclick="logout()">Logout</a></div>
        `;
  } else {
    // Links for unauthenticated users
    taskbarItems.innerHTML = `
            <div class="taskbar-item"><a href="index.html">Home</a></div>
            <div class="taskbar-item"><a href="register.html">Register</a></div>
        `;
  }

  // Form submission handling
  const registerForm = document.getElementById("registerForm");
  registerForm.onsubmit = function (event) {
    event.preventDefault();

    const fullName = document.getElementById("fullName").value.trim();
    const username = document.getElementById("username").value.trim();
    const password = document.getElementById("password").value.trim();

    const userData = { fullName, username, password };

    fetch(`${apiBaseURL}/api/users`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(userData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Registration successful. Please log in.");
          window.location.assign("index.html");
        } else {
          alert("Registration failed. Try again.");
        }
      })
      .catch((error) => console.error("Error registering:", error));
  };
});
