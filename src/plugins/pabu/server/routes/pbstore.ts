const pbStoreAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/store/all",
      handler: "pbstore.getAllEntriesOfStores",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.str",
            },
          },
        ],
      },
    },
  ],
};

export { pbStoreAdminRoutes };
