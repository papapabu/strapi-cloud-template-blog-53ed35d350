import { Schema } from "@strapi/strapi";
import type { Common } from "@strapi/types/dist/types";
import slugify from "slugify";
import { PAGE_MODULE_UID } from "../constants";
import pbEntityService from "../services/pbEntityService";
import { ContentElement, NestedElement } from "../types/pbpage";
const { JSDOM } = require("jsdom");

/**
 * Retrieves a service instance from the "pabu" plugin in the Strapi framework.
 *
 * @param {string} name - The name of the service to retrieve.
 * @returnsThe service instance associated with the provided name.
 */
export const getService = (name: string) => {
  return strapi.plugin("pabu").service(name);
};

/**
 * Retrieves a service instance from the "upload" plugin in the Strapi framework.
 *
 * @param {string} name - The name of the service to retrieve.
 * @returnsThe service instance associated with the provided name.
 */
export const getUploadService = (name: string) => {
  return strapi.plugin("upload").service(name);
};

/**
 * checks if the given string results in a valid html element
 * @param {string} htmlString
 * @returns
 */
export const isValidHtml = (htmlString: string) => {
  try {
    new JSDOM(htmlString);
    return true;
  } catch (error) {
    return false;
  }
};

/**
 * Slugifies a string by replacing spaces with slashes and applying slugify to each segment.
 *
 * @param name - The input string to be slugified with slashes.
 * @returns The slugified string with slashes.
 */
export const slugifyWithSlashes = (name: string) => {
  return name
    .split("/")
    .map((val) => slugify(val))
    .join("/");
};

/**
 * Removes special characters in a string.
 *
 * @param str - The input string containing special characters.
 * @returns The string with special characters replaced.
 */
export const removeSpecialCharacters = (str: string) => {
  // Replace umlauts
  str = str.replace(/ä/g, "ae");
  str = str.replace(/ö/g, "oe");
  str = str.replace(/ü/g, "ue");
  str = str.replace(/ß/g, "ss");

  // Remove special characters
  str = str.replace(/[^\w\s-]/gi, "");

  // Fallback
  if (str.length === 0) {
    str = "invalid";
  }

  return str;
};

/**
 * Checks if a given URL is unique by querying a database for existing pages with the same URL.
 *
 * @param url - The URL to be checked for uniqueness.
 * @returns `true` if the URL is unique, and `false` otherwise.
 */
export const isUrlUnique = async (url: string) => {
  const page = await strapi.db.query("plugin::pabu.pbpage").findOne({
    where: {
      url: url,
    },
  });
  return !page;
};

/**
 * Finds a nested element within a given component.
 * @param component - Component to search for nested elements.
 * @returns Nested element or undefined if not found.
 */
export const findNestedElement = (
  component: Schema.Component
): NestedElement | undefined => {
  return Object.entries(component.attributes)
    .flatMap(([_, attributes]) =>
      Object.entries(attributes).flatMap(([key, value]) =>
        key === "repeatable" && value
          ? Object.values(strapi.components).find(
              // @ts-ignore
              (nestedElement) => nestedElement.uid === attributes.component
            )
          : []
      )
    )
    .map(
      (nestedElement) =>
        ({
          uid: nestedElement.uid,
          attributes: nestedElement.attributes,
        } as NestedElement)
    )
    .pop();
};
/**
 * Retrieves available content elements.
 * @returns Array of content elements with their attributes and optional nested elements.
 */
export const availableContentElements = (): ContentElement[] => {
  const contentElementComponentNames =
    strapi.contentTypes[PAGE_MODULE_UID].attributes.content["components"];

  const availableComponents: ContentElement[] =
    // Exclude searchresults (csrchslts).
    contentElementComponentNames
      .filter((contentElementName) => contentElementName !== "pb.csrchrslts")
      .map((contentElementName) => {
        const contentElement = strapi.components[
          contentElementName
        ] as unknown as ContentElement;

        const nestedElement = findNestedElement(
          contentElement as Schema.Component
        );

        if (nestedElement) {
          contentElement.nestedElement = nestedElement;
        }

        return contentElement;
      });
  return availableComponents;
};

/**
 * Checks if the value is unique for the specified attribute in the given entity.
 *
 * @param {string} entityApi - The name of the entity API.
 * @param {string} attribute - The name of the attribute to be checked.
 * @param {string | number} value - The value to be checked.
 * @param {number} entityId - The ID of the entity to be excluded.
 * @param {string} [strapiLocale] - The locale for the query (optional).
 * @returns {Promise<boolean>} - Returns true if the value is unique; otherwise, false.
 */
export const isValueUnique = async (
  entityApi: Common.UID.ContentType,
  attribute: string,
  value: string | number,
  entityId: number | null,
  strapiLocale?: string
): Promise<boolean> => {
  let entity: any = null;

  const queryOptions: any = {
    fields: ["*"],
    filters: {
      [attribute]: value,
    },
    sort: {},
    populate: "pb-deep",
  };

  if (strapiLocale) {
    queryOptions.locale = strapiLocale;
  }

  try {
    entity = await pbEntityService.findOneByQuery(entityApi, queryOptions);
  } catch (error) {
    strapi.log.error(`[PB] Error while searching for ${entityApi}`);
    strapi.log.error(error);
  }
  return !entity || entity.id === entityId;
};

/**
 * Checks if a string is empty or consists only of whitespace characters.
 *
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is empty or contains only whitespace; otherwise, false.
 */
export const stringIsEmpty = (str: string): boolean =>
  typeof str === "string" && !str.trim();

/**
 * Checks if an entity with the specified ID does not exist in the given entity API.
 *
 * @param {number} id - The ID of the entity to be checked.
 * @param {Common.UID.ContentType} entityApi - The entity API for the entity.
 * @returns {Promise<boolean>} - Returns true if the entity with the specified ID does not exist; otherwise, false.
 */
export const idDoesNotExist = async (
  id: number,
  entityApi: Common.UID.ContentType
): Promise<boolean> => {
  const result = await pbEntityService.findOne(entityApi, id, {
    fields: ["*"],
    filters: {},
    sort: {},
  });
  return !result;
};

/**
 * Sanitizes an entity by removing specific properties such as 'id', 'localizations',
 * 'createdAt', 'updatedAt', and 'locale'.
 *
 * @param {Common.UID.ContentType} entity - The entity to be sanitized.
 */
export const sanitizeEntity = async (entity: Common.UID.ContentType) => {
  if (entity) {
    Object.keys(entity).map(async (key) => {
      if (
        key === "id" ||
        key === "localizations" ||
        key === "createdAt" ||
        key === "updatedAt" ||
        key === "locale"
      ) {
        delete entity[key];
      } else if (entity[key] && typeof entity[key] === "object") {
        entity[key] = await sanitizeEntity(entity[key]);
      }
    });
  }
  return entity;
};

/**
 * Generates a random string based on the current timestamp.
 * @returns A random string representation of the current timestamp.
 */
export const randomString = () => Date.now().toString(36);

/**
 * Recursively counts the occurrences of media objects with a specific ID in the given object.
 * @param strapiObject - The object to search for media objects.
 * @param id - The ID of the media object to count.
 * @returns The number of occurrences of the specified media object ID.
 */
export const countMediaInObjectById = (
  strapiObject: any,
  id: number
): number => {
  if (strapiObject === null || typeof strapiObject !== "object") {
    return 0;
  }
  if (Array.isArray(strapiObject)) {
    return strapiObject.reduce(
      (count: number, element: any) =>
        count + countMediaInObjectById(element, id),
      0
    );
  } else {
    let count = 0;
    if (
      strapiObject.id === id &&
      "mime" in strapiObject &&
      "url" in strapiObject
    ) {
      count += 1;
    }
    count += Object.values(strapiObject).reduce(
      (innerCount: number, value: any) =>
        innerCount + countMediaInObjectById(value, id),
      0
    ) as number;
    return count;
  }
};

export const sleep = (ms: number): Promise<void> =>
  new Promise((r) => setTimeout(r, ms));

export const getFontFamily = (fontId: number, storeFonts: Array<any>) => {
  let fontFamily = "font-family: 'Roboto';";
  storeFonts.forEach((storeFont) => {
    if (storeFont.id === fontId) {
      fontFamily = storeFont.css.fontFamily;
    }
  });
  return fontFamily;
};
