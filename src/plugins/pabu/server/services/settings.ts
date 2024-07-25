import { CmsSettings } from "../types/pbcmssetting";
import pbEntityService from "./pbEntityService";

const fs = require("fs-extra");

export default {
  /**
   * createSettingsJSON
   * @param settingType glbl | setting
   * @param data
   */
  async createSettingsJSON(
    settingType: string,
    data: any,
    onlyValues: Boolean = false
  ) {
    let configFileName =
      settingType === "glbl" ? "global" : "contentelement-settings";
    if (onlyValues) {
      // store v1: Might be no longer required
      data = await strapi
        .service("plugin::pabu.settings")
        .flattenSettingsJSON(data);
    }
    if (data) {
      // Note: previously createOrUpdateFile:
      await strapi
        .service("plugin::pabu.pbsystem")
        .createSystemStrapiFile(
          JSON.stringify(data),
          `config-${configFileName}`,
          "json",
          "application/json",
          null,
          "uploads",
          null
        );
    } else {
      strapi.log.info(
        `[plugin::pabu.settings] Skipped generation of "config-${configFileName}.json".`
      );
    }
  },

  // store v1: Might be no longer required
  async flattenSettingsJSON(data: any) {
    let flatSetting;
    if (data) {
      flatSetting = {};
      for (const [key, value] of Object.entries(data)) {
        /* @ts-ignore */
        if (value && value.id) {
          const settingComponent = await strapi
            .service("plugin::pabu.str")
            .getStoreValues(value);

          // flat & sanitized Data: For JSON.
          strapi.log.debug(`flatData: ${key}`);
          strapi.log.debug(settingComponent.flatData);
          flatSetting[key] = settingComponent.flatData;
        }
      }
    }
    return flatSetting;
  },

  async fetchSettingsData(setting: "glbl" | "cesstr" | "custom") {
    let settingData = await pbEntityService.findMany(
      `plugin::pabu.${setting}`,
      {
        populate: "pb-deep",
      }
    );

    if (setting === "glbl" || setting === "cesstr") {
      settingData = await strapi
        .service("plugin::pabu.str")
        .populateStoreData(settingData);
    }

    return settingData;
  },

  /**
   * removeDynamicZoneArrayStructure
   * Used to remove the unnecessary array structures of dynamic zones (which are often limited to 1) in store-entries.
   * @returns
   */
  removeDynamicZoneArrayStructure(entry, dynamicZoneName) {
    if (
      entry[dynamicZoneName] &&
      Array.isArray(entry[dynamicZoneName]) &&
      entry[dynamicZoneName].length === 1
    ) {
      entry[dynamicZoneName] = entry[dynamicZoneName][0];
    }
    return entry;
  },

  /**
   * regenerateSettingsJSONs
   * @param settings Array<String> default: ["glbl", "setting"]
   * @returns
   */
  async regenerateSettingsJSONs(settings: Array<String> = ["glbl", "cesstr"]) {
    for (const setting of settings) {
      strapi.log.info(`regenerateSettingsJSONs: ${setting}-JSON.`);

      let settingData = await strapi
        .service("plugin::pabu.settings")
        .fetchSettingsData(setting);

      // Sepcial Handling cesstr
      if (settingData && setting === "cesstr") {
        const backgrounds = await strapi
          .service("plugin::pabu.str")
          .getAllStoreEntriesOfType("background");
        const reducedBackgrounds = strapi
          .service("plugin::pabu.str")
          .reduceBackgroundJsonData(backgrounds);

        for (let index = 0; index < settingData.length; index++) {
          // Append backgrounds-Options to all contentElementSettings.
          // Note: If we need additional "pick from all existing store entries of type x" fields on all
          // contentElements, we should change this to a "cms-User-only-fetched" json like for example store.json.
          // that includes all store-Entries.
          if (settingData[index].setting && settingData[index].setting[0]) {
            if (!settingData[index].setting[0].backgrounds) {
              settingData[index].setting[0].backgrounds = reducedBackgrounds;
            } else {
              strapi.log.error(
                `Could not add .background to contentElementSettings (id: ${settingData[index].id}). backgrounds-Attribute already exists!`
              );
            }
          }

          // Remove unnecessary dynamic zone array on cesstr-Entries.
          settingData[index] = strapi
            .service("plugin::pabu.settings")
            .removeDynamicZoneArrayStructure(settingData[index], "setting");
        }
      }

      // sepcial handling glbl
      if (settingData && setting === "glbl") {
        // add specific fields to the globalsettings object
        const cmsSettings: CmsSettings = await strapi
          .plugin("pabu")
          .service("pbcmssettings")
          .getCmsSettings();

        settingData.recaptchaV2 = {
          publicKey:
            cmsSettings?.googlerecaptchav2?.recaptchav2publickey ?? null,
        };
      }

      await strapi
        .service("plugin::pabu.settings")
        .createSettingsJSON(setting, settingData, false);

      // Special Handling glbl
      if (settingData && setting === "glbl") {
        strapi.log.info(`regenerateSettingsJSONs: Regenerate global.css`);
        await strapi.service("plugin::pabu.glbl").createCSS(settingData);
      }
    }
  },

  /**
   * createNecessaryFolders
   * @returns
   */
  async createNecessaryFolders() {
    // Add necessary folders here.
    const necessaryFolders = ["public/assets/", "public/assets/fonts/"];

    for (const necessaryFolder of necessaryFolders) {
      const folderPath = `${process.cwd()}/${necessaryFolder}`;
      if (!fs.pathExistsSync(folderPath)) {
        try {
          await fs.mkdir(folderPath);
          strapi.log.info(`[PB]: Created ${folderPath}.`);
        } catch (e) {
          strapi.log.error(`[PB]: Could not create ${folderPath}!`, e);
        }
      }
    }
  },
};
