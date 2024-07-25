import { Common } from "@strapi/strapi";
import {
  CES_STORE_DEFAULTS_STRUUIDS,
  CESSTR_MODULE_UID,
  DEFAULT_AS_SELECTABLE_VALUE,
  STORE_MODULE_UID,
  STR_STORE_DEFAULTS_STRUUIDS,
} from "../constants";
import pbEntityService from "./pbEntityService";

const { v4, validate } = require("uuid");

// Skipping vowels for short component & collection-type names.
// Note: This is suboptimal, however due to the limitation in characters
// for the moment our only solution to streamline shorter names.
const shortNameToNames = {
  // ContentElements:
  ccrds: "cards",
  ctwi: "textwithimage",
  cmltmd: "multimedia",
  chdln: "headline",
  cbttn: "button",
  crchtxt: "richtext",
  cccrdn: "accordion",
  ccrsl: "carousel",
  cfrm: "form",
  cgllry: "gallery",
  cmg: "image",
  cmgtckr: "image ticker",
  csprtr: "separator",
  cspcr: "spacer",
  csrchrslts: "searchresults",
  chtml: "html",
  cmgwthmrkrs: "image with markers",

  // General:
  crd: "card",

  // PaBu
  setting: "setting",
  str: "store",
  cesstr: "contentelementsettingsstore", // contentElementSettings
  glbl: "global",
  customcss: "customcss",

  // Global:
  rspnsvc: "responsiveconfig",
  lytc: "layoutconfig",
  ftrc: "footerconfig",
  nvgtnc: "navigationconfig",
  sc: "seoconfig",
  lgc: "logoconfig",
  frmsc: "formsconfig",
  srchc: "searchconfig",
  srchrsltsc: "searchresultsconfig",
  tgsc: "tagsconfig",
  mltlnggc: "multilanguageconfig",
  nmtnc: "animationconfig",
  scrllngc: "scrollingconfig",
  scrllttpc: "scrolltotopconfig",
  brdcrmbsc: "breadcrumbsconfig",

  // str Store:
  sclr: "color",
  sfnt: "font",
  sgglfnt: "googlefont",
  sspcx: "spaceX",
  sspcy: "spaceY",
  stypgrphy: "typography",
  sbttn: "button",
  slnk: "link",
  srchtxt: "richtext",
  sbckgrnd: "background",
  srrws: "arrows",
  scn: "icon",

  // cesstr Store:
  cshdln: "headline",
  csbttn: "button",
  csrchtxt: "richtext",
  csccrdin: "accordion",
  cstwi: "text with image", // twi
  cscrds: "cards",
  cscrsl: "carousel",
  csfrm: "form",
  csgllry: "gallery",
  csmg: "image",
  csmgtckr: "image ticker",
  cssprtr: "separator",
  csspcr: "spacer",
  csmltmd: "multimedia",
  csccrdn: "accordion",
  cshtml: "html",
  csmgwthmrkrs: "image with markers",
};

export default {
  async getDefaultEntriesIds() {
    const storeEntries = await strapi.entityService.findMany(
      STORE_MODULE_UID,
      {}
    );
    const ceSettingsEntries = await strapi.entityService.findMany(
      CESSTR_MODULE_UID,
      {}
    );

    const defaultCeRichtext = ceSettingsEntries?.find(
      (entry) => entry.struuid === CES_STORE_DEFAULTS_STRUUIDS.csrchtxt
    );

    const spaceY0 = storeEntries?.find(
      (entry) => entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.spaceY0
    );

    const spaceX0 = storeEntries?.find(
      (entry) => entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.spaceX0
    );

    const colorBackgroundDark = storeEntries?.find(
      (entry) =>
        entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.colorBackgroundDark
    );

    const colorPrimaryDark = storeEntries?.find(
      (entry) => entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.colorPrimaryDark
    );

    const colorSecondaryDark = storeEntries?.find(
      (entry) =>
        entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.colorSecondaryDark
    );

    const colorBackgroundLight = storeEntries?.find(
      (entry) =>
        entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.colorBackgroundLight
    );

    const colorPrimaryLight = storeEntries?.find(
      (entry) => entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.colorPrimaryLight
    );

    const colorSecondaryLight = storeEntries?.find(
      (entry) =>
        entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.colorSecondaryLight
    );

    const spaceY30 = storeEntries?.find(
      (entry) => entry.struuid === STR_STORE_DEFAULTS_STRUUIDS.spaceY30
    );

    const lightColorIds = [
      colorBackgroundDark?.id,
      colorPrimaryDark?.id,
      colorSecondaryDark?.id,
    ];
    const darkColorIds = [
      colorBackgroundLight?.id,
      colorPrimaryLight?.id,
      colorSecondaryLight?.id,
    ];
    const bgColorIds = [
      DEFAULT_AS_SELECTABLE_VALUE,
      ...lightColorIds,
      ...darkColorIds,
    ];

    return {
      bgColorIds: bgColorIds,
      spaceX0Id: spaceX0?.id,
      spaceY0Id: spaceY0?.id,
      spaceY30Id: spaceY30?.id,
      defaultCeRichtextId: defaultCeRichtext?.id,
    };
  },
  /**
   * checks if a given struuid already exists in the given module
   * @param struuid the struuid to search for
   * @param uid the module uid
   * @returns
   */
  async doesStrUuidExist(struuid: string, uid: Common.UID.ContentType) {
    const entry = await pbEntityService.findOneByQuery(uid, {
      filters: {
        struuid: struuid,
      },
    });
    return !!entry;
  },
  /**
   * generateStoreEntryName
   * Store-Entries include a component with a custom strname and value(s).
   * This function combines these attributes together with the (readable)name of the component
   * and autogenerate a name that is then set as storeEntry.name and displayed in the relation
   * dropdowns.
   * @param {object} storeEntryData Lifecycle Data
   * @returns {Promise<string>} "componentName: component.strname value1 value2 ..."
   */
  async generateStoreEntryName(storeEntryData) {
    let autogeneratedName = "";
    if (storeEntryData && storeEntryData.setting && storeEntryData.setting[0]) {
      const storeSetting = await pbEntityService.findOne(
        `${storeEntryData.setting[0].__component}` as Common.UID.ContentType,
        storeEntryData.setting[0].id,
        {
          fields: ["*"],
        }
      )!;

      strapi.log.debug(
        `Map: ${storeEntryData.setting[0].__component} -> ${strapi
          .service("plugin::pabu.str")
          .readableLabel(
            storeEntryData.setting[0].__component.replace("pb.", "")
          )}`
      );

      autogeneratedName = `${strapi
        .service("plugin::pabu.str")
        .readableLabel(
          storeEntryData.setting[0].__component.replace("pb.", "")
        )}:${storeSetting?.strname ? ` ${storeSetting.strname}` : ""}`;

      if (storeSetting) {
        if (storeSetting.valueAttribute) {
          // SingleValue-Store-Entry:
          // The name of the attribute that contains the value is defined in valueAttribute.
          autogeneratedName += ` ${storeSetting[storeSetting.valueAttribute]}`;
        }
      }
    }

    return autogeneratedName;
  },

  /**
   * generateStoreEntryType
   * @param {object} storeEntryData Lifecycle Data
   * @returns {string} "componentName"
   */
  generateStoreEntryType(storeEntryData) {
    let autogeneratedType = strapi
      .service("plugin::pabu.str")
      .readableLabel(storeEntryData.setting[0].__component.replace("pb.", ""));

    // Add specialCases here:
    if (autogeneratedType === "googlefont") {
      // SpecialCase: googlefont shares type with font (sfnt).
      autogeneratedType = strapi
        .service("plugin::pabu.str")
        .readableLabel("sfnt");
    }
    return autogeneratedType;
  },

  /**
   * generateStoreEntryUUID
   * Skips generation if uuid exists.
   * @param {string} uuid
   * @returns {string} "1b8d6bcd-bbfd-9b2d-9b5d-ab9dfbbd4bod"
   */
  generateStoreEntryUUID(uuid) {
    const storeEntryUUID = uuid && validate(uuid) ? uuid : v4();
    return storeEntryUUID;
  },

  /**
   * readableLabel
   * @param {string} label "ccrds"
   * @returns {string} "cards"
   */
  readableLabel(label) {
    let readableLabel = label || "";
    readableLabel = shortNameToNames[label] ?? label;
    return readableLabel;
  },

  /**
   * validateAndReturnStoreValue
   * Validates the storeValue inside of storeRelation by checking if the attributeName
   * of the storeValue ("color" / "space") is a part of the storeAttribute ("spaceX" / "backgroundColorPrimary").
   *
   * @param {any} storeRelation {}
   * @param {string} storeAttribute "font"
   * @returns {any}
   */
  validateAndReturnStoreValue(storeRelation, storeAttribute) {
    let valueWasSanitized = false;
    let storeValue: unknown = null; // TODO: For the moment: color, spaceX, spaceY, font, googleFont.

    if (storeRelation && storeRelation.setting && storeRelation.setting[0]) {
      // ReadableName of the component.
      const nameOfComponent = strapi
        .service("plugin::pabu.str")
        .readableLabel(storeRelation.setting[0].__component.replace("pb.", ""));

      let valueAttribute = storeRelation.setting[0].valueAttribute;
      let couldMatch;
      // "Validation"
      // Store-Entry has attribute: valueAttribute
      // bgColor -> color || space -> spaceX || backgroundColor -> color (not matching: valueAttribute but matching nameOfComponent)
      if (
        valueAttribute &&
        (storeAttribute.toLowerCase().includes(valueAttribute.toLowerCase()) ||
          valueAttribute.toLowerCase().includes(storeAttribute.toLowerCase()) ||
          storeAttribute
            .toLowerCase()
            .includes(nameOfComponent.toLowerCase()) ||
          nameOfComponent.toLowerCase().includes(storeAttribute.toLowerCase()))
      ) {
        couldMatch = true;
        storeValue = storeRelation.setting[0][valueAttribute];
      } else {
        // "Validation"
        // Store-Entry has no attribute: valueAttribute
        // Possible multi value store-Entry
        if (
          storeAttribute
            .toLowerCase()
            .includes(nameOfComponent.toLowerCase()) ||
          nameOfComponent.toLowerCase().includes(storeAttribute.toLowerCase())
        ) {
          couldMatch = true;
          // Depending on further development this might include a bigger switch-statement here with different store-special-cases.
          if (
            storeRelation.setting[0].__component === "pb.sgglfnt" ||
            storeRelation.setting[0].__component === "pb.fnt"
          ) {
            // Streamlining of googlefont & font.
            // Only fontFamily & defaultLineHeight might be useful in NextJS.
            storeValue = {
              fontFamily: storeRelation.setting[0].fontName
                ? // font
                  `font-family: '${storeRelation.setting[0].fontName}'`
                : // googleFont
                  storeRelation.setting[0].googleFontFamily,
              defaultLineHeight: storeRelation.setting[0].defaultLineHeight,
            };
          } else {
            // Include all attributes of store-Entry.
            storeValue = storeRelation.setting[0];
          }
        }
      }
      if (!couldMatch) {
        strapi.log.warn(
          `validateAndReturnStoreValue: Could NOT match ${storeAttribute} with ${JSON.stringify(
            storeRelation.setting[0]
          )}.`
        );
        // We should not rely on storeValue: null if sanitized or not.
        valueWasSanitized = true;
      }
    }
    return { storeValue, valueWasSanitized };
  },

  /**
   * getStoreValues
   * @param {object} storeEntryData Lifecycle Data
   * @returns {Promise<any>}
   */
  async getStoreValues(storeEntryData) {
    let componentData;
    if (
      storeEntryData &&
      storeEntryData.__pivot &&
      storeEntryData.__pivot.field &&
      storeEntryData.__pivot.component_type
    ) {
      componentData = await pbEntityService.findOne(
        `${storeEntryData.__pivot.component_type}` as Common.UID.ContentType,
        storeEntryData.id,
        {
          fields: ["*"],
          populate: "pb-deep",
        }
      );
    }

    // Gather attributes that use values from store.
    let storeAttributes = [];
    if (componentData) {
      if (
        strapi.components &&
        strapi.components[storeEntryData.__pivot.component_type]
      ) {
        for (const componentDataAttributes of Object.entries(
          strapi.components[storeEntryData.__pivot.component_type].attributes
        )) {
          if (
            componentDataAttributes[1] &&
            /* @ts-ignore */
            componentDataAttributes[1].target === "plugin::pabu.str" &&
            componentDataAttributes[1].type === "relation"
          ) {
            /* @ts-ignore */
            storeAttributes.push(componentDataAttributes[0]);
          }
        }
      }
    }

    // Replace relations in componentData with actual storeValue.
    let sanitizedStoreAttributes = {};
    let flatComponentData = { ...componentData }; // top-level-copy
    for (const storeAttribute of storeAttributes) {
      if (componentData[storeAttribute]) {
        strapi.log.warn(componentData[storeAttribute]);
        strapi.log.warn(storeAttribute);
        const validatedStoreValue = strapi
          .service("plugin::pabu.str")
          .validateAndReturnStoreValue(
            componentData[storeAttribute],
            storeAttribute
          );
        flatComponentData[storeAttribute] = validatedStoreValue.storeValue;
        if (validatedStoreValue.valueWasSanitized) {
          /* @ts-ignore */
          sanitizedStoreAttributes[storeAttribute] = null;
        }
      }
    }

    // Replace componentData-Relations with incorrect values with null.
    let sanitizedComponentData;
    if (Object.keys(sanitizedStoreAttributes).length > 0) {
      try {
        sanitizedComponentData = await pbEntityService.update(
          `${storeEntryData.__pivot.component_type}` as Common.UID.ContentType,
          componentData.id,
          {
            // Corrected componentData
            data: { ...componentData, ...sanitizedStoreAttributes },
          }
        );
        // updateAndReturnPopulated-Workaround:
        if (sanitizedComponentData) {
          sanitizedComponentData = {
            ...componentData,
            ...sanitizedStoreAttributes,
          };
        }
        strapi.log.debug(
          `Replaced incorrect relations in ${storeEntryData.__pivot.component_type} (id: ${componentData.id}).`
        );
      } catch (error) {
        strapi.log.error(error);
      }
    }

    return {
      data: componentData,
      flatData: flatComponentData,
      sanitizedData: sanitizedComponentData,
    };
  },

  /**
   * updateStoreFonts:
   * Moves fontFiles & cleans fontDirectories.
   */
  async updateStoreFonts(data) {
    if (data.setting[0] && data.setting[0].__component === "pb.sfnt") {
      const storeFont: any | null = (await pbEntityService.findOneByQuery(
        STORE_MODULE_UID,
        {
          fields: ["*"],
          filters: {
            struuid: data.struuid,
          },
          sort: {},
          populate: "pb-deep",
        }
      )) as any;
      const fontName = storeFont.setting[0].fontName
        ? `${storeFont.setting[0].fontName}-${storeFont.id}`
        : "Roboto"; // Roboto as fallback

      if (storeFont.setting[0].fontFile) {
        // Note: previously createOrUpdateFile:
        await strapi
          .service("plugin::pabu.pbsystem")
          .createSystemStrapiFile(
            storeFont.setting[0].fontFile,
            fontName,
            "ttf",
            "application/octet-stream",
            "fonts",
            "uploads",
            null,
            true
          );
      }

      await strapi.service("plugin::pabu.fonts").cleanFonts();
    }
  },
  /**
   * getAllStoreEntriesOfType:
   * Returns all storeEntries by storeType (font , googlefont, color) by matching with
   * store.name (startswith: ${storeType}:)
   * @returns {Promise<Array<any>}
   */
  async getAllStoreEntriesOfType(storeType: string) {
    const storeEntries = await pbEntityService.findMany(STORE_MODULE_UID, {
      fields: ["*"],
      filters: {
        name: {
          $startsWith: `${storeType}:`,
        },
      },
      sort: {},
      populate: "pb-deep",
    });
    return storeEntries ? storeEntries : [];
  },

  /**
   * populateStoreData
   * @param data glblData
   * @param {Array} stores default: ["str", "cesstr"]
   * @returns populatedStoreData
   */
  async populateStoreData(data, stores: Array<any> = ["str", "cesstr"]) {
    if (!data) {
      return data;
    }

    let storeData = {};
    for (const store of stores) {
      const storeEntries = await pbEntityService.findMany(
        `plugin::pabu.${store}`,
        {
          fields: ["*"],
          filters: {},
          sort: {},
          populate: "pb-deep",
        }
      );
      storeData[store] = storeEntries;
    }

    const populateObjectWithStoreData = (object, optimizeData: boolean) => {
      for (const [attributeKey, attributeValue] of Object.entries(object)) {
        if (
          attributeValue &&
          /* @ts-ignore */
          attributeValue.store &&
          /* @ts-ignore */
          attributeValue.storeType
        ) {
          /* @ts-ignore */
          if (attributeValue.values) {
            let storeValuesData = {};
            /* @ts-ignore */
            for (const storeId of attributeValue.values) {
              /* @ts-ignore */
              let relatedStoreData = storeData[attributeValue.store].find(
                (storeData) => storeData.id === storeId
              );
              // TBD: For now default (-1) data is null.
              storeValuesData[storeId] = relatedStoreData
                ? strapi
                    .service("plugin::pabu.str")
                    .getStoreData(relatedStoreData.setting[0], optimizeData)
                : null;

              if (
                storeId !== DEFAULT_AS_SELECTABLE_VALUE &&
                !relatedStoreData
              ) {
                strapi.log.debug(
                  /* @ts-ignore */
                  `Store-Entry [store: ${attributeValue.store} id: ${storeId}] does not exist anymore. (deleted?)`
                );
              }

              // Nested Store
              if (storeValuesData[storeId]) {
                for (const [innerKey, innerValue] of Object.entries(
                  storeValuesData[storeId]
                )) {
                  /* @ts-ignore */
                  if (innerValue && innerValue.values) {
                    let innerStoreValuesData = {};
                    /* @ts-ignore */
                    for (const nestedStoreId of innerValue.values) {
                      let innerRelatedStoreData = storeData[
                        /* @ts-ignore */
                        innerValue.store
                      ].find((storeData) => storeData.id === nestedStoreId);
                      // TBD: For now default (-1) data is null.
                      innerStoreValuesData[nestedStoreId] =
                        innerRelatedStoreData
                          ? strapi
                              .service("plugin::pabu.str")
                              .getStoreData(
                                innerRelatedStoreData.setting[0],
                                optimizeData
                              )
                          : null;

                      if (
                        nestedStoreId !== DEFAULT_AS_SELECTABLE_VALUE &&
                        !relatedStoreData
                      ) {
                        strapi.log.debug(
                          /* @ts-ignore */
                          `Store-Entry (nested in: ${storeId}) [store: ${innerValue.store} id: ${nestedStoreId}] does not exist anymore. (deleted?)`
                        );
                      }
                    }
                    // Debugging:
                    // strapi.log.debug(`.${attributeKey}.data.${storeId}.${innerKey}.data added`);
                    storeValuesData[storeId][innerKey].data =
                      innerStoreValuesData;
                  }
                }
              }
            }
            // Debugging:
            // strapi.log.debug(`.${attributeKey}.data added`);
            object[attributeKey].data = storeValuesData;
          }
        }
      }
      return object;
    };

    if (Object.keys(storeData).length > 0) {
      if (Array.isArray(data)) {
        // Store-Collection-Type [cesstr]
        // Note: Because of development of cfgModal Dropdowns we decided to not optimize
        // .data of storeValues if they are singleValues.
        const optimizeData = false;
        for (let index = 0; index < data.length; index++) {
          if (data[index].setting[0]) {
            data[index].setting[0] = populateObjectWithStoreData(
              data[index].setting[0],
              optimizeData
            );
            // TBD:
            // data[index].setting[0] = Object.keys(populatedData)
            //   .sort()
            //   .reduce(function (obj, key) {
            //     obj[key] = populatedData[key];
            //     return obj;
            //   }, {});
          }
        }
      } else {
        // SingleType with Components. [glbl]
        // Note: This was set to false with usage of spaceX & more Relations in glbl. (like in cesstr)
        const optimizeData = false;
        for (const [key, value] of Object.entries(data)) {
          if (value) {
            data[key] = populateObjectWithStoreData(value, optimizeData);
            // TBD:
            // data[key] = Object.keys(populatedData)
            //   .sort()
            //   .reduce(function (obj, key) {
            //     obj[key] = populatedData[key];
            //     return obj;
            //   }, {});
          }
        }
      }
    }
    return data;
  },

  /**
   * reduceBackgroundJsonData
   * @param backgrounds
   * @returns backgrounds without image & css attributes.
   */
  reduceBackgroundJsonData(backgrounds) {
    if (!backgrounds || !Array.isArray(backgrounds)) {
      return [];
    }
    for (let index = 0; index < backgrounds.length; index++) {
      if (backgrounds[index].setting && backgrounds[index].setting[0]) {
        // TBD: Do we need the image in the cfgModal-Dropdown?
        delete backgrounds[index].setting[0].backgroundImage;
        delete backgrounds[index].setting[0].additionalCss;
        delete backgrounds[index].setting[0].additionalCssHover;
      }
      backgrounds[index] = strapi
        .service("plugin::pabu.settings")
        .removeDynamicZoneArrayStructure(backgrounds[index], "setting");
    }
    return backgrounds;
  },

  /**
   * getStoreData
   * @param storeSettingData .setting[0] of your storeEntry
   * @param optimizeData Boolean
   * @param storeType optional: "color" If provided and storeSettingData is a singleValueStore-Entry it gets checked.
   * @returns storeSettingData
   */
  getStoreData(storeSettingData, optimizeData: boolean, storeType = null) {
    // Note: optimizeData Because of development of cfgModal Dropdowns we decided to not optimize
    // .data of storeValues if they are singleValues.

    if (storeSettingData && optimizeData) {
      if (storeSettingData.valueAttribute) {
        // "Sanitizing" is possible:
        if (storeType) {
          if (storeSettingData.valueAttribute !== storeType) {
            // singleValueStore-Entry does not match requested storeType
            strapi.log.warn(
              `storeType ${storeType} does not match with singleValueStoreEntry-Type: ${storeSettingData.valueAttribute}`
            );
            return null;
          }
          // singleValueStore-Entry matches requested storeType
        }
        // singleValue-Store-Entry without sanitizing.
        return storeSettingData[storeSettingData.valueAttribute];
      }

      // Remove only when optimizeData: true
      delete storeSettingData.id;
      delete storeSettingData.strname;
    }
    // Remove always:
    delete storeSettingData.strinfo;
    delete storeSettingData.__component;

    return storeSettingData;
  },

  async initializeStrListView() {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "content_manager_configuration",
    });

    await pluginStore.set({
      key: "content_types::plugin::pabu.str",
      value: {
        uid: "plugin::pabu.str",
        settings: {
          bulkable: true,
          filterable: true,
          searchable: true,
          pageSize: 50,
          mainField: "name",
          defaultSortBy: "type",
          defaultSortOrder: "ASC",
        },
        metadatas: {
          id: {
            edit: {},
            list: { label: "id", searchable: true, sortable: true },
          },
          name: {
            edit: {
              label: "name",
              description: "",
              placeholder: "",
              visible: true,
              editable: true,
            },
            list: { label: "name", searchable: true, sortable: true },
          },
          type: {
            edit: {
              label: "type",
              description: "",
              placeholder: "",
              visible: true,
              editable: true,
            },
            list: { label: "type", searchable: true, sortable: true },
          },
          struuid: {
            edit: {
              label: "struuid",
              description: "",
              placeholder: "",
              visible: true,
              editable: true,
            },
            list: { label: "struuid", searchable: true, sortable: true },
          },
          setting: {
            edit: {
              label: "setting",
              description: "",
              placeholder: "",
              visible: true,
              editable: true,
            },
            list: { label: "setting", searchable: false, sortable: false },
          },
          createdAt: {
            edit: {
              label: "createdAt",
              description: "",
              placeholder: "",
              visible: false,
              editable: true,
            },
            list: { label: "createdAt", searchable: true, sortable: true },
          },
          updatedAt: {
            edit: {
              label: "updatedAt",
              description: "",
              placeholder: "",
              visible: false,
              editable: true,
            },
            list: { label: "updatedAt", searchable: true, sortable: true },
          },
          createdBy: {
            edit: {
              label: "createdBy",
              description: "",
              placeholder: "",
              visible: false,
              editable: true,
              mainField: "firstname",
            },
            list: { label: "createdBy", searchable: true, sortable: true },
          },
          updatedBy: {
            edit: {
              label: "updatedBy",
              description: "",
              placeholder: "",
              visible: false,
              editable: true,
              mainField: "firstname",
            },
            list: { label: "updatedBy", searchable: true, sortable: true },
          },
        },
        layouts: {
          edit: [
            [
              { name: "name", size: 6 },
              { name: "type", size: 6 },
            ],
            [{ name: "struuid", size: 6 }],
            [{ name: "setting", size: 12 }],
          ],
          list: ["id", "name", "type", "updatedAt"],
        },
      },
    });
    strapi.log.info("Initialized ListView: pabu.str");
  },
};
