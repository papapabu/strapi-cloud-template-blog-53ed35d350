import { Strapi } from "@strapi/strapi";
import { Context } from "koa";
import { CreateFormRequest, SubmitFormRequest, UpdateFormRequest } from "../types/pbform";

export default ({ strapi }: { strapi: Strapi }) => ({
  async findForms(ctx: Context) {
    const { locale } = ctx.request.query;
    if (Array.isArray(locale)) {
      ctx.badRequest();
    }
    ctx.body = await strapi.plugin("pabu").service("pbform").findForms(locale);
  },
  async findFormById(ctx) {
    const { id } = ctx.params;
    if (!id) {
      ctx.badRequest();
    }
    const form = await strapi.plugin("pabu").service("pbform").findFormById(id);

    if (!form) {
      return ctx.notFound("Form not found");
    }
    ctx.body = form;
  },
  async submitForm(ctx) {
    const form = ctx.request.body as SubmitFormRequest;
    if (!form.formId) {
      return ctx.badRequest("A valid form.formId is required!");
    }
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbform")
      .submitForm(form)
      .catch((error: Error) => {
        ctx.throw(400, error);
      });;
  },
  async cmsFindForm(ctx) {
    const { id } = ctx.params;
    const { locale } = ctx.request.query;
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbform")
      .cmsFindForm(id, locale)
      .catch((error: Error) => {
        ctx.throw(400, error);
      });
  },
  async cmsCreateValuesForm(ctx) {
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbform")
      .cmsCreateValuesForm()
      .catch((error: Error) => {
        strapi.log.error(error);
        ctx.throw(400, error);
      });
  },
  async cmsCreateForm(ctx) {
    const form = ctx.request.body as CreateFormRequest;
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbform")
      .cmsCreateForm(form)
      .catch((error: Error) => {
        strapi.log.error(error);
        ctx.throw(400, error);
      });
  },
  async cmsUpdateForm(ctx) {
    const form = ctx.request.body as UpdateFormRequest;
    const id = form.id;
    if (!id) {
      ctx.badRequest("no form id provided");
      return;
    }
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbform")
      .cmsUpdateForm(form)
      .catch((error: Error) => {
        ctx.throw(400, error);
      });
  },
  async cmsDeleteForm(ctx) {
    const { id } = ctx.params;
    if (!id) {
      ctx.badRequest();
      return;
    }
    ctx.body = await strapi
      .plugin("pabu")
      .service("pbform")
      .cmsDeleteForm(id)
      .catch((error: Error) => {
        ctx.throw(400, error);
      });
  },
});
