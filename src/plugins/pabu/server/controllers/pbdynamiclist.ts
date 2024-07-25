import { Strapi } from "@strapi/strapi";
import { Context } from "koa";
import { CreateDynamicListRequest } from "../types/pbdynamiclist";

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * [GET] /dynamiclists/name/:name
   * [middlewares]: hasValidCmsToken
   * finds a dynamic list by its name. This controller is needed for
   * the contentmanager if you want to edit a dynamic list.
   * @param {*} ctx
   * @returns
   */
  async findOneByName(ctx: Context) {
    const { name } = ctx.params;
    let { locale } = ctx.query;
    if (!locale || Array.isArray(locale) || !name) {
      ctx.badRequest();
    }

    const dynamicList = await strapi
      .service("plugin::pabu.pbdynamiclist")
      .findOneByName(name, locale);

    if (!dynamicList) {
      ctx.throw(404);
    }

    ctx.body = dynamicList;
  },
  /**
   * [POST] /dynamiclists
   * [middlewares]: hasValidCmsToken
   * Creates a new dynamic list (currently used for footer)
   * @param {*} ctx
   * @returns
   */
  async cmsCreateDynamicList(ctx) {
    ctx.body = await strapi
      .service("plugin::pabu.pbdynamiclist")
      .createDynamicList(ctx.request.body as CreateDynamicListRequest)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },

  async cmsUpdateDynamicList(ctx) {
    const { id } = ctx.params;
    const data = ctx.request.body;
    ctx.body = await strapi
      .service("plugin::pabu.pbdynamiclist")
      .updateDynamicList(id, data)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
});
