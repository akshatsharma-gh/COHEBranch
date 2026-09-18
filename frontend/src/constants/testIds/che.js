export const AUTH = {
  usernameInput: "login-username-input",
  passwordInput: "login-password-input",
  submitButton: "login-submit-button",
  errorAlert: "login-error-alert",
};

export const DASHBOARD = {
  searchInput: "dashboard-search-input",
  branchCard: (id) => `branch-card-${id}`,
  branchesGrid: "branches-grid",
  logoutButton: "logout-button",
  loginButton: "header-login-button",
  branchCount: "branch-count",
  emptyState: "branches-empty-state",
  addBranchButton: "add-branch-button",
  editBranchButton: (id) => `edit-branch-button-${id}`,
  deleteBranchButton: (id) => `delete-branch-button-${id}`,
};

export const BRANCH = {
  backButton: "branch-back-button",
  title: "branch-title",
  orgNode: (id) => `org-node-${id}`,
  orgNodeName: (id) => `org-node-name-${id}`,
  orgNodeRole: (id) => `org-node-role-${id}`,
  editBranchButton: "branch-edit-button",
  deleteBranchButton: "branch-delete-button",
  addPersonButton: "branch-add-person-button",
  editPersonButton: (i) => `branch-edit-person-${i}`,
  deletePersonButton: (i) => `branch-delete-person-${i}`,
};

export const ADMIN_FORM = {
  nameInput: "admin-form-name-input",
  descriptionInput: "admin-form-description-input",
  iconSelect: "admin-form-icon-select",
  saveButton: "admin-form-save-button",
  personNameInput: "admin-person-name-input",
  personRoleInput: "admin-person-role-input",
  personSaveButton: "admin-person-save-button",
};