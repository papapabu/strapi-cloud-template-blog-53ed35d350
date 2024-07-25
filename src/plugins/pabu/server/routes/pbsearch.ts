const pbSearchPublicRoutes = {
  type: "content-api",
  routes: [
    {
      method: "GET",
      path: "/search/suggest/:searchString",
      handler: "pbsearch.suggest",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
    {
      method: "GET",
      path: "/search/:searchString",
      handler: "pbsearch.search",
      config: {
        auth: false,
        policies: [],
        middlewares: [],
      },
    },
  ],
};
export { pbSearchPublicRoutes };

