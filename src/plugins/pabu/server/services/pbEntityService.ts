import { Common } from "@strapi/types/dist/types";
import { syncNonLocalizedAttributes } from "../utils/localization";

/**
 * Removes confidential attributes from deep nested objects
 */
const pbSanitizeEntity = (entity: any) => {
  if (!entity) {
    return;
  }

  if (Array.isArray(entity)) {
    for (const entry of entity) {
      pbSanitizeEntity(entry);
    }
  } else if (typeof entity === "object") {
    delete entity["password"];
    delete entity["resetPasswordToken"];
    delete entity["registrationToken"];
    for (const [key, value] of Object.entries(entity)) {
      pbSanitizeEntity(value);
    }
  }
};

/**
 * Represents sorting options for database query parameters.
 */
type DbQueryParamSort =
  | { [key: string]: string }
  | { [key: string]: "asc" | "desc" };

/**
 * Represents query parameters for database queries in the PbPage entity.
 * @see {@link https://docs.strapi.io/dev-docs/api/entity-service/filter}
 * @see {@link https://docs.strapi.io/dev-docs/api/entity-service/order-pagination}
 * @see {@link https://docs.strapi.io/dev-docs/api/entity-service/populate}
 */
export interface PbDbQueryParams {
  _q?: string;
  fields?: Array<string>;
  filters?: Object;
  start?: number;
  limit?: number;
  locale?: string;
  sort?: DbQueryParamSort | Array<DbQueryParamSort>;
  populate?: "pb-deep" | "*";
  publicationState?: "live" | "preview";
}

/**
 * Data object needed for strapi.entityService CRUD operations
 */
export interface StrapiDataObject {
  data: any;
}

/**
 * Updates an entity with the specified ID, returns the updated and populated entity.
 *
 * @param {Common.UID.ContentType} api - The entity API.
 * @param {number} id - The ID of the entity to be updated.
 * @param {StrapiDataObject} data - The data to update the entity with.
 * @returns Returns the updated and populated entity, or null if the update fails.
 */
const updateAndReturnPopulated = async (
  api: Common.UID.ContentType,
  id: number,
  data: StrapiDataObject
): Promise<any> => {
  let updatedEntity = null;
  let populatedEntity: any = null;

  try {
    updatedEntity = (await strapi.entityService.update(api, id, data)) as any;
  } catch (error) {
    // Additional error info (YUP Validation errors etc.):
    strapi.log.error(error.details);
    strapi.log.error(error.name);
    strapi.log.error(error.message);
    strapi.log.error(error);
    strapi.log.error(`Error: [Update] - ${api} (id: ${id}) with data:`);
    strapi.log.error(JSON.stringify(data, null, 2));
  }

  if (updatedEntity) {
    await syncNonLocalizedAttributes(api, updatedEntity);

    const entity = (await strapi.entityService.findOne(api, id, {
      fields: ["*"],
      filters: {},
      sort: {},
      populate: "pb-deep",
    })) as any;

    pbSanitizeEntity(entity);
    populatedEntity = entity;
  }

  return populatedEntity;
};

/**
 * Creates an entity, returns the created and populated entity.
 *
 * @param {Common.UID.ContentType} api - The entity API.
 * @param {StrapiDataObject} data - The data to create the entity with.
 * @returns Returns the created and populated entity, or null if the creation fails.
 */
const createAndReturnPopulated = async (
  api: Common.UID.ContentType,
  data: StrapiDataObject
): Promise<any> => {
  let createdEntity: any | null = null;
  let populatedEntity: any = null;

  try {
    createdEntity = (await strapi.entityService.create(api, data)) as any;
  } catch (error) {
    strapi.log.error(error);
    strapi.log.error(`Error: [Create] - ${api} with data:`);
    strapi.log.error(JSON.stringify(data, null, 2));
    return null;
  }

  if (createdEntity) {
    const entity = (await strapi.entityService.findOne(api, createdEntity.id, {
      fields: ["*"],
      filters: {},
      sort: {},
      populate: "pb-deep",
    })) as any;

    pbSanitizeEntity(entity);
    populatedEntity = entity;
  }

  return populatedEntity;
};

/**
 * Finds and returns the first entity that matches the specified query parameters.
 *
 * @param {Common.UID.ContentType} api - The entity API.
 * @param {PbDbQueryParams} query - The query parameters.
 * @returns Returns the first matching entity, or null if no match is found.
 */
const findOneByQuery = async (
  api: Common.UID.ContentType,
  query: PbDbQueryParams
): Promise<any> => {
  let result: any[] | null = null;
  result = (await strapi.entityService.findMany(api, query as any)) as any;
  if (result && result[0]) {
    pbSanitizeEntity(result[0]);
    return result[0];
  } else {
    return null;
  }
};

const create = async (
  uid: Common.UID.ContentType,
  params: StrapiDataObject
): Promise<any> => {
  const entity = await strapi.entityService.create(uid, params);
  pbSanitizeEntity(entity);
  return entity;
};

const update = async (
  uid: Common.UID.ContentType,
  entityId: number,
  params: StrapiDataObject
): Promise<any> => {
  const entity = await strapi.entityService.update(uid, entityId, params);
  pbSanitizeEntity(entity);
  return entity;
};

const del = async (
  uid: Common.UID.ContentType,
  entityId: number
): Promise<any> => {
  const entity = await strapi.entityService.delete(uid, entityId);
  pbSanitizeEntity(entity);
  return entity;
};

const findMany = async (
  uid: Common.UID.ContentType,
  params?: PbDbQueryParams
): Promise<any> => {
  const entities = await strapi.entityService.findMany(uid, params as any);
  if (Array.isArray(entities)) {
    return entities?.map((entity) => {
      pbSanitizeEntity(entity);
      return entity;
    });
  } else {
    pbSanitizeEntity(entities);
    return entities;
  }
};

const findOne = async (
  uid: Common.UID.ContentType,
  entityId: number,
  params?: PbDbQueryParams
): Promise<any> => {
  const entity = await strapi.entityService.findOne(uid, entityId, params);
  pbSanitizeEntity(entity);
  return entity;
};

const pbEntityService = {
  createAndReturnPopulated,
  updateAndReturnPopulated,
  findOneByQuery,
  create,
  update,
  delete: del,
  findMany,
  findOne,
};

export default pbEntityService;
