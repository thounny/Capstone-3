"use strict";

const postsList = document.querySelector("#postsList");
const newPostForm = document.querySelector("#newPostForm");
const postContent = document.querySelector("#postContent");
const sortOptions = document.querySelector("#sortOptions");

// Fetch posts
function fetchPosts(sortBy = "newest") {
  const loginData = getLoginData();

  fetch(`${apiBaseURL}/api/posts`, {
    method: "GET",
    headers: { Authorization: `Bearer ${loginData.token}` },
  })
    .then((response) => response.json())
    .then((posts) => {
      const sortedPosts = sortPostsClientSide(posts, sortBy);
      renderPosts(sortedPosts);
    })
    .catch((error) => console.error("Error fetching posts:", error));
}

// Sort posts on the client-side
function sortPostsClientSide(posts, sortBy) {
  switch (sortBy) {
    case "newest":
      return posts.sort(
        (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
      );
    case "oldest":
      return posts.sort(
        (a, b) => new Date(a.createdAt) - new Date(b.createdAt)
      );
    case "likes":
      return posts.sort(
        (a, b) => (b.likes?.length || 0) - (a.likes?.length || 0)
      );
    default:
      return posts;
  }
}

// Render posts in the list
function renderPosts(posts) {
  postsList.innerHTML = ""; // Clear previous posts
  posts.forEach((post) => {
    const postItem = createPostElement(post);
    postsList.appendChild(postItem);
  });
}

// Create post elements dynamically
function createPostElement(post) {
  const postItem = document.createElement("div");
  postItem.className = "window post-item";

  const profilePicture =
    localStorage.getItem(`profilePicture_${post.username}`) ||
    "./default-profile.png";

  const likeCount = post.likes.length || 0;
  const userHasLiked = post.likes.some(
    (like) => like.username === getLoginData().username
  );

  postItem.innerHTML = `
    <div class="title-bar">
        <div class="title-bar-text">${post.text}</div>
    </div>
    <div class="window-body" style="display: flex; align-items: center;">
        <img src="${profilePicture}" alt="Profile" class="profile-pic" 
            style="width: 40px; height: 40px; margin-right: 10px;">
        <div>
            <p><b>By:</b> ${post.username} 
                <small>At: ${new Date(post.createdAt).toLocaleString()}</small>
            </p>
            <div class="post-actions">
                <button class="heart-btn" data-post-id="${post._id}" 
                    data-like-id="" data-likes="${likeCount}">
                    <span>${userHasLiked ? "❤️" : "♡"}</span>
                </button>
                <span class="like-count">${
                  likeCount > 0 ? `Likes: ${likeCount}` : ""
                }</span>
                ${
                  post.username === getLoginData().username
                    ? `<button class="delete-btn" data-post-id="${post._id}">🗑</button>`
                    : ""
                }
            </div>
        </div>
    </div>
  `;

  const heartButton = postItem.querySelector(".heart-btn");
  const deleteButton = postItem.querySelector(".delete-btn");
  const likeCountSpan = postItem.querySelector(".like-count");

  if (userHasLiked) {
    const userLike = post.likes.find(
      (like) => like.username === getLoginData().username
    );
    heartButton.dataset.likeId = userLike._id;
  }

  heartButton.onclick = () => toggleLike(post._id, heartButton, likeCountSpan);
  if (deleteButton) deleteButton.onclick = () => deletePost(post._id);

  return postItem;
}

// Toggle like/unlike on a post
function toggleLike(postId, heartButton, likeCountSpan) {
  const loginData = getLoginData();
  const existingLikeId = heartButton.dataset.likeId;

  if (existingLikeId) {
    // Unlike the post
    fetch(`${apiBaseURL}/api/likes/${existingLikeId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${loginData.token}` },
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to unlike post.");
        updateLikeUI(false, heartButton, likeCountSpan);
      })
      .catch((error) => console.error("Error unliking post:", error));
  } else {
    // Like the post
    fetch(`${apiBaseURL}/api/likes`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${loginData.token}`,
      },
      body: JSON.stringify({ postId }),
    })
      .then((response) => {
        if (!response.ok) throw new Error("Failed to like post.");
        return response.json();
      })
      .then((data) => {
        updateLikeUI(true, heartButton, likeCountSpan, data._id);
      })
      .catch((error) => console.error("Error liking post:", error));
  }
}

// Update like UI
function updateLikeUI(isLiked, heartButton, likeCountSpan, likeId = null) {
  let likeCount = parseInt(heartButton.dataset.likes || "0");

  // Adjust like count
  likeCount = isLiked ? likeCount + 1 : likeCount - 1;
  heartButton.dataset.likes = likeCount;

  // Update the like-count span
  likeCountSpan.textContent = likeCount > 0 ? `Likes: ${likeCount}` : "";

  // Update heart icon and likeId
  heartButton.querySelector("span").textContent = isLiked ? "❤️" : "♡";
  if (isLiked) {
    heartButton.dataset.likeId = likeId;
  } else {
    delete heartButton.dataset.likeId;
  }
}

// Handle Sort Change
sortOptions.onchange = (e) => {
  const sortBy = e.target.value;
  fetchPosts(sortBy);
};

// Create a new post
newPostForm.onsubmit = function (event) {
  event.preventDefault();
  const loginData = getLoginData();

  const postData = {
    text: postContent.value.trim(),
  };

  fetch(`${apiBaseURL}/api/posts`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${loginData.token}`,
    },
    body: JSON.stringify(postData),
  })
    .then((response) => {
      if (response.ok) {
        postContent.value = ""; // Clear input
        fetchPosts(); // Refresh posts
      } else {
        console.error("Failed to create post.");
      }
    })
    .catch((error) => console.error("Error creating post:", error));
};

// Delete a post
function deletePost(postId) {
  const loginData = getLoginData();

  fetch(`${apiBaseURL}/api/posts/${postId}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${loginData.token}` },
  })
    .then((response) => {
      if (response.ok) {
        fetchPosts(); // Refresh posts
      } else {
        console.error("Failed to delete post.");
      }
    })
    .catch((error) => console.error("Error deleting post:", error));
}

// Initial fetch
fetchPosts();
