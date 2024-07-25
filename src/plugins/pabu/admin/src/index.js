import { prefixPluginTranslations } from "@strapi/helper-plugin";
import pluginPkg from "../../package.json";
import Initializer from "./components/Initializer";
import OverwriteCSS from "./components/OverwriteCSS";
import PluginIcon from "./components/PluginIcon";
import ContentManager from "./components/contentManager";
import pluginId from "./pluginId";
import pabuReducers from "./hooks/reducers";

const name = pluginPkg.strapi.name;

export default {
  register(app) {
    // Pabu-Plugin
    app.addReducers(pabuReducers);
    app.addMenuLink({
      to: `/plugins/${pluginId}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${pluginId}.plugin.name`,
        defaultMessage: name,
      },
      Component: async () => {
        const component = await import(
          /* webpackChunkName: "[request]" */ "./pages/App"
        );

        return component;
      },
      permissions: [
        // Uncomment to set the permissions of the plugin here
        // {
        //   action: '', // the action name should be plugin::plugin-name.actionType
        //   subject: null,
        // },
      ],
    });
    app.registerPlugin({
      id: pluginId,
      initializer: Initializer,
      isReady: false,
      name,
    });

    // Store-Values
    app.customFields.register({
      name: "store-values",
      pluginId: "pabu",
      type: "json",
      intlLabel: {
        id: "pabu.store-values.label",
        defaultMessage: "Store Values",
      },
      intlDescription: {
        id: "pabu.store-values.description",
        defaultMessage: "Create a JSON with relation ids to a selected store.",
      },
      icon: PluginIcon,
      components: {
        Input: async () => import("./components/customFields/StoreValuesInput"),
      },
      options: {
        // No Regex for Grouped-Values.
      },
    });

    // Grouped-Values
    app.customFields.register({
      name: "grouped-values",
      pluginId: "pabu",
      type: "json",
      intlLabel: {
        id: "pabu.grouped-values.label",
        defaultMessage: "Grouped Values",
      },
      intlDescription: {
        id: "pabu.grouped-values.description",
        defaultMessage:
          "Create a row of up to 4 grouped values stored as JSON.",
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import("./components/customFields/GroupedValuesInput"),
      },
      options: {
        // No Regex for Grouped-Values.
      },
    });

    // String-Value
    app.customFields.register({
      name: "string-value",
      pluginId: "pabu",
      type: "string",
      intlLabel: {
        id: "pabu.string-value.label",
        defaultMessage: "String Value",
      },
      intlDescription: {
        id: "pabu.string-value.description",
        defaultMessage: "Creates a string value for the pabu pagebuilder.",
      },
      icon: PluginIcon,
      components: {
        Input: async () => import("./components/customFields/StringValueInput"),
      },
      options: {
        advanced: [
          {
            intlLabel: {
              id: "pabu.string-value.options.advanced.regex",
              defaultMessage: "RegExp pattern",
            },
            name: "regex",
            type: "text",
            description: {
              id: "pabu.string-value.options.advanced.regex.description",
              defaultMessage: "The text of the regular expression",
            },
          },
        ],
      },
    });

    // Integer-Value
    app.customFields.register({
      name: "integer-value",
      pluginId: "pabu",
      type: "integer",
      intlLabel: {
        id: "pabu.integer-value.label",
        defaultMessage: "Integer Value",
      },
      intlDescription: {
        id: "pabu.integer-value.description",
        defaultMessage: "Creates a integer value for the pabu pagebuilder.",
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import("./components/customFields/IntegerValueInput"),
      },
      options: {
        advanced: [
          {
            intlLabel: {
              id: "pabu.integer-value.options.advanced.regex",
              defaultMessage: "RegExp pattern",
            },
            name: "regex",
            type: "text",
            description: {
              id: "pabu.integer-value.options.advanced.regex.description",
              defaultMessage: "The text of the regular expression",
            },
          },
        ],
      },
    });

    // Boolean-Value
    app.customFields.register({
      name: "boolean-value",
      pluginId: "pabu",
      type: "boolean",
      intlLabel: {
        id: "pabu.boolean-value.label",
        defaultMessage: "Boolean Value",
      },
      intlDescription: {
        id: "pabu.boolean-value.description",
        defaultMessage: "Creates a boolean value for the pabu pagebuilder.",
      },
      icon: PluginIcon,
      components: {
        Input: async () =>
          import("./components/customFields/BooleanValueInput"),
      },
      options: {
        // No Regex for Boolean-Value.
      },
    });

    // Text-Value
    app.customFields.register({
      name: "text-value",
      pluginId: "pabu",
      type: "text",
      intlLabel: {
        id: "pabu.text-value.label",
        defaultMessage: "Text Value",
      },
      intlDescription: {
        id: "pabu.text-value.description",
        defaultMessage: "Creates a text value for the pabu pagebuilder.",
      },
      icon: PluginIcon,
      components: {
        Input: async () => import("./components/customFields/TextValueInput"),
      },
      options: {
        // No Regex for Text-Value.
      },
    });

    // JSON-Value
    app.customFields.register({
      name: "json-value",
      pluginId: "pabu",
      type: "json",
      intlLabel: {
        id: "pabu.json-value.label",
        defaultMessage: "JSON Value",
      },
      intlDescription: {
        id: "pabu.json-value.description",
        defaultMessage: "Creates a JSON value for the pabu pagebuilder.",
      },
      icon: PluginIcon,
      components: {
        Input: async () => import("./components/customFields/JsonValueInput"),
      },
      options: {
        // No Regex for Json-Value.
      },
    });

    // Hex-Color
    app.customFields.register({
      name: "hex-color",
      pluginId: "pabu",
      type: "string",
      icon: PluginIcon,
      intlLabel: {
        id: "pabu.hex-color.label",
        defaultMessage: "Color",
      },
      intlDescription: {
        id: "pabu.hex-color.description",
        defaultMessage: "Select any color",
      },
      components: {
        Input: async () =>
          import("./components/customFields/HexColorInput/HexColorInput").then(
            (module) => ({
              default: module.HexColorInput,
            })
          ),
      },
      options: {
        // No Regex for Hex-Color.
      },
    });

    // Overwrite CSS:
    app.addMenuLink({
      to: "/only-overwrites-css",
      icon: OverwriteCSS,
      intlLabel: {
        id: "overwriteCSS.label",
        defaultMessage: "overwriteCSS",
      },
      Component: () => "",
      permissions: [],
    });

    // contentManager
    app.injectContentManagerComponent("editView", "right-links", {
      name: "contentManager",
      Component: ContentManager,
    });
  },

  bootstrap(app) {},
  async registerTrads({ locales }) {
    const importedTrads = await Promise.all(
      locales.map((locale) => {
        return import(
          /* webpackChunkName: "translation-[request]" */ `./translations/${locale}.json`
        )
          .then(({ default: data }) => {
            return {
              data: prefixPluginTranslations(data, pluginId),
              locale,
            };
          })
          .catch(() => {
            return {
              data: {},
              locale,
            };
          });
      })
    );

    return Promise.resolve(importedTrads);
  },
};
