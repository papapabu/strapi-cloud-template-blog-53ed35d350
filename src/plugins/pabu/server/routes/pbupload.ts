const pbUploadAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "POST",
      path: "/upload/chunk",
      handler: "pbupload.cmsChunkUpload",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
  ],
};

export { pbUploadAdminRoutes };

