export const API_ENDPOINTS = {
  GENERAL: {
    ROOT: "",
    HOME: "/home",
    BOOTSTRAP_SEED: "/bootstrap/seed",
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
    PRODUCTS: "/Products",
    CATEGORIES: "/ProductCategories",
    BRANDS: "/Brands",
    UNITS: "/Units",
  },
  TERRITORY: {
    BRANCHES: "/Branches",
    AREAS: "/Areas",
    TABLES: "/RestaurantTables",
  },
} as const;
