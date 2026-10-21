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

  // Inventory Routes
  route("ingredients", "routes/inventory/ingredients.tsx"),

  // Communication Routes
  route("contact-messages", "routes/communication/contact-messages.tsx"),

  // Operations & Sales Routes
  route("orders", "routes/sale/orders.tsx"),
  route("reservations", "routes/schedule/reservations.tsx"),

  // Territory Routes
  route("branches", "routes/territory/branches.tsx"),
  route("areas", "routes/territory/areas.tsx"),
  route("tables", "routes/territory/tables.tsx"),
] satisfies RouteConfig;

