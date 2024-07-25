const pbAuthenticationAdminRoutes = {
  type: "admin",
  routes: [
    {
      method: "GET",
      path: "/auth/verify",
      handler: "pbauthentication.verifyAuthentication",
      config: {
        policies: ["admin::isAuthenticatedAdmin"],
      },
    },
  ],
};

export { pbAuthenticationAdminRoutes };
