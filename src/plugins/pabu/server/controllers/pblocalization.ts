import { Strapi } from "@strapi/strapi";
import { Context } from "koa";

export default ({ strapi }: { strapi: Strapi }) => ({
  async availableLocales(ctx: Context) {
    ctx.body = await strapi
      .plugin("pabu")
      .service("pblocalization")
      .availableLocales();
  },
});
