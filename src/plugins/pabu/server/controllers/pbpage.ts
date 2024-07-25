import { Strapi } from "@strapi/strapi";
import { Context } from "koa";
import {
  CreatePageRequest,
  SetDefaultPageRequest,
  UpdatePageRequest,
  UpdatePageSettingsRequest,
} from "../types/pbpage";

export default ({ strapi }: { strapi: Strapi }) => ({
  async findPages(ctx: Context) {
    const { locale } = ctx.request.query;
    if (Array.isArray(locale)) {
      ctx.badRequest();
    }
    ctx.body = await strapi.plugin("pabu").service("pbpage").findPages(locale);
  },
  async findPageByURL(ctx: Context) {
    const { locale, url } = ctx.request.query;
    if (Array.isArray(locale) || !url) {
      ctx.badRequest();
    }
    const page = await strapi
      .plugin("pabu")
      .service("pbpage")
      .findPageByUrl(url, locale);
    if (!page) {
      ctx.throw(404);
    }
    ctx.body = page;
  },
  async findCmsPageByUrl(ctx: Context) {
    const { locale, url } = ctx.request.query;
    if (Array.isArray(locale) || !url) {
      ctx.badRequest();
    }
    const page = await strapi
      .plugin("pabu")
      .service("pbpage")
      .findCmsPageByUrl(url, locale);
    if (!page) {
      ctx.throw(404);
    }
    ctx.body = page;
  },
  async createPage(ctx: any) {
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .createPage(ctx.request.body as CreatePageRequest, ctx.state.user.id)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async togglePublishState(ctx: Context) {
    const { id } = ctx.params;
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .togglePublishState(id, ctx.state.user.id)
      .catch((err: Error) => ctx.throw(400, err));
  },
  async updatePageDetails(ctx: any) {
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .updatePageDetails(ctx.request.body as UpdatePageSettingsRequest)
      .catch((err: Error) => ctx.throw(400, err));
  },
  async deletePage(ctx: Context) {
    const { id } = ctx.params;
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .deletePage(id)
      .catch((err: Error) => ctx.throw(400, err));
  },
  async findPrivateDefaultPage(ctx: Context) {},
  async cmsDraftPageById(ctx: Context) {
    const { locale } = ctx.request.query;
    const { id } = ctx.params;
    if (Array.isArray(locale) || !id) {
      ctx.badRequest();
    }
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .cmsDraftPageById(id, locale);
  },
  async cmsSaveDraftPage(ctx: any) {
    const { id } = ctx.params;
    const { locale } = ctx.request.query;
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .cmsSaveDraftPage(
        id,
        ctx.request.body as UpdatePageRequest,
        locale,
        ctx.state.user.id
      )
      .catch((err: Error) => ctx.throw(400, err));
  },
  async setDefaultPage(ctx: any) {
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbpage")
      .setDefaultPage(ctx.request.body as SetDefaultPageRequest)
      .catch((err: Error) => ctx.throw(400, err));
  },
});
