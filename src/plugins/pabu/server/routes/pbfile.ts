const pbFilePublicRoutes = {
  type: "content-api",
  routes: [
    {
      method: "GET",
      path: "/download/file/:id",
      handler: "pbfile.fileDownloadById",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};

const pbFileAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/media-manager-folder",
      handler: "pbfile.mediaManagerFolder",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
    {
      method: "GET",
      path: "/files",
      handler: "pbfile.filesHandler",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/files/:id",
      handler: "pbfile.updateFile",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "DELETE",
      path: "/files/:id",
      handler: "pbfile.deleteFile",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.delete"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/files/references/:id",
      handler: "pbfile.findReferences",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/files/search",
      handler: "pbfile.search",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "GET",
      path: "/files/:id",
      handler: "pbfile.getFileById",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.read"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/folders",
      handler: "pbfile.createFolder",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.create"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "POST",
      path: "/folders/bulk-delete",
      handler: "pbfile.bulkDeleteFolders",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.delete"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
    {
      method: "PUT",
      path: "/folders/:id",
      handler: "pbfile.updateFolder",
      config: {
        policies: [
          "admin::isAuthenticatedAdmin",
          {
            name: "plugin::pabu.hasPermission",
            config: {
              actions: ["plugin::content-manager.explorer.update"],
              model: "plugin::pabu.pbfile",
            },
          },
        ],
      },
    },
  ],
};

export { pbFileAdminRoutes, pbFilePublicRoutes };
