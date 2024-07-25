import { Strapi } from "@strapi/strapi";
import { CMS_SETTING_MODULE_UID } from "../constants";
import { CmsSettings } from "../types/pbcmssetting";
import pbEntityService from "./pbEntityService";

const getCmsSettings = async (): Promise<CmsSettings> => {

  const cmsSettings: any = await pbEntityService.findMany(
    CMS_SETTING_MODULE_UID,
    {
      fields: ["*"],
      filters: {},
      populate: "pb-deep",
    }
  );

  return cmsSettings as CmsSettings;
};

export default ({ strapi }: { strapi: Strapi }) => ({
  getCmsSettings,
});
