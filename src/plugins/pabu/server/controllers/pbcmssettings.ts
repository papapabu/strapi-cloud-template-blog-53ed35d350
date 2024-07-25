import { Strapi } from "@strapi/strapi";
import { CmsSettings } from "../types/pbcmssetting";

export default ({ strapi }: { strapi: Strapi }) => ({
  async getCmsSettings(ctx: any) {
    let response = {} as CmsSettings;
    try {
      response = await strapi
        .plugin("pabu")
        .service("pbcmssettings")
        .getCmsSettings();
    } catch (error) {
      strapi.log.error("[getCmsSettings] failed to get cmsSettings exception:");
      strapi.log.error(error);
    }
    return response;
  },
});
