<script setup>
import { ref, computed, inject } from "vue";
import { required, minLength } from "@vuelidate/validators";
import { useVuelidate } from "@vuelidate/core";
import axios from "axios";
import { useToast } from "primevue/usetoast";

const toast = useToast();

const url = inject("backendURL");

const props = defineProps(["allBlogs", "userId", "userName", "refreshToken"]);

const title = ref("");
const content = ref("");
const isLoading = ref(false);
const isSubmitted = ref(false);
const minWords = ref(25);

const contentWords = computed(() => {
  let words = content.value.split(" ");
  let last = words[words.length - 1] == "" ? 1 : 0;
  return words.length - last;
});

const rules = {
  title: { required },
  content: { required },
};

const v$ = useVuelidate(rules, { title, content });

function resetForm() {
  title.value = "";
  content.value = "";
  isSubmitted.value = false;
}

async function addBlog(isValid) {
  isSubmitted.value = true;
  if (isValid && contentWords.value >= minWords.value) {
    try {
      let res = await axios.post(
        `${url}/blogs/create`,
        {
          title: title.value,
          content: content.value,
        },
        {
          headers: {
            authorization: `bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      res = res.data;
      if (res.status == "success") {
        props.allBlogs.push({
          title: title.value,
          content: content.value,
          likes: 0,
          comments: 0,
          writer: props.userName,
          writerId: props.userId,
          _id: res._id,
          likedBy: [],
        });
        resetForm();
        toast.add({
          severity: "success",
          summary: "Blog Posted",
          detail: "Your Blog is Posted successfully.",
          life: 3000,
        });
      } else if (res.status == "jwt expired") {
        let res = await props.refreshToken();

        if (res) {
          addBlog(isValid);
        } else {
          toast.add({
            severity: "info",
            summary: "Session Expired",
            detail: "Please Login Again",
            life: 3000,
          });
        }
      } else {
        toast.add({
          severity: "info",
          summary: "Session Expired",
          detail: "Please Login Again",
          life: 3000,
        });
      }
    } catch (err) {
      toast.add({
        severity: "warn",
        summary: "Posting Blog",
        detail: "Some error occurred while Posting the Blog, try again later.",
        life: 3000,
      });
    }
  }
}
</script>
<template>
  <div id="container">
    <h1>Create New Blog</h1>
    <form action="" @submit.prevent="addBlog(!v$.$invalid)">
      <InputText
        type="text"
        v-model="title"
        placeholder="Title"
        class="p-inputtext-sm"
        :class="{
          'p-invalid': v$.title.$invalid && isSubmitted,
        }"
      ></InputText>

      <Textarea
        v-model="content"
        :auto-resize="true"
        rows="3"
        placeholder="Blog"
        :class="{
          'p-invalid':
            (v$.content.$invalid && isSubmitted) ||
            (contentWords < minWords && isSubmitted),
        }"
      />
      <div>
        <div>
          <label
            for=""
            :style="{ color: 'red', 'font-size': '12px' }"
            v-show="
              (v$.content.$invalid && isSubmitted) ||
              (contentWords < minWords && isSubmitted)
            "
            >Minimum Length of Blog should be 25 words</label
          >
        </div>
        <p
          :style="{
            color: 'var(--text-color-secondary)',
            'font-size': '12px',
            'padding-right': '5px',
          }"
        >
          Words: {{ contentWords }}
        </p>
      </div>
      <div>
        <Button
          label="Reset"
          icon="pi pi-times"
          class="p-button-warning"
          iconPos="left"
          :loading="isLoading"
          @click="resetForm"
        />
        <Button
          type="submit"
          label="Create"
          icon="pi pi-check"
          iconPos="left"
          :loading="isLoading"
        />
      </div>
    </form>
  </div>
</template>

<style scoped>
#container {
  margin: 20px 0;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
}
form {
  width: 30%;
  margin: 30px 0;
  display: flex;
  flex-direction: column;
  gap: 15px;
}
form > * {
  width: 100%;
}

.fileUpload {
  width: 100%;
}
.fileUpload > span {
  width: 100%;
}
form > div {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
</style>
