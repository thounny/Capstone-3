"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const desktop = document.querySelector(".desktop");
  const wallpaperSelect = document.getElementById("wallpaper-select");
  const wallpaperUpload = document.getElementById("wallpaper-upload");
  const loadImageButton = document.getElementById("load-custom-image");
  const wallpaperWindow = document.getElementById("change-wallpaper");
  const addSongsWindow = document.getElementById("add-songs");
  const startMenu = document.getElementById("start-menu");
  const songUploadInput = document.getElementById("song-upload");
  const userTracksList = document.getElementById("user-tracks-list");
  let webampInstance = null; // Webamp instance for the music player
  let customWallpaper = null; // To store uploaded custom image

  // Function to make elements draggable within the desktop boundaries
  function makeDraggable(element) {
    let offsetX,
      offsetY,
      isDragging = false;

    element.addEventListener("mousedown", (e) => {
      isDragging = true;
      offsetX = e.clientX - element.offsetLeft;
      offsetY = e.clientY - element.offsetTop;
      element.style.cursor = "grabbing";
    });

    document.addEventListener("mousemove", (e) => {
      if (isDragging) {
        const maxX = desktop.offsetWidth - element.offsetWidth;
        const maxY = desktop.offsetHeight - element.offsetHeight;

        let newX = e.clientX - offsetX;
        let newY = e.clientY - offsetY;

        newX = Math.max(0, Math.min(newX, maxX));
        newY = Math.max(0, Math.min(newY, maxY));

        element.style.left = `${newX}px`;
        element.style.top = `${newY}px`;
      }
    });

    document.addEventListener("mouseup", () => {
      isDragging = false;
      element.style.cursor = "grab";
    });
  }

  // Make program windows draggable
  wallpaperWindow.style.position = "absolute";
  addSongsWindow.style.position = "absolute";
  makeDraggable(wallpaperWindow);
  makeDraggable(addSongsWindow);

  // Load saved wallpaper on page load
  function loadSavedWallpaper() {
    const loginData = getLoginData();
    const savedWallpaper = localStorage.getItem(
      `wallpaper-${loginData.username}`
    );
    if (savedWallpaper) {
      applyWallpaperToDesktop(savedWallpaper);
      if (savedWallpaper.startsWith("data:image")) {
        wallpaperSelect.value = "custom";
        customWallpaper = savedWallpaper; // Set the custom wallpaper in memory
      } else if (savedWallpaper.includes("gradient")) {
        wallpaperSelect.value = "blue-gradient";
      } else {
        wallpaperSelect.value = "bliss";
      }
    }
  }

  // Open a program window
  window.openProgram = function (programId) {
    const program = document.getElementById(programId);
    if (program) {
      program.style.display = "block";
      program.style.zIndex = "10";

      // Position Webamp player closer to the middle of the screen
      if (programId === "webamp-player") {
        const desktopWidth = desktop.offsetWidth;
        const desktopHeight = desktop.offsetHeight;
        const programWidth = program.offsetWidth;
        const programHeight = program.offsetHeight;

        program.style.left = `${(desktopWidth - programWidth) / 2}px`;
        program.style.top = `${(desktopHeight - programHeight) / 2}px`;

        // Initialize Webamp if not already initialized
        if (!webampInstance) {
          initializeWebamp();
        } else {
          // If already initialized, simply show it
          program.style.display = "block";
        }
      }
    }
  };

  // Close a program window
  window.closeProgram = function (programId) {
    const program = document.getElementById(programId);
    if (program) {
      program.style.display = "none";

      // Hide Webamp instead of disposing
      if (programId === "webamp-player" && webampInstance) {
        program.style.display = "none"; // Just hide Webamp
      }
    }
  };

  // Handle wallpaper selection changes
  wallpaperSelect.onchange = function () {
    if (wallpaperSelect.value === "custom") {
      loadImageButton.style.display = "inline"; // Show the "Load Image" button
    } else {
      loadImageButton.style.display = "none"; // Hide the "Load Image" button
    }
  };

  // Handle "Load Image" button click
  loadImageButton.onclick = function () {
    wallpaperUpload.click();
  };

  // Handle custom image upload
  wallpaperUpload.onchange = function (event) {
    const file = event.target.files[0];
    if (file && file.type.startsWith("image/")) {
      const reader = new FileReader();
      reader.onload = function (e) {
        customWallpaper = e.target.result;
        alert("Custom image loaded. Click 'Apply' to set it as wallpaper.");
      };
      reader.readAsDataURL(file);
    } else {
      alert(
        "Invalid file type. Please upload a valid image (JPG, PNG, GIF, WebP)."
      );
    }
  };

  // Apply wallpaper
  window.applyWallpaper = function () {
    const selectedWallpaper = wallpaperSelect.value;

    if (selectedWallpaper === "custom" && customWallpaper) {
      applyWallpaperToDesktop(customWallpaper);
      saveWallpaper(customWallpaper);
      alert("Wallpaper applied successfully!");
      closeProgram("change-wallpaper");
    } else {
      const wallpapers = {
        bliss: "./styles/bliss.jpg",
        "blue-gradient": "linear-gradient(to bottom, #1c86ee, #87cefa)",
      };

      const wallpaper = wallpapers[selectedWallpaper];
      if (!wallpaper) {
        alert("Invalid wallpaper selection. Please try again.");
        return;
      }
      applyWallpaperToDesktop(wallpaper);
      saveWallpaper(wallpaper);
      alert("Wallpaper applied successfully!");
      closeProgram("change-wallpaper");
    }
  };

  // Apply wallpaper to desktop
  function applyWallpaperToDesktop(wallpaper) {
    if (wallpaper.startsWith("data:image")) {
      desktop.style.background = `url('${wallpaper}') no-repeat center center fixed`;
    } else if (wallpaper.includes("gradient")) {
      desktop.style.background = wallpaper;
    } else {
      desktop.style.background = `url('${wallpaper}') no-repeat center center fixed`;
    }
    desktop.style.backgroundSize = "cover";
  }

  // Save wallpaper in localStorage
  function saveWallpaper(wallpaper) {
    const loginData = getLoginData();
    localStorage.setItem(`wallpaper-${loginData.username}`, wallpaper);
  }

  // IndexedDB Initialization
  function initializeIndexedDB() {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open("WebampTracksDB", 1);

      request.onerror = function (event) {
        console.error("IndexedDB error:", event.target.error);
        reject(event.target.error);
      };

      request.onsuccess = function (event) {
        const db = event.target.result;
        resolve(db);
      };

      request.onupgradeneeded = function (event) {
        const db = event.target.result;
        if (!db.objectStoreNames.contains("tracks")) {
          db.createObjectStore("tracks", {
            keyPath: "id",
            autoIncrement: true,
          });
        }
      };
    });
  }

  // Add Tracks to IndexedDB for Logged-In User
  function addTracksToIndexedDB(tracks) {
    initializeIndexedDB().then((db) => {
      const loginData = getLoginData(); // Retrieve current user's data
      const userId = loginData.username;

      const transaction = db.transaction("tracks", "readwrite");
      const store = transaction.objectStore("tracks");

      tracks.forEach((track) => {
        store.add({ ...track, userId }); // Associate track with the current user
      });

      transaction.oncomplete = function () {
        console.log("Tracks added to IndexedDB successfully.");
        updateTrackList(); // Refresh track list
      };

      transaction.onerror = function (event) {
        console.error("Error adding tracks to IndexedDB:", event.target.error);
      };
    });
  }

  // Get Tracks from IndexedDB for Logged-In User
  function getTracksFromIndexedDB() {
    return new Promise((resolve) => {
      initializeIndexedDB().then((db) => {
        const loginData = getLoginData(); // Retrieve current user's data
        const userId = loginData.username;

        const transaction = db.transaction("tracks", "readonly");
        const store = transaction.objectStore("tracks");

        const request = store.getAll();

        request.onsuccess = function (event) {
          const tracks = event.target.result.filter(
            (track) => track.userId === userId
          );
          resolve(tracks);
        };

        request.onerror = function (event) {
          console.error(
            "Error retrieving tracks from IndexedDB:",
            event.target.error
          );
          resolve([]);
        };
      });
    });
  }

  // Remove a Track from IndexedDB
  function removeTrackFromIndexedDB(id) {
    initializeIndexedDB().then((db) => {
      const transaction = db.transaction("tracks", "readwrite");
      const store = transaction.objectStore("tracks");

      store.delete(id);

      transaction.oncomplete = function () {
        console.log(`Track with ID ${id} removed from IndexedDB.`);
        updateTrackList(); // Refresh track list
      };

      transaction.onerror = function (event) {
        console.error(
          "Error removing track from IndexedDB:",
          event.target.error
        );
      };
    });
  }

  // Update User Track List
  function updateTrackList() {
    getTracksFromIndexedDB().then((tracks) => {
      userTracksList.innerHTML = "";

      if (tracks.length === 0) {
        userTracksList.innerHTML = "<li>No songs added yet.</li>";
        return;
      }

      tracks.forEach((track) => {
        const li = document.createElement("li");
        li.textContent = track.metaData.title;

        const removeButton = document.createElement("button");
        removeButton.textContent = "Remove";
        removeButton.style.marginLeft = "10px";
        removeButton.onclick = function () {
          removeTrackFromIndexedDB(track.id); // Remove track from IndexedDB
        };

        li.appendChild(removeButton);
        userTracksList.appendChild(li);
      });
    });
  }

  // Initialize Webamp with Tracks from IndexedDB for Logged-In User
  function initializeWebamp() {
    getTracksFromIndexedDB().then((tracks) => {
      const validTracks = tracks.map((track) => {
        if (track.url.startsWith("data:")) {
          const base64Data = track.url.split(",")[1];
          const binaryData = atob(base64Data);
          const byteArray = Uint8Array.from(binaryData, (char) =>
            char.charCodeAt(0)
          );
          const blob = new Blob([byteArray], { type: "audio/mpeg" });
          const blobUrl = URL.createObjectURL(blob);
          return { ...track, url: blobUrl };
        }
        return track;
      });

      const savedSkin = localStorage.getItem("webamp-skin") || null;

      webampInstance = new Webamp({
        initialTracks: validTracks,
        initialSkin: savedSkin ? { url: savedSkin } : null,
      });

      webampInstance.renderWhenReady(
        document.getElementById("winamp-container")
      );
    });
  }

  // Add Songs Button Handler
  window.handleAddSongs = function () {
    const fileInput = songUploadInput;

    if (fileInput.files.length > 0) {
      const newTracksPromises = Array.from(fileInput.files).map((file) => {
        if (!file.type.startsWith("audio/")) {
          alert(`The file "${file.name}" is not a valid audio file.`);
          return null;
        }

        return new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = function (event) {
            resolve({
              metaData: { title: file.name, artist: "Unknown Artist" },
              url: event.target.result, // Base64-encoded audio data
            });
          };
          reader.readAsDataURL(file); // Convert to Base64
        });
      });

      Promise.all(newTracksPromises).then((newTracks) => {
        addTracksToIndexedDB(newTracks); // Add tracks to IndexedDB
        alert("Songs added successfully!");

        if (webampInstance) {
          appendTracksToWebamp(newTracks); // Dynamically add new tracks to Webamp
        }

        fileInput.value = ""; // Clear file input
      });
    } else {
      alert("No files selected. Please upload audio files.");
    }
  };

  // Dynamically Add Tracks to Webamp
  function appendTracksToWebamp(tracks) {
    if (webampInstance) {
      webampInstance.appendTracks(tracks);
    }
  }

  // Initialize Wallpaper and Tracks
  loadSavedWallpaper();
  updateTrackList();
});
