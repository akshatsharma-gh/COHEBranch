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
  branchCount: "branch-count",
  emptyState: "branches-empty-state",
};

export const BRANCH = {
  backButton: "branch-back-button",
  title: "branch-title",
  orgNode: (id) => `org-node-${id}`,
  orgNodeName: (id) => `org-node-name-${id}`,
  orgNodeRole: (id) => `org-node-role-${id}`,
};
