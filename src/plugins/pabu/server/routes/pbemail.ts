const pbEmailAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/email/get-all-templates",
      handler: "pbemail.getAllTemplates",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "GET",
      path: "/email/templates/categories/:category",
      handler: "pbemail.getTemplatesByCategory",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "POST",
      path: "/email/trigger-test-email",
      handler: "pbemail.testEmail",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
  ],
};

export { pbEmailAdminRoutes };
