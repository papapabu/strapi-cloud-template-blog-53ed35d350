import { Strapi } from "@strapi/strapi";
import { Context } from "koa";

export default ({ strapi }: { strapi: Strapi }) => ({
  async verifyAuthentication(ctx: Context) {
    /* 
     * This route is protected by the policy 
     * "admin::isAuthenticatedAdmin" so if you reach this 
     * return the authentication was successfully verified
     */
    return true;
  },
});
