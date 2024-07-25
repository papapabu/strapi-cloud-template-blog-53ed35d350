const pbCmsSettingAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/cmssettings",
      handler: "pbcmssettings.getCmsSettings",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.cesstr",
            },
          },
        ],
      },
    },
  ],
};

export { pbCmsSettingAdminRoutes };
