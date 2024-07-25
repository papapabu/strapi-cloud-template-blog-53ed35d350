import { STORE_MODULE_UID, SYSTEM_MODULE_UID } from "../constants";
import pbEntityService from "./pbEntityService";

const fs = require("fs-extra");

const getRootFolder = () => {
  return process.env.NODE_ENV === "development" ? "" : process.cwd() + "/";
};

export default {
  /**
   * Copy strapi strapiFileObject into /public/assets/fonts
   * @param {String} fileName name inside the fonts directory.
   * @param {Object} strapiFileObject which copy to fonts directory
   */
  async copyFontFile(fileName, strapiFileObject) {
    // Note: In the current state we only allow .ttf-Font-Files.
    if (!strapiFileObject || strapiFileObject.ext !== ".ttf") {
      // default & fallbackFont will not result in error.
      if (fileName !== "Barlow" && fileName !== "Roboto-Regular") {
        strapi.log.error(
          `Missing or incorrect fontFile (${strapiFileObject?.ext}).`
        );
      }
      return;
    }
    const path = `${getRootFolder()}public/assets/fonts/${fileName}`;
    const filePath = `${path}/${fileName}${strapiFileObject.ext}`;
    try {
      if (!fs.existsSync(path)) {
        fs.mkdirSync(path);
      }
      if (fs.existsSync(filePath)) {
        fs.removeSync(filePath);
      }
      fs.copyFileSync(
        `${getRootFolder()}public${strapiFileObject.url}`,
        filePath
      );
    } catch (error) {
      strapi.log.error(
        `error while trying to create ${getRootFolder()}public/assets/fonts/${fileName}`
      );
      strapi.log.debug(error);
    }
  },
  /**
   * Compares uploaded fonts from store with name of fonts in pbSystem.systemFiles.
   * Removes fonts from pbSystem.systemFiles if store entry does not exist.
   */
  async cleanFonts() {
    // const storeFontEntries: Array<StoreEntry> | null =
    const storeFontEntries: Array<any> | null = (await pbEntityService.findMany(
      STORE_MODULE_UID,
      {
        fields: ["*"],
        filters: {
          name: {
            $startsWith: "font:",
          },
        },
        sort: {},
        populate: "pb-deep",
      }
    )) as any;

    if (!storeFontEntries) {
      return;
    }

    let storeFontNames: Array<String> = [];
    for (const storeFont of storeFontEntries) {
      if (storeFont.setting[0] && storeFont.setting[0].fontName) {
        storeFontNames.push(`${storeFont.setting[0].fontName}-${storeFont.id}`);
      }
    }

    const pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {
      populate: "pb-deep",
    });
    if (pbSystem && pbSystem.systemFiles && pbSystem.systemFiles.fonts) {
      for (const systemFileFontName of Object.keys(
        pbSystem.systemFiles.fonts
      )) {
        if (!storeFontNames.includes(systemFileFontName)) {
          await strapi
            .service("plugin::pabu.pbsystem")
            .removeFromSystemFiles(systemFileFontName, "fonts");
        }
      }
    }
  },
};
