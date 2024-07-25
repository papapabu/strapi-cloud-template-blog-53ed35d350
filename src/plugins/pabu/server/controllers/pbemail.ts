import { Strapi } from "@strapi/strapi";
import { getService } from "../utils/functions";
import { EmailTestRequest } from "../types/pbemail";

export default ({ strapi }: { strapi: Strapi }) => ({
  async getAllTemplates(ctx: any) {
    const service = getService("pbemail");
    ctx.body = await service.getAllEmailTemplates().catch((err: Error) => {
      ctx.throw(400, err);
    });
  },
  async getTemplatesByCategory(ctx: any) {
    const service = getService("pbemail");
    const { category } = ctx.params;
    ctx.body = await service
      .getEmailTemplateByCategory(category)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async testEmail(ctx: any) {
    const service = getService("pbemail");
    const request = ctx.request.body as EmailTestRequest;
    ctx.body = await service
      .testEmail(request.templateName, request.recipientEmail)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
});
