import { Strapi } from "@strapi/strapi";
import { Common } from "@strapi/types/dist/types";
import { StrapiUploadFile, StrapiUploadFolder } from "../../custom";
import {
  DYNAMICLIST_MODULE_UID,
  FILE_MODEL_UID,
  MEDIA_MANAGER_ROOT_FOLDER,
  NAVIGATION_MODULE_UID,
  PAGE_MODULE_UID,
} from "../constants";
import {
  BulkDeleteFoldersRequest,
  CreateFolderRequest,
  PbFile,
  PbFileDownload,
  PbFileLocalizations,
  PbFileResponse,
  StrapiUploadFileReference,
  UpdateFileRequest,
  UpdateFolderRequest,
} from "../types/pbfile";
import {
  countMediaInObjectById,
  getService,
  getUploadService,
  sleep,
} from "../utils/functions";
import {
  i18nDefaultLocale,
  syncNonLocalizedAttributes,
  synchronizeLocalizations,
} from "../utils/localization";
import pbEntityService from "./pbEntityService";

export default ({ strapi }: { strapi: Strapi }) => ({
  /**
   * Retrieves a PB file based on its media library file ID.
   *
   * @param {number} mFileId - The media library file to be retrieved.
   * @returns {Promise<PbFile>} A Promise that resolves with the PB file object corresponding to the specified file ID.
   * @async
   */
  async pbFileByFileId(mFileId: number): Promise<PbFile> {
    return await strapi.db!.query(FILE_MODEL_UID).findOne({
      where: {
        fileId: mFileId,
      },
      populate: {
        localizations: true,
      },
    });
  },
  /**
   * Handles the creation event for a new media file in the library.
   *
   * @param {any} mFile - The new media file object to be processed.
   * @returns {Promise<PbFile | null>} A Promise that resolves with the created media file object if successful, or null if the media file cannot be created.
   * @async
   */
  async mediaLibraryCreateEvent(mFile: any): Promise<PbFile | null> {
    strapi.log.debug("mediaLibraryCreateEvent", mFile);
    if (!mFile || !mFile.id) {
      strapi.log.error(`mediaLibraryCreateEvent: object is not valid`);
      return null;
    }

    return (await pbEntityService.create(FILE_MODEL_UID, {
      data: {
        fileId: mFile.id,
        name: mFile.name,
        alternativeText: mFile.alternativeText,
      },
    })) as unknown as PbFile;
  },
  /**
   * Handles the update event for a media file in the library.
   *
   * @param {any} mFile - The updated media file object to be processed.
   * @returns {Promise<PbFile | null>} A Promise that resolves with the updated media file object if successful, or null if the media file does not exist or cannot be updated.
   * @async
   */
  async mediaLibraryUpdateEvent(mFile: any): Promise<PbFile | null> {
    strapi.log.debug("mediaLibraryUpdateEvent", mFile);
    const pbFile: PbFile = await strapi.db!.query(FILE_MODEL_UID).findOne({
      where: {
        fileId: mFile.id,
      },
    });

    if (!pbFile) {
      strapi.log.warn(
        `mediaLibraryUpdateEvent: pb-file for file (${mFile.id}) not found. create new entry.`
      );
      return this.mediaLibraryCreateEvent(mFile);
    }

    return (await pbEntityService.update(FILE_MODEL_UID, pbFile.id, {
      data: {
        id: pbFile.id,
        fileId: mFile.id,
        name: mFile.name,
        alternativeText: mFile.alternativeText,
      },
    })) as unknown as PbFile;
  },
  /**
   * Handles the deletion event for a media file in the library.
   *
   * @param {number} mFileId - The ID of the media file to be deleted.
   * @returns {Promise<void>} A Promise that resolves when the deletion event is successfully handled.
   * @async
   */
  async mediaLibraryDeleteEvent(mFileId: number): Promise<void> {
    strapi.log.debug("mediaLibraryDeleteEvent", mFileId);

    const pbFiles: any = await pbEntityService.findMany(FILE_MODEL_UID, {
      filters: {
        fileId: mFileId,
      },
      locale: "all",
      populate: "pb-deep",
    });

    if (!pbFiles) {
      strapi.log.warn(
        `mediaLibraryDeleteEvent: pb-file for file (${mFileId}) not found.`
      );
      return;
    }

    for (const pbFile of pbFiles) {
      await pbEntityService.delete(FILE_MODEL_UID, pbFile.id);
    }
  },
  /**
   * Retrieves localizations for a specific PB file based on its ID.
   *
   * @param {number} mFileId - The ID of the PB file for which localizations are to be retrieved.
   * @returns {Promise<PbFileLocalizations>} A Promise that resolves with an object containing PB file localizations.
   * @async
   */
  async getPbFileLocalizations(mFileId: number): Promise<PbFileLocalizations> {
    const localizations: PbFileLocalizations = {};
    const defaultLocale = await i18nDefaultLocale();
    const pbFile = await strapi.db!.query(FILE_MODEL_UID).findOne({
      where: {
        fileId: mFileId,
      },
      populate: {
        localizations: true,
      },
    });
    if (pbFile) {
      localizations[pbFile.locale] = {
        alternativeText: pbFile.alternativeText,
        title: pbFile.title,
        isStrapiDefault: pbFile.locale === defaultLocale,
      };
      if (pbFile.localizations?.length > 0) {
        for (let localization of pbFile.localizations) {
          localizations[localization.locale] = {
            alternativeText: localization.alternativeText,
            title: localization.title,
            isStrapiDefault: localization.locale === defaultLocale,
          };
        }
      }
    }
    return localizations;
  },
  /**
   * Adds localizations to a Strapi media object.
   *
   * @param {any} strapiMediaObject - The Strapi media object to which localizations will be added.
   * @returns {Promise<void>} A Promise that resolves when the localizations are successfully added.
   * @async
   */
  async addLocalizationsToMediaObjects(strapiMediaObject: any): Promise<void> {
    if (!strapiMediaObject) {
      return;
    }
    if (
      strapiMediaObject.id !== undefined &&
      strapiMediaObject.mime !== undefined &&
      strapiMediaObject.url !== undefined
    ) {
      strapiMediaObject.localizations = await this.getPbFileLocalizations(
        strapiMediaObject.id
      );
    }
    for (const key in strapiMediaObject) {
      if (
        strapiMediaObject.hasOwnProperty(key) &&
        typeof strapiMediaObject[key] === "object"
      ) {
        await this.addLocalizationsToMediaObjects(strapiMediaObject[key]);
      }
    }
  },
  /**
   * Retrieves the parent folders of the specified path from the given list of folders.
   *
   * @param {string} path - The path for which parent folders need to be retrieved.
   * @param {any[]} folders - List of folders to search within.
   * @returns {string[]} An array containing the parent folders of the specified path.
   */
  async getParents(
    path: string,
    folders: StrapiUploadFolder[]
  ): Promise<StrapiUploadFolder[]> {
    const rootFolder =
      (await this.mediaManagerRootFolder()) ??
      ({
        id: null,
        path: "/",
      } as StrapiUploadFolder);
    const pathSegments = path.split("/").filter((segment) => segment !== "");
    const parents: StrapiUploadFolder[] = [];
    for (const segment of pathSegments) {
      const item = folders.find(
        (folder) => folder.pathId === parseInt(segment)
      );
      if (item && item.id !== rootFolder.id) {
        parents.push(item);
      }
    }
    return parents;
  },
  /**
   * Handles the retrieval of files and folders information based on the provided folderPath.
   *
   * @param {string} folderPath - The path of the target folder. Defaults to the root ("/").
   * @param {string | null} folder - The parent folder's identifier or null for the root folder.
   *
   * @returns {Promise<PbFileResponse>} A object containing information
   * about the files and folders, including breadcrumb, parents, folders, and files.
   */
  async filesHandler(
    folderPath = "/",
    folder: string | null
  ): Promise<PbFileResponse> {
    const folders: any = await pbEntityService.findMany(
      "plugin::upload.folder",
      {
        filters: {
          parent: folder,
        },
      }
    );

    const allFolder: any = await pbEntityService.findMany(
      "plugin::upload.folder"
    );

    const files: any = await pbEntityService.findMany("plugin::upload.file", {
      filters: {
        folderPath: folderPath,
      },
    });

    for (const file of files) {
      file.pbFile = await this.pbFileByFileId(file.id);
    }

    return {
      parents: await this.getParents(folderPath, allFolder),
      folders: folders,
      files: files,
    };
  },

  async getFileById(id: number): Promise<StrapiUploadFile> {
    const file: any = await pbEntityService.findOne("plugin::upload.file", id);
    if (!file) {
      return Promise.reject("could not find file with id=" + id);
    }
    file.pbFile = await this.pbFileByFileId(file.id);

    return file;
  },
  /**
   * Finds references to a specific upload file by its ID in various content types.
   * @param fileId - The ID of the upload file to search for references.
   * @returns A promise that resolves to an array of StrapiUploadFileReference objects representing the references found.
   * @throws If the specified file with the given ID does not exist.
   */
  async findReferences(fileId: string) {
    const strapiFile = await pbEntityService.findOne(
      "plugin::upload.file",
      parseInt(fileId, 10),
      {}
    );
    if (!strapiFile) {
      return Promise.reject(`file with id "${fileId}" does not exist`);
    }

    const getModelType = (uid: Common.UID.ContentType, obj: any) => {
      switch (uid) {
        case PAGE_MODULE_UID:
          return obj.isDraft ? "draftpage" : "page";
        case DYNAMICLIST_MODULE_UID:
          return "dynamiclist";
        case NAVIGATION_MODULE_UID:
          return "navigation";
        default:
          return uid.toString();
      }
    };

    const mediaFounds: StrapiUploadFileReference[] = [];
    const searchList = [
      PAGE_MODULE_UID,
      DYNAMICLIST_MODULE_UID,
      NAVIGATION_MODULE_UID,
    ];
    for (const contentTypeUid of searchList) {
      const contentTypeResults = (await pbEntityService.findMany(
        contentTypeUid,
        {
          populate: "pb-deep",
        }
      )) as any[];

      for (const contentType of contentTypeResults) {
        const countMediaInObject = countMediaInObjectById(
          contentType,
          parseInt(fileId, 10)
        );
        if (countMediaInObject !== 0) {
          mediaFounds.push({
            modelType: getModelType(contentTypeUid, contentType),
            description: contentType.name,
            amount: countMediaInObject,
          });
        }
      }
    }
    return Promise.resolve(mediaFounds);
  },
  async deleteFile(id: number) {
    const file = await pbEntityService.findOne("plugin::upload.file", id);

    if (!file) {
      return Promise.reject(`file with id "${id}" does not exist`);
    }

    const fileReferences = await getService("pbfile").findReferences(id);
    const removedFile = await getUploadService("upload").remove(file);
    await regenerateJsonFilesFromFileReferences(fileReferences);
    return removedFile;
  },
  async updateFile(updateFileRequest: UpdateFileRequest) {
    if (!updateFileRequest.file.pbFile) {
      // no pb file exists
      return;
    }

    const strapiFile = await pbEntityService.findOneByQuery(
      "plugin::upload.file",
      {
        filters: {
          id: updateFileRequest.file.id,
        },
      }
    );

    if (!strapiFile) {
      return;
    }
    
    if (strapiFile.name !== updateFileRequest.file.name) {
      const copyResult = await strapi
        .service("plugin::pabu.file")
        .copyFile(
          `${process.cwd()}/public/uploads/`,
          `${strapiFile.hash}${strapiFile.ext}`,
          `${process.cwd()}/public/uploads/`,
          `${updateFileRequest.file.name}`
        );

      if (!copyResult) {
        strapi.log.warn(
          "could not copy file in /uploads " +
            `${strapiFile.hash}${strapiFile.ext}`
        );
        return;
      }

      const fileBuffer: any = await strapi
        .service("plugin::pabu.file")
        .getFileBuffer("uploads", `${updateFileRequest.file.name}`);

      const path = `${process.cwd()}/public/uploads/${
        updateFileRequest.file.name
      }`;

      let uploadedFile: StrapiUploadFile | null = null;

      try {
        uploadedFile = await strapi
          .plugin("pabu")
          .service("pbupload")
          .insertOrReplaceStrapiUpload(fileBuffer, {
            path: path,
            filename: updateFileRequest.file.name,
            fileType: updateFileRequest.file.mime,
            fileSize: updateFileRequest.file.size,
            fileInformation: {
              strapiUploadUpdateId: updateFileRequest.file.id,
            },
          });
      } catch (error) {
        strapi.log.error(error);
        strapi.log.error("could not update strapi file");
        return;
      }

      const removeSuccess = strapi
        .service("plugin::pabu.file")
        .removeFile("uploads", updateFileRequest.file.name, false);

      if (!removeSuccess) {
        strapi.log.warn(
          "could not remove copied file with name=" +
            updateFileRequest.file.name
        );
      }
    }

    const updatedDefaultPbFile = await pbEntityService.updateAndReturnPopulated(
      FILE_MODEL_UID,
      updateFileRequest.file.pbFile.id,
      {
        data: {
          alternativeText: updateFileRequest.file.pbFile.alternativeText,
          title: updateFileRequest.file.pbFile.title,
          description: updateFileRequest.file.pbFile.description,
        },
      }
    );

    if (updateFileRequest.file.pbFile.localizations) {
      for (const localizedPbFile of updateFileRequest.file.pbFile
        .localizations) {
        if (localizedPbFile.id) {
          await pbEntityService.update(FILE_MODEL_UID, localizedPbFile.id, {
            data: {
              alternativeText: localizedPbFile.alternativeText,
              title: localizedPbFile.title,
              description: localizedPbFile.description,
            },
          });
        } else {
          const newLocalizedPbFile = await pbEntityService.create(
            FILE_MODEL_UID,
            {
              data: {
                ...localizedPbFile,
              },
            }
          );

          const syncResult = await synchronizeLocalizations(
            updatedDefaultPbFile,
            {
              locale: newLocalizedPbFile.locale,
              id: newLocalizedPbFile.id as number,
            },
            FILE_MODEL_UID
          );

          if (!syncResult) {
            strapi.log.warn(
              `the file localizations array could not be synced` +
                `default locale entry=${updateFileRequest.file.pbFile.id}` +
                `tried to sync={locale: ${newLocalizedPbFile.locale}, id:${newLocalizedPbFile.id}}`
            );
          }
        }
      }
    }

    const defaultPbFile = await pbEntityService.findOne(
      FILE_MODEL_UID,
      updateFileRequest.file.pbFile.id,
      { populate: "pb-deep" }
    );

    await syncNonLocalizedAttributes(FILE_MODEL_UID, defaultPbFile);
    
    const fileReferences = await getService("pbfile").findReferences(
      updateFileRequest.file.id
    );
    await regenerateJsonFilesFromFileReferences(fileReferences);
  },
  async search(name: string) {
    const allFiles: any = await pbEntityService.findMany(
      "plugin::upload.file",
      {}
    );
    const rootFolder = await this.mediaManagerRootFolder();
    const filteredFiles = allFiles.filter((file) => {
      if (file.name.toLowerCase().includes(name.toLowerCase())) {
        if (rootFolder) {
          return file.folderPath.startsWith(rootFolder.path);
        }
        return file;
      }
    });
    for (const file of filteredFiles) {
      file.pbFile = await this.pbFileByFileId(file.id);
    }
    return filteredFiles;
  },
  async createFolder(createFolderRequest: CreateFolderRequest) {
    const uploadService = getUploadService("folder");
    return await uploadService.create({
      name: createFolderRequest.name,
      parent: createFolderRequest.parentId,
    });
  },
  async updateFolder(
    id: number,
    user: any,
    updateFolderRequest: UpdateFolderRequest
  ) {
    const uploadService = getUploadService("folder");
    return await uploadService.update(id, updateFolderRequest, {
      user,
    });
  },
  async bulkDeleteFolders(deleteFolderRequest: BulkDeleteFoldersRequest) {
    const uploadService = getUploadService("folder");
    return await uploadService.deleteByIds(deleteFolderRequest.folderIds);
  },
  async fileDownloadById(id: number): Promise<PbFileDownload | null> {
    const file: any = await pbEntityService.findOne("plugin::upload.file", id);

    if (!file) {
      return Promise.reject("could not find file with id=" + id);
    }

    if (file) {
      let readStream = await strapi
        .service("plugin::pabu.file")
        .getFileStream("uploads", file.hash + file.ext);

      if (readStream) {
        return { readStream: readStream, name: file.name };
      }
    }

    return Promise.reject("could not create readstream for file with id=" + id);
  },
  async mediaManagerRootFolder() {
    const pbMediaManagerFolder: any = await pbEntityService.findOneByQuery(
      "plugin::upload.folder",
      {
        filters: {
          name: MEDIA_MANAGER_ROOT_FOLDER,
        },
      }
    );
    return pbMediaManagerFolder ?? null;
  },
  async initMediaManagerRootFolder() {
    const pbMediaManagerFolder: any = await pbEntityService.findOneByQuery(
      "plugin::upload.folder",
      {
        filters: {
          name: MEDIA_MANAGER_ROOT_FOLDER,
        },
      }
    );
    if (!pbMediaManagerFolder) {
      strapi.log.info(
        "[PB] create media manager root folder: " + MEDIA_MANAGER_ROOT_FOLDER
      );
      await getUploadService("folder").create({
        name: MEDIA_MANAGER_ROOT_FOLDER,
      });
    }
  },
});

export const regenerateJsonFilesFromFileReferences = async (fileReferences: any) => {
  if (fileReferences) {
    let regenerate = false;
    if (
      fileReferences.some(
        (fileReference) => fileReference.modelType === "navigation"
      )
    ) {
      await strapi
        .plugin("pabu")
        .service("pbnavigation")
        .createNavigationJson();
      regenerate = true;
    }
    if (
      fileReferences.some(
        (fileReference) => fileReference.modelType === "dynamiclist"
      )
    ) {
      await strapi
        .plugin("pabu")
        .service("pbdynamiclist")
        .createDynamicListJson();
      regenerate = true;
    }
    if (regenerate) {
      await sleep(1500);
    }
  }
  return Promise.resolve();
};
