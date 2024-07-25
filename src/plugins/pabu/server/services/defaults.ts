import { Common } from "@strapi/strapi";
import {
  ARROWS_DEFAULT_SETTING,
  BUTTON_DEFAULT_SETTING,
  CESSTR_MODULE_UID,
  CES_STORE_DEFAULTS_STRUUIDS,
  CMS_SETTING_MODULE_UID,
  DEFAULT_AS_SELECTABLE_VALUE,
  GLOBAL_DEFAULT,
  GLOBAL_MODULE_UID,
  LINK_DEFAULT_SETTING,
  RICHTEXT_STORE_DEFAULT_SETTING,
  STORE_MODULE_UID,
  STR_STORE_DEFAULTS_STRUUIDS,
  TYPOGRAPHY_H1_DEFAULT_SETTING,
  TYPOGRAPHY_H2_DEFAULT_SETTING,
  TYPOGRAPHY_H3_DEFAULT_SETTING,
  TYPOGRAPHY_H4_DEFAULT_SETTING,
  TYPOGRAPHY_H5_DEFAULT_SETTING,
  TYPOGRAPHY_H6_DEFAULT_SETTING,
  TYPOGRAPHY_P_DEFAULT_SETTING,
} from "../constants";
import { sleep } from "../utils/functions";
import pbEntityService, {
  PbDbQueryParams,
  StrapiDataObject,
} from "./pbEntityService";

export default {
  /**
   * Creates default entrys. Applies skipLifecycle: true and a delay to the creation process.
   * @param uid
   * @param data
   * @param delay
   * @returns
   */
  async createDefaultEntry(
    uid: Common.UID.ContentType,
    data: StrapiDataObject,
    delay: number = 250
  ): Promise<any> {
    const createdEntry = await pbEntityService.create(uid, {
      data: { skipLifecycle: true, ...data.data },
    });
    if (createdEntry) {
      await sleep(delay);
      strapi.log.info(
        `[PB] Created default Entry: ${createdEntry.id} ${
          createdEntry.name ? `[name: ${createdEntry.name}]` : ""
        } ${createdEntry.struuid ? `[struuid: ${createdEntry.struuid}]` : ""}`
      );
    }
    return createdEntry;
  },

  /**
   * Returns true/false if entries do exist.
   * @param uid
   * @param params
   * @returns
   */
  async doEntriesExist(
    uid: Common.UID.ContentType,
    params: PbDbQueryParams = {
      fields: ["*"],
      filters: {},
      sort: {},
      populate: "pb-deep",
    }
  ) {
    const entries = await pbEntityService.findMany(uid, params);
    return !entries || entries.length === 0 ? false : true;
  },

  /**
   * Generate default entries
   */
  async generateDefaultEntries() {
    // Only create default entries if no entry exist. See below if check for exceptions
    if (
      (await strapi
        .service("plugin::pabu.defaults")
        .doEntriesExist(STORE_MODULE_UID)) === false &&
      (await strapi
        .service("plugin::pabu.defaults")
        .doEntriesExist(CESSTR_MODULE_UID)) === false
    ) {
      // Store:
      // Colors
      // Color: Black
      const colorBlack = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "black",
                color: "#000000",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorBlack"],
          },
        });

      // Color: White
      const colorWhite = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "white",
                color: "#ffffff",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorWhite"],
          },
        });

      // Color: Transparent
      const colorTransparent = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "transparent",
                color: "#00000000",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorTransparent"],
          },
        });

      // Color: Primary Color (Dark)
      const colorPrimaryDark = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "primary color (dark)",
                color: "#1abc9c",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorPrimaryDark"],
          },
        });

      // Color: Primary Color (Light)
      const colorPrimaryLight = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "primary color (light)",
                color: "#88E8D5",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorPrimaryLight"],
          },
        });

      // Color: Secondary Color (Dark)
      const colorSecondaryDark = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "secondary color (dark)",
                color: "#e67e22",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorSecondaryDark"],
          },
        });

      // Color: Secondary Color (Light)
      const colorSecondaryLight = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "secondary color (light)",
                color: "#E09553",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorSecondaryLight"],
          },
        });

      // Color: Background Color (Dark)
      const colorBackgroundDark = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "background color (dark)",
                color: "#7F8C8D",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorBackgroundDark"],
          },
        });

      // Color: Background Color (Light)
      const colorBackgroundLight = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "background color (light)",
                color: "#cecdc7",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorBackgroundLight"],
          },
        });

      // Color: Accent Color
      const colorAccent = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sclr",
                strname: "accent color",
                color: "#0733A1",
                valueAttribute: "color",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["colorAccent"],
          },
        });

      const lightColors = [
        colorBackgroundDark.id,
        colorPrimaryDark.id,
        colorSecondaryDark.id,
      ];
      const darkColors = [
        colorBackgroundLight.id,
        colorPrimaryLight.id,
        colorSecondaryLight.id,
      ];
      const bgColors = [
        DEFAULT_AS_SELECTABLE_VALUE,
        ...lightColors,
        ...darkColors,
      ];

      // defaultFont: Barlow
      const defaultFont = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sfnt",
                strname: "Barlow (default)",
                fontName: "Barlow",
                defaultLineHeight: "1.2",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultFont"],
          },
        });

      // Typography: Paragraph
      const defaultP = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...TYPOGRAPHY_P_DEFAULT_SETTING,
                font: {
                  store: "str",
                  values: [defaultFont.id],
                  storeType: "font",
                },
                color: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultP"],
          },
        });

      // Typography: h1
      const defaultH1 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [TYPOGRAPHY_H1_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultH1"],
          },
        });

      // Typography: h2
      const defaultH2 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [TYPOGRAPHY_H2_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultH2"],
          },
        });

      // Typography: h3
      const defaultH3 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [TYPOGRAPHY_H3_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultH3"],
          },
        });

      // Typography: h4
      const defaultH4 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [TYPOGRAPHY_H4_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultH4"],
          },
        });

      // Typography: h5
      const defaultH5 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [TYPOGRAPHY_H5_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultH5"],
          },
        });

      // Typography: h6
      const defaultH6 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [TYPOGRAPHY_H6_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultH6"],
          },
        });

      const typographys = [
        defaultP.id,
        defaultH1.id,
        defaultH2.id,
        defaultH3.id,
        defaultH4.id,
        defaultH5.id,
        defaultH6.id,
      ];

      // SpaceX: 0
      const spaceX0 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sspcx",
                strname: "full width elements",
                spaceX: 0,
                valueAttribute: "spaceX",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["spaceX0"],
          },
        });

      // SpaceX: 400
      const spaceX400 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sspcx",
                strname: "indented elements",
                spaceX: 400,
                valueAttribute: "spaceX",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["spaceX400"],
          },
        });

      // SpaceY: 0
      const spaceY0 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sspcy",
                strname: "no margin between elements",
                spaceY: 0,
                valueAttribute: "spaceY",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["spaceY0"],
          },
        });

      // SpaceY: 30
      const spaceY30 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sspcy",
                strname: "normal margin between elements",
                spaceY: 30,
                valueAttribute: "spaceY",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["spaceY30"],
          },
        });

      // SpaceY: Navigation 20
      const spaceYNav20 = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.sspcy",
                strname: "Navigation Margin",
                spaceY: 20,
                valueAttribute: "spaceY",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["spaceY30"],
          },
        });

      // RichTextEditor: Default
      const richTextEditorDefault = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [RICHTEXT_STORE_DEFAULT_SETTING],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["richTextEditorDefault"],
          },
        });

      // Button
      const buttonDefault = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...BUTTON_DEFAULT_SETTING,
                font: {
                  store: "str",
                  values: [defaultFont.id],
                  storeType: "font",
                },
                buttonColor: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
                buttonColorHover: {
                  store: "str",
                  values: [colorWhite.id],
                  storeType: "color",
                },
                fontColor: {
                  store: "str",
                  values: [colorWhite.id],
                  storeType: "color",
                },
                fontColorHover: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["buttonDefault"],
          },
        });

      // Link
      const linkDefault = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...LINK_DEFAULT_SETTING,
                font: {
                  store: "str",
                  values: [defaultFont.id],
                  storeType: "font",
                },
                color: {
                  store: "str",
                  values: [colorAccent.id],
                  storeType: "color",
                },
                colorHover: {
                  store: "str",
                  values: [colorAccent.id],
                  storeType: "color",
                },
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["linkDefault"],
          },
        });

      // NavLink Level 1
      const navLinkLevel1Default = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...LINK_DEFAULT_SETTING,
                strname: "Navigation Link (level 1)",
                fontSize: { mobile: 16, desktop: 20 },
                font: {
                  store: "str",
                  values: [defaultFont.id],
                  storeType: "font",
                },
                color: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
                colorHover: {
                  store: "str",
                  values: [colorWhite.id],
                  storeType: "color",
                },
                additionalCss: "letter-spacing: normal; text-transform: none;",
                additionalCssHover: "",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["navLinkLevel1"],
          },
        });

      // NavLink Level 2
      const navLinkLevel2Default = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...LINK_DEFAULT_SETTING,
                fontWeight: 600,
                fontSize: { mobile: 14, desktop: 18 },
                lineHeight: "2.3",
                strname: "Navigation Link (level 2)",
                font: {
                  store: "str",
                  values: [defaultFont.id],
                  storeType: "font",
                },
                color: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
                colorHover: {
                  store: "str",
                  values: [colorWhite.id],
                  storeType: "color",
                },
                additionalCss: "letter-spacing: normal; text-transform: none;",
                additionalCssHover: "",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["navLinkLevel2"],
          },
        });

      // NavLink Level 3
      const navLinkLevel3Default = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...LINK_DEFAULT_SETTING,
                fontWeight: 400,
                lineHeight: "1.5",
                strname: "Navigation Link (level 3)",
                font: {
                  store: "str",
                  values: [defaultFont.id],
                  storeType: "font",
                },
                color: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
                colorHover: {
                  store: "str",
                  values: [colorWhite.id],
                  storeType: "color",
                },
                additionalCss: "letter-spacing: normal; text-transform: none;",
                additionalCssHover: "",
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["navLinkLevel3"],
          },
        });

      // defaultArrows
      const defaultArrows = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(STORE_MODULE_UID, {
          data: {
            setting: [
              {
                ...ARROWS_DEFAULT_SETTING,
                arrowSize: {
                  mobile: 25,
                  tablet: 35,
                  desktop: 50,
                },
                hideArrowsOnMobile: true,
              },
            ],
            struuid: STR_STORE_DEFAULTS_STRUUIDS["defaultArrows"],
          },
        });

      // contentElementSettings:

      // Headline:
      const defaultCeHeadline = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cshdln",
                strname: "Headline (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY0.id],
                  storeType: "spaceY",
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
                typographys: {
                  store: "str",
                  storeType: "typography",
                  values: [...typographys],
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["cshdln"],
          },
        });

      // Richtext:
      const defaultCeRichtext = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csrchtxt",
                strname: "Richtext (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY0.id],
                  storeType: "spaceY",
                },
                fontColors: {
                  store: "str",
                  values: [
                    colorBlack.id,
                    colorWhite.id,
                    colorPrimaryDark.id,
                    colorPrimaryLight.id,
                    colorSecondaryDark.id,
                    colorSecondaryLight.id,
                    colorAccent.id,
                  ],
                  storeType: "color",
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
                link: {
                  store: "str",
                  values: [linkDefault.id],
                  storeType: "link",
                },
                richtext: {
                  store: "str",
                  values: [richTextEditorDefault.id],
                  storeType: "richtext",
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csrchtxt"],
          },
        });

      // Button:
      const defaultCeButton = await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csbttn",
                strname: "Button (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                buttons: {
                  store: "str",
                  storeType: "button",
                  values: [buttonDefault.id],
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csbttn"],
          },
        });

      // Form:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csfrm",
                strname: "Form (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
                maxWidth: {
                  mobile: 470,
                  tablet: 680,
                  desktop: 992,
                  wqhd: 1200,
                },
                headlineheading: "h3",
                headlineEnabled: false,
                formFieldInputSpace: {
                  aboveInput: 5,
                  belowInput: 20,
                },
                inputBgColor: {
                  store: "str",
                  storeType: "color",
                  values: [colorWhite.id],
                },
                inputBorder:
                  "border: 1px solid #d2d4da; border-radius: 6px !important;",
                inputBorderHover:
                  "border: 1px solid rgba(0, 0, 0, 0.87); border-radius: 6px !important;",
                inputLabelTypography: {
                  store: "str",
                  storeType: "typography",
                  values: [defaultP.id],
                },
                inputTypography: {
                  store: "str",
                  storeType: "typography",
                  values: [defaultP.id],
                },
                additionalCss: null,
                additionalCssHover: null,
                submitButton: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
                backButton: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
                fileUploadButton: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csfrm"],
          },
        });

      // Separator:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cssprtr",
                strname: "Separator (default)",
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["cssprtr"],
          },
        });

      // Spacer:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csspcr",
                strname: "Spacer (default)",
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csspcr"],
          },
        });

      // Gallery:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csgllry",
                strname: "Gallery (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
                fullScreenIconColor: {
                  store: "str",
                  values: [colorBlack.id],
                  storeType: "color",
                },
                hoverColors: {
                  store: "str",
                  values: [colorAccent.id],
                  storeType: "color",
                },
                arrows: {
                  store: "str",
                  storeType: "arrows",
                  values: [defaultArrows.id],
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csgllry"],
          },
        });

      // Image:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csmg",
                strname: "Image (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
                typographys: {
                  store: "str",
                  storeType: "typography",
                  values: [defaultP.id],
                },
                maxWidthImagePX: 1000,
                maxHeightImage: {
                  mobile: 200,
                  tablet: 300,
                  desktop: 400,
                  wqhd: 600,
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csmg"],
          },
        });

      // Multimedia:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csmltmd",
                strname: "Multimedia (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csmltmd"],
          },
        });

      // Carousel:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cscrsl",
                strname: "Carousel (default)",
                spaceX: {
                  store: "str",
                  storeType: "spaceX",
                  values: [spaceX0.id],
                },
                spaceY: {
                  store: "str",
                  storeType: "spaceY",
                  values: [spaceY0.id],
                },
                width: "100%",
                height: {
                  mobile: 200,
                  tablet: 400,
                  desktop: 500,
                  wqhd: 500,
                },
                headline: {
                  store: "cesstr",
                  storeType: "headline",
                  values: [defaultCeHeadline.id],
                },
                subheadline: {
                  store: "cesstr",
                  storeType: "headline",
                  values: [defaultCeHeadline.id],
                },
                richtext: {
                  store: "cesstr",
                  storeType: "richtext",
                  values: [defaultCeRichtext.id],
                },
                button: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
                arrows: {
                  store: "str",
                  storeType: "arrows",
                  values: [defaultArrows.id],
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
                containerColors: {
                  store: "str",
                  storeType: "color",
                  values: [
                    DEFAULT_AS_SELECTABLE_VALUE,
                    colorBackgroundLight.id,
                    colorBackgroundDark.id,
                  ],
                },
                borderColors: {
                  store: "str",
                  storeType: "color",
                  values: [
                    DEFAULT_AS_SELECTABLE_VALUE,
                    colorBlack.id,
                    colorWhite.id,
                  ],
                },
                headlineheading: "h2",
                subheadlineheading: "h3",
                alignmentX: "center",
                alignmentY: "center",
                shadowLayerBottom: false,
                captionContainerTransparentPercentage: 0,
                captionContainerBorderTop: false,
                captionContainerBorderRight: false,
                captionContainerBorderBottom: false,
                captionContainerBorderLeft: false,
                captionContainerBorder:
                  "border: 1px solid #6c757d; border-radius: 5px;",
                captionContainerPadding: {
                  x: 30,
                  y: 45,
                },
                captionContainerWidth: "50%",
                captionContainerHeightPercentage: 50,
                buttonPlacement: "left",
                buttonMarginTop: 17,
                intervalMS: 5000,
                captionContainerHeadingsAlign: null,
                captionContainerOffset: null,
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["cscrsl"],
          },
        });

      // Carousel:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cscrsl",
                strname: "Hero Image (default)",

                spaceX: {
                  store: "str",
                  storeType: "spaceX",
                  values: [spaceX0.id],
                },
                spaceY: {
                  store: "str",
                  storeType: "spaceY",
                  values: [spaceY0.id],
                },
                width: "100%",
                height: {
                  mobile: 400,
                  tablet: 600,
                  desktop: 800,
                  wqhd: 1000,
                },
                headline: {
                  store: "cesstr",
                  storeType: "headline",
                  values: [defaultCeHeadline.id],
                },
                subheadline: {
                  store: "cesstr",
                  storeType: "headline",
                  values: [defaultCeHeadline.id],
                },
                richtext: {
                  store: "cesstr",
                  storeType: "richtext",
                  values: [defaultCeRichtext.id],
                },
                button: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
                arrows: {
                  store: "str",
                  storeType: "arrows",
                  values: [defaultArrows.id],
                },
                bgColors: {
                  store: "str",
                  values: [...bgColors],
                  storeType: "color",
                },
                containerColors: {
                  store: "str",
                  storeType: "color",
                  values: [
                    DEFAULT_AS_SELECTABLE_VALUE,
                    colorBackgroundLight.id,
                    colorBackgroundDark.id,
                  ],
                },
                borderColors: {
                  store: "str",
                  storeType: "color",
                  values: [
                    DEFAULT_AS_SELECTABLE_VALUE,
                    colorBlack.id,
                    colorWhite.id,
                  ],
                },
                headlineheading: "h2",
                subheadlineheading: "h3",
                alignmentX: "left",
                alignmentY: "center",
                shadowLayerBottom: false,
                captionContainerTransparentPercentage: 0,
                captionContainerBorderTop: false,
                captionContainerBorderRight: false,
                captionContainerBorderBottom: false,
                captionContainerBorderLeft: false,
                captionContainerBorder:
                  "border: 1px solid #6c757d; border-radius: 5px;",
                captionContainerPadding: {
                  x: 30,
                  y: 15,
                },
                captionContainerWidth: "50%",
                captionContainerHeightPercentage: 0,
                buttonPlacement: "left",
                buttonMarginTop: 15,
                intervalMS: 5000,
                captionContainerHeadingsAlign: null,
                captionContainerOffset: null,
              },
            ],
            // Note: This CESTR is an additional variant of the carousel content-element and not "undeletable".
            struuid: "c3aa15b4-5d8b-404c-a003-7e94a43de660",
          },
        });

      // ImageTicker:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csmgtckr",
                strname: "Image Ticker (default)",
                spaceX: {
                  store: "str",
                  storeType: "spaceX",
                  values: [spaceX0.id],
                },
                spaceY: {
                  store: "str",
                  storeType: "spaceY",
                  values: [spaceY30.id],
                },
                imageTickerHeight: {
                  mobile: 80,
                  tablet: 120,
                  desktop: 150,
                  wqhd: 200,
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
                imageMarginRight: 60,
                slideSpeedScalingFactor: 5,
                opacity: "1",
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csmgtckr"],
          },
        });

      // TWI:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cstwi",
                strname: "Text with Image (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                headline: {
                  store: "cesstr",
                  storeType: "headline",
                  values: [defaultCeHeadline.id],
                },
                richtext: {
                  store: "cesstr",
                  storeType: "richtext",
                  values: [defaultCeRichtext.id],
                },
                button: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
                maxWidthImage: {
                  mobile: 300,
                  tablet: 400,
                  desktop: 500,
                  wqhd: 600,
                },
                headlineheading: "h3",
                spacerHeadlineRichtext: 15,
                spacerMiddle: 40,
                spacerButton: 20,
                maxHeightImage: {
                  mobile: 200,
                  tablet: 300,
                  desktop: 400,
                  wqhd: 500,
                },
                ratio1: "8/4",
                ratio2: "7/5",
                ratio3: "5/7",
                ratio4: "4/8",
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["cstwi"],
          },
        });

      // Cards:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cscrds",
                strname: "Cards (default)",
                spaceX: {
                  store: "str",
                  values: [spaceX400.id],
                  storeType: "spaceX",
                },
                spaceY: {
                  store: "str",
                  values: [spaceY30.id],
                  storeType: "spaceY",
                },
                richtext: {
                  store: "cesstr",
                  storeType: "richtext",
                  values: [defaultCeRichtext.id],
                },
                button: {
                  store: "cesstr",
                  storeType: "button",
                  values: [defaultCeButton.id],
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
                border: "border: 0px solid black; border-radius: 8px;",
                imageBorder:
                  "border-top-left-radius: 8px; border-top-right-radius: 8px;",
                shadow: "box-shadow: 0 0px 0px 0 rgba(0, 0, 0, 0);",
                showImage: true,
                imageHeight: {
                  small: 100,
                  medium: 150,
                  big: 200,
                },
                spaceCards: {
                  x: 50,
                  y: 50,
                },
                textMargin: {
                  top: 8,
                  right: 0,
                  bottom: 8,
                  left: 0,
                },
                buttonMargin: {
                  top: 8,
                  right: 8,
                  bottom: 8,
                  left: 8,
                },
                bgColorsCards: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["cscrds"],
          },
        });

      // Accordeon:
      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csccrdn",
                strname: "Accordion (default)",
                spaceX: {
                  store: "str",
                  storeType: "spaceX",
                  values: [spaceX400.id],
                },
                spaceY: {
                  store: "str",
                  storeType: "spaceY",
                  values: [spaceY30.id],
                },
                panelMargin: 15,
                titleHeading: "h3",
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColors],
                },
                headline: {
                  store: "cesstr",
                  storeType: "headline",
                  values: [defaultCeHeadline.id],
                },
                richtext: {
                  store: "cesstr",
                  storeType: "richtext",
                  values: [defaultCeRichtext.id],
                },
                textMargin: {
                  left: 0,
                  right: 0,
                },
                bgColorsTitle: {
                  store: "str",
                  storeType: "color",
                  values: [
                    DEFAULT_AS_SELECTABLE_VALUE,
                    colorBackgroundLight.id,
                    colorBackgroundDark.id,
                  ],
                },
                bgColorsPanel: {
                  store: "str",
                  storeType: "color",
                  values: [
                    DEFAULT_AS_SELECTABLE_VALUE,
                    colorBackgroundLight.id,
                    colorBackgroundDark.id,
                  ],
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS["csccrdn"],
          },
        });

      // global:
      const global = await pbEntityService.findMany(GLOBAL_MODULE_UID, {});
      if (!global) {
        strapi.log.info("[PB] Creating default global-Config...");
        try {
          await pbEntityService.create(GLOBAL_MODULE_UID, {
            data: {
              ...GLOBAL_DEFAULT,
              ...{
                responsive: {
                  breakpoints: {
                    mobile: 768,
                    tablet: 1366,
                    desktop: 2560,
                    wqhd: 3840,
                  },
                },
                layout: {
                  containerWidth: "100%",
                  // TBD: Misconfiguration?
                  containerBgColor: {
                    store: "str",
                    values: [colorTransparent.id],
                    storeType: "color",
                  },
                  scalingfactorSpaceX: {
                    mobile: 0.1,
                    tablet: 0.3,
                    desktop: 1,
                    wqhd: 1.5,
                  },
                  scalingfactorSpaceY: {
                    mobile: 0.5,
                    tablet: 0.75,
                    desktop: 1,
                    wqhd: 1.5,
                  },
                  verticalpadding: 15,
                  verticalpaddingafterfirstelement: 30,
                  verticalpaddingbeforefooter: 30,
                  scalingfactorVerticalPadding: {
                    wqhd: 1.25,
                    mobile: 0.5,
                    tablet: 0.75,
                    desktop: 1,
                  },
                },
                navigation: {
                  spaceX: {
                    store: "str",
                    values: [spaceX0.id],
                    storeType: "spaceX",
                  },
                  spaceY: {
                    store: "str",
                    values: [spaceYNav20.id],
                    storeType: "spaceY",
                  },
                  mobileNavDrawerWidth: "50%",
                  mobileDrawerDropDirection: "left",
                  linkTopLevel: {
                    store: "str",
                    storeType: "link",
                    values: [navLinkLevel1Default.id],
                  },
                  linkLevel2: {
                    store: "str",
                    storeType: "link",
                    values: [navLinkLevel2Default.id],
                  },
                  linkLevel3: {
                    store: "str",
                    storeType: "link",
                    values: [navLinkLevel3Default.id],
                  },
                  bgColor: {
                    store: "str",
                    storeType: "color",
                    values: [colorBackgroundLight.id],
                  },
                  bgColorLinks: {
                    store: "str",
                    storeType: "color",
                    values: [],
                  },
                  linkActiveColor: {
                    store: "str",
                    storeType: "color",
                    values: [colorPrimaryDark.id],
                  },
                  logoMaxHeight: {
                    mobile: 50,
                    desktop: 50,
                  },
                  onlyMobileNavigation: false,
                  showAllNavItems: true,
                  additionalCss: `/* Use these selectors to style the navigation to your needs */\n
.navigation {}\n
.navigation-desktop {}\n
.navigation-desktop > .navigation-desktop-logo {}\n
.navigation-desktop > nav {}\n
.navigation-desktop > .navigation-desktop-action-group {}\n
\n
.navigation-mobile {}\n
.navigation-mobile > .navigation-mobile-logo {}\n
.navigation-mobile > .navigation-mobile-action-group {}\n
.navigation-mobile-menu {}\n
.navigation-mobile-header {}\n
.navigation-mobile-menu > nav {}\n
.navigation-mobile-menu > nav > .navigation-item {}\n
.navigation-search {}\n
\n
/* Remove the following styles to remove the default styling: */\n
/* Additional Default Styling */\n
.navigation-desktop .navigation-desktop-submenu-drawer-content-col {\n
    display: flex;\n
    width: 500px !important;\n
    justify-content: space-around;\n
    padding: 0 !important;\n
}

.navigation-desktop > nav {\n
  display: flex;\n
  justify-content: space-around;\n
}\n

.navigation-desktop > nav .navigation-desktop-top-level-menu {\n
    width: 50%;\n
    display: flex;\n
    justify-content: space-around;\n
}\n

/* Additional padding */\n
.navigation-desktop .navigation-desktop-submenu-drawer-content {\n
  padding-top: 1rem;\n
  padding-bottom: 2rem;\n
}`,
                },
                footer: {
                  footerType: "default",
                  bgColor: {
                    store: "str",
                    values: [colorWhite.id],
                    storeType: "color",
                  },
                  richtextFooter: {
                    store: "cesstr",
                    storeType: "richtext",
                    values: [defaultCeRichtext.id],
                  },
                  spaceX: {
                    store: "str",
                    values: [spaceX0.id],
                    storeType: "spaceX",
                  },
                  verticalSpace: {
                    top: 0,
                    bottom: 30,
                  },
                  copyrightTextJson: {
                    cn: "",
                    de: "",
                    en: "",
                  },
                  socialMediaWidth: 290,
                  socialMediaTitleType: "h3",
                  repeatableElementWidth: 290,
                  footerElementsAlignmentLeft: false,
                  footerCol: {
                    spaceX: 0,
                    spaceY: 50,
                  },
                  border: "border: 0px solid #000000;",
                  additionalCss: "",
                },
                seo: {
                  disableImageOptimization: false,
                  openExternalLinksInNewTab: true,
                  twitterSiteContent: "",
                  twitterCardContent: "summary_large_image",
                  fallbackOpenGraphImage: null,
                },
                logo: {},
                forms: {
                  richtext: {
                    store: "cesstr",
                    values: [defaultCeRichtext.id],
                    storeType: "richtext",
                  },
                },
                search: {
                  searchEnabled: true,
                  searchPlaceholder: "",
                  navSearchIconColor: {
                    store: "str",
                    values: [colorBlack.id],
                    storeType: "color",
                  },
                  searchBarBgColor: {
                    store: "str",
                    values: [colorWhite.id],
                    storeType: "color",
                  },
                  searchBarTypography: {
                    store: "str",
                    values: [defaultP.id],
                    storeType: "typography",
                  },
                  searchBarSearchIconColor: {
                    store: "str",
                    values: [colorBlack.id],
                    storeType: "color",
                  },
                  searchBarCloseIconColor: {
                    store: "str",
                    values: [colorBlack.id],
                    storeType: "color",
                  },
                  searchBarBgHoverColor: {
                    store: "str",
                    values: [colorBackgroundLight.id],
                    storeType: "color",
                  },
                  searchBarMaxWidth: 0,
                },
                searchresults: {
                  spaceX: {
                    store: "str",
                    values: [spaceX400.id],
                    storeType: "spaceX",
                  },
                  spaceY: {
                    store: "str",
                    values: [spaceY30.id],
                    storeType: "spaceY",
                  },
                  h1Typography: {
                    store: "str",
                    storeType: "typography",
                    values: [defaultH1.id],
                  },
                  h2Typography: {
                    store: "str",
                    storeType: "typography",
                    values: [defaultH2.id],
                  },
                  ctTypography: {
                    store: "str",
                    storeType: "typography",
                    values: [defaultH2.id],
                  },
                  resultTypography: {
                    store: "str",
                    storeType: "typography",
                    values: [defaultP.id],
                  },
                  resultLink: {
                    store: "str",
                    storeType: "link",
                    values: [linkDefault.id],
                  },
                  contentTypeDivider: "1px solid #000",
                  marginBetweenContentType: 30,
                  elementSpace: {
                    x: 20,
                    y: 10,
                  },
                  listElementSpaceY: 10,
                  searchFilterBgColor: {
                    store: "str",
                    values: [colorWhite.id],
                    storeType: "color",
                  },
                  searchFilterBorderColor: {
                    store: "str",
                    values: [colorBlack.id],
                    storeType: "color",
                  },
                  searchFilterDropdownBgColor: {
                    store: "str",
                    values: [colorWhite.id],
                    storeType: "color",
                  },
                  searchFilterDropdownBgColorHover: {
                    store: "str",
                    values: [colorBackgroundLight.id],
                    storeType: "color",
                  },
                  searchFilterDropdownFontColor: {
                    store: "str",
                    values: [colorBlack.id],
                    storeType: "color",
                  },
                  searchFilterChipBgColor: {
                    store: "str",
                    values: [colorTransparent.id],
                    storeType: "color",
                  },
                  searchFilterChipFontColor: {
                    store: "str",
                    values: [colorBlack.id],
                    storeType: "color",
                  },
                  searchFilterChipBorder: "border: 1px solid #000",
                  searchTermSpace: null,
                  searchSummarySpace: null,
                  searchFilterSpace: null,
                  searchFilterBorderHoverColor: {
                    store: "str",
                    storeType: "color",
                    values: [],
                  },
                },
                multilanguage: {
                  languageSwitchEnabled: true,
                  bgColor: {
                    store: "str",
                    values: [],
                    storeType: "color",
                  },
                  borderColor: {
                    store: "str",
                    values: [],
                    storeType: "color",
                  },
                  fontColor: {
                    store: "str",
                    values: [],
                    storeType: "color",
                  },
                  hoverBgColor: {
                    store: "str",
                    values: [],
                    storeType: "color",
                  },
                  hoverFontColor: {
                    store: "str",
                    values: [],
                    storeType: "color",
                  },
                },
                animation: {
                  triggerGap: 100,
                  animationsMobile: false,
                  triggerInitialAnimation: false,
                },
                scrolling: {
                  scrollEffect: "auto",
                },
                scrolltotop: {
                  enabled: false,
                },
                captchatype: {
                  formCaptchaType: "none",
                },
              },
            },
          });
        } catch (error) {
          strapi.log.error(
            "[PB] Could not create default global-Config.",
            error
          );
        }
      }

      const cmsSettings = await pbEntityService.findMany(
        CMS_SETTING_MODULE_UID,
        {}
      );
      if (!cmsSettings) {
        strapi.log.info("[PB] Creating default cmsSettings...");
        try {
          await pbEntityService.create(CMS_SETTING_MODULE_UID, {
            data: {
              googlerecaptchav2: {
                recaptchav2publickey: "",
              },
              configmodalsettings: {
                cfgmodalsort: [],
              },
            },
          });
        } catch (error) {
          strapi.log.error("[PB] Could not create default cmsSettings.", error);
        }
      }

      // Regenerate Store Settings
      await strapi
        .service("plugin::pabu.settings")
        .regenerateSettingsJSONs(["glbl", "cesstr"]);

      // ListViews:
      await strapi.service("plugin::pabu.str").initializeStrListView();
      await strapi.service("plugin::pabu.cesstr").initializeCesstrListView();

      strapi.log.info(
        "[PB] All default settings were created. For more information about how to quickly adjust the default settings to your need: Checkout our quick start guide."
      );
    }

    // Html:
    if (
      (await strapi
        .service("plugin::pabu.str")
        .doesStrUuidExist(
          CES_STORE_DEFAULTS_STRUUIDS.cshtml,
          CESSTR_MODULE_UID
        )) === false
    ) {
      const { spaceY0Id, spaceX0Id, bgColorIds } = await strapi
        .service("plugin::pabu.str")
        .getDefaultEntriesIds();

      if (!spaceX0Id || !spaceY0Id || !bgColorIds) {
        strapi.log.error(
          "Ids missing to create image with html ce default values. Default value creation skipped."
        );
        return;
      }

      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.cshtml",
                strname: "html (default)",
                spaceY: {
                  store: "str",
                  storeType: "spaceY",
                  values: [spaceY0Id],
                },
                spaceX: {
                  store: "str",
                  values: [spaceX0Id],
                  storeType: "spaceX",
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColorIds],
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS.cshtml,
          },
        });
    }

    // Image with markers:
    if (
      (await strapi
        .service("plugin::pabu.str")
        .doesStrUuidExist(
          CES_STORE_DEFAULTS_STRUUIDS.csmgwthmrkrs,
          CESSTR_MODULE_UID
        )) === false
    ) {
      const { bgColorIds, spaceY30Id, defaultCeRichtextId } = await strapi
        .service("plugin::pabu.str")
        .getDefaultEntriesIds();

      if (!bgColorIds || !spaceY30Id || !defaultCeRichtextId) {
        strapi.log.error(
          "IDs missing to create image with markers ce default values. Default value creation skipped."
        );
        return;
      }

      await strapi
        .service("plugin::pabu.defaults")
        .createDefaultEntry(CESSTR_MODULE_UID, {
          data: {
            setting: [
              {
                __component: "pb.csmgwthmrkrs",
                strname: "Image with markers (default)",
                spaceY: {
                  store: "str",
                  storeType: "spaceY",
                  values: [spaceY30Id],
                },
                bgColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColorIds],
                },
                textBackgroundColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColorIds],
                },
                markerColors: {
                  store: "str",
                  storeType: "color",
                  values: [...bgColorIds],
                },
                richtext: {
                  store: "cesstr",
                  storeType: "richtext",
                  values: [defaultCeRichtextId],
                },
                marker: {
                  store: "str",
                  storeType: "icon",
                  values: [DEFAULT_AS_SELECTABLE_VALUE],
                },
                markerSize: {
                  mobile: 30,
                  tablet: 40,
                  desktop: 50,
                  wqhd: 50,
                },
                textMargin: {
                  left: 0,
                  right: 0,
                },
              },
            ],
            struuid: CES_STORE_DEFAULTS_STRUUIDS.csmgwthmrkrs,
          },
        });
    }
  },
};
