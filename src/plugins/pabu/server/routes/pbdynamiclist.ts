const pbDynamicListAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/dynamiclists/name/:name",
      handler: "pbdynamiclist.findOneByName",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbdynamiclist",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/dynamiclists",
      handler: "pbdynamiclist.cmsCreateDynamicList",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.create"],
              model: "plugin::pabu.pbdynamiclist",
            },
          },
        ],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/dynamiclists/:id",
      handler: "pbdynamiclist.cmsUpdateDynamicList",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbdynamiclist",
            },
          },
        ],
        middlewares: [],
      },
    },
  ],
};

export { pbDynamicListAdminRoutes };

