export const STORAGE_KEYS = {
  ACCESS_TOKEN: "mp_access_token",
  REFRESH_TOKEN: "mp_refresh_token",
  USER_DATA: "mp_user_data",
  SIDEBAR_COLLAPSED: "mp_sidebar_collapsed",
  SELECTED_BRANCH_ID: "mp_selected_branch_id",
  SELECTED_BRANCH_CODE: "mp_selected_branch_code",
  THEME: "mp_theme",
} as const;

export const APP_CONFIG = {
  NAME: "Restaurant Management Portal",
  SHORT_NAME: "RestoPortal",
  VERSION: "1.0.0",
  DESCRIPTION: "Hệ thống quản lý chuỗi nhà hàng toàn diện & chuyên nghiệp",
} as const;

export const APP_EVENTS = {
  BRANCH_CHANGED: "mp_branch_changed",
} as const;
