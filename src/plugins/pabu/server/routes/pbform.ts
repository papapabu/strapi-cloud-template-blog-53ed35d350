const pbFormPublicRoutes = {
  type: "content-api",
  routes: [
    {
      method: "GET",
      path: "/forms/:id",
      handler: "pbform.findFormById",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "POST",
      path: "/forms/submit",
      handler: "pbform.submitForm",
      config: {
        auth: false,
        policies: [],
        middlewares: ["plugin::pabu.removeHtml"],
      },
    },
  ],
};

const pbFormAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/forms",
      handler: "pbform.findForms",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbform",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/forms/:id",
      handler: "pbform.cmsFindForm",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbform",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/forms/create/values",
      handler: "pbform.cmsCreateValuesForm",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbform",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/forms/create",
      handler: "pbform.cmsCreateForm",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.create"],
              model: "plugin::pabu.pbform",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/forms/update",
      handler: "pbform.cmsUpdateForm",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbform",
            },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/forms/delete/:id",
      handler: "pbform.cmsDeleteForm",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.delete"],
              model: "plugin::pabu.pbform",
            },
          },
        ],
      },
    },
  ],
};

export { pbFormAdminRoutes, pbFormPublicRoutes };
