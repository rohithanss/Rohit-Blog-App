// import VueCookies from "vue-cookies";
import { createApp } from "vue";
import App from "./App.vue";
import "./assets/main.css";
import ToastService from "primevue/toastservice";
import ConfirmationService from "primevue/confirmationservice";
import PrimeVue from "primevue/config";
import Card from "primevue/card";
import InputText from "primevue/inputtext";
import Button from "primevue/button";
import Password from "primevue/password";
import Textarea from "primevue/textarea";
import FileUpload from "primevue/fileupload";
import Avatar from "primevue/avatar";
import Checkbox from "primevue/checkbox";
import ConfirmDialog from "primevue/confirmdialog";
import ConfirmPopup from "primevue/confirmpopup";
import InputMask from "primevue/inputmask";
import Dialog from "primevue/dialog";
import InputNumber from "primevue/inputnumber";
import RadioButton from "primevue/radiobutton";
import Dropdown from "primevue/dropdown";
import DataTable from "primevue/datatable";
import Rating from "primevue/rating";
import Column from "primevue/column";
import Toolbar from "primevue/toolbar";
import Toast from "primevue/toast";
import Menu from "primevue/menu";

const app = createApp(App);
app.component("Card", Card);
app.component("InputText", InputText);
app.component("Textarea", Textarea);
app.component("Password", Password);
app.component("Button", Button);
app.component("Avatar", Avatar);
app.component("Checkbox", Checkbox);
app.component("ConfirmPopup", ConfirmPopup);
app.component("ConfirmDialog", ConfirmDialog);
app.component("InputMask", InputMask);
app.component("FileUpload", FileUpload);
app.component("Dialog", Dialog);
app.component("InputNumber", InputNumber);
app.component("RadioButton", RadioButton);
app.component("Dropdown", Dropdown);
app.component("DataTable", DataTable);
app.component("Rating", Rating);
app.component("Column", Column);
app.component("Toolbar", Toolbar);
app.component("Toast", Toast);
app.component("Menu", Menu);

// import "primevue/resources/themes/saga-blue/theme.css";
// import "primevue/resources/themes/lara-dark-indigo/theme.css";
// import "primevue/resources/themes/lara-dark-teal/theme.css";
// import "primevue/resources/themes/tailwind-light/theme.css";
import "primevue/resources/themes/md-dark-deeppurple/theme.css";
// import "primevue/resources/themes/nova-alt/theme.css";
// import "primevue/resources/themes/luna-amber/theme.css";
// import "primevue/resources/themes/rhea/theme.css";
import "primevue/resources/primevue.min.css"; //core css
import "primeicons/primeicons.css"; //icons
// app.provide("backendURL", "http://localhost:7010");
app.provide("backendURL", "https://rohit-blog-app.onrender.com");
app.use(ConfirmationService);
app.use(PrimeVue);
app.use(ToastService);
app.mount("#app");
