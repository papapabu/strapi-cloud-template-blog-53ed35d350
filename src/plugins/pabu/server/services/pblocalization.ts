import { Strapi } from "@strapi/strapi";
import { PbLocalSwitchOption } from "../types/pblocalization";

export default ({ strapi }: { strapi: Strapi }) => ({
  async availableLocales() {
    let locales = await strapi.query("plugin::i18n.locale").findMany({});
    return locales.map(
      (locale: any) =>
        ({
          code: locale.code,
          name: locale.name,
        } as PbLocalSwitchOption)
    );
  },
});
