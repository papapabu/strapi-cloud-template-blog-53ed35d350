import { STORE_MODULE_UID, SYSTEM_MODULE_UID } from "../constants";
import { getUploadService } from "../utils/functions";
import pbEntityService from "./pbEntityService";

export default {
  /**
   * updateSystemFiles
   * Updates the pbSystem.systemFiles Attribute by adding (optional: fileCategory) fileName with fileInfo.
   * systemFiles: {
   *  "global-config" : {
   *    "id": 4
   *    "url": media-library-url
   *    "systemURL": usable by frontend to access local file
   *  }
   *  ...
   * }
   * @param fileName
   * @param fileInfo
   * @param fileCategory
   */
  async updateSystemFiles(
    fileName: string,
    fileInfo: any,
    fileCategory: string | undefined = undefined
  ) {
    let pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});
    let systemFileInfo = {
      [fileName]: fileInfo,
    };
    await pbEntityService.update(SYSTEM_MODULE_UID, pbSystem.id, {
      data: {
        ...pbSystem,
        systemFiles: {
          ...pbSystem.systemFiles,
          ...(fileCategory && {
            [fileCategory]: {
              ...pbSystem.systemFiles[fileCategory],
              ...systemFileInfo,
            },
          }),
          ...(!fileCategory && { ...systemFileInfo }),
        },
      },
    });
    strapi.log.debug(`[PB]: Updated systemFiles (${fileName})...`);
  },
  /**
   * removeFromSystemFiles
   * Removes "fileName" from pbSystem.systemFiles.
   * If fileCategory is provided, only removes "fileName" from within fileCategory.
   * @param fileName
   * @param fileCategory
   */
  async removeFromSystemFiles(
    fileName: string,
    fileCategory: string | undefined = undefined
  ) {
    let pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});
    if (pbSystem && pbSystem.systemFiles) {
      if (fileCategory) {
        if (pbSystem.systemFiles[fileCategory]) {
          // With fileCategory
          if (
            pbSystem.systemFiles[fileCategory][fileName] &&
            pbSystem.systemFiles[fileCategory][fileName].id
          ) {
            await strapi
              .service("plugin::pabu.pbsystem")
              .deleteFileById(pbSystem.systemFiles[fileCategory][fileName].id);
          }
          delete pbSystem.systemFiles[fileCategory][fileName];
        }
      } else {
        // Without fileCategory
        if (
          pbSystem.systemFiles[fileName] &&
          pbSystem.systemFiles[fileName].id
        ) {
          await strapi
            .service("plugin::pabu.pbsystem")
            .deleteFileById(pbSystem.systemFiles[fileName].id);
        }
        delete pbSystem.systemFiles[fileName];
        for (const [key, value] of Object.entries(pbSystem.systemFiles)) {
          if (value && typeof value === "object") {
            if (
              pbSystem.systemFiles[key][fileName] &&
              pbSystem.systemFiles[key][fileName].id
            ) {
              await strapi
                .service("plugin::pabu.pbsystem")
                .deleteFileById(pbSystem.systemFiles[key][fileName].id);
            }
            delete pbSystem.systemFiles[key][fileName];
          }
        }
      }
      await pbEntityService.update(SYSTEM_MODULE_UID, pbSystem.id, {
        data: {
          ...pbSystem,
          systemFiles: {
            ...pbSystem.systemFiles,
          },
        },
      });
    }
  },
  /**
   * createSystemStrapiFile
   * Creates a System Strapi File. Adding an entry to the media-library and keeping track of it within the pbSystem.systemFiles.
   *
   * @param file
   * @param fileName
   * @param fileExtension
   * @param fileType
   * @param fileCategory
   * @param filePath
   * @param folderId
   * @param fileExists
   */
  async createSystemStrapiFile(
    file: any,
    fileName: string,
    fileExtension: string,
    fileType: string,
    fileCategory: string | undefined = undefined,
    filePath: string | undefined = "uploads",
    folderId: number | undefined = undefined,
    fileExists: boolean = false
  ) {
    strapi.log.debug("[PB]: Creating a PbSystem Strapi File...");

    let pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});
    if (!pbSystem) {
      pbSystem = await pbEntityService.create(SYSTEM_MODULE_UID, {
        data: {
          systemFiles: {},
        },
      });
    }

    let finalSystemFile: { [key: string]: string | number } = {};

    /* Strapi File */
    if (fileExists && file.id && file.url) {
      // Update fileInfo of preuploaded, existing file.
      strapi.log.debug(
        `[PB]: File already exists. Updating existing Strapi File...`
      );

      const newSystemFile = await strapi
        .service("plugin::pabu.pbsystem")
        .createSystemFileByStrapiFile(
          fileName,
          file,
          fileType,
          fileCategory,
          folderId
        );
      if (newSystemFile) {
        finalSystemFile.id = newSystemFile.id;
        finalSystemFile.url = newSystemFile.url;
        finalSystemFile.systemURL = newSystemFile.systemURL;
      }

      // TODO: Remove after refactor test
      // finalSystemFile.id = file.id;
      // const strapiFileExt = file.url.split(".").pop();
      // let strapiFileBuffer;
      // if (!file.url.startsWith("/")) {
      //   const existingStrapiFile = await fetch(file.url);
      //   strapiFileBuffer = Buffer.from(await existingStrapiFile.arrayBuffer());
      // } else {
      //   strapiFileBuffer = await strapi
      //     .service("plugin::pabu.file")
      //     .getFileBufferByPath(`/public${file.url}`);
      // }
      // await getUploadService("upload").updateFileInfo(file.id, {
      //   ...systemFileFileInfo,
      // });
      // strapiFileBuffer.name = `${fileName}.${fileExtension}`;
      // strapiFileBuffer.type = `${fileType}`;
      // strapiFileBuffer.size = Buffer.byteLength(strapiFileBuffer);
      // strapiFileBuffer.path = `${process.cwd()}/public/assets/system${
      //   fileCategory ? `/${fileCategory}` : ""
      // }/${fileName}.${fileExtension}`;
      // const createFile = await strapi
      //   .service("plugin::pabu.file")
      //   .createOrUpdateFile(
      //     `assets/system${fileCategory ? `/${fileCategory}` : ""}`,
      //     fileName,
      //     strapiFileExt,
      //     strapiFileBuffer
      //   );

      // finalSystemFile.url = file.url;
      // finalSystemFile.systemURL = `${
      //   process.env.PABU_PUBLIC_FRONTEND_URL
      // }/api/assets/system/${
      //   fileCategory ? `${fileCategory}/` : ""
      // }${fileName}.${fileExtension}`;
    }
    if (!fileExists) {
      // Note: This file is temporary and will get deleted after creation of the actual strapi file.

      // TODO: Remove after refactor:
      // const createFile = await strapi
      //   .service("plugin::pabu.file")
      //   .createOrUpdateFile(
      //     "assets/system",
      //     `${fileName}`,
      //     `${fileExtension}`,
      //     file
      //   );

      // TODO: Remove after refactor:
      // let createdFile = await strapi
      //   .service("plugin::pabu.file")
      //   .getFileBuffer("assets/system", `${fileName}.${fileExtension}`);
      // createdFile.name = `${fileName}.${fileExtension}`;
      // createdFile.type = `${fileType}`;
      // createdFile.size = Buffer.byteLength(createdFile);
      // createdFile.path = `${process.cwd()}/public/assets/system/${fileName}.${fileExtension}`;

      const { fileBuffer, systemURL } = await strapi
        .service("plugin::pabu.pbsystem")
        .createSystemFileByFile(
          file,
          fileName,
          fileExtension,
          fileType,
          fileCategory
        );

      let systemFile;
      console.log("-- remove after refactor test --");
      console.log(fileBuffer);
      if (fileBuffer) {
        systemFile = await strapi
          .service("plugin::pabu.pbsystem")
          .createStrapiFile(fileName, fileExtension, fileBuffer);
      }

      if (systemFile) {
        finalSystemFile.id = systemFile.id;
        finalSystemFile.url = systemFile.url;
        finalSystemFile.systemURL = systemURL;

        // Delete previous system-file.
        if (
          pbSystem.systemFiles &&
          pbSystem.systemFiles[fileName] &&
          pbSystem.systemFiles[fileName].id
        ) {
          await strapi
            .service("plugin::pabu.pbsystem")
            .deleteFileById(pbSystem.systemFiles[fileName].id);
        }
      }
    }

    /* Update pbSystem.systemFiles */
    if (
      finalSystemFile.id &&
      finalSystemFile.url &&
      finalSystemFile.systemURL
    ) {
      // Strapi Files that are used within CSS
      await strapi.service("plugin::pabu.pbsystem").updateSystemFiles(
        fileName,
        {
          id: finalSystemFile.id,
          systemURL: finalSystemFile.systemURL,
          url: finalSystemFile.url,
        },
        fileCategory
      );
    }
  },
  async deleteFileById(id) {
    const file = await strapi.entityService!.findOne(
      "plugin::upload.file",
      id,
      {
        filters: {},
        locale: "all",
        populate: "pb-deep",
      }
    );
    if (file) {
      await getUploadService("upload").remove(file);
    }

    // Remove after testing:
    console.log(
      await strapi.entityService!.findMany("plugin::upload.file", {
        filters: {},
        locale: "all",
        populate: "pb-deep",
      })
    );
    return;
  },
  /**
   * TODO: Test if necessary. If so: Move/Refactor to migrateExistingFile
   * createSystemStrapiStoreFiles
   */
  async createSystemStrapiStoreFiles() {
    let pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});

    // TODO: Check if media-url is in contentElementSettings.
    const backgrounds = await pbEntityService.findMany(STORE_MODULE_UID, {
      fields: ["*"],
      filters: {
        type: "background",
      },
      sort: {},
      populate: "pb-deep",
    });

    // TODO: Check if media-url is in contentElementSettings.
    const arrows = await pbEntityService.findMany(STORE_MODULE_UID, {
      fields: ["*"],
      filters: {
        type: "icon",
      },
      sort: {},
      populate: "pb-deep",
    });

    // TODO: Check if media-url is in contentElementSettings.
    const icons = await pbEntityService.findMany(STORE_MODULE_UID, {
      fields: ["*"],
      filters: {
        type: "icon",
      },
      sort: {},
      populate: "pb-deep",
    });
  },
  /**
   *
   *
   */
  async generateTemporarySystemFiles() {
    let createAndClearRequired = true;
    let pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});

    const createAndClearSystemDirectory = async () => {
      strapi.log.debug("Creating directory /public/assets/system/ ...");
      await strapi
        .service("plugin::pabu.file")
        .clearDirectory(`${process.cwd()}/public/assets/system/`);
      createAndClearRequired = false;
    };

    const recreateSystemFile = async (
      fileName,
      fileURL,
      category = undefined
    ) => {
      const systemFileExt = fileURL.split(".").pop();
      if (!fileURL.startsWith("/")) {
        const systemFile = await fetch(fileURL);
        const systemFileBuffer = Buffer.from(await systemFile.arrayBuffer());
        const createFile = await strapi
          .service("plugin::pabu.file")
          .createOrUpdateFile(
            `assets/system${category ? `/${category}` : ""}`,
            fileName,
            systemFileExt,
            systemFileBuffer
          );
      } else {
        // TBD: Do we also want to recreate files on persistent systems (locally)?
        // Imo: No.
        strapi.log.debug(
          `Skipped recreation of systemFile: ${fileName}.${systemFileExt}`
        );
      }
    };

    const checkSystemFilesEntries = async (object, category = undefined) => {
      for (const [key, value] of Object.entries(object)) {
        /*@ts-ignore*/
        if (value && typeof value === "object" && !value.id) {
          // Nested:
          /*@ts-ignore*/
          await checkSystemFilesEntries(value, key);
        }
        /*@ts-ignore*/
        if (value && value.id && value.url) {
          // Not Nested:
          /*@ts-ignore*/
          if (createAndClearRequired && !value.url.startsWith("/")) {
            await createAndClearSystemDirectory();
          }
          /*@ts-ignore*/
          await recreateSystemFile(key, value.url, category);
        }
      }
    };

    if (!pbSystem) {
      await createAndClearSystemDirectory();
      await strapi
        .service("plugin::pabu.pbsystem")
        .generateInitialSystemFiles();
      return;
    }

    if (pbSystem && pbSystem.systemFiles) {
      await checkSystemFilesEntries(pbSystem.systemFiles);
    }
  },

  /**
   * createSystemFileByPath
   * Creates the actual systemFile.
   * Usage: 
   * const { fileName, fileExt, fileBuffer, systemURL, category } = 
   * await strapi.service("plugin::pabu.pbsystem").
   * createSystemFileByPath(
      path,
      fileName,
      fileType,
      fileCategory
    );
   * @param path
   * @param fileName
   * @param fileType
   * @param category
   * @returns
   */
  async createSystemFileByPath(
    path: string,
    fileName: string,
    fileType: string,
    category: string
  ): Promise<{
    fileName: string;
    fileExt: string;
    fileBuffer: any | null;
    systemURL: string;
    category: string;
  } | null> {
    const fileExt = path.split(".").pop() ?? "";
    const fileDirectory = `assets/system${category ? `/${category}` : ""}`;
    let fileBuffer = await strapi
      .service("plugin::pabu.file")
      .getFileBufferByPath(`/public${path}`);
    if (fileBuffer) {
      fileBuffer.name = `${fileName}.${fileExt}`;
      fileBuffer.type = `${fileType}`;
      fileBuffer.size = Buffer.byteLength(fileBuffer);
      fileBuffer.path = `${process.cwd()}/public/${fileDirectory}/${fileName}.${fileExt}`;

      const createFile = await strapi
        .service("plugin::pabu.file")
        .createOrUpdateFile(fileDirectory, fileName, fileExt, fileBuffer);
    }

    return {
      fileName,
      fileExt,
      fileBuffer: fileBuffer ? fileBuffer : null,
      systemURL: `${process.env.PABU_PUBLIC_FRONTEND_URL}/api/${fileDirectory}/${fileName}.${fileExt}`,
      category,
    };
  },

  async createSystemFileByStrapiFile(
    fileName,
    file,
    fileType,
    category = undefined,
    folderId = undefined
  ) {
    let systemFile: any = {};
    systemFile.id = file.id;
    systemFile.url = file.url;

    const strapiFileExt = file.url.split(".").pop();
    const fileInfo = {
      name: `${fileName}.${strapiFileExt}`,
      folder: folderId ? folderId : null,
      caption:
        "This file is required by the PaBu-plugin. Do not edit or delete this file manually.",
      alternativeText:
        "This file is required by the PaBu-plugin. Do not edit or delete this file manually.",
    };

    let strapiFileBuffer;
    // TBD: This will not happen on migration, however might be needed in future.
    if (!file.url.startsWith("/")) {
      const existingStrapiFile = await fetch(file.url);
      strapiFileBuffer = Buffer.from(await existingStrapiFile.arrayBuffer());
    } else {
      strapiFileBuffer = await strapi
        .service("plugin::pabu.file")
        .getFileBufferByPath(`/public${file.url}`);
    }

    if (strapiFileBuffer) {
      strapiFileBuffer.name = `${fileName}.${strapiFileExt}`;
      strapiFileBuffer.type = `${fileType}`;
      strapiFileBuffer.size = Buffer.byteLength(strapiFileBuffer);
      strapiFileBuffer.path = `${process.cwd()}/public/assets/system${
        category ? `/${category}` : ""
      }/${fileName}.${strapiFileExt}`;
      const createFile = await strapi
        .service("plugin::pabu.file")
        .createOrUpdateFile(
          `assets/system${category ? `/${category}` : ""}`,
          fileName,
          strapiFileExt,
          strapiFileBuffer
        );

      // Updates caption, alternativeText for being a systemFile.
      await getUploadService("upload").updateFileInfo(file.id, {
        ...fileInfo,
      });
      systemFile.systemURL = `${
        process.env.PABU_PUBLIC_FRONTEND_URL
      }/api/assets/system/${
        category ? `${category}/` : ""
      }${fileName}.${strapiFileExt}`;
    }

    return systemFile.id && systemFile.url && systemFile.systemURL
      ? systemFile
      : null;
  },
  /**
   * createSystemFileByFile
   * Creates the actual systemFile.
   * 
   * Usage: 
   * const { fileName, fileExt, fileBuffer, systemURL, category } = 
   * await strapi.service("plugin::pabu.pbsystem").
   * createSystemFileByFile(
      file,
      fileName,
      fileExtension,
      fileType,
      fileCategory
    );
   * @param file
   * @param fileName
   * @param fileExt
   * @param fileType
   * @param category
   * @returns
   */
  async createSystemFileByFile(
    file: any,
    fileName: string,
    fileExt: string,
    fileType: string,
    category: string
  ): Promise<{
    fileName: string;
    fileExt: string;
    fileBuffer: any | null;
    systemURL: string;
    category: string;
  } | null> {
    const fileDirectory = `assets/system${category ? `/${category}` : ""}`;

    const createFile = await strapi
      .service("plugin::pabu.file")
      .createOrUpdateFile(fileDirectory, `${fileName}`, `${fileExt}`, file);

    let fileBuffer = await strapi
      .service("plugin::pabu.file")
      .getFileBuffer(
        `assets/system${category ? `/${category}` : ""}`,
        `${fileName}.${fileExt}`
      );
    fileBuffer.name = `${fileName}.${fileExt}`;
    fileBuffer.type = `${fileType}`;
    fileBuffer.size = Buffer.byteLength(fileBuffer);
    fileBuffer.path = `${process.cwd()}/public/${fileDirectory}/${fileName}.${fileExt}`;

    return {
      fileName,
      fileExt,
      fileBuffer: fileBuffer ? fileBuffer : null,
      systemURL: `${process.env.PABU_PUBLIC_FRONTEND_URL}/api/${fileDirectory}/${fileName}.${fileExt}`,
      category,
    };
  },
  /**
   * createStrapiFile
   * Creates a new strapiFile
   * @param fileName
   * @param fileExt
   * @param fileBuffer
   * @param folderId
   * @returns
   */
  async createStrapiFile(
    fileName: string,
    fileExt: string,
    fileBuffer: any,
    folderId: number | undefined = undefined
  ): Promise<any | null> {
    const fileInfo = {
      name: `${fileName}.${fileExt}`,
      folder: folderId ? folderId : null,
      caption:
        "This file is required by the PaBu-plugin. Do not edit or delete this file manually.",
      alternativeText:
        "This file is required by the PaBu-plugin. Do not edit or delete this file manually.",
    };
    strapi.log.debug(`[PB]: Creating a new Strapi File...`);
    const strapiFile = await getUploadService("upload").upload({
      data: {
        fileInfo: fileInfo,
      },
      files: fileBuffer,
    });

    return strapiFile && strapiFile[0] ? strapiFile[0] : null;
  },

  /**
   * generateInitialSystemFiles
   * This function is used by the updateStep for Pabu version 1.1.
   */
  async generateInitialSystemFiles() {
    let pbSystem = await pbEntityService.findMany(SYSTEM_MODULE_UID, {});

    if (!pbSystem) {
      pbSystem = await pbEntityService.create(SYSTEM_MODULE_UID, {
        data: {
          systemFiles: {},
        },
      });
    }

    const migrateExistingFile = async (
      fileName,
      path,
      fileType,
      category = undefined
    ) => {
      let systemFile: any = {};
      const { fileBuffer, fileExt, systemURL } = await strapi
        .service("plugin::pabu.pbsystem")
        .createSystemFileByPath(path, fileName, fileType, category);
      systemFile.systemURL = systemURL;

      if (!fileBuffer) {
        strapi.log.info(
          `Couldn't migrate ${fileName} (public${path}). (file does not exist?)`
        );
        return;
      }

      const strapiFile = await strapi
        .service("plugin::pabu.pbsystem")
        .createStrapiFile(fileName, fileExt, fileBuffer);
      if (strapiFile && strapiFile.id && strapiFile.url) {
        systemFile.id = strapiFile.id;
        systemFile.url = strapiFile.url;
      }

      if (systemFile.id && systemFile.url && systemFile.systemURL) {
        await strapi.service("plugin::pabu.pbsystem").updateSystemFiles(
          fileName,
          {
            ...systemFile,
          },
          category
        );
      }
    };

    await migrateExistingFile(
      "config-contentelement-settings",
      "/assets/config-contentelement-settings.json",
      "application/json"
    );

    await migrateExistingFile(
      "config-global",
      "/assets/config-global.json",
      "application/json"
    );

    await migrateExistingFile(
      "css-global",
      "/assets/css-global.css",
      "text/css"
    );
    await migrateExistingFile(
      "css-global.min",
      "/assets/css-global.min.css",
      "text/css"
    );

    const availableLocales = await strapi
      .plugin("pabu")
      .service("pblocalization")
      .availableLocales();
    for (const locale of availableLocales) {
      await migrateExistingFile(
        `${locale.code}_content-dynamiclists`,
        `/assets/${locale.code}_content-dynamiclists.json`,
        "application/json"
      );

      await migrateExistingFile(
        `${locale.code}_content-navigations`,
        `/assets/${locale.code}_content-navigations.json`,
        "application/json"
      );
    }

    await migrateExistingFile("body", "/assets/body.html", "text/html");

    await migrateExistingFile("head", "/assets/head.html", "text/html");

    // TODO: !!!

    // Migration of store fonts
    // const fonts = await pbEntityService.findMany(STORE_MODULE_UID, {
    //   fields: ["*"],
    //   filters: {
    //     type: "font",
    //   },
    //   sort: {},
    //   populate: "pb-deep",
    // });
    // for await (const font of fonts) {
    //   if (
    //     font &&
    //     font.setting[0] &&
    //     font.setting[0].fontFile &&
    //     font.setting[0].fontName
    //   ) {
    //     // TODO:
    //   }
    // }
  },
};
