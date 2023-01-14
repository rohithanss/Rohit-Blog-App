<script setup>
import { ref } from "vue";

const props = defineProps(["page", "isLogged", "userName", "userRole"]);
</script>
<template>
  <div id="container">
    <h2>Blog App</h2>
    <div v-if="!isLogged">
      <p @click="$emit('home')" :class="{ isActive: props.page == 'home' }">
        Home
      </p>
      <p @click="$emit('login')" :class="{ isActive: props.page == 'login' }">
        Login
      </p>
      <p @click="$emit('signup')" :class="{ isActive: props.page == 'signup' }">
        Sign up
      </p>
    </div>
    <div v-else>
      <p @click="$emit('home')" :class="{ isActive: props.page == 'home' }">
        Home
      </p>
      <p
        v-show="props.userRole == 'admin'"
        @click="$emit('allUsers')"
        :class="{ isActive: props.page == 'allUsers' }"
      >
        All Users
      </p>
      <p @click="$emit('profile')">{{ userName }}</p>
      <p @click="$emit('logout')">Log out</p>
    </div>
  </div>
</template>

<style scoped>
#container {
  position: sticky;
  z-index: 10;
  top: 0;
  display: flex;
  justify-content: space-between;
  padding: 10px 35px;
  align-items: center;
  background-color: gray;
  background-color: var(--surface-card);
}
#container > div {
  display: flex;
  align-items: center;
  gap: 15px;
}
h2 {
  color: var(--text-color);
}
p {
  color: var(--text-color-secondary);
  cursor: pointer;
  font-weight: 600;
  font-size: 18px;
  transition: all 250ms;
}

p:hover {
  color: var(--text-color);
}
.isActive {
  color: var(--primary-color);
}
.isActive:hover {
  color: var(--primary-color);
}
</style>
