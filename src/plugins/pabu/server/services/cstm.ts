import { minify } from "html-minifier";

export default {
  async createHeadAndBodyScripts() {
    const customData = await strapi
      .service("plugin::pabu.settings")
      .fetchSettingsData("custom");

    const minifierOptions = {
      removeComments: true,
      removeRedundantAttributes: true,
      collapseWhitespace: true,
      minifyJS: true,
      minifyCSS: true,
      preventAttributesEscaping: true,
    };

    const minifiedHeadScripts = minify(customData.headScripts, minifierOptions);
    const minifiedBodyScripts = minify(customData.bodyScripts, minifierOptions);

    // Note: previously createOrUpdateFile:
    await strapi
      .service("plugin::pabu.pbsystem")
      .createSystemStrapiFile(
        minifiedHeadScripts,
        `head`,
        "html",
        "text/html",
        null,
        "uploads",
        null
      );
    // Note: previously createOrUpdateFile:
    await strapi
      .service("plugin::pabu.pbsystem")
      .createSystemStrapiFile(
        minifiedBodyScripts,
        `body`,
        "html",
        "text/html",
        null,
        "uploads",
        null
      );
  },
};
