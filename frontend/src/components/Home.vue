<script setup>
import { ref, inject } from "vue";
import Blog from "./Blog.vue";
import AddBlog from "./AddBlog.vue";
import axios from "axios";
import { computed } from "@vue/reactivity";
import { useConfirm } from "primevue/useconfirm";
import { io } from "socket.io-client";
import { useToast } from "primevue/usetoast";

const confirm = useConfirm();
const toast = useToast();

const url = inject("backendURL");

let props = defineProps([
  "isLogged",
  "userId",
  "userName",
  "userRole",
  "refreshToken",
]);

let socket;
const editBlogBox = ref(false);
const commentBox = ref(false);
const commentValue = ref("");
const commentId = ref({});
const allComments = ref([]);
const allBlogs = ref([]);
const isAddBlog = ref(false);
const isCommentInputFocused = ref();
const isCommentOptions = ref(false);

const commentOptions = ref([
  {
    label: "Edit",
    icon: "pi pi-pencil",
    command: async () => {
      commentValue.value = commentId.value.comment;
    },
  },
  {
    label: "Delete",
    icon: "pi pi-trash",
    command: async () => {
      try {
        let res = await axios.delete(`${url}/comments/${commentId.value.id}`, {
          headers: {
            authorization: `bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });

        res = await res.data;

        if (res.status == "success") {
          toast.add({
            severity: "success",
            summary: "Comment deleted",
            detail: "Comment deleted Successfully",
            life: 3000,
          });
        } else {
          toast.add({
            severity: "error",
            summary: "Comment not deleted",
            detail: "Something went wrong while deleting the comment",
            life: 3000,
          });
        }
      } catch (err) {
        toast.add({
          severity: "error",
          summary: "Comment not deleted",
          detail: "Something went wrong while deleting the comment",
          life: 3000,
        });
      }
      commentId.value = {};
    },
  },
]);

const blog = ref({
  _id: "dfasf",
  title: "dafsafasd",
  content: "afdfsafdsa",
});

const blogs = computed(async () => {
  try {
    let res = await axios.get(`${url}/blogs`, {
      headers: {
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
    });
    res = res.data;
    if (res.status == "success") {
      allBlogs.value = res.data;
    }
    return await res.data;
  } catch (err) {
    console.log(err);
    return [];
  }
});

const showCommentOptions = (target, id, comment, commenterId) => {
  commentId.value = { id, comment, commenterId };
  isCommentOptions.value.toggle(target);
};

const editBlog = (ex) => {
  editBlogBox.value = true;
  blog.value = ex;
};

const updateBlog = async () => {
  let { index, _id, title, content } = blog.value;
  try {
    let res = await axios.patch(
      `${url}/blogs/update/${_id}`,
      { title, content },
      {
        headers: {
          authorization: `bearer ${localStorage.getItem("token")}`,
        },
        withCredentials: true,
      }
    );

    if (res.data.status == "success") {
      allBlogs.value[index].title = title;
      allBlogs.value[index].content = content;
      toast.add({
        severity: "success",
        summary: "Edit Blog",
        detail: "Your Blog Updated Successfully",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "warn",
        summary: "Edit Blog",
        detail: "Some error occurred while editing the Blog, try again later.",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "warn",
      summary: "Edit Blog",
      detail: "Some error occurred while editing the Blog, try again later.",
      life: 3000,
    });
  }
  editBlogBox.value = false;
  blog.value = {};
};

async function deleteBlog(index, blogId) {
  confirm.require({
    // target: event.currentTarget,
    message: "Are you sure you want to delete this Blog?",
    icon: "pi pi-exclamation-triangle",
    accept: async () => {
      //callback to execute when user confirms the action
      try {
        let res = await axios.delete(`${url}/blogs/delete/${blogId}`, {
          headers: {
            authorization: `bearer ${localStorage.getItem("token")}`,
          },
          withCredentials: true,
        });
        res = res.data;
        if (res.status == "success") {
          allBlogs.value.splice(index, 1);
          toast.add({
            severity: "success",
            summary: "Delete Blog",
            detail: "Your Blog Deleted successfully",
            life: 3000,
          });
        } else {
          toast.add({
            severity: "warn",
            summary: "Delete Blog",
            detail:
              "Some error occurred while deleting the Blog, try again later.",
            life: 3000,
          });
        }
      } catch (err) {
        toast.add({
          severity: "warn",
          summary: "Delete Blog",
          detail:
            "Some error occurred while deleting the Blog, try again later.",
          life: 3000,
        });
      }
    },
  });
}

async function commentBlog(ex) {
  blog.value = ex;
  if (socket != null) {
    socket.disconnect();
  }
  socket = io(`${url}`, {
    path: "/iocomments",
  });
  socket.emit("getComments", blog.value._id, (comments) => {
    if (comments.status == "success") {
      allComments.value = comments.data;
    } else {
      toast.add({
        severity: "error",
        summary: "Comments",
        detail:
          "Some error occurred while fetching comments, please try again later",
        life: 3000,
      });
    }
  });

  socket.on("newComment", (comment) => {
    if (comment.status == "success") {
      allBlogs.value[blog.value.index].comments++;
      allComments.value.push(comment.data);
    } else {
      toast.add({
        severity: "error",
        summary: "Comments",
        detail:
          "Some error occurred while fetching new comment, please try again later",
        life: 3000,
      });
    }
  });
  commentBox.value = true;
}

async function postComment() {
  if (commentId.value?.id) {
    commentValue.value = "";
    commentId.value = {};
  } else {
    if (props.userId != "not_logged_in") {
      socket.emit(
        "postComment",
        blog.value._id,
        commentValue.value,
        props.userId,

        (response) => {
          console.log(response);
        }
      );
    } else {
      toast.add({
        severity: "warn",
        summary: "Posting Comment",
        detail: "Please Login to do like, or comments",
        life: 3000,
      });
    }
  }
  commentValue.value = "";
}
</script>
<template>
  <Suspense>
    <div id="container">
      <h1>Blog App</h1>
      <div>
        <Button
          v-if="props.isLogged && props.userRole == 'writer'"
          @click="isAddBlog = !isAddBlog"
          :icon="isAddBlog ? 'pi pi-times' : 'pi pi-plus'"
          :class="{ 'p-button-danger': isAddBlog }"
          :label="isAddBlog ? 'Close' : 'Add Blog'"
        ></Button>
      </div>
      <div style="display: none">
        {{ blogs }}
      </div>
      <Transition>
        <AddBlog
          v-show="isAddBlog && props.isLogged"
          :allBlogs="allBlogs"
          :userId="props.userId"
          :userName="props.userName"
          :refreshToken="props.refreshToken"
        ></AddBlog>
      </Transition>
      <div v-if="userId != ''">
        <Blog
          v-for="(
            { title, content, writer, writerId, likes, likedBy, comments, _id },
            index
          ) of allBlogs"
          :title="title"
          :content="content"
          :writer="writer"
          :writerId="writerId"
          :userRole="props.userRole"
          :userId="props.userId"
          :likes="likes"
          :likedBy="likedBy"
          :comments="comments"
          :blogId="_id"
          :key="_id"
          :index="index"
          @delete-blog="deleteBlog"
          @edit-blog="editBlog"
          @comment-blog="commentBlog"
        ></Blog>
        <ConfirmDialog> </ConfirmDialog>
      </div>
      <div v-else>loading</div>
      <Dialog
        v-model:visible="editBlogBox"
        :style="{ width: '450px' }"
        header="User Details"
        :modal="true"
        class="p-fluid"
      >
        <img
          src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
          :alt="blog.image"
          class="product-image"
          v-if="blog.image"
        />
        <div class="field">
          <label for="title">Title</label>
          <InputText
            id="title"
            v-model.trim="blog.title"
            :style="{ margin: '8px 0 15px' }"
            placeholder="Enter title"
            required="true"
            autofocus
            :class="{ 'p-invalid': !blog.title }"
          />
          <small class="p-error" v-if="!blog.title">title is required.</small>
        </div>

        <div class="field">
          <label for="email" :style="{ margin: '10px' }">Content</label>
          <Textarea
            id="content"
            :auto-resize="true"
            rows="3"
            v-model="blog.content"
            :style="{ margin: '8px 0 15px' }"
            placeholder="Enter content"
          />
        </div>

        <template #footer>
          <Button
            label="Cancel"
            icon="pi pi-times"
            class="p-button-text"
            @click="
              () => {
                editBlogBox = false;
                blog.value = {};
              }
            "
          />
          <Button
            label="Save"
            icon="pi pi-check"
            class="p-button-text"
            @click="updateBlog"
          />
        </template>
      </Dialog>

      <Dialog
        v-model:visible="commentBox"
        :style="{ width: '450px' }"
        header="Comments"
        :modal="true"
        class="p-fluid commentBoxClass"
      >
        <div
          class="profile"
          v-for="{ userName, _id, comment, userId: commenterId } in allComments"
          :key="_id"
        >
          <Avatar :label="userName[0]" shape="circle"></Avatar>
          <div class="user-comment">
            <p :style="{ 'font-size': '16px' }">{{ userName }}</p>
            <p :style="{ 'font-size': '16px' }" class="comment-text">
              {{ comment }}
            </p>
          </div>
          <i
            v-if="commenterId == props.userId"
            class="pi pi-ellipsis-v"
            :style="{ cursor: 'pointer' }"
            @click="showCommentOptions($event, _id, comment)"
          ></i>
        </div>
        <Menu ref="isCommentOptions" :model="commentOptions" :popup="true" />
        <template #footer>
          <span :style="{ width: '100%' }" class="p-input-icon-right">
            <i
              class="pi pi-send post-comment-icon"
              :style="{
                cursor: 'pointer',
                'font-size': '20px',
                transform: 'rotateZ(45deg)',
                'margin-right': '10px',
              }"
              @click="postComment"
            ></i>
            <InputText
              ref="isCommentInputFocused"
              :style="{ width: '100%' }"
              type="text"
              placeholder="Write comment"
              v-model="commentValue"
            />
          </span>
        </template>
      </Dialog>
    </div>
  </Suspense>
</template>

<style scoped>
div {
  width: 100%;
}
h1 {
  margin: 15px 0;
}
#container > div:nth-child(2) {
  padding: 0 20px;
  display: flex;

  justify-content: end;
}
.v-enter-active,
.v-leave-active {
  transition: all 0.5s ease;
}

.v-enter-from,
.v-leave-to {
  transform: translateX(100%);
}
.profile {
  display: flex;
  gap: 15px;
  margin: 5px 0;
  align-items: center;
}
.profile > .user-comment {
  width: 100%;
  display: flex;
  flex-direction: column;
}

.profile > .p-avatar {
  width: 10%;
  padding: 25px;
}
.p-inputtext {
  width: 50%;
}

.post-comment-icon {
  transition: all 250ms;
}
.post-comment-icon:hover {
  color: var(--text-color);
}
</style>
