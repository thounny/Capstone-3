"use strict";

if (typeof apiBaseURL === "undefined") {
  var apiBaseURL = "http://localhost:5005";
}

function getLoginData() {
  const loginJSON = window.localStorage.getItem("login-data");
  return JSON.parse(loginJSON) || {};
}

function isLoggedIn() {
  const loginData = getLoginData();
  return Boolean(loginData.token);
}

function login(loginData) {
  const options = {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(loginData),
  };

  return fetch(`${apiBaseURL}/auth/login`, options)
    .then((response) => response.json())
    .then((data) => {
      if (!data.token) {
        alert("Invalid username or password!");
        return null;
      }
      window.localStorage.setItem("login-data", JSON.stringify(data));
      window.location.assign("posts.html");
    });
}

function logout() {
  window.localStorage.removeItem("login-data");
  window.location.assign("index.html");
}

window.getLoginData = getLoginData;
window.isLoggedIn = isLoggedIn;
window.login = login;
window.logout = logout;
