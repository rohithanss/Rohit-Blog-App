<script setup>
import axios from "axios";
import { inject } from "vue";

const url = inject("backendURL");

async function githubLogin() {
  window.open(
    "https://github.com/login/oauth/authorize?client_id=4c2e60c71f36093a9e48"
  );
}
async function googleLogin() {
  window.open(`${url}/auth/google`);
}
</script>
<template>
  <div id="container">
    <Button
      type="button"
      class="p-button-outlined p-button-sm"
      @click="googleLogin"
    >
      <img alt="logo" src="/google.png" style="width: 1.5rem" />
      <span>Continue With Google</span>
    </Button>

    <Button
      type="button"
      class="p-button-outlined p-button-sm"
      @click="githubLogin"
    >
      <i class="pi pi-github" :style="{ 'font-size': '25px' }"></i>
      <span class="ml-2 font-bold">Continue With Github</span>
    </Button>
  </div>
</template>

<style scoped>
#container {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
}
#container > * {
  justify-content: center;
  gap: 15px;
  width: 30%;
}
</style>
