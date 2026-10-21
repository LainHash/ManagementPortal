export const API_ENDPOINTS = {
  GENERAL: {
    ROOT: "",
    HOME: "/home",
    BOOTSTRAP_SEED: "/bootstrap/seed",
    IMPORT: "/import",
  },
  AUTH: {
    LOGIN: "/Authentication/login",
    REGISTER: "/Authentication/register",
    LOGOUT: "/Authentication/logout",
    LOGOUT_ALL: "/Authentication/logout-all",
    REFRESH: "/Authentication/refresh",
    ME: "/Authentication/me",
    CHANGE_PASSWORD: "/Authentication/me/change-password",
    UPDATE_PROFILE: "/Authentication/me/profile",
  },
  USERS: {
    LIST: "/Users",
    DETAIL: (id: string) => `/Users/${id}`,
  },
  CATALOG: {
    PRODUCTS: "/catalog/products",
    PRODUCT_DETAIL: (id: string) => `/catalog/products/${id}`,
    PRODUCT_RESTORE: (id: string) => `/catalog/products/${id}/restore`,
    PRODUCT_BRANCH_PRICE: (productId: string, branchId: string) => `/catalog/products/${productId}/branches/${branchId}/price`,
    PRODUCT_BRANCH_STOCK: (productId: string, branchId: string) => `/catalog/products/${productId}/branches/${branchId}/stock`,

    CATEGORIES: "/catalog/categories",
    CATEGORY_DETAIL: (id: string) => `/catalog/categories/${id}`,
    CATEGORY_RESTORE: (id: string) => `/catalog/categories/${id}/restore`,

    BRANDS: "/catalog/brands",
    BRAND_DETAIL: (id: string) => `/catalog/brands/${id}`,
    BRAND_RESTORE: (id: string) => `/catalog/brands/${id}/restore`,

    UNITS: "/catalog/units",
    UNIT_DETAIL: (id: string) => `/catalog/units/${id}`,
    UNIT_RESTORE: (id: string) => `/catalog/units/${id}/restore`,
  },
  INVENTORY: {
    INGREDIENTS: "/inventory/ingredients",
    INGREDIENT_DETAIL: (id: string) => `/inventory/ingredients/${id}`,
    INGREDIENT_RESTORE: (id: string) => `/inventory/ingredients/${id}/restore`,
    INGREDIENT_BRANCH_PRICE: (ingredientId: string, branchId: string) => `/inventory/ingredients/${ingredientId}/branches/${branchId}/price`,
    INGREDIENT_BRANCH_STOCK: (ingredientId: string, branchId: string) => `/inventory/ingredients/${ingredientId}/branches/${branchId}/stock`,

    CATEGORIES: "/inventory/categories",
    CATEGORY_DETAIL: (id: string) => `/inventory/categories/${id}`,
    CATEGORY_RESTORE: (id: string) => `/inventory/categories/${id}/restore`,
  },
  TERRITORY: {
    BRANCHES: "/territory/Branches",
    BRANCH_DETAIL: (id: string) => `/territory/Branches/${id}`,
    AREAS: "/territory/Areas",
    TABLES: "/territory/RestaurantTables",
  },
} as const;
