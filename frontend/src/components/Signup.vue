<script setup>
import { ref, computed, inject } from "vue";
import { email, required, minLength } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import axios from "axios";
import { useToast } from "primevue/usetoast";

import OauthBtn from "./OauthBtn.vue";

const url = inject("backendURL");

const toast = useToast();

let emits = defineEmits(["signedUp"]);

let submitted = ref(false);
const isLoading = ref(false);
const password = ref("");
const email1 = ref("");
const name = ref("");
const otpValue = ref("");
const roleArr = ref([]);
const isOtpSent = ref(false);

const isOtp = computed(() => {
  return otpValue.value.split("-_").join("").split("-").join("").length != 4;
});

const role = computed(() => {
  return roleArr.value[0] ? roleArr.value[0] : "user";
});

const rules = {
  password: { required, minLengthValue: minLength(8) },
  email1: { required, email },
  name: { required },
};

const v$ = useVuelidate(rules, { password, email1, name });

async function signup(isValid) {
  submitted.value = true;
  if (isValid) {
    isLoading.value = true;
    try {
      let res = await axios.post(`${url}/getotp`, {
        email: email1.value,
      });
      res = res.data;
      if (res.status == "success") {
        toast.add({
          severity: "success",
          summary: "OTP Sent",
          detail: "OTP is successfully sent to " + email1.value,
          life: 3000,
        });
        isOtpSent.value = true;
      } else {
        toast.add({
          severity: "warn",
          summary: "OTP Sent",
          detail: "Some error occurred while sending OTP, try after some time",
          life: 3000,
        });
      }
    } catch (err) {
      toast.add({
        severity: "warn",
        summary: "OTP Sent",
        detail: "Some error occurred while sending OTP, try after some time",
        life: 3000,
      });
    }
    isLoading.value = false;
  }
}

async function validateOtp() {
  isLoading.value = true;
  try {
    let res = await axios.post(`${url}/user/signup`, {
      email: email1.value,
      password: password.value,
      name: name.value,
      role: role.value,
      otp: +otpValue.value.split("-").join(""),
    });
    if (res.data.status == "success") {
      localStorage.setItem("token", res.data.token);
      localStorage.setItem("refreshToken", res.data.refreshToken);
      emits("signedUp");
    } else if (res.data.msg == "invalid otp") {
      toast.add({
        severity: "warn",
        summary: "Signing up",
        detail: "Invalid OTP, please enter carefully",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "warn",
        summary: "Signing up",
        detail: res.data.msg,
        life: 3000,
      });
      isOtpSent.value = false;
    }
    isLoading.value = false;
  } catch (err) {
    toast.add({
      severity: "warn",
      summary: "Signing up",
      detail: "something went wrong while registering try again later",
      life: 3000,
    });

    isLoading.value = false;
  }
}
</script>
<template>
  <div id="container">
    <h1>Signup page</h1>
    <form class="signup-form" @submit.prevent="signup(!v$.$invalid)">
      <span>
        <InputText
          type="text"
          id="name"
          v-model="name"
          class="p-inputtext-sm"
          :class="{ 'p-invalid': v$.name.$invalid && submitted }"
          placeholder="name"
          :disabled="isOtpSent"
        ></InputText>
      </span>
      <span>
        <InputText
          type="text"
          id="email"
          v-model="email1"
          class="p-inputtext-sm"
          :class="{ 'p-invalid': v$.email1.$invalid && submitted }"
          placeholder="Email"
          :disabled="isOtpSent"
        ></InputText>
      </span>

      <Password
        type="password"
        id="password"
        v-model="password"
        class="p-inputtext-sm"
        :class="{ 'p-invalid': v$.password.$invalid && submitted }"
        placeholder="Password"
        :feedback="false"
        :toggle-mask="true"
        :disabled="isOtpSent"
      ></Password>
      <div>
        <Checkbox
          value="writer"
          v-model="roleArr"
          :disabled="isOtpSent"
        ></Checkbox>
        <span>Register as Writer.</span>
      </div>
      <InputMask
        v-if="isOtpSent"
        v-model="otpValue"
        mask="9-9-9-9"
        placeholder="Enter OTP"
      ></InputMask>
      <Button
        v-if="!isOtpSent"
        type="submit"
        label="Sign up"
        :loading="isLoading"
      />
      <Button
        v-if="isOtpSent"
        @click="validateOtp"
        label="Verify OTP"
        :loading="isLoading"
        :disabled="isOtp"
      />
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

.signup-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
  justify-content: center;
}
.signup-form > span {
  width: 30%;
}
.signup-form > div {
  width: 30%;
  display: flex;
  gap: 10px;
  justify-content: start;
}
.p-inputtext {
  width: 100%;
}
.p-inputmask {
  width: 12%;
  text-align: center;
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
