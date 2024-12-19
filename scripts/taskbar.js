document.addEventListener("DOMContentLoaded", function () {
  const taskbarContainer = document.getElementById("taskbar-container");

  if (taskbarContainer) {
    // Default taskbar HTML
    let taskbarHTML = `
            <nav class="taskbar">
                <div class="start-button" onclick="toggleStartMenu()">Start</div>
            </nav>
            <div id="start-menu" class="start-menu-modal" style="display: none;">
                <div class="start-menu-content">
                    <ul>
                        <li><a href="posts.html">Posts</a></li>
                        <li><a href="profile_page.html">Profile Page</a></li>
                        <li><a href="profile.html">Settings</a></li>
                        <li><a href="#" onclick="logout()">Logout</a></li>
                    </ul>
                </div>
            </div>
        `;

    // Check if we are on profile_page.html
    if (window.location.pathname.includes("profile_page.html")) {
      taskbarHTML = `
            <nav class="taskbar">
                <div class="start-button" onclick="toggleStartMenu()">Start</div>
            </nav>
            <div id="start-menu" class="start-menu-modal" style="display: none;">
                <div class="start-menu-content">
                    <ul>
                        <li><a href="posts.html">Posts</a></li>
                        <li><a href="profile_page.html">Profile Page</a></li>
                        <li><a href="profile.html">Settings</a></li>
                        <li><a href="#" onclick="openProgram('webamp-player')">Music Player</a></li>
                        <li><a href="#" onclick="logout()">Logout</a></li>
                    </ul>
                </div>
            </div>
        `;
    }

    // Set the taskbar HTML
    taskbarContainer.innerHTML = taskbarHTML;
  }

  const startMenu = document.getElementById("start-menu");

  window.toggleStartMenu = function () {
    const isDisplayed = startMenu.style.display === "block";
    startMenu.style.display = isDisplayed ? "none" : "block";
  };

  // Close Start Menu when clicking outside
  document.addEventListener("click", function (event) {
    if (
      !event.target.closest(".start-button") &&
      !event.target.closest("#start-menu")
    ) {
      startMenu.style.display = "none";
    }
  });
});
