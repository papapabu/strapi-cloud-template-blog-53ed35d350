const pbPagePublicRoutes = {
  type: "content-api",
  routes: [
    {
      method: "GET",
      path: "/pages/find",
      handler: "pbpage.findPageByURL",
      config: {
        auth: false,
      },
    },
  ],
};
const pbPageAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/pages",
      handler: "pbpage.findPages",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/pages/cms/find",
      handler: "pbpage.findCmsPageByUrl",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/pages/create",
      handler: "pbpage.createPage",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.create"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/pages/publish/:id",
      handler: "pbpage.togglePublishState",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/pages/update",
      handler: "pbpage.updatePageDetails",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
        middlewares: [],
      },
    },
    {
      method: "DELETE",
      path: "/pages/delete/:id",
      handler: "pbpage.deletePage",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.delete"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/pages/private-default-page",
      handler: "pbpage.findPrivateDefaultPage",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/draftpages/cms/:id",
      handler: "pbpage.cmsDraftPageById",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/draftpages/update/:id",
      handler: "pbpage.cmsSaveDraftPage",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
        middlewares: [],
      },
    },
    {
      method: "PUT",
      path: "/pages/set-default-page",
      handler: "pbpage.setDefaultPage",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbpage",
            },
          },
        ],
      },
    },
  ],
};

export { pbPageAdminRoutes, pbPagePublicRoutes };

