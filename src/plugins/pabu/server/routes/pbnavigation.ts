const pbNavigationAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/navigations/cms-list",
      handler: "pbnavigation.cmsListNavigations",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbnavigation",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/navigations/find/:id",
      handler: "pbnavigation.cmsFindById",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbnavigation",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/navigations/create",
      handler: "pbnavigation.cmsCreateNavigation",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/navigations/update/:id",
      handler: "pbnavigation.cmsUpdateNavigation",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbnavigation",
            },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/navigations/delete/:id",
      handler: "pbnavigation.cmsDeleteNavigation",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.delete"],
              model: "plugin::pabu.pbnavigation",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/navigations/main",
      handler: "pbnavigation.cmsFindMainNavigation",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbnavigation",
            },
          },
        ],
      },
    },
  ],
};

export { pbNavigationAdminRoutes };
