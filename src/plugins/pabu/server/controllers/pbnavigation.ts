import { Strapi } from "@strapi/strapi";
import { Context } from "koa";
import { PbNavigationUpdateData } from "../types/pbnavigation";

export default ({ strapi }: { strapi: Strapi }) => ({
  async cmsListNavigations(ctx: Context) {
    const { locale } = ctx.request.query;

    if (Array.isArray(locale)) {
      ctx.badRequest();
    }

    ctx.body = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .cmsListNavigations(locale);
  },
  async cmsFindById(ctx: Context) {
    const { locale } = ctx.request.query;
    const { id } = ctx.params;

    if (Array.isArray(locale) || !id) {
      ctx.badRequest();
    }
    const navigation = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .cmsFindById(id, locale);
    if (!navigation) {
      ctx.throw(404);
    }
    ctx.body = navigation;
  },
  async cmsCreateNavigation(ctx: any) {
    const data = ctx.request.body;
    const { locale } = ctx.request.query;

    ctx.body = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .cmsCreateNavigation({ ...data, locale } as PbNavigationUpdateData)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async cmsUpdateNavigation(ctx: any) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    const { locale } = ctx.request.query;

    ctx.body = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .cmsUpdateNavigation(id, { ...data, locale } as PbNavigationUpdateData)
      .catch((err: Error) => ctx.throw(400, err));
  },
  async cmsDeleteNavigation(ctx: any) {
    const { id } = ctx.params;
    const { locale } = ctx.request.query;

    ctx.body = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .cmsDeleteNavigation(id, locale)
      .catch((err: Error) => ctx.throw(400, err));
  },
  async cmsFindMainNavigation(ctx: Context) {
    const { locale } = ctx.request.query;

    if (Array.isArray(locale)) {
      ctx.badRequest();
    }

    ctx.body = await strapi
      .plugin("pabu")
      .service("pbnavigation")
      .cmsFindMainNavigation(locale);
  },
});
