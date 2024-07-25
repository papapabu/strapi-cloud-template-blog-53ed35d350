const pbLocalizationAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/available-locales",
      handler: "pblocalization.availableLocales",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
  ],
};

export { pbLocalizationAdminRoutes };
