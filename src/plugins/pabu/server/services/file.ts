const fs = require("fs-extra");
const { writeFile, access, mkdir, appendFile } = require("fs-extra").promises;
const ft = require("file-type");

export default {
  /**
   *
   * @param {file} javascript file object (blob)
   */
  async uploadFile(file: any) {
    const upload = await strapi.plugin("upload").services.upload.upload({
      data: {},
      files: { ...file },
    });
    if (upload && upload.length > 0) {
      return upload[0];
    } else {
      return null;
    }
  },
  /**
   * updates fields of a strapi file
   *
   * @param {file} javascript file object (blob)
   */
  async updateStrapiFile(id: number, data: any) {
    const updatedUpload = await strapi
      .plugin("upload")
      .services.upload.update(id, data);

    if (
      updatedUpload &&
      Array.isArray(updatedUpload) &&
      updatedUpload.length > 0
    ) {
      return updatedUpload[0];
    } else if (updatedUpload) {
      return updatedUpload;
    } else {
      return null;
    }
  },
  /**
   * createOrUpdateFile
   * Note: Created / Updated Files exist outside of media-library or any used upload-provider-plugin.
   * You might want to use createSystemStrapiFile for persistent system-relevant files that exist in media-library AND in parallel on file-system.
   * @param foldername
   * @param filename
   * @param fileExtension
   * @param data
   * @param isBase64
   * @param isPrivate
   * @returns
   */
  async createOrUpdateFile(
    foldername: string,
    filename: string,
    fileExtension: string,
    data: any,
    isBase64: boolean,
    isPrivate: boolean = false
  ): Promise<boolean> {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    strapi.log.debug(`Trying to update ${path}${filename}.${fileExtension}`);
    try {
      await access(path);
      if (isBase64) {
        await writeFile(`${path}${filename}.${fileExtension}`, data, {
          encoding: "base64",
        });
      } else {
        await writeFile(`${path}${filename}.${fileExtension}`, data);
      }
      strapi.log.debug(`updated ${filename}.${fileExtension}`);
      return true;
    } catch (error) {
      try {
        strapi.log.debug(
          `Could not update file. trying to create path and file for ${path}${filename}.${fileExtension}.`
        );
        await mkdir(path, { recursive: true });
        if (isBase64) {
          await writeFile(`${path}${filename}.${fileExtension}`, data, {
            encoding: "base64",
          });
        } else {
          await writeFile(`${path}${filename}.${fileExtension}`, data);
        }
        strapi.log.debug(`created ${filename}.${fileExtension}`);
        return true;
      } catch (error) {
        strapi.log.error(error);
        strapi.log.error(
          `Could not create file/path for ${path}${filename}.${fileExtension}.`
        );
        strapi.log.error(
          `There might be problems with public/-directory-Structure.`
        );
        return false;
      }
    }
  },

  /**
   * appendToFile
   *
   * @param {*} foldername
   * @param {*} filenameWithExtension
   * @param {*} data
   * @param {*} isBase64
   * @returns
   */
  appendToFile: async (
    foldername: string,
    filenameWithExtension: string,
    data: string,
    isBase64: boolean,
    isPrivate: boolean = false
  ): Promise<boolean> => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    try {
      if (fs.existsSync(`${path}${filenameWithExtension}`)) {
        if (isBase64) {
          await appendFile(`${path}${filenameWithExtension}`, data, {
            encoding: "base64",
          });
        } else {
          await appendFile(`${path}${filenameWithExtension}`, data);
        }

        return true;
      } else {
        strapi.log.warn(
          `Could not append to file ${filenameWithExtension}. file does not exit. aborted action`
        );
        return false;
      }
    } catch (error) {
      strapi.log.error(error);
      strapi.log.error(
        `Could not append to file ${filenameWithExtension}. aborted action`
      );
      return false;
    }
  },
  /**
   * renameFile
   *
   * @param {*} foldername
   * @param {*} oldFilename
   * @param {*} newFilename
   * @returns
   */
  renameFile: (
    foldername: string,
    oldFilename: string,
    newFilename: string,
    isPrivate: boolean = false
  ): boolean => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    try {
      if (fs.existsSync(`${path}${oldFilename}`)) {
        fs.renameSync(`${path}${oldFilename}`, `${path}${newFilename}`);
        return true;
      } else {
        strapi.log.warn(
          `could not rename ${path}${oldFilename} to ${path}${newFilename} - file does not exist`
        );
        return false;
      }
    } catch (error) {
      strapi.log.error(error);
      strapi.log.error(
        `could not rename ${path}${oldFilename} to ${path}${newFilename} - aborted`
      );
      return false;
    }
  },

  /**
   * getFileStats
   *
   * @param {*} foldername
   * @param {*} filename
   * @returns
   */
  getFileStats: (
    foldername: string,
    filename: string,
    isPrivate: boolean = false
  ): any | null => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    try {
      if (fs.existsSync(`${path}${filename}`)) {
        const fileStats = fs.statSync(`${path}${filename}`);
        return fileStats;
      } else {
        strapi.log.warn(
          `could not get file stats ${path}${filename} - file does not exist`
        );
        return null;
      }
    } catch (error) {
      strapi.log.error(error);
      strapi.log.error(
        `could not get file stats ${path}${filename}  - aborted`
      );
      return null;
    }
  },

  /**
   * removeFile
   *
   * @param {*} foldername
   * @param {*} filename
   * @returns
   */
  removeFile: (
    foldername: string,
    filename: string,
    isPrivate: boolean = false
  ): boolean => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;
    strapi.log.debug(`Trying to remove ${path}${filename}`);

    try {
      if (fs.existsSync(`${path}${filename}`)) {
        fs.unlinkSync(`${path}${filename}`);
        return true;
      } else {
        strapi.log.warn(
          `could not get file ${path}${filename} - file does not exist`
        );
        return false;
      }
    } catch (error) {
      strapi.log.error(error);
      strapi.log.error(`could not delete file ${path}${filename}  - aborted`);
      return false;
    }
  },

  /**
   * checks the actual mime type or file ext of a file against the 
   * allowedMimeTypesAndExtensions param array if the 
   * allowedMimeTypesAndExtensions array is empty the check will be successful
   *
   * NOTE: The fileType package is limited so it can not handle SVG and most office filetypes
   *      SVG files are only checked by includes(".svg") they can be disallowed by not listing
   *      "svg" in the allowedMimeTypes array
   * 
   * // https://www.npmjs.com/package/file-type
     // The following file types will not be accepted:
     // - .doc - 97-2003 Document
     // - .xls - 97-2003 Document
     // - .ppt - 97-2003 Document
     // - .msi - windows installer
     // - .csv - https://github.com/sindresorhus/file-type/issues/264#issuecomment-568439196
     // - .svg - Detecting it requires a full-blown parser. Check out is-svg for something that mostly works.
   *
   * example:
   * allowedMimeTypes = [] // everything is allowed all files will be kept
   * allowedMimeTypes = ["png", "svg"] // only png and svg files are allowed and will be kept
   * allowedMimeTypes = ["image/jpeg"] // all jpeg (.jpg, .jpeg, .jfif, .pjpeg, .pjp) are allowed
   *
   *
   * @param {*} foldername foldername/folderpath no beginning trailing slashes
   * @param {*} filename the filename that exists on the server
   * @param {*} isPrivate determines if the functions reads files from private (/private) or public (/public) folder
   * @param {*} uncheckedIncomingMimeType optional - the mimeType that was given in the frontend that can not be trusted
   *    if this differs from the actual mimeType you can always block the file
   *    the real fileType check is done regardless of this result, but if you get a
   *    mimetype from the frontend and it differs already from the actual file then
   *    something isnt right in first place. (the upload request could be compromised)
   * @param {*} allowedMimeTypesAndExtensions optional - the list of allowed mime types / files -> when empty everything will be allowed
   *          In this array you can wether list mimetypes OR file ext as strings. If one of both exist in the array
   *          the file is allowed
   *          file ext examples: https://github.com/sindresorhus/file-type#supported-file-types
   *          mimetypes examples: https://en.wikipedia.org/wiki/Media_type
   * @returns result object {success: true/false, errorMsg: ""}
   *          success: true = the mimetype / file is ok 
   *          success: false = if the mimetype is not allowed, cant be read or differs from the frontend
   */
  checkMimeTypeFromFile: async (
    foldername: string,
    filename: string,
    isPrivate: boolean = false,
    uncheckedIncomingMimeType: string = "",
    allowedMimeTypesAndExtensions: Array<string> = []
  ): Promise<{
    success: boolean;
    errorMsg: string;
    incomingFileMimeType?: string;
    incomingFileExt?: string;
    actualFileMimetype?: string;
    actualFileExt?: string;
  }> => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    const fileType = await ft.fromFile(`${path}${filename}`);

    // special cases for SVG files:
    // filetype cant find the filetype for SVG files or it detects it as a xml
    if (
      !fileType ||
      (fileType.mime === "application/xml" && filename.includes(".svg"))
    ) {
      if (!fileType) {
        strapi.log.warn(
          `[checkMimeTypeFromFile]: could not check mimeType for file ${path}${filename}`
        );
      }
      if (filename.includes(".svg")) {
        // if it is a .svg file skip the check because
        // https://www.npmjs.com/package/file-type
        // The following file types will not be accepted:
        // - .doc - 97-2003 Document
        // - .xls - 97-2003 Document
        // - .ppt - 97-2003 Document
        // - .msi - windows installer
        // - .csv - https://github.com/sindresorhus/file-type/issues/264#issuecomment-568439196
        // - .svg - Detecting it requires a full-blown parser. Check out is-svg for something that mostly works.
        // TODO add a specific check for those types
        // for now we skip the file type check for .svg files only
        if (
          allowedMimeTypesAndExtensions &&
          allowedMimeTypesAndExtensions.length === 0
        ) {
          strapi.log.debug(
            "[checkMimeTypeFromFile]: no allowedMimeTypesAndExtensions specified keep the file"
          );
          return { success: true, errorMsg: "" };
        } else if (
          allowedMimeTypesAndExtensions &&
          allowedMimeTypesAndExtensions.length > 0 &&
          allowedMimeTypesAndExtensions.includes("svg")
        ) {
          return { success: true, errorMsg: "" };
        }
      }
      return { success: false, errorMsg: "" };
    }
    if (fileType && uncheckedIncomingMimeType !== fileType.mime) {
      strapi.log.warn(
        `[checkMimeTypeFromFile]: incoming mimeType=${uncheckedIncomingMimeType} for file ${path}${filename} is different to the actual mimeType=${fileType.mime}`
      );

      let incomingFileExt = filename;
      if (filename.endsWith(".chunked")) {
        incomingFileExt = incomingFileExt.substring(
          0,
          incomingFileExt.lastIndexOf(".")
        );
      }
      incomingFileExt = incomingFileExt.includes(".")
        ? incomingFileExt.substring(incomingFileExt.lastIndexOf("."))
        : incomingFileExt;

      if (incomingFileExt !== "." + fileType.ext) {
        return {
          success: false,
          errorMsg: "fileMimeTypeIsCorrupted",
          incomingFileMimeType: uncheckedIncomingMimeType,
          incomingFileExt: incomingFileExt,
          actualFileMimetype: fileType.mime,
          actualFileExt: "." + fileType.ext,
        };
      }
    }

    if (
      fileType &&
      allowedMimeTypesAndExtensions &&
      allowedMimeTypesAndExtensions.length === 0
    ) {
      strapi.log.debug(
        "[checkMimeTypeFromFile]: no allowedMimeTypesAndExtensions specified keep the file"
      );
      return { success: true, errorMsg: "" };
    }

    if (
      fileType &&
      allowedMimeTypesAndExtensions &&
      allowedMimeTypesAndExtensions.length > 0 &&
      (allowedMimeTypesAndExtensions.includes(fileType.mime) ||
        allowedMimeTypesAndExtensions.includes(fileType.ext))
    ) {
      return { success: true, errorMsg: "" };
    } else {
      strapi.log.warn(
        `[checkMimeTypeFromFile]: ${fileType.mime} is not allowed`
      );
    }

    return { success: false, errorMsg: "fileMimeTypeIsWrong" };
  },

  /**
   * returns the mimetype of a file saved on the server
   *
   * @param {*} foldername foldername/folderpath no beginning trailing slashes
   * @param {*} filename the filename that exists on the server
   * @param {*} isPrivate determines if the functions reads files from private (/private) or public (/public) folder
   * @returns the fileType object from file-type node module
   */
  getMimeTypeFromFile: async (
    foldername: string,
    filename: string,
    isPrivate: boolean = false
  ): Promise<any | null> => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    try {
      const fileType = await ft.fromFile(`${path}${filename}`);
      return fileType;
    } catch (error) {
      strapi.log.error(error);
      return null;
    }
  },

  /**
   * creates a readstream of a file that you can return to trigger
   * a download for the file saved on the server
   *
   * example usage:
   * ////////////////////////////////////////
   *
   *   const readStream = await strapi
   *     .service("api::custom.file")
   *     .getFileStream(privateFile.folder, privateFile.name, true);
   *
   *   ctx.response.body = readStream;
   *   ctx.response.attachment(privateFile.name);
   *   return ctx.response;
   * ////////////////////////////////////////
   *
   * @param {*} foldername foldername/folderpath no beginning trailing slashes
   * @param {*} filename the filename that exists on the server
   * @param {*} isPrivate determines if the functions reads files from private (/private) or public (/public) folder
   * @returns
   */
  getFileStream: async (
    foldername: string,
    filename: string,
    isPrivate: boolean = false
  ): Promise<any | null> => {
    const path = isPrivate
      ? `${process.cwd()}/private/${foldername !== "" ? foldername + "/" : ""}`
      : `${process.cwd()}/public/${foldername !== "" ? foldername + "/" : ""}`;

    try {
      if (fs.existsSync(`${path}${filename}`)) {
        return fs.createReadStream(`${path}${filename}`);
      } else {
        strapi.log.warn(
          `could not create readstream for file ${path}${filename} file does not exist`
        );
      }
    } catch (error) {
      strapi.log.error(
        `could not create readstream for file ${path}${filename}`
      );
    }
    return null;
  },

  /**
   * creates a buffer from a file
   *
   * @param {*} foldername foldername/folderpath no beginning trailing slashes
   * @param {*} filename the filename that exists on the server
   * @param {*} isPrivate determines if the functions reads files from private (/private) or public (/public) folder
   * @returns
   */
  getFileBuffer: (
    foldername: string,
    filename: string,
    isPrivate: boolean = false
  ): any | null => {
    const path = isPrivate
      ? `/private/${foldername !== "" ? foldername + "/" : ""}`
      : `/public/${foldername !== "" ? foldername + "/" : ""}`;

    return strapi
      .service("plugin::pabu.file")
      .getFileBufferByPath(`${path}${filename}`);
  },
  /**
   * creates a buffer from a file
   *
   * @param {*} path pathname with file
   * @returns
   */
  getFileBufferByPath: (path: string): any | null => {
    path = `${process.cwd()}${path}`;
    try {
      if (fs.existsSync(`${path}`)) {
        return fs.readFileSync(`${path}`);
      } else {
        strapi.log.warn(
          `could not create buffer for file ${path} file does not exist`
        );
      }
    } catch (error) {
      strapi.log.error(`could not create buffer for file ${path}`);
    }
    return null;
  },

  /**
   * Copies a file only on the filesystem
   * @param {String} existingFilepathWithTrailingSlash
   * @param {String} existingFilename
   * @param {String} newFilepathWithTrailingSlash
   * @param {String} newFilename
   * @returns
   */
  copyFile: (
    existingFilepathWithTrailingSlash: string,
    existingFilename: string,
    newFilepathWithTrailingSlash: string,
    newFilename: string
  ): boolean => {
    try {
      fs.copyFileSync(
        `${existingFilepathWithTrailingSlash}${existingFilename}`,
        `${newFilepathWithTrailingSlash}${newFilename}`
      );
      return true;
    } catch (error) {
      strapi.log.error(error);
      return false;
    }
  },
  clearDirectory: (dir) => {
    try {
      fs.emptyDirSync(dir);
      return true;
    } catch (error) {
      strapi.log.error(error);
      return false;
    }
  },
};
