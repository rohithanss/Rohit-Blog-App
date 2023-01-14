<script setup>
import { ref, onMounted, inject } from "vue";
import axios from "axios";
import { useConfirm } from "primevue/useconfirm";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const url = inject("backendURL");

const props = defineProps([
  "title",
  "content",
  "writer",
  "writerId",
  "userId",
  "likes",
  "comments",
  "blogId",
  "userRole",
  "likedBy",
  "index",
]);

const emit = defineEmits(["commentBlog"]);

const blogLikes = ref(0);
const liked = ref(false);

blogLikes.value = await props.likes;
onMounted(async () => {
  liked.value = await props.likedBy.includes(props.userId);
});

async function likeBlog() {
  if (props.userId != "") {
    liked.value = !liked.value;

    if (liked.value) {
      blogLikes.value++;
    } else {
      blogLikes.value--;
    }
    try {
      let res = await axios.post(
        `${url}/likes/${props.blogId}`,
        {},
        {
          headers: {
            authorization: `Bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        }
      );
      res = res.data;
      if (res.status != "success") {
        toast.add({
          severity: "warn",
          summary: "Like Post",
          detail: "Some error occurred while liking the post, try again later.",
          life: 3000,
        });
        liked.value = !liked.value;

        if (liked.value) {
          blogLikes.value++;
        } else {
          blogLikes.value--;
        }
      }
    } catch (err) {
      toast.add({
        severity: "warn",
        summary: "Like Post",
        detail: "Some error occurred while liking the post, try again later.",
        life: 3000,
      });
      liked.value = !liked.value;

      if (liked.value) {
        blogLikes.value++;
      } else {
        blogLikes.value--;
      }
    }
  } else {
    toast.add({
      severity: "info",
      summary: "Log in",
      detail: "Please Login to do like, or comments",
      life: 3000,
    });
  }
}

async function commentBlog() {
  emit("commentBlog", { _id: props.blogId, index: props.index });
}
</script>
<template>
  <div id="container">
    <Card>
      <template #header>
        <!-- <img alt="user header" src="/about.png" class="blog-img" /> -->
        <div class="profile">
          <Avatar :label="writer[0]" shape="circle"></Avatar>
          <p>{{ writer }}</p>
        </div>
      </template>
      <template #title> {{ title }} </template>
      <template #content>
        {{ content }}
      </template>
      <template #footer>
        <div class="blog-events">
          <div>
            <div class="likes-div">
              <i
                :class="{
                  'pi pi-heart': !liked,
                  'pi pi-heart-fill': liked,
                  red: liked,
                }"
                @click="likeBlog"
              ></i>
              <p>{{ blogLikes }} Likes</p>
            </div>
            <div class="comments-div">
              <i class="pi pi-comment" @click="commentBlog"></i
              >{{ comments }} Comments
            </div>
          </div>
          <div>
            <Button
              v-if="props.writerId == props.userId && userRole == 'writer'"
              icon="pi pi-pencil"
              label="Edit"
              @click="
                $emit('edit-blog', {
                  index: props.index,
                  _id: props.blogId,
                  title: props.title,
                  content: props.content,
                })
              "
            />
            <Button
              v-if="
                (props.writerId == props.userId && userRole == 'writer') ||
                userRole == 'admin'
              "
              icon="pi pi-trash"
              label="Delete"
              class="p-button-danger"
              :style="{ 'margin-left': '20px' }"
              @click="$emit('delete-blog', props.index, props.blogId)"
            />
          </div>
        </div>
      </template>
    </Card>
  </div>
</template>

<style scoped>
#container {
  width: 50%;
  margin: 20px auto;
}

.blog-events {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.blog-events > div:first-child {
  width: 50%;
  display: flex;
  align-items: center;
  padding: 0 10px;
  gap: 25px;
}
.likes-div > i,
.comments-div > i {
  cursor: pointer;
  font-size: 25px;
}
.blog-events > div:first-child > div {
  display: flex;
  gap: 5px;
}
.red {
  color: red;
}
.profile {
  padding: 20px 0 0 20px;
  display: flex;
  gap: 15px;
  align-items: center;
}
</style>
