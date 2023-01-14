<template>
  <Toast />
  <div>
    <div class="card">
      <Toolbar class="mb-4">
        <template #start>
          <Button
            label="New"
            icon="pi pi-plus"
            class="p-button-success mr-2"
            @click="openNew"
            disabled
          />
          <Button
            label="Delete"
            icon="pi pi-trash"
            class="p-button-danger"
            :style="{ 'margin-left': '10px' }"
            @click="confirmDeleteSelected"
            :disabled="!selectedProducts || !selectedProducts.length"
          />
        </template>
      </Toolbar>

      <DataTable
        ref="dt"
        :value="products"
        v-model:selection="selectedProducts"
        dataKey="id"
        :paginator="true"
        :rows="10"
        :filters="filters"
        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport RowsPerPageDropdown"
        :rowsPerPageOptions="[5, 10, 25]"
        currentPageReportTemplate="Showing {first} to {last} of {totalRecords} products"
        responsiveLayout="scroll"
      >
        <template #header>
          <div
            class="table-header flex flex-column md:flex-row md:justify-content-between"
          >
            <h5 class="mb-2 md:m-0 p-as-md-center">Manage Products</h5>
            <span class="p-input-icon-left">
              <i class="pi pi-search" />
              <InputText
                v-model="filters['global'].value"
                placeholder="Search..."
              />
            </span>
          </div>
        </template>

        <Column
          selectionMode="multiple"
          style="width: 3rem"
          :exportable="false"
        ></Column>
        <Column
          field="createdAt"
          header="Date"
          :sortable="true"
          :style="{ 'min-width': '10rem', 'align-items': 'center' }"
        ></Column>
        <Column header="Image">
          <template #body="slotProps">
            <img
              src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
              :alt="slotProps.data.image"
              class="product-image"
            />
          </template>
        </Column>
        <Column
          field="name"
          header="Name"
          :sortable="true"
          style="min-width: 16rem"
        ></Column>

        <Column
          field="role"
          header="Role"
          :sortable="true"
          style="min-width: 10rem"
        ></Column>

        <Column
          field="email"
          header="Email"
          :sortable="true"
          style="min-width: 12rem"
        >
        </Column>
        <Column :exportable="false" style="min-width: 8rem">
          <template #body="slotProps">
            <Button
              icon="pi pi-pencil"
              class="p-button-rounded p-button-success mr-2"
              @click="editProduct(slotProps.data)"
            />
            <Button
              icon="pi pi-trash"
              class="p-button-rounded p-button-warning"
              :style="{ 'margin-left': '10px' }"
              @click="confirmDeleteProduct(slotProps.data)"
            />
          </template>
        </Column>
      </DataTable>
    </div>

    <Dialog
      v-model:visible="productDialog"
      :style="{ width: '450px' }"
      header="User Details"
      :modal="true"
      class="p-fluid"
    >
      <img
        src="https://www.primefaces.org/wp-content/uploads/2020/05/placeholder.png"
        :alt="product.image"
        class="product-image"
        v-if="product.image"
      />
      <div class="field">
        <label for="name">Name</label>
        <InputText
          id="name"
          v-model.trim="product.name"
          :style="{ margin: '8px 0 15px' }"
          placeholder="Enter Name"
          required="true"
          autofocus
          :class="{ 'p-invalid': submitted && !product.name }"
        />
        <small class="p-error" v-if="submitted && !product.name"
          >Name is required.</small
        >
      </div>

      <div class="field">
        <label for="inventoryStatus" class="mb-3">Select Role</label>
        <Dropdown
          id="inventoryStatus"
          v-model="product.role"
          :options="statuses"
          optionLabel="label"
          optionValue="value"
          :style="{ margin: '8px 0 15px' }"
          placeholder="Select a Status"
        >
          <template #value="slotProps">
            <div v-if="slotProps.value && slotProps.value.value">
              <span :class="'product-badge status-' + slotProps.value.value">{{
                slotProps.value.label
              }}</span>
            </div>
            <div v-else-if="slotProps.value && !slotProps.value.value">
              <span
                :class="'product-badge status-' + slotProps.value.toLowerCase()"
                >{{ slotProps.value }}</span
              >
            </div>
            <span v-else>
              {{ slotProps.placeholder }}
            </span>
          </template>
        </Dropdown>
      </div>

      <div class="field">
        <label for="email" :style="{ margin: '10px' }">Email</label>
        <InputText
          id="email"
          v-model="product.email"
          :style="{ margin: '8px 0 15px' }"
          placeholder="Enter Email"
        />
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="hideDialog"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          class="p-button-text"
          @click="saveProduct"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="deleteProductDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product"
          >Are you sure you want to delete <b>{{ product.name }}</b
          >?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteProductDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteProduct"
        />
      </template>
    </Dialog>

    <!-- <Dialog
      v-model:visible="deleteProductsDialog"
      :style="{ width: '450px' }"
      header="Confirm"
      :modal="true"
    >
      <div class="confirmation-content">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span v-if="product"
          >Are you sure you want to delete the selected products?</span
        >
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          class="p-button-text"
          @click="deleteProductsDialog = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          class="p-button-text"
          @click="deleteSelectedProducts"
        />
      </template>
    </Dialog> -->
  </div>
</template>

<script setup>
import { ref, onMounted, inject } from "vue";
import { FilterMatchMode } from "primevue/api";
import { useToast } from "primevue/usetoast";
import axios from "axios";

const url = inject("backendURL");

onMounted(async () => {
  let users = await getUsers();

  products.value = await users.users;
});

const toast = useToast();
const dt = ref();
const products = ref();
const productDialog = ref(false);
const deleteProductDialog = ref(false);
const deleteProductsDialog = ref(false);
const product = ref({});

const selectedProducts = ref();
const filters = ref({
  global: { value: null, matchMode: FilterMatchMode.CONTAINS },
});
const submitted = ref(false);
const statuses = ref([
  { label: "USER", value: "user" },
  { label: "WRITER", value: "writer" },
]);

const getUsers = async () => {
  try {
    let allUsers = await axios.get(`${url}/admin/users`, {
      headers: {
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });

    return allUsers.data;
  } catch (err) {
    console.log(err);
  }
};

const openNew = () => {
  product.value = {};
  // submitted.value = false;
  // productDialog.value = true;
};
const hideDialog = () => {
  productDialog.value = false;
  submitted.value = false;
};

const saveProduct = async () => {
  submitted.value = true;
  let { name, email, role, _id } = product.value;
  if (name.trim() !== "" || email.trim() !== "" || role != "") {
    if (_id) {
      try {
        let res = await axios.patch(
          `${url}/admin/user/${_id}`,
          {
            name,
            email,
            role,
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
          toast.add({
            severity: "success",
            summary: "Updating User",
            detail: "User Updated Successfully.",
            life: 3000,
          });
        } else {
          toast.add({
            severity: "warn",
            summary: "Updating User",
            detail:
              "Something went wrong while updating user info, try again after some time.",
            life: 3000,
          });
        }
      } catch (err) {
        console.log(err);
        toast.add({
          severity: "warn",
          summary: "Updating User",
          detail:
            "Something went wrong while updating user info, try again after some time.",
          life: 3000,
        });
      }
    } else {
      toast.add({
        severity: "info",
        summary: "Adding New User",
        detail: "This feature is not currently available.",
        life: 3000,
      });
    }

    productDialog.value = false;
    product.value = {};
  }
};
const editProduct = (prod) => {
  product.value = { ...prod };
  productDialog.value = true;
};

const confirmDeleteProduct = (prod) => {
  product.value = { ...prod };
  deleteProductDialog.value = true;
};
const deleteProduct = async () => {
  let { _id } = product.value;

  product.value = {};
  try {
    let res = await axios.delete(`${url}/admin/user/${_id}`, {
      headers: {
        authorization: `bearer ${localStorage.getItem("token")}`,
      },
      withCredentials: true,
    });
    res = res.data;
    if (res.status == "success") {
      toast.add({
        severity: "success",
        summary: "Deleting User",
        detail: "User Deleted Successfully.",
        life: 3000,
      });
    } else {
      toast.add({
        severity: "warn",
        summary: "Deleting User",
        detail:
          "Something went wrong while Deleting user info, try again after some time.",
        life: 3000,
      });
    }
  } catch (err) {
    toast.add({
      severity: "warn",
      summary: "Deleting User",
      detail:
        "Something went wrong while Deleting user info, try again after some time.",
      life: 3000,
    });
  }
  deleteProductDialog.value = false;
};

const confirmDeleteSelected = () => {
  deleteProductsDialog.value = true;
};
const deleteSelectedProducts = () => {
  console.log("deleted many");
  deleteProductsDialog.value = false;
  selectedProducts.value = null;
  toast.add({
    severity: "success",
    summary: "Successful",
    detail: "Products Deleted",
    life: 3000,
  });
};
</script>

<style scoped>
.table-header {
  display: flex;
  align-items: center;
  justify-content: space-between;

  @media screen and (max-width: 960px) {
    align-items: start;
  }
}

.product-image {
  width: 50px;
  box-shadow: 0 3px 6px rgba(0, 0, 0, 0.16), 0 3px 6px rgba(0, 0, 0, 0.23);
}

.p-dialog .product-image {
  width: 50px;
  margin: 0 auto 2rem auto;
  display: block;
}

.confirmation-content {
  display: flex;
  align-items: center;
  justify-content: center;
}
@media screen and (max-width: 960px) {
  ::v-deep(.p-toolbar) {
    flex-wrap: wrap;
  }
  .p-button {
    margin-bottom: 0.25rem;
  }
}
</style>
