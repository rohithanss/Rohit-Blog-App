<script setup>
import { ref, inject } from "vue";
import axios from "axios";
import { useToast } from "primevue/usetoast";

import NavBar from "./components/NavBar.vue";
import Home from "./components/Home.vue";
import Login from "./components/Login.vue";
import Signup from "./components/Signup.vue";
import AllUsers from "./components/AllUsers.vue";
import ForgetPassword from "./components/ForgetPassword.vue";

const url = inject("backendURL");

let page = ref("home");
const userId = ref("");
const userRole = ref("user");
const userName = ref("");
const isLogged = ref(false);

const toast = useToast();

function switchPage(name) {
  isLoggedIn();
  page.value = name;
}

async function logout() {
  try {
    let res = await axios.get(`${url}/user/loggout`, {
      headers: {
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    res = res.data;
    // console.log(res);
    if (res.status == "success") {
      isLogged.value = false;
    } else {
      isLogged.value = false;
    }
  } catch (err) {
    isLogged.value = false;
  }
  document.cookie =
    "token" + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  document.cookie =
    "refreshToken" + "=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
  localStorage.removeItem("token");
  localStorage.removeItem("refreshToken");

  toast.add({
    severity: "info",
    summary: "Leaving Already!",
    detail: "See you soon, " + userName.value,
    life: 3000,
  });
  userId.value = "";
  userRole.value = "user";
  userName.value = "";
  switchPage("login");
}

async function isLoggedIn() {
  try {
    let res = await axios.get(`${url}/user/profile`, {
      headers: {
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    res = await res.data;

    if (res.status == "success") {
      userId.value = res.userId;
      userRole.value = res.role;
      userName.value = res.name;
      isLogged.value = true;

      toast.add({
        severity: "info",
        summary: "Welcome to Rohit's Blog!",
        detail: "Good to see you , " + res.name,
        life: 3000,
      });
    } else if (res.status == "jwt expired") {
      // console.log(res);
      let res = await refreshToken();
      if (res) {
        isLoggedIn();
      } else {
        isLogged.value = false;
        userId.value = "not_logged_in";
      }
    } else {
      isLogged.value = false;
      userId.value = "not_logged_in";
    }
  } catch (err) {
    isLogged.value = false;
    userId.value = "not_logged_in";
    console.log(err);
  }
}

async function refreshToken() {
  try {
    let res = await axios.post(
      `${url}/getfreshtoken`,
      {},
      {
        withCredentials: true,
      }
    );
    res = res.data;
    if (res.status == "success") {
      return true;
    } else {
      console.log("wrong Credentials");
    }
    console.log(res);
  } catch (err) {
    console.log("err");
  }
  isLogged.value = false;
  return false;
}

function profile() {
  switchPage("home");
}
isLoggedIn();
</script>

<template>
  <Toast />

  <NavBar
    @login="switchPage('login')"
    @home="switchPage('home')"
    @signup="switchPage('signup')"
    @allUsers="switchPage('allUsers')"
    @logout="logout"
    @profile="profile"
    :page="page"
    :isLogged="isLogged"
    :userRole="userRole"
    :userName="userName"
  ></NavBar>
  <Suspense v-if="page == 'home'">
    <Home
      :isLogged="isLogged"
      :userId="userId"
      :userRole="userRole"
      :userName="userName"
      :refreshToken="refreshToken"
    ></Home>
  </Suspense>
  <Login
    v-else-if="page == 'login'"
    @logged-In="switchPage('home')"
    @forgetPassword="switchPage('forgetPassword')"
  ></Login>

  <Signup v-else-if="page == 'signup'" @signed-up="switchPage('home')"></Signup>
  <AllUsers v-else-if="page == 'allUsers'"></AllUsers>
  <ForgetPassword
    v-else-if="page == 'forgetPassword'"
    @passwordChanged="switchPage('home')"
  ></ForgetPassword>
</template>

<style scoped></style>
