import { CESSTR_MODULE_UID, CES_STORE_DEFAULTS_STRUUIDS } from "../constants";
import pbEntityService from "./pbEntityService";
const { ValidationError } = require("@strapi/utils").errors;

export default {
  /**
   * getAllCesStoreEntriesOfType:
   * Returns all contentElementSettingsStoreEntries by storeType (richtext, headline) by matching with
   * store.name (startswith: ${storeType}:)
   * @returns {Promise<Array<any>}
   */
  async getAllCesStoreEntriesOfType(storeType: string) {
    const storeEntries = await pbEntityService.findMany(CESSTR_MODULE_UID, {
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
  async initializeCesstrListView() {
    const pluginStore = strapi.store({
      environment: "",
      type: "plugin",
      name: "content_manager_configuration",
    });

    await pluginStore.set({
      key: "content_types::plugin::pabu.cesstr",
      value: {
        uid: "plugin::pabu.cesstr",
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

    strapi.log.info("Initialized ListView: pabu.cesstr");
  },

  /**
   * isDefaultCeSetting:
   * Returns true if the entry is the default CeSetting (cesstr-Entry) of its type.
   * @returns {boolean}
   */
  async isDefaultCeSetting(cesstrId) {
    const cesstrEntry: any = await pbEntityService.findOne(
      CESSTR_MODULE_UID,
      cesstrId,
      {
        fields: ["*"],
        filters: {},
        sort: {},
        populate: "pb-deep",
      }
    );
    if (
      cesstrEntry &&
      cesstrEntry.setting &&
      CES_STORE_DEFAULTS_STRUUIDS[
        cesstrEntry.setting[0].__component.replace("pb.", "")
      ] === cesstrEntry.struuid
    ) {
      return true;
    }
    return false;
  },

  /**
   * preventDeleteDefault:
   * Throws a validationError if the cesstrId belongs to a default CE-Setting.
   * @returns
   */
  async preventDeleteDefault(cesstrId: number) {
    if (
      await strapi.service("plugin::pabu.cesstr").isDefaultCeSetting(cesstrId)
    ) {
      throw new ValidationError(
        `Default Content-Element-Setting (id: ${cesstrId}) can't be deleted.`
      );
    }
  },

  /**
   * preventDeleteDefaults:
   * Throws a validationError if array includes a cesstrId that belongs to a default CE-Setting.
   * @returns
   */
  async preventDeleteDefaults(cesstrIds: Array<number>) {
    let defaultCeSettings: Array<number> = [];
    for (const cesstrId of cesstrIds) {
      if (
        await strapi.service("plugin::pabu.cesstr").isDefaultCeSetting(cesstrId)
      ) {
        defaultCeSettings.push(cesstrId);
      }
    }
    if (defaultCeSettings.length > 0) {
      throw new ValidationError(
        `Selection includes default Content-Element-Settings (ids: ${defaultCeSettings.join(
          ", "
        )}) that can't be deleted.`
      );
    }
  },
};

/**
 * doesCesstrTypeExist:
 * Returns true if cesstr of this type (__component:-Value) does exist.
 * @returns {boolean}
 */
const doesCesstrTypeExist = (cesstrs: Array<any>, cesstrType: string) => {
  return cesstrs.find(
    (cesstr) =>
      cesstr.setting &&
      cesstr.setting[0] &&
      cesstr.setting[0].__component === cesstrType
  )
    ? true
    : false;
};
