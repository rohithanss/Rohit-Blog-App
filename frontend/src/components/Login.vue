<script setup>
import { ref, inject } from "vue";
import axios from "axios";
import { email, required } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import OauthBtn from "./OauthBtn.vue";
import { useToast } from "primevue/usetoast";

const url = inject("backendURL");

const emits = defineEmits(["loggedIn", "forgetPassword"]);

let submitted = ref(false);
const isLoading = ref(false);
const password = ref("");
const email1 = ref("");

const toast = useToast();

const rules = {
  password: { required },
  email1: { required, email },
};

const v$ = useVuelidate(rules, { password, email1 });

async function login(isValid) {
  submitted.value = true;
  if (!isValid) {
    console.log("yoo");
  } else {
    isLoading.value = true;
    try {
      let res = await axios.post(`${url}/user/login`, {
        email: email1.value,
        password: password.value,
      });
      res = res.data;
      console.log(res);
      if (res.status == "success") {
        localStorage.setItem("token", res.token);
        localStorage.setItem("refreshToken", res.refreshToken);
        emits("loggedIn");
        toast.add({
          severity: "success",
          summary: "Logged in",
          detail: "You are successfully logged in.",
          life: 3000,
        });
      } else if (res.status == "fail") {
        toast.add({
          severity: "error",
          summary: "Wrong Credentials",
          detail: "You have entered wrong credentials, try again.",
          life: 3000,
        });
      } else {
        console.log("af");
        toast.add({
          severity: "warn",
          summary: "Logging in fail",
          detail:
            "Some error occurred while logging in, please try again after some time",
          life: 3000,
        });
      }
      isLoading.value = false;
    } catch (err) {
      toast.add({
        severity: "warn",
        summary: "Logging in fail",
        detail:
          "Some error occurred while logging in, please try again after some time",
        life: 3000,
      });
      isLoading.value = false;
    }
  }
}
</script>
<template>
  <div id="container">
    <h1>Login page</h1>
    <form class="login-form" @submit.prevent="login(!v$.$invalid)">
      <InputText
        type="email"
        name=""
        id=""
        v-model="email1"
        class="p-inputtext-sm"
        :class="{ 'p-invalid': v$.email1.$invalid && submitted }"
        placeholder="Email"
      />
      <Password
        type="password"
        id="password"
        v-model="password"
        class="p-inputtext-sm"
        :class="{ 'p-invalid': v$.password.$invalid && submitted }"
        placeholder="Password"
        :feedback="false"
        :toggle-mask="true"
      ></Password>
      <Button
        @click="emits('forgetPassword')"
        class="p-button-link"
        label="Forget Password?"
      />
      <Button type="submit" label="Log in" :loading="isLoading" />
    </form>
    <OauthBtn></OauthBtn>
  </div>
</template>

<style scoped>
#container {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 30px;
  margin: 30px 0;
}

.login-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  justify-content: center;
}

.p-inputtext {
  width: 30%;
}

.p-button {
  width: 30%;
}
.p-password {
  width: 30%;
}
::v-deep(.p-password input) {
  width: 100%;
}
</style>
