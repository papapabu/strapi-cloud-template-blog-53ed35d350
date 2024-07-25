import {
  BODY_SELECTOR,
  BUTTON_DEFAULT_SETTING,
  HARDCODED_MOBILE_SCALING_FACTOR,
  HARDCODED_TABLET_SCALING_FACTOR,
  LINK_DEFAULT_SETTING,
  RICHTEXT_CONTENT_SELECTOR,
  SYSTEM_MODULE_UID,
  TYPOGRAPHY_H1_DEFAULT_SETTING,
  TYPOGRAPHY_H2_DEFAULT_SETTING,
  TYPOGRAPHY_H3_DEFAULT_SETTING,
  TYPOGRAPHY_H4_DEFAULT_SETTING,
  TYPOGRAPHY_H5_DEFAULT_SETTING,
  TYPOGRAPHY_H6_DEFAULT_SETTING,
  TYPOGRAPHY_P_DEFAULT_SETTING,
} from "../constants";
import pbEntityService from "./pbEntityService";

const { minify } = require("csso");

export default {
  /**
   * createCSS:
   * Transforms the configuration done in global to CSS.
   * The minified CSS is used by the frontend.
   * @param {Object} globalData
   * @returns
   */
  async createCSS(globalData = null as any) {
    if (!globalData) {
      globalData = await strapi
        .service("plugin::pabu.settings")
        .fetchSettingsData("glbl");
    }
    const cssStrings: Array<String> = [];

    // Note: breakpoints are the UPPER limit of each breakpoint.
    const {
      mobile: breakpointMobile,
      tablet: breakpointTablet,
      desktop: breakpointDesktop,
      wqhd: breakpointWqhd,
    } = globalData.responsive?.breakpoints;
    const {
      mobile: sfVerticalPaddingMobile,
      tablet: sfVerticalPaddingTablet,
      desktop: sfVerticalPaddingDesktop,
      wqhd: sfVerticalPaddingWqhd,
    } = globalData.layout?.scalingfactorVerticalPadding;
    const {
      verticalpadding,
      verticalpaddingafterfirstelement,
      verticalpaddingbeforefooter,
    } = globalData.layout;

    // Googlefont & Font Handling
    const {
      storeFonts,
      fallbackFont,
      storeFontsCssVariables,
      storeFontsCss,
      fontFaces,
    } = await strapi.service("plugin::pabu.glbl").processStoreFonts();
    cssStrings.push(fontFaces);

    const base = `
    html {
      font-size: 62.5%;
    }\n`;
    cssStrings.push(base);

    // :root {
    // Place cssVariables that have no special scope here:
    const variablesStart = `:root {`;
    cssStrings.push(variablesStart);

    // store.color
    const storeColors = await strapi
      .service("plugin::pabu.glbl")
      .getAllStoreColors();

    const colors = `\n${strapi
      .service("plugin::pabu.glbl")
      .getAllStoreColorsAsCSS(storeColors)}`;
    cssStrings.push(colors);

    // Layout container bgcolor
    cssStrings.push(
      `\n--global-layout-container-bg-color: ${strapi
        .service("plugin::pabu.glbl")
        .getStoreColorCss(
          storeColors,
          globalData.layout?.containerBgColor,
          "#fff"
        )};`
    );

    // store.font
    const fontsAsVariables = `\n${storeFontsCssVariables}`;
    cssStrings.push(fontsAsVariables);

    const variablesEnd = `\n}\n`;
    cssStrings.push(variablesEnd);
    // :root } - End

    // store.typography
    const storeTypographys = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("typography");

    /**
     * getStoreEntryCss
     * Returns the storeEntry CSS-String.
     * @param storeEntry
     * @param classSelector String
     * @param customAdditionalCss String
     * @returns
     */
    const getStoreEntryCss = (
      storeEntry: any,
      classSelector: string,
      customAdditionalCss: string = ""
    ) => {
      const elementCss = `\n
      ${classSelector} {
        ${storeEntry.cssVariables ? storeEntry.cssVariables : ""}
        ${storeEntry.fontFamily ? storeEntry.fontFamily : ""}
        ${storeEntry.fontSizeMobile ? storeEntry.fontSizeMobile : ""}
        ${storeEntry.fontWeight ? storeEntry.fontWeight : ""}
        ${storeEntry.lineHeight ? storeEntry.lineHeight : ""}
        ${storeEntry.color ? storeEntry.color : ""}
        ${storeEntry.border ? sanitizeCss(storeEntry.border) : ""}
        ${storeEntry.buttonPadding ? storeEntry.buttonPadding : ""}
        ${storeEntry.buttonWidth ? storeEntry.buttonWidth : ""}
        ${storeEntry.buttonColor ? storeEntry.buttonColor : ""}
        ${storeEntry.textDecoration ? storeEntry.textDecoration : ""}

        ${
          storeEntry.additionalCss
            ? `/* Additional CSS: */\n ${sanitizeCss(storeEntry.additionalCss)}`
            : ""
        }
      }
      ${
        storeEntry.marginRichText
          ? `
          /* marginRichText: */
          ${
            classSelector.includes(",")
              ? classSelector
                  .split(",")
                  .map(
                    (className) =>
                      `${
                        className.includes(BODY_SELECTOR)
                          ? `${BODY_SELECTOR} `
                          : ""
                      }${
                        className.includes(RICHTEXT_CONTENT_SELECTOR)
                          ? ""
                          : `${RICHTEXT_CONTENT_SELECTOR} `
                      } ${className.replace(BODY_SELECTOR, "")}`
                  )
              : `${
                  classSelector.includes(BODY_SELECTOR)
                    ? `${BODY_SELECTOR} `
                    : ""
                }${
                  classSelector.includes(RICHTEXT_CONTENT_SELECTOR)
                    ? ""
                    : `${RICHTEXT_CONTENT_SELECTOR} `
                }${classSelector.replace(BODY_SELECTOR, "")}`
          } {
            ${storeEntry.marginRichText}
        }`
          : ""
      }
      ${
        storeEntry.additionalCssHover ||
        storeEntry.colorHover ||
        storeEntry.buttonColorHover
          ? `\n
        ${
          classSelector.includes(",")
            ? classSelector.split(",").map((className) => `${className}:hover`)
            : `${classSelector}:hover`
        } {
          ${storeEntry.buttonColorHover ? storeEntry.buttonColorHover : ""}
          ${storeEntry.colorHover ? storeEntry.colorHover : ""}

          ${
            storeEntry.additionalCssHover
              ? `/* Additional CSS Hover: */\n ${sanitizeCss(
                  storeEntry.additionalCssHover
                )}`
              : ""
          }
        }`
          : ""
      }
      @media (min-width: ${breakpointTablet}px) {
        ${classSelector} {
          ${storeEntry.fontSizeDesktop ? storeEntry.fontSizeDesktop : ""}
        }
      }
      ${customAdditionalCss}
    `;
      return elementCss;
    };

    /**
     * getAllTypographysAsCSS
     * Returns a combined string of all existing typography CSS strings.
     * @returns
     */
    const getAllTypographysAsCSS = () => {
      const typographysDefaultCss: Array<string> = [];
      const typographysCss: Array<string> = [];

      // Overwriting bootstrap typography styling
      const typographyStyle = `p, .p, h1, .h1, h2, .h2, h3, .h3, h4, .h4, h5, .h5, h6, .h6 {
        margin-bottom: 0 !important;
      }`;
      typographysDefaultCss.push(typographyStyle);

      // p
      const paragraphs = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "p" },
          TYPOGRAPHY_P_DEFAULT_SETTING
        );
      for (let index = 0; index < paragraphs.length; index++) {
        const paragraphTypography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            paragraphs[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = paragraphs[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          // customAddition:
          // The default paragraph styling is applied to some specific other elements.

          let customAddition = "";
          // Overwrite bootstrap styling that colludes with p-like styling.
          customAddition =
            customAddition +
            `
          body {
            --bs-body-font-size: unset;
            ${paragraphTypography.fontSizeMobile}
          }
          @media (min-width: ${breakpointTablet}px) {
            body {
              --bs-body-font-size: unset;
              ${paragraphTypography.fontSizeDesktop}
            }
          }`;

          // RTE
          const richTextLinkSelector = `${RICHTEXT_CONTENT_SELECTOR} li`;
          customAddition =
            customAddition +
            `
          ${richTextLinkSelector} {
            ${paragraphTypography.fontFamily}
            ${paragraphTypography.lineHeight}
            ${paragraphTypography.fontWeight}
            ${paragraphTypography.color}
            ${paragraphTypography.fontSizeMobile}
          }
          @media (min-width: ${breakpointTablet}px) {
            ${richTextLinkSelector} {
              ${paragraphTypography.fontSizeDesktop}
            }
          }`;

          typographysDefaultCss.push(
            getStoreEntryCss(
              paragraphTypography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                paragraphs[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`,
              customAddition
            )
          );
        }
        if (paragraphs[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              paragraphTypography,
              `${BODY_SELECTOR} .str-typography-${paragraphs[index].id}`
            )
          );
        }
      }

      // h1
      const h1s = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "h1" },
          TYPOGRAPHY_H1_DEFAULT_SETTING
        );
      for (let index = 0; index < h1s.length; index++) {
        const h1Typography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            h1s[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = h1s[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              h1Typography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                h1s[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (h1s[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              h1Typography,
              `${BODY_SELECTOR} .str-typography-${h1s[index].id}`
            )
          );
        }
      }

      // h2
      const h2s = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "h2" },
          TYPOGRAPHY_H2_DEFAULT_SETTING
        );
      for (let index = 0; index < h2s.length; index++) {
        const h2Typography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            h2s[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = h2s[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              h2Typography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                h2s[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (h2s[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              h2Typography,
              `${BODY_SELECTOR} .str-typography-${h2s[index].id}`
            )
          );
        }
      }

      // h3
      const h3s = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "h3" },
          TYPOGRAPHY_H3_DEFAULT_SETTING
        );
      for (let index = 0; index < h3s.length; index++) {
        const h3Typography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            h3s[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = h3s[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              h3Typography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                h3s[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (h3s[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              h3Typography,
              `${BODY_SELECTOR} .str-typography-${h3s[index].id}`
            )
          );
        }
      }

      // h4
      const h4s = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "h4" },
          TYPOGRAPHY_H4_DEFAULT_SETTING
        );
      for (let index = 0; index < h4s.length; index++) {
        const h4Typography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            h4s[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = h4s[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              h4Typography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                h4s[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (h4s[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              h4Typography,
              `${BODY_SELECTOR} .str-typography-${h4s[index].id}`
            )
          );
        }
      }

      // h5
      const h5s = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "h5" },
          TYPOGRAPHY_H5_DEFAULT_SETTING
        );
      for (let index = 0; index < h5s.length; index++) {
        const h5Typography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            h5s[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = h5s[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              h5Typography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                h5s[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (h5s[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              h5Typography,
              `${BODY_SELECTOR} .str-typography-${h5s[index].id}`
            )
          );
        }
      }

      // h6
      const h6s = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(
          storeTypographys,
          { htmlElement: "h6" },
          TYPOGRAPHY_H6_DEFAULT_SETTING
        );
      for (let index = 0; index < h6s.length; index++) {
        const h6Typography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            h6s[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = h6s[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              h6Typography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                h6s[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (h6s[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              h6Typography,
              `${BODY_SELECTOR} .str-typography-${h6s[index].id}`
            )
          );
        }
      }

      // unspecified
      const unspecifieds = strapi
        .service("plugin::pabu.glbl")
        .filterAndSortStoreEntries(storeTypographys, {
          htmlElement: "unspecified",
        });
      for (let index = 0; index < unspecifieds.length; index++) {
        const unspecifiedTypography = strapi
          .service("plugin::pabu.glbl")
          .extractStoreObject(
            unspecifieds[index],
            storeFonts,
            fallbackFont,
            storeColors
          );
        const htmlElement = unspecifieds[index].setting[0].htmlElement;
        // default
        if (index === 0) {
          typographysDefaultCss.push(
            getStoreEntryCss(
              unspecifiedTypography,
              `${BODY_SELECTOR} ${htmlElement}, ${BODY_SELECTOR} .${htmlElement}${
                unspecifieds[index].id === 0
                  ? `, ${BODY_SELECTOR} .str-typography-${htmlElement}-0`
                  : ""
              }`
            )
          );
        }
        if (unspecifieds[index].id !== 0) {
          // with typography-selector
          typographysCss.push(
            getStoreEntryCss(
              unspecifiedTypography,
              `${BODY_SELECTOR} .str-typography-${unspecifieds[index].id}`
            )
          );
        }
      }
      return typographysDefaultCss.join("") + "\n" + typographysCss.join("");
    };

    const typographys = `${getAllTypographysAsCSS()}`;
    cssStrings.push(typographys);

    // store.background (Access via: .str-background-{id})
    const storeBackgrounds = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("background");
    let backgroundCss = "";
    for (const storeBackground of storeBackgrounds) {
      backgroundCss =
        backgroundCss + `/*str-background-${storeBackground.id}*/\n`;
      if (storeBackground.setting[0]) {
        backgroundCss =
          backgroundCss +
          `.str-background-${storeBackground.id} {
            ${
              storeBackground.setting[0].backgroundImage
                ? `background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/api${storeBackground.setting[0].backgroundImage.url});`
                : ""
            }
            ${storeBackground.setting[0].additionalCss}
          }\n
          .str-background-${storeBackground.id}-preview {
          ${
            storeBackground.setting[0].backgroundImage
              ? `background-image: url(${
                  process.env.PABU_PUBLIC_FRONTEND_URL
                }/api${
                  storeBackground.setting[0].backgroundImage.formats?.thumbnail
                    ?.url
                    ? storeBackground.setting[0].backgroundImage.formats
                        .thumbnail.url
                    : storeBackground.setting[0].backgroundImage.url
                });`
              : ""
          }
            ${storeBackground.setting[0].additionalCss}
          }
          ${
            storeBackground.setting[0].additionalCssHover
              ? `.str-background-${storeBackground.id}:hover, .str-background-${storeBackground.id}-preview:hover {
            ${storeBackground.setting[0].additionalCssHover}
          }\n`
              : ""
          }`;
      }
    }
    cssStrings.push(backgroundCss);

    const containerWidth = `
      .page.content {
        background-color: var(--global-layout-container-bg-color);
        max-width: ${globalData.layout?.containerWidth || "100%"};
        margin-left: auto;
        margin-right: auto;
      }`;
    cssStrings.push(containerWidth);

    const verticalPaddings = `
      @media (min-width: 0px) {
      .main .page.content #draft-page .content-element,
      .main .page.content #page .content-element {
          padding-top: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingMobile : 0
          }px;
          padding-bottom: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingMobile : 0
          }px;
        }
      }
      @media (min-width: ${breakpointMobile}px) {
      .main .page.content #draft-page .content-element,
      .main .page.content #page .content-element {
          padding-top: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingTablet : 0
          }px;
          padding-bottom: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingTablet : 0
          }px;
        }
      }
      @media (min-width: ${breakpointTablet}px) {
      .main .page.content #draft-page .content-element,
      .main .page.content #page .content-element {
          padding-top: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingDesktop : 0
          }px;
          padding-bottom: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingDesktop : 0
          }px;
        }
      }
      @media (min-width: ${breakpointDesktop}px) {
      .main .page.content #draft-page .content-element,
      .main .page.content #page .content-element {
          padding-top: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingWqhd : 0
          }px;
          padding-bottom: ${
            verticalpadding ? verticalpadding * sfVerticalPaddingWqhd : 0
          }px;
        }
      }`;
    cssStrings.push(verticalPaddings);

    // Hardcoded padding-top of first-element.
    // Note: If you want to have a padding before the first element: Use the spacer.
    if (
      verticalpaddingafterfirstelement ||
      verticalpaddingafterfirstelement === 0
    ) {
      const verticalPaddingsAfterFirstElement = `
        @media (min-width: 0px) {
          .main .page.content #draft-page .content-element.first-element,
          .main .page.content #page .content-element.first-element {
            padding-top: 0px !important;
            padding-bottom: ${
              verticalpaddingafterfirstelement * sfVerticalPaddingMobile
            }px;
          }
        }
        @media (min-width: ${breakpointMobile}px) {
          .main .page.content #draft-page .content-element.first-element,
          .main .page.content #page .content-element.first-element {
            padding-top: 0px !important;
            padding-bottom: ${
              verticalpaddingafterfirstelement * sfVerticalPaddingTablet
            }px;
          }
        }
        @media (min-width: ${breakpointTablet}px) {
          .main .page.content #draft-page .content-element.first-element,
          .main .page.content #page .content-element.first-element {
            padding-top: 0px !important;
            padding-bottom: ${
              verticalpaddingafterfirstelement * sfVerticalPaddingDesktop
            }px;
          }
        }
        @media (min-width: ${breakpointDesktop}px) {
          .main .page.content #draft-page .content-element.first-element,
          .main .page.content #page .content-element.first-element {
            padding-top: 0px !important;
            padding-bottom: ${
              verticalpaddingafterfirstelement * sfVerticalPaddingWqhd
            }px;
          }
        }`;
      cssStrings.push(verticalPaddingsAfterFirstElement);
    }

    if (verticalpaddingbeforefooter || verticalpaddingbeforefooter === 0) {
      const verticalPaddingsAfterLastElement = `
        /* last content-element padding-bottom */
        @media (min-width: 0px) {
          .main .page.content #draft-page .content-element.last-element,
          .main .page.content #page .content-element.last-element {
            padding-bottom: ${
              verticalpaddingbeforefooter * sfVerticalPaddingMobile
            }px;
          }
        }
        @media (min-width: ${breakpointMobile}px) {
          .main .page.content #draft-page .content-element.last-element,
          .main .page.content #page .content-element.last-element {
            padding-bottom: ${
              verticalpaddingbeforefooter * sfVerticalPaddingTablet
            }px;
          }
        }
        @media (min-width: ${breakpointTablet}px) {
          .main .page.content #draft-page .content-element.last-element,
          .main .page.content #page .content-element.last-element {
            padding-bottom: ${
              verticalpaddingbeforefooter * sfVerticalPaddingDesktop
            }px;
          }
        }
        @media (min-width: ${breakpointDesktop}px) {
          .main .page.content #draft-page .content-element.last-element,
          .main .page.content #page .content-element.last-element {
            padding-bottom: ${
              verticalpaddingbeforefooter * sfVerticalPaddingWqhd
            }px;
          }
        }
      `;
      cssStrings.push(verticalPaddingsAfterLastElement);
    }

    // store.link
    // this styles all a tags with the class .pb-link
    // all richtext links are not affected from this generated selector
    const storeLinks = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("link");
    const links = strapi
      .service("plugin::pabu.glbl")
      .filterAndSortStoreEntries(storeLinks, null, LINK_DEFAULT_SETTING);
    let linksCss: Array<string> = [];
    for (let index = 0; index < links.length; index++) {
      const linkObject = strapi
        .service("plugin::pabu.glbl")
        .extractStoreObject(
          links[index],
          storeFonts,
          fallbackFont,
          storeColors
        );
      const selector = "a.pb-link";
      // default
      if (index === 0) {
        linksCss.push(
          getStoreEntryCss(
            linkObject,
            `${BODY_SELECTOR} ${selector}, ${BODY_SELECTOR} .${selector}${
              links[index].id === 0 ? `, ${BODY_SELECTOR} .str-link-0` : ""
            }`
          )
        );
      }
      if (links[index].id !== 0) {
        // with typography-selector
        linksCss.push(
          getStoreEntryCss(
            linkObject,
            `${BODY_SELECTOR} .str-link-${links[index].id}`
          )
        );
      }
    }
    cssStrings.push(linksCss.join(""));

    // store.button
    const storeButtons = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("button");
    const buttons = strapi
      .service("plugin::pabu.glbl")
      .filterAndSortStoreEntries(storeButtons, null, BUTTON_DEFAULT_SETTING);
    let buttonsCss: Array<string> = [];
    for (let index = 0; index < buttons.length; index++) {
      const buttonObject = strapi
        .service("plugin::pabu.glbl")
        .extractStoreObject(
          buttons[index],
          storeFonts,
          fallbackFont,
          storeColors
        );

      const selector = ".default-btn .mui-cms-button.MuiButtonBase-root";
      // default
      if (index === 0) {
        buttonsCss.push(
          getStoreEntryCss(
            buttonObject,
            `${BODY_SELECTOR} ${selector}${
              buttons[index].id === 0 ? `, ${BODY_SELECTOR} .str-button-0` : ""
            }`
          )
        );
      }
      if (buttons[index].id !== 0) {
        // with id className-selector
        buttonsCss.push(
          getStoreEntryCss(
            buttonObject,
            `.str-button-${buttons[index].id} .mui-cms-button.MuiButtonBase-root`
          )
        );
      }
    }
    cssStrings.push(buttonsCss.join(""));

    // fonts as cssClassNames
    const fontsAsCssClasses = `\n${storeFontsCss}`;
    cssStrings.push(fontsAsCssClasses);

    // store.color by className
    let colorsAsCssClasses = "";
    for (const storeColorValue of Object.values(storeColors)) {
      colorsAsCssClasses =
        colorsAsCssClasses +
        /* @ts-ignore */
        `\n${BODY_SELECTOR} ${storeColorValue.cssVariable.replaceAll(
          "--",
          "."
        )} {
        ${/* @ts-ignore */ ""}
        color: var(${storeColorValue.cssVariable});
        }`;
    }
    cssStrings.push(colorsAsCssClasses);

    // RTE:
    const richtextCestrs = await strapi
      .service("plugin::pabu.cesstr")
      .getAllCesStoreEntriesOfType("richtext");
    let richtextCss: Array<String> = [`\n /* richtext */ \n`];
    for (const richtext of richtextCestrs) {
      richtextCss.push(`/* .cesstr-richtext-${richtext.id} */\n`);

      // rte.p
      if (richtext.setting[0]?.ptypography?.values[0]) {
        const pTypography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].ptypography.values[0]
        );
        if (pTypography) {
          const p = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              pTypography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          // .rte-p & li (p-styling)
          richtextCss.push(
            getStoreEntryCss(
              p,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} p, ${BODY_SELECTOR} .cesstr-richtext-${richtext.id} li`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].ptypography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-p"-Selector.`
          );
        }
      }
      // rte.h1
      if (richtext.setting[0]?.h1typography?.values[0]) {
        const h1Typography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].h1typography.values[0]
        );
        if (h1Typography) {
          const h1 = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              h1Typography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              h1,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} h1`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].h1typography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-h1"-Selector.`
          );
        }
      }
      // rte.h2
      if (richtext.setting[0]?.h2typography?.values[0]) {
        const h2Typography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].h2typography.values[0]
        );
        if (h2Typography) {
          const h2 = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              h2Typography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              h2,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} h2`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].h2typography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-h2"-Selector.`
          );
        }
      }
      // rte.h3
      if (richtext.setting[0]?.h3typography?.values[0]) {
        const h3Typography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].h3typography.values[0]
        );
        if (h3Typography) {
          const h3 = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              h3Typography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              h3,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} h3`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].h3typography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-h3"-Selector.`
          );
        }
      }
      // rte.h4
      if (richtext.setting[0]?.h4typography?.values[0]) {
        const h4Typography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].h4typography.values[0]
        );
        if (h4Typography) {
          const h4 = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              h4Typography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              h4,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} h4`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].h4typography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-h4"-Selector.`
          );
        }
      }
      // rte.h5
      if (richtext.setting[0]?.h5typography?.values[0]) {
        const h5Typography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].h5typography.values[0]
        );
        if (h5Typography) {
          const h5 = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              h5Typography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              h5,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} h5`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].h5typography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-h5"-Selector.`
          );
        }
      }
      // rte.h6
      if (richtext.setting[0]?.h6typography?.values[0]) {
        const h6Typography = storeTypographys.find(
          (typography) =>
            typography.id === richtext.setting[0].h6typography.values[0]
        );
        if (h6Typography) {
          const h6 = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              h6Typography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              h6,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} h6`
            )
          );
        } else {
          strapi.log.debug(
            `Missing typography [id: ${richtext.setting[0].h6typography.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-h6"-Selector.`
          );
        }
      }
      // rte.link
      if (richtext.setting[0]?.link?.values[0]) {
        const linkTypography = storeLinks.find(
          (link) => link.id === richtext.setting[0].link.values[0]
        );
        if (linkTypography) {
          const link = strapi
            .service("plugin::pabu.glbl")
            .extractStoreObject(
              linkTypography,
              storeFonts,
              fallbackFont,
              storeColors
            );
          richtextCss.push(
            getStoreEntryCss(
              link,
              `${BODY_SELECTOR} .cesstr-richtext-${richtext.id} a`
            )
          );
        } else {
          strapi.log.debug(
            `Missing link [id: ${richtext.setting[0].link.values[0]}] for ".cesstr-richtext-${richtext.id} .rte-link"-Selector.`
          );
        }
      }

      if (richtext.setting[0]?.fontColors?.values?.length > 0) {
        richtextCss.push(`\n /* RTE Colors */ \n`);
        for (
          let index = 0;
          index < richtext.setting[0].fontColors.values.length;
          index++
        ) {
          const storeColorId = richtext.setting[0].fontColors.values[index];
          richtextCss.push(
            `\n${BODY_SELECTOR} .cesstr-richtext-${richtext.id} .rte-color-${storeColorId} {
                 color: var(--str-color-${storeColorId});
               }`
          );
        }
      }

      // additional styling for richtext
      richtextCss.push(
        `.cesstr-richtext-${richtext.id} {
          padding-left: ${pixelToRem(
            (richtext.setting[0]?.textPadding.left || 0) *
              HARDCODED_MOBILE_SCALING_FACTOR
          )};
          padding-right: ${pixelToRem(
            (richtext.setting[0]?.textPadding.right || 0) *
              HARDCODED_MOBILE_SCALING_FACTOR
          )};
        }

        @media (min-width: ${breakpointMobile}px) {
          .cesstr-richtext-${richtext.id} {
            padding-left: ${pixelToRem(
              (richtext.setting[0]?.textPadding.left || 0) *
                HARDCODED_TABLET_SCALING_FACTOR
            )};
            padding-right: ${pixelToRem(
              (richtext.setting[0]?.textPadding.right || 0) *
                HARDCODED_TABLET_SCALING_FACTOR
            )};
          }
        }

        @media (min-width: ${breakpointTablet}px) {
          .cesstr-richtext-${richtext.id} {
            padding-left: ${pixelToRem(
              richtext.setting[0]?.textPadding.left || 0
            )};
            padding-right: ${pixelToRem(
              richtext.setting[0]?.textPadding.right || 0
            )};
          }
        }`
      );
    }
    cssStrings.push(richtextCss.join(""));

    // store.icon
    const storeIcons = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("icon");

    let iconCss = "";

    for (const icon of storeIcons) {
      const iconUrl = icon.setting[0].icon.formats?.thumbnail.url;
      iconCss += `\n/*str-icon-${icon.id}*/\n`;
      iconCss += `.str-icon-${icon.id} {
        background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/api${iconUrl});
      }`;
    }
    cssStrings.push(iconCss);

    // store.arrows
    // Use .str-arrows-${arrows.id} on container and .right-arrow / .left-arrow inside.
    const storeArrows = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("arrows");
    let arrowsCss = "";

    arrowsCss = `
    .arrow-container .left-arrow, .arrow-container .right-arrow {
      padding: 10px !important;
      border: none;
      height: 100% !important;
      background-color: transparent;
      background-size: contain;
      background-repeat: no-repeat;
      background-position: center;
    }
    `;

    if (storeArrows.length === 0) {
      arrowsCss =
        arrowsCss +
        `.arrow-container .left-arrow, .arrow-container .right-arrow {
            width: 25px;
            height: 25px;
          }
          @media (min-width: ${breakpointMobile}px) {
            .arrow-container .left-arrow, .arrow-container .right-arrow {
              width: 50px;
              height: 50px;
            }
          }
          @media (min-width: ${breakpointTablet}px) {
            .arrow-container .left-arrow, .arrow-container .right-arrow {
              width: 75px;
              height: 75px;
            }
          }
          .arrow-container .left-arrow {
            background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/svg/fontAwesome/chevron-left-light.svg);
          }
          .arrow-container .right-arrow {
            background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/svg/fontAwesome/chevron-right-light.svg);
          }
          `;
    }

    for (const arrows of storeArrows) {
      arrowsCss = arrowsCss + `/*str-arrows-${arrows.id}*/\n`;
      if (arrows.setting[0]) {
        arrowsCss =
          arrowsCss +
          `.str-arrows-${arrows.id} {
            display: ${arrows.setting[0].hideArrowsOnMobile ? "none" : "flex"};
          }
          @media (min-width: ${breakpointMobile}px) {
            .str-arrows-${arrows.id} {
              display: ${
                arrows.setting[0].hideArrowsOnTablet ? "none" : "flex"
              };
            }
          }
          @media (min-width: ${breakpointTablet}px) {
            .str-arrows-${arrows.id} {
              display: ${
                arrows.setting[0].hideArrowsOnDesktop ? "none" : "flex"
              };
            }
          }
          ` +
          `.str-arrows-${arrows.id} svg, .str-arrows-${
            arrows.id
          } img[src$=".svg"] {
              filter: ${
                arrows.setting[0].arrowSvgFilterCssAttribute
                  ? arrows.setting[0].arrowSvgFilterCssAttribute
                  : "none"
              };
          }` +
          `.str-arrows-${arrows.id} button {
              filter: ${
                arrows.setting[0].arrowSvgFilterCssAttribute
                  ? arrows.setting[0].arrowSvgFilterCssAttribute
                  : "none"
              };
          }` +
          `.str-arrows-${arrows.id}.left-arrow-container .left-arrow, .str-arrows-${arrows.id}.right-arrow-container .right-arrow {
            width: ${arrows.setting[0].arrowSize.mobile}px;
            height: ${arrows.setting[0].arrowSize.mobile}px;
          }
          @media (min-width: ${breakpointMobile}px) {
            .str-arrows-${arrows.id}.left-arrow-container .left-arrow, .str-arrows-${arrows.id}.right-arrow-container .right-arrow {
              width: ${arrows.setting[0].arrowSize.tablet}px;
              height: ${arrows.setting[0].arrowSize.tablet}px;
            }
          }
          @media (min-width: ${breakpointTablet}px) {
            .str-arrows-${arrows.id}.left-arrow-container .left-arrow, .str-arrows-${arrows.id}.right-arrow-container .right-arrow {
              width: ${arrows.setting[0].arrowSize.desktop}px;
              height: ${arrows.setting[0].arrowSize.desktop}px;
            }
          }

          ` +
          `.str-arrows-${arrows.id} .left-arrow {
            ${
              arrows.setting[0].leftArrow
                ? `background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/api${arrows.setting[0].leftArrow.url});`
                : `background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/svg/fontAwesome/chevron-left-light.svg);`
            }
          }
          .str-arrows-${arrows.id} .right-arrow{
            ${
              arrows.setting[0].rightArrow
                ? `background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/api${arrows.setting[0].rightArrow.url});`
                : `background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/svg/fontAwesome/chevron-right-light.svg);`
            }
          }

          `;
        if (!arrows.setting[0].leftArrow) {
          arrowsCss =
            arrowsCss +
            `.arrow-container .left-arrow {
            width: 25px;
            height: 25px;
          }
          @media (min-width: ${breakpointMobile}px) {
            .arrow-container .left-arrow {
              width: 50px;
              height: 50px;
            }
          }
          @media (min-width: ${breakpointTablet}px) {
            .arrow-container .left-arrow {
              width: 75px;
              height: 75px;
            }
          }
          .arrow-container .left-arrow {
            background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/svg/fontAwesome/chevron-left-light.svg);
          }
          `;
        }
        if (!arrows.setting[0].rightArrow) {
          arrowsCss =
            arrowsCss +
            `.arrow-container .right-arrow {
            width: 25px;
            height: 25px;
          }
          @media (min-width: ${breakpointMobile}px) {
            .arrow-container .right-arrow {
              width: 50px;
              height: 50px;
            }
          }
          @media (min-width: ${breakpointTablet}px) {
            .arrow-container .right-arrow {
              width: 75px;
              height: 75px;
            }
          }
          .arrow-container .right-arrow {
            background-image: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/svg/fontAwesome/chevron-right-light.svg);
          }
          `;
        }
      }
    }
    cssStrings.push(arrowsCss);

    // Footer
    // Note: Migration of current styled JSX CSS.
    // Hint: Might get a rework in the future.
    if (globalData.footer) {
      const footer = `\n\n /* Footer */ \n
      .footer-wrapper {
        display: block;
        position: relative;
        z-index: 0;
      }
      @media (min-width: ${breakpointTablet}px) {
        .footer-wrapper {
          position: ${
            globalData.footer.footerType === "parallax" ||
            globalData.footer.footerType === "sticky"
              ? "sticky"
              : "relative"
          };
          z-index: ${globalData.footer.footerType === "sticky" ? 1010 : 0};
          ${
            globalData.footer.footerType === "parallax" ||
            globalData.footer.footerType === "sticky"
              ? "bottom: 0;"
              : ""
          }
        }
      }

      .footer-wrapper .footer {
        padding-top: ${globalData.footer.verticalSpace.top}px;
        padding-bottom: 0px;
        background-color: ${strapi
          .service("plugin::pabu.glbl")
          .getStoreColorCss(storeColors, globalData.footer.bgColor, "#fff")};
        color: ${strapi
          .service("plugin::pabu.glbl")
          .getStoreColorCss(storeColors, globalData.footer.fontColor)};
        min-height: 100px;
        bottom: 0;
        z-index: 5;
        position: relative;
        width: 100%;
        ${globalData.footer.border}
        ${globalData.footer.additionalCss}
      }

      .footer-wrapper .footer.footer-sticky-edit-mode {
        max-height: 60%;
        overflow-y: auto;
      }

      .footer-wrapper .footer .footer-content {
        max-width: 100%;
        padding-bottom: ${globalData.footer.verticalSpace.bottom}px;
      }

      .footer-wrapper .footer .footer-content-right {
        padding-left: 15px;
      }

      .footer-wrapper .footer .footerPlaceholder {
        height: 100px;
        z-index: 1;
      }

      .footer-wrapper .footer .footer-copyright {
        background-color: #fff;
        color: #000;
       }

      .footer-wrapper .footer .footer-copyright .row,
      .footer-wrapper .footer .footer-copyright .row > * {
        --bs-gutter-x: 0 !important;
      }

      .footer-wrapper .footer .custom {
        color: ${strapi
          .service("plugin::pabu.glbl")
          .getStoreColorCss(storeColors, globalData.footer.fontColor)};
        text-decoration: none;
        cursor: pointer;
      }

      /* footerContentStyle: */
      .footer-col .ql-editor p a {
        color: ${strapi
          .service("plugin::pabu.glbl")
          .getStoreColorCss(storeColors, globalData.footer.linkFontColor)};
      }

      .footer-col .ql-editor p a:hover {
        color: ${strapi
          .service("plugin::pabu.glbl")
          .getStoreColorCss(storeColors, globalData.footer.linkFontColorHover)};
      }

      .footer-col .ql-editor p {
        hyphens: auto;
      }
      @media (min-width: ${breakpointTablet}px) {
        .footer-col .ql-editor p {
          word-break: break-word;
          hyphens: none;
        }
      }

      `;
      cssStrings.push(footer);
    }

    // ---
    // ---
    // ---

    // End of CssString-Generation.

    // ---
    // ---
    // ---

    // Add custom.css at the end of the cssString.
    const custom = await strapi
      .service("plugin::pabu.settings")
      .fetchSettingsData("custom");

    let customCssString = "/* No custom exists */";
    if (custom) {
      customCssString = `
        ${custom.css ? custom.css : "/* No custom.css exists. */"}
        \n
        @media (min-width: ${breakpointMobile}px) {
          ${
            custom.tabletCss
              ? custom.tabletCss
              : "/*No custom.tabletCss exists.*/"
          }
        } \n
        @media (min-width: ${breakpointTablet}px) {
        ${
          custom.desktopCss
            ? custom.desktopCss
            : "/*No custom.desktopCss exists.*/"
        }
        } \n
        @media (min-width: ${breakpointDesktop}px) {
          ${custom.wqhdCss ? custom.wqhdCss : "/*No custom.wqhdCss exists.*/"}
        } \n
      `;
    }
    cssStrings.push(customCssString);

    // Combine cssStrings and create file(s)
    const cssString = cssStrings.join("");
    let minifiedCss = "";
    try {
      minifiedCss = minify(cssString).css;
    } catch (error) {
      strapi.log.error(
        "Could not minify CSS. Using the non-minified CSS instead!"
      );
      strapi.log.debug(error);
      minifiedCss = cssString;
    }

    // In case you extend our tool-kit and have trouble with generated styles:
    // Always make sure if the CSS is generated correctly in css-global.css first!
    // Note: For testing. We might keep unminified css for now & easier troubleshooting.
    // Note: previously createOrUpdateFile:
    await strapi
      .service("plugin::pabu.pbsystem")
      .createSystemStrapiFile(
        cssString,
        `css-global`,
        "css",
        "text/css",
        null,
        "uploads",
        null
      );
    // Note: We should use global.min.css in production.
    // Note: previously createOrUpdateFile:
    await strapi
      .service("plugin::pabu.pbsystem")
      .createSystemStrapiFile(
        minifiedCss,
        `css-global.min`,
        "css",
        "text/css",
        null,
        "uploads",
        null
      );
  },

  /**
   */
  async processStoreFonts() {
    const fallbackFont = {
      css: {
        fontFamily: `font-family: 'Roboto';`,
        fontFace: `\n@font-face {
          font-family: 'Roboto';
          src: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/fonts/Roboto/Roboto-Regular.ttf) format("truetype");
          font-display: block;
        }\n
        \n@font-face {
          font-family: 'Barlow';
          src: url(${process.env.PABU_PUBLIC_FRONTEND_URL}/fonts/Barlow/Barlow-Regular.ttf) format("truetype");
          font-display: block;
        }\n`,
        defaultLineHeight: "1.2",
      },
    };
    let fontFaces = `${fallbackFont.css.fontFace}`;

    const pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});

    // Googlefont & Font Handling
    const storeFonts = (await pbEntityService.findMany("plugin::pabu.str", {
      fields: ["*"],
      filters: {
        type: "font",
      },
      sort: {},
      populate: "pb-deep",
    })) as Array<any>;

    // Generate CSS for storeFonts.
    // The css.fontFamily-Attribute is used for generating CSS for the different components.
    // The fontFace is used at the beginning of the CSS-File.
    let googleFontCssImports = "";
    // store-fonts usable as css (by variable)
    let storeFontsCssVariables = "";
    // store-fonts usable as css (by class-selector)
    let storeFontsCss = "";
    for (const storeFont of storeFonts) {
      const css = {
        fontFamily: "",
      };
      let isGoogleFont =
        storeFont.setting[0] &&
        storeFont.setting[0].__component === "pb.sgglfnt"
          ? true
          : false;
      if (
        !isGoogleFont &&
        storeFont.setting[0].fontName &&
        storeFont.setting[0].fontFile
      ) {
        // font
        css.fontFamily = `font-family: '${storeFont.setting[0].fontName}';`;
        fontFaces =
          fontFaces +
          `\n@font-face {
              font-family: '${storeFont.setting[0].fontName}';
              src: ${
                pbSystem &&
                pbSystem.systemFiles &&
                pbSystem.systemFiles.fonts &&
                pbSystem.systemFiles.fonts[
                  `${storeFont.setting[0].fontName}-${storeFont.id}`
                ] &&
                pbSystem.systemFiles.fonts[
                  `${storeFont.setting[0].fontName}-${storeFont.id}`
                ].url
                  ? `url(${
                      pbSystem.systemFiles.fonts[
                        `${storeFont.setting[0].fontName}-${storeFont.id}`
                      ].systemURL
                    })`
                  : `invalid`
              };
              font-display: block;
            }\n`;
      } else if (
        isGoogleFont &&
        storeFont.setting[0].googleFontFamily &&
        storeFont.setting[0].googleFontCssImport
      ) {
        // google-font:
        css.fontFamily = `font-family: ${
          storeFont.setting[0].googleFontFamily.includes("font-family:")
            ? storeFont.setting[0].googleFontFamily
                .replace("font-family:", "")
                .replace(";", "")
            : storeFont.setting[0].googleFontFamily.replace(";", "")
        };`;
        googleFontCssImports =
          googleFontCssImports +
          storeFont.setting[0].googleFontCssImport
            .replace(/<style>/gi, "")
            .replace(/<\/style>/gi, "")
            .replace(/\)/, ");")
            .replace("display=swap", "display=block") +
          "\n";
      } else {
        // defaultFont: Barlow
        if (storeFont.setting[0].fontName === "Barlow") {
          css.fontFamily = `font-family: 'Barlow';`;
        } else {
          // No fontName && no fontFile: font
          // No fontFamily && googleFontCssImport: googleFont
          // Use fallback-Font.
          css.fontFamily = fallbackFont.css.fontFamily;
        }
      }
      let cssVariable = `--str-font-${storeFont.id}: ${css.fontFamily.replace(
        "font-family: ",
        ""
      )}`;
      storeFontsCssVariables = storeFontsCssVariables + `\n${cssVariable}`;
      storeFontsCss =
        storeFontsCss +
        `\n${BODY_SELECTOR} .str-font-${storeFont.id} {
        font-family: var(--str-font-${storeFont.id});
      }\n`;
      storeFont.css = css;
    }

    return {
      storeFonts,
      fallbackFont,
      storeFontsCssVariables,
      storeFontsCss,
      fontFaces: `${googleFontCssImports} \n ${fontFaces}`,
    };
  },

  /**
   * getAllStoreColors
   * @returns {}
   */
  async getAllStoreColors() {
    const allStoreColors = {};
    const storeColors = await strapi
      .service("plugin::pabu.str")
      .getAllStoreEntriesOfType("color");
    for (const storeColor of storeColors) {
      if (storeColor.setting[0] && storeColor.setting[0].color) {
        allStoreColors[storeColor.id] = {
          cssVariable: `--str-color-${storeColor.id}`,
          cssVariableValue: storeColor.setting[0].color,
        };
      }
    }
    return allStoreColors;
  },

  /**
   * filterAndSortStoreEntries: Also adds a fallbackSetting if no storeEntry exists.
   * @param storeEntries
   * @param filter
   * @param fallback optional
   * @returns
   */
  filterAndSortStoreEntries(
    storeEntries: any,
    filter: { [key: string]: string } | null,
    fallbackSetting: any = null
  ) {
    let filterBy = filter ? Object.keys(filter)[0] : "";
    let filteredAndSorted;

    // If filter exists, apply filter.
    if (filter && filterBy) {
      filteredAndSorted = storeEntries.filter(
        (storeEntry) => storeEntry.setting[0][filterBy] === filter[filterBy]
      );
    }

    // Sort
    filteredAndSorted = Array.isArray(filteredAndSorted)
      ? filteredAndSorted.sort((a, b) => a.id - b.id)
      : storeEntries.sort((a, b) => a.id - b.id);

    // Add fallbackSetting:
    if (
      fallbackSetting &&
      (!filteredAndSorted || filteredAndSorted.length === 0)
    ) {
      filteredAndSorted = [
        {
          id: 0,
          setting: [fallbackSetting],
        },
      ];
    }
    return filteredAndSorted;
  },

  /**
   * extractStoreObject
   * Returns a sanitized storeEntry object with css-Attributes & values.
   * @param storeEntry
   * @param storeFonts
   * @param fallbackFont
   * @param storeColors
   * @param customAddition optional This is a workaround to allow for !important on specific cssAtributes. (should be removed in a later phase)
   * @returns
   */
  extractStoreObject(
    storeEntry,
    storeFonts,
    fallbackFont,
    storeColors,
    customAddition: { fontSize: "" } | null = null
  ) {
    let usedFont =
      storeEntry.setting[0].font &&
      storeEntry.setting[0].font.values.length > 0 &&
      storeFonts.find(
        (storeFont) => storeEntry.setting[0].font.values[0] === storeFont.id
      )
        ? storeFonts.find(
            (storeFont) => storeEntry.setting[0].font.values[0] === storeFont.id
          )
        : fallbackFont;

    let storeObject = {};
    let finalStoreObject = {};

    // Link Exclusive
    if (storeEntry.type === "link") {
      storeObject = {
        // Overwrites reboot-Styling
        // Can be overwritten by using additionalCss
        ...{ textDecoration: "text-decoration: none;" },
        // Link
        ...(storeEntry.setting[0].colorHover && {
          colorHover: `color: ${strapi
            .service("plugin::pabu.glbl")
            .getStoreColorCss(storeColors, storeEntry.setting[0].colorHover)};`,
        }),
        ...(storeEntry.setting[0].additionalCssHover && {
          additionalCssHover: storeEntry.setting[0].additionalCssHover,
        }),
      };
    }

    // Button Exclusive
    if (storeEntry.type === "button") {
      storeObject = {
        // Button
        ...(storeEntry.setting[0].buttonColor && {
          buttonColor: `background-color: ${strapi
            .service("plugin::pabu.glbl")
            .getStoreColorCss(
              storeColors,
              storeEntry.setting[0].buttonColor
            )};`,
        }),
        ...(storeEntry.setting[0].buttonColorHover && {
          buttonColorHover: `background-color: ${strapi
            .service("plugin::pabu.glbl")
            .getStoreColorCss(
              storeColors,
              storeEntry.setting[0].buttonColorHover
            )};`,
        }),
        // .fontColor will override .color on the same element
        ...(!storeEntry.setting[0].color && {
          color: `color: ${strapi
            .service("plugin::pabu.glbl")
            .getStoreColorCss(storeColors, storeEntry.setting[0].fontColor)};`,
        }),
        // .fontColorHover will override .colorHover on the same element
        ...(!storeEntry.setting[0].colorHover &&
          !storeEntry.setting[0].color && {
            colorHover: `color: ${strapi
              .service("plugin::pabu.glbl")
              .getStoreColorCss(
                storeColors,
                storeEntry.setting[0].fontColorHover
              )};`,
          }),
        ...(storeEntry.setting[0].border && {
          border: storeEntry.setting[0].border,
        }),
        ...(storeEntry.setting[0].buttonPadding && {
          buttonPadding: `padding: ${pixelToRem(
            storeEntry.setting[0].buttonPadding.vertical || 0
          )} ${pixelToRem(
            storeEntry.setting[0].buttonPadding.horizontal || 0
          )} ${pixelToRem(
            storeEntry.setting[0].buttonPadding.vertical || 0
          )} ${pixelToRem(
            storeEntry.setting[0].buttonPadding.horizontal || 0
          )};`,
        }),
        ...(storeEntry.setting[0].buttonWidth && {
          buttonWidth: `width: fit-content;
              overflow: hidden;
              display: inline-block;
              text-overflow: ellipsis;
              white-space: nowrap;
              max-width: ${
                storeEntry.setting[0].buttonWidth.maxWidth !== 0
                  ? `${storeEntry.setting[0].buttonWidth.maxWidth}px`
                  : "100%"
              };
        min-width: ${
          storeEntry.setting[0].buttonWidth.minWidth !== 0
            ? `${storeEntry.setting[0].buttonWidth.minWidth}px`
            : "100%"
        };`,
        }),
      };
    }
    // All (mostly Typography):

    // Adds cssAttributes as cssVariables to css.
    // For the moment only relevant for typographys + buttons.
    const cssVariables = strapi
      .service("plugin::pabu.glbl")
      .cssAttributesAsCssVariables(
        storeEntry,
        usedFont ? usedFont.css.fontFamily : null,
        storeColors,
        storeEntry.type
      );

    /* @ts-ignore */
    finalStoreObject = {
      ...(cssVariables && { cssVariables: cssVariables }),
      ...(usedFont && { fontFamily: usedFont.css.fontFamily }),
      ...(storeEntry.setting[0].fontSize && {
        fontSizeMobile: `font-size: ${pixelToRem(
          storeEntry.setting[0].fontSize.mobile
        )}${
          customAddition && customAddition.fontSize
            ? customAddition.fontSize
            : ""
        };`,
      }),
      ...(storeEntry.setting[0].fontSize && {
        fontSizeDesktop: `font-size: ${pixelToRem(
          storeEntry.setting[0].fontSize.desktop
        )}${
          customAddition && customAddition.fontSize
            ? customAddition.fontSize
            : ""
        };`,
      }),
      ...(storeEntry.setting[0].fontWeight && {
        fontWeight: `font-weight: ${storeEntry.setting[0].fontWeight};`,
      }),
      ...(storeEntry.setting[0].lineHeight && {
        lineHeight: `line-height: ${storeEntry.setting[0].lineHeight};`,
      }),
      ...{
        color: `color: ${strapi
          .service("plugin::pabu.glbl")
          .getStoreColorCss(storeColors, storeEntry.setting[0].color)};`,
      },
      // Typography
      // marginRichText
      // Only used in RTE
      ...(storeEntry.setting[0].marginRichText && {
        marginRichText: `margin-top: ${pixelToRem(
          storeEntry.setting[0].marginRichText
        )} !important; margin-bottom: ${pixelToRem(
          storeEntry.setting[0].marginRichText
        )} !important; `,
      }),
      ...(storeEntry.setting[0].additionalCss && {
        additionalCss: storeEntry.setting[0].additionalCss,
      }),
      ...(storeEntry.setting[0].additionalCssHover && {
        additionalCssHover: storeEntry.setting[0].additionalCssHover,
      }),
      ...storeObject,
    };

    return finalStoreObject;
  },

  /**
   * getStoreColorCss
   * Replaces storeColor.values[0] with the actual cssVariableValue.
   * @param allStoreColors
   * @param storeColor
   * @param fallback
   * @returns
   */
  getStoreColorCss(allStoreColors, storeColor, fallback = "#000000") {
    return storeColor &&
      storeColor.values &&
      storeColor.values[0] &&
      allStoreColors[storeColor.values[0]]
      ? allStoreColors[storeColor.values[0]].cssVariableValue
      : fallback;
  },

  /**
   * cssAttributesAsCssVariables
   * Creates a cssVariable string with useful cssVariables of storeEntry.
   *
   * @param storeEntry
   * @param fontFamily
   * @param storeColors
   * @param storeEntryType
   * @returns
   */
  cssAttributesAsCssVariables(
    storeEntry,
    fontFamily,
    storeColors,
    storeEntryType
  ) {
    // For the moment we don't want all attributes as cssVariables.
    let cssVariables = "";
    if (storeEntryType === "button") {
      cssVariables += `\n--pb-${storeEntryType}-color: ${strapi
        .service("plugin::pabu.glbl")
        .getStoreColorCss(storeColors, storeEntry.setting[0].fontColor)};`;

      cssVariables += `\n--pb-${storeEntryType}-color-hover: ${strapi
        .service("plugin::pabu.glbl")
        .getStoreColorCss(storeColors, storeEntry.setting[0].fontColorHover)};`;
    }
    if (storeEntryType === "typography") {
      cssVariables += `\n--pb-${storeEntryType}-color: ${strapi
        .service("plugin::pabu.glbl")
        .getStoreColorCss(storeColors, storeEntry.setting[0].color)};`;
    }

    if (storeEntryType === "typography" || storeEntryType === "button") {
      if (storeEntry.setting[0].fontSize) {
        cssVariables += `\n--pb-${storeEntryType}-fontSize-mobile: ${pixelToRem(
          storeEntry.setting[0].fontSize.mobile
        )};`;
        cssVariables += `\n--pb-${storeEntryType}-fontSize-desktop: ${pixelToRem(
          storeEntry.setting[0].fontSize.desktop
        )};`;
      }
      if (fontFamily) {
        cssVariables += `\n--pb-${storeEntryType}-fontFamily: ${fontFamily.replace(
          "font-family: ",
          ""
        )}`;
      }
      if (storeEntry.setting[0].fontWeight) {
        cssVariables += `\n--pb-${storeEntryType}-fontWeight: ${storeEntry.setting[0].fontWeight};`;
      }
      if (storeEntry.setting[0].lineHeight) {
        cssVariables += `\n--pb-${storeEntryType}-lineHeight: ${storeEntry.setting[0].lineHeight};`;
      }
    }
    return cssVariables;
  },

  /**
   *
   * @param allStoreColors
   * @returns
   */
  getAllStoreColorsAsCSS(allStoreColors: {
    storeColorId: {
      cssVariable: string;
      cssVariableValue: string;
    };
  }) {
    let storeColorCSS = `/* Store-Colors (--{store}-{storeType}-{id}) */\n`;
    for (const storeColor of Object.values(allStoreColors)) {
      storeColorCSS =
        storeColorCSS +
        `${storeColor.cssVariable}: ${storeColor.cssVariableValue};\n`;
    }
    return storeColorCSS;
  },
};

const pixelToRem = (pixelValue: number) => {
  return `${pixelValue / 10}rem`;
};

/**
 * Appends a ; at end of CSS. To prevent wrong CSS from crashing following styles.
 * Might result into double semicolon (which are ignored)
 * low-cost fix for what is a valid CSS ¯\(ツ)/¯
 * https://github.com/emotion-js/emotion/issues/1284
 * @param cssString
 * @returns
 */
const sanitizeCss = (cssString: string) => {
  return `${cssString};`;
};
