"use strict";

document.addEventListener("DOMContentLoaded", function () {
  const profileForm = document.getElementById("profileForm");
  const usernameField = document.getElementById("username");
  const passwordField = document.getElementById("password");
  const profilePicInput = document.getElementById("profilePic");
  const profilePicPreview = document.getElementById("profilePicPreview");
  const updateButton = document.querySelector("button[type='submit']");

  // Max file size (1MB)
  const MAX_FILE_SIZE = 1 * 1024 * 1024; // 1MB in bytes

  // Fetch user profile
  function fetchProfile() {
    const loginData = getLoginData();

    fetch(`${apiBaseURL}/api/users/${loginData.username}`, {
      headers: { Authorization: `Bearer ${loginData.token}` },
    })
      .then((response) => response.json())
      .then((user) => {
        usernameField.value = user.username;

        // Load saved profile picture
        const savedProfilePic = localStorage.getItem(
          `profilePicture_${user.username}`
        );
        profilePicPreview.src = savedProfilePic || "./default-profile.png";
      })
      .catch((error) => console.error("Error fetching profile:", error));
  }

  // Resize image (for static images only)
  function resizeImage(file, maxWidth, maxHeight, callback) {
    const reader = new FileReader();

    reader.onload = function (event) {
      if (file.size > MAX_FILE_SIZE) {
        alert("File size too large! Please upload an image less than 1MB.");
        profilePicInput.value = ""; // Clear the file input
        profilePicPreview.src = "./default-profile.png";
        updateButton.disabled = true; // Disable Update button
        return;
      }

      if (file.type === "image/gif") {
        // If GIF, skip resizing and directly save as base64
        callback(event.target.result);
        updateButton.disabled = false; // Enable Update button
        return;
      }

      const img = new Image();
      img.onload = function () {
        const canvas = document.createElement("canvas");
        let width = img.width;
        let height = img.height;

        // Calculate new dimensions
        if (width > height) {
          if (width > maxWidth) {
            height = Math.round((height * maxWidth) / width);
            width = maxWidth;
          }
        } else {
          if (height > maxHeight) {
            width = Math.round((width * maxHeight) / height);
            height = maxHeight;
          }
        }

        // Draw resized image
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);

        // Convert canvas to base64
        const resizedDataURL = canvas.toDataURL("image/jpeg", 0.7);
        callback(resizedDataURL);
        updateButton.disabled = false; // Enable Update button
      };
      img.src = event.target.result;
    };

    reader.readAsDataURL(file);
  }

  // Handle profile picture upload
  profilePicInput.addEventListener("change", function () {
    const file = this.files[0];
    if (file && file.type.startsWith("image/")) {
      resizeImage(file, 150, 150, (imageData) => {
        profilePicPreview.src = imageData;

        // Save image to localStorage
        const loginData = getLoginData();
        try {
          localStorage.setItem(
            `profilePicture_${loginData.username}`,
            imageData
          );
          updateButton.disabled = false; // Enable Update button
        } catch (e) {
          console.error("Storage quota exceeded:", e);
          alert("Failed to save profile picture. Try using a smaller image.");
          profilePicPreview.src = "./default-profile.png";
          profilePicInput.value = ""; // Clear input
          updateButton.disabled = true; // Disable Update button
        }
      });
    } else {
      alert("Please upload a valid image file.");
      profilePicInput.value = "";
      profilePicPreview.src = "./default-profile.png";
      updateButton.disabled = true; // Disable Update button
    }
  });

  // Handle profile updates
  profileForm.onsubmit = function (event) {
    event.preventDefault();

    const loginData = getLoginData();
    const updatedData = {};

    if (passwordField.value.trim()) {
      updatedData.password = passwordField.value.trim();
    }

    fetch(`${apiBaseURL}/api/users/${loginData.username}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify(updatedData),
    })
      .then((response) => {
        if (response.ok) {
          alert("Profile updated successfully!");
          passwordField.value = "";
        } else {
          alert("Failed to update profile.");
        }
      })
      .catch((error) => console.error("Error updating profile:", error));
  };

  fetchProfile();
});
