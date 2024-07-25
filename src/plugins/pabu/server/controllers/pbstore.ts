import { Strapi } from "@strapi/strapi";
import pbEntityService from "../services/pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * getAllEntriesOfStores
   * @returns
   */
  async getAllEntriesOfStores() {
    const allStoreEntries = await pbEntityService.findMany(
      "plugin::pabu.str",
      {
        fields: ["*"],
        filters: {},
        sort: {},
        populate: "pb-deep",
      }
    );

    const allContentElementSettingsStoreEntries =
      await pbEntityService.findMany("plugin::pabu.cesstr", {
        fields: ["*"],
        filters: {},
        sort: {},
        populate: "pb-deep",
      });

    return {
      str: allStoreEntries ? allStoreEntries : [],
      cesstr: allContentElementSettingsStoreEntries
        ? allContentElementSettingsStoreEntries
        : [],
    };
  },
});
