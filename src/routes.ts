import { type RouteConfig, index, route } from "@react-router/dev/routes";

export default [
  index("routes/home.tsx"),
  route("login", "routes/auth/login.tsx"),
  route("profile", "routes/profile.tsx"),

  // Catalog Routes
  route("products", "routes/catalog/products.tsx"),
  route("categories", "routes/catalog/categories.tsx"),
  route("brands", "routes/catalog/brands.tsx"),
  route("units", "routes/catalog/units.tsx"),
  route("catalog", "routes/catalog/index.tsx"),
] satisfies RouteConfig;

