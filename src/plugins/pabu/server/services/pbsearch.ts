import { Strapi } from "@strapi/strapi";
import {
  CMS_SEARCH_PAGE_NAME,
  CMS_SEARCH_PAGE_URL,
  PAGE_MODULE_UID,
} from "../constants";
import { i18nDefaultLocale } from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * Creates search-Page.
   */
  async init() {
    const searchPage: any = await pbEntityService.findMany(PAGE_MODULE_UID, {
      filters: {
        url: CMS_SEARCH_PAGE_URL,
      },
    });
    if (!searchPage || searchPage.length === 0) {
      strapi.log.info(
        `[PB] Created Page: ${CMS_SEARCH_PAGE_NAME} (${CMS_SEARCH_PAGE_URL}).`
      );

      const createdPage = await pbEntityService.create(PAGE_MODULE_UID, {
        data: {
          name: CMS_SEARCH_PAGE_NAME,
          url: CMS_SEARCH_PAGE_URL,
          isDraft: false,
          published: true,
          locale: await i18nDefaultLocale(
            process.env.STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE
          ),
          content: [{ __component: "pb.csrchrslts" }],
        },
      });
      await strapi
        .service("plugin::pabu.pbpage")
        .createDraftPage(parseInt(createdPage.id.toString()));
    }
  },
});
