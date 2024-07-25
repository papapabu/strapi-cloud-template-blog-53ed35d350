import { Strapi } from "@strapi/strapi";
import { StrapiUploadFile } from "../../custom";
import {
  ChunkUploadProgress,
  ChunkUploadRequest,
  FileInformation,
} from "../types/pbupload";
import { getUploadService } from "../utils/functions";
import pbEntityService from "./pbEntityService";
const crypto = require("crypto");
const { nameToSlug } = require("@strapi/utils");

/**
 * Retrieves a base64 chunk and adds it to a file.
 * If the file does not exists the file is created with the initial part.
 *
 * @async
 */
const pbUploadChunk = async (
  uploadParams: ChunkUploadRequest,
  allowedFileTypes?: Array<string>
): Promise<ChunkUploadProgress | null> => {
  const folderPath = uploadParams.isPrivate ? "" : "uploads";

  if (!allowedFileTypes) {
    allowedFileTypes = [];
  }

  if (uploadParams.fileBegin) {
    return await createNewChunkUploadFile(uploadParams, folderPath);
  }

  const appendResult = await appendToExistingChunkedUploadFile(
    uploadParams,
    folderPath
  );
  if (appendResult.status === "failed") {
    return appendResult;
  }

  const fileStats = await getFileStatsFromExistingChunkedUploadFile(
    uploadParams,
    folderPath
  );
  if (!fileStats) {
    return { status: "failed", newFileName: uploadParams.newFileName };
  }

  if (uploadParams.fileSize !== fileStats.size) {
    // file is not completed return true and the filename
    return { status: "progress", newFileName: uploadParams.newFileName };
  }

  return await finalizeChunkedUploadFile(
    uploadParams,
    folderPath,
    allowedFileTypes
  );
};

const insertOrReplaceStrapiUpload = async (
  fileBuffer: any,
  {
    filename,
    fileType,
    fileSize,
    path,
    fileInformation,
  }: {
    filename: string;
    fileType: string;
    fileSize: number;
    path: string;
    fileInformation?: FileInformation;
  }
): Promise<StrapiUploadFile | null> => {
  let uploadedFile: StrapiUploadFile | null = null;
  if (fileBuffer) {
    fileBuffer.name = filename;
    fileBuffer.type = fileType;
    fileBuffer.size = fileSize;
    fileBuffer.path = path;

    if (
      fileInformation &&
      typeof fileInformation.strapiUploadUpdateId !== "undefined"
    ) {
      strapi.log.debug("update existing media library file");
      try {
        const newUploadedFiles = await getUploadService("upload").upload({
          data: {
            fileInfo: {
              name: filename,
              folder: fileInformation?.folder ?? null,
              caption: fileInformation?.caption ?? "",
              alternativeText: fileInformation?.alternativeText ?? "",
            },
          },
          files: fileBuffer,
        });

        if (
          newUploadedFiles &&
          Array.isArray(newUploadedFiles) &&
          newUploadedFiles[0] &&
          newUploadedFiles[0].id
        ) {
          uploadedFile = newUploadedFiles[0];

          const existingStrapiFile = await pbEntityService.findOne(
            "plugin::upload.file",
            fileInformation.strapiUploadUpdateId,
            {}
          );

          if (!existingStrapiFile) {
            return Promise.reject(
              "[insertOrReplaceStrapiUpload] could not get existing strapi file"
            );
          }

          const copyExistingStrapiFile = JSON.parse(
            JSON.stringify(existingStrapiFile)
          );
          const copyNewStrapiFile = JSON.parse(JSON.stringify(uploadedFile));

          const updateExistingStrapiFile = await pbEntityService.update(
            "plugin::upload.file",
            existingStrapiFile.id,
            {
              data: {
                ...copyNewStrapiFile,
                folderPath: existingStrapiFile.folderPath,
                id: existingStrapiFile.id,
              },
            }
          );

          const updateNewStrapiFile = await pbEntityService.update(
            "plugin::upload.file",
            uploadedFile!.id,
            {
              data: {
                ...copyExistingStrapiFile,
                id: uploadedFile!.id,
              },
            }
          );

          await getUploadService("upload").remove(updateNewStrapiFile);
        }
      } catch (error) {
        strapi.log.error(
          `[getUploadService("upload").upload] could not insert file into strapi media library...`
        );
        strapi.log.error(error);
        return Promise.reject(
          "[insertOrReplaceStrapiUpload] could not insert file into strapi media library"
        );
      }
    } else {
      try {
        const uploadedFiles = await getUploadService("upload").upload({
          data: {
            fileInfo: {
              name: filename,
              folder: fileInformation?.folder ?? null,
              caption: fileInformation?.caption ?? "",
              alternativeText: fileInformation?.alternativeText ?? "",
            },
          },
          files: fileBuffer,
        });
        if (
          uploadedFiles &&
          Array.isArray(uploadedFiles) &&
          uploadedFiles[0] &&
          uploadedFiles[0].id
        ) {
          uploadedFile = uploadedFiles[0];
        }
      } catch (error) {
        strapi.log.error(
          `[getUploadService("upload").upload] could not insert file into strapi media library...`
        );
        strapi.log.error(error);
        return Promise.reject(
          "[insertOrReplaceStrapiUpload] could not insert file into strapi media library"
        );
      }
    }
  }
  return uploadedFile;
};

const finalizeChunkedUploadFile = async (
  uploadParams: ChunkUploadRequest,
  folderPath: string,
  allowedFileTypes: Array<string>
): Promise<ChunkUploadProgress> => {
  // upload is completed rename file now (remove the .chunked)
  let newFileNameWithoutSuffix = uploadParams.newFileName!.substring(
    0,
    uploadParams.newFileName!.lastIndexOf(".")
  );

  // remove the custom added randomsuffix if it is a public file
  // example test_2c3351cb66.jpg -> remove the "_2c3351cb66"
  // this is added by strapi while creating the file via strapi upload
  // plugin
  if (!uploadParams.isPrivate) {
    newFileNameWithoutSuffix = newFileNameWithoutSuffix.replace(
      newFileNameWithoutSuffix.substring(
        newFileNameWithoutSuffix.lastIndexOf("_"),
        newFileNameWithoutSuffix.lastIndexOf(".")
      ),
      ""
    );
  }

  const renameSuccess = await strapi
    .service("plugin::pabu.file")
    .renameFile(
      folderPath,
      uploadParams.newFileName,
      newFileNameWithoutSuffix,
      uploadParams.isPrivate
    );

  // TODO: Strapi Cloud: insertOrReplaceStrapiUpload

  if (!renameSuccess) {
    strapi.log.warn(
      `[chunked upload failed]: (${uploadParams.newFileName}) rename ${
        uploadParams.isPrivate ? "private" : "public"
      } file failed...`
    );
    removeFileChunkedUpload(
      folderPath,
      uploadParams.newFileName!,
      uploadParams.isPrivate
    );
    return { status: "failed", newFileName: uploadParams.newFileName };
  }

  // the foldernamepath (this could be empty -> no trailing slash then)
  const foldernamePath = folderPath !== "" ? folderPath + "/" : "";
  // the filesystem path
  const path = uploadParams.isPrivate
    ? `${process.cwd()}/private/${foldernamePath}${newFileNameWithoutSuffix}`
    : `${process.cwd()}/public/${foldernamePath}${newFileNameWithoutSuffix}`;

  const fileBuffer: any = await strapi
    .service("plugin::pabu.file")
    .getFileBuffer(folderPath, newFileNameWithoutSuffix);

  let uploadedFile: StrapiUploadFile | null = null;
  try {
    uploadedFile = await insertOrReplaceStrapiUpload(fileBuffer, {
      path: path,
      filename: newFileNameWithoutSuffix,
      fileType: uploadParams.fileType,
      fileSize: uploadParams.fileSize,
      fileInformation: uploadParams.fileInformation,
    });
  } catch (error) {
    strapi.log.error(error);
    return { status: "failed", newFileName: uploadParams.newFileName };
  }

  removeFileChunkedUpload(
    folderPath,
    newFileNameWithoutSuffix,
    uploadParams.isPrivate
  );

  if (uploadedFile && uploadedFile.id) {
    strapi.log.info(
      `upload for ${
        uploadParams.isPrivate ? "private" : "public"
      } ${folderPath}/${uploadParams.newFileName} completed!`
    );
    strapi.log.debug(
      `${newFileNameWithoutSuffix} inserted into ${
        uploadParams.isPrivate ? "private" : "public"
      } uploads! Its url is: ${uploadedFile.url}`
    );

    return {
      status: "finished",
      newFileName: newFileNameWithoutSuffix,
      uploadId: uploadedFile.id,
      file: uploadedFile,
    };
  } else {
    // insert into uploads failed - abort upload
    strapi.log.error(
      `[chunked upload failed]: (${folderPath}/${newFileNameWithoutSuffix}) insert into ${
        uploadParams.isPrivate ? "private" : "public"
      } uploads failed...`
    );

    return { status: "failed", newFileName: uploadParams.newFileName };
  }
};

const getFileStatsFromExistingChunkedUploadFile = async (
  uploadParams: ChunkUploadRequest,
  folderPath: string
): Promise<any | null> => {
  const fileStats = await strapi
    .service("plugin::pabu.file")
    .getFileStats(folderPath, uploadParams.newFileName, uploadParams.isPrivate);

  if (!fileStats) {
    strapi.log.error(
      `[chunked upload failed]: (${uploadParams.newFileName}) could not get ${
        uploadParams.isPrivate ? "private" : "public"
      } filestats...`
    );
    removeFileChunkedUpload(
      folderPath,
      uploadParams.newFileName!,
      uploadParams.isPrivate
    );
    return null;
  }
  return fileStats;
};

const appendToExistingChunkedUploadFile = async (
  uploadParams: ChunkUploadRequest,
  folderPath: string
): Promise<ChunkUploadProgress> => {
  const appendSuccess = await strapi.service("plugin::pabu.file").appendToFile(
    folderPath,
    uploadParams.newFileName,
    uploadParams.fileBase64Chunk.split(";base64,").pop(), // remove the base64 header
    true,
    uploadParams.isPrivate
  );

  if (!appendSuccess) {
    strapi.log.error(
      `[chunked upload failed]: (${uploadParams.newFileName}) append to ${
        uploadParams.isPrivate ? "private" : "public"
      } file failed...`
    );
    removeFileChunkedUpload(
      folderPath,
      uploadParams.newFileName!,
      uploadParams.isPrivate
    );
    return { status: "failed", newFileName: uploadParams.newFileName };
  }

  return { status: "progress", newFileName: uploadParams.newFileName };
};

const createNewChunkUploadFile = async (
  uploadParams: ChunkUploadRequest,
  folderPath: string
): Promise<ChunkUploadProgress> => {
  // this is the begin of a new chunked upload so create the file first
  // the new file ends with .chunked until it is fully uploaded
  const fileExtenion = "chunked";

  // if the fileSize is zero return and do nothing
  if (uploadParams.fileSize === 0) {
    strapi.log.warn("fileSize is 0 Bytes aborting upload...");
    return {
      status: "failed",
      errorMsg: "fileSizeIsWrong",
    };
  }

  // the filename should only contain exactly one dot
  if (
    !uploadParams.fileName ||
    !uploadParams.fileName.includes(".") ||
    uploadParams.fileName.match(/\./g)!.length > 1
  ) {
    strapi.log.warn(
      "filename contains no or more dots so this file is invalid"
    );
    return {
      status: "failed",
      errorMsg: "filenameIsWrong",
    };
  }

  let generatedFileName = generateFilename(uploadParams.fileName);

  // set the filename to
  // [originalFileName]_[randomSuffix].[originalFileExtension]
  // if it contains a "."
  if (uploadParams.fileName && uploadParams.fileName.includes(".")) {
    generatedFileName = `${generateFilename(
      uploadParams.fileName.substring(0, uploadParams.fileName.lastIndexOf("."))
    )}${uploadParams.fileName.substring(
      uploadParams.fileName.lastIndexOf(".")
    )}`;
  }

  // TODO: Strapi Cloud !!!
  const creationSuccess: boolean = await strapi
    .service("plugin::pabu.file")
    .createOrUpdateFile(
      folderPath,
      generatedFileName,
      fileExtenion,
      uploadParams.fileBase64Chunk.split(";base64,").pop(), // remove the base64 header
      true,
      uploadParams.isPrivate
    );

  if (creationSuccess) {
    strapi.log.debug(
      `start chunked ${
        uploadParams.isPrivate ? "private" : "public"
      } upload for ${folderPath}/${generatedFileName}.${fileExtenion} (size=${
        uploadParams.fileSize
      })`
    );
  } else {
    strapi.log.warn(
      `could not create and start chunked ${
        uploadParams.isPrivate ? "private" : "public"
      } upload for ${folderPath}/${generatedFileName}.${fileExtenion} (size=${
        uploadParams.fileSize
      })`
    );
  }

  if (!creationSuccess) {
    return {
      status: "failed",
    };
  }
  // if creationSuccess is false no file was created
  return {
    status: "progress",
    newFileName: `${generatedFileName}.${fileExtenion}`,
  };
};

/**
 * Generates a unique filename based on the provided name.
 *
 * @param {string} name - The original name to generate a filename from.
 * @returns {string} A unique filename generated by combining the slugified base name and a random suffix.
 *
 * @example
 * const originalName = "My File Name";
 * const generatedFilename = generateFilename(originalName);
 * e.g., "my_file_name_1a4f3b2c9e"
 */
const generateFilename = (name) => {
  const baseName = nameToSlug(name, { separator: "_", lowercase: false });

  return `${baseName}_${randomSuffix()}`;
};

/**
 * Generates a random hexadecimal suffix using crypto.randomBytes.
 *
 * @function
 * @returns {string} A random hexadecimal string of length 10 (5 bytes converted to hex).
 *
 * @example
 * const suffix = randomSuffix();
 */
const randomSuffix = () => crypto.randomBytes(5).toString("hex");

/**
 * Removes a not finished file uploaded in chunks from a specified folder.
 *
 * @param {string} foldername - The name of the folder containing the file.
 * @param {string} filename - The name of the file to be removed.
 * @param {boolean} [isPrivate=false] - Indicates whether the file is private (default is false).
 * @returns {void}
 *
 * @throws {Error} If there is an issue removing the file or the file doesn't exist.
 *
 * @example
 * removeFileChunkedUpload('uploads', 'example.txt', true);
 */
const removeFileChunkedUpload = (
  foldername: string,
  filename: string,
  isPrivate: boolean = false
): void => {
  strapi.log.info(
    `remove file: ${filename} from ${
      isPrivate ? "private" : "public"
    } ${foldername} folder`
  );
  const removeSuccess = strapi
    .service("plugin::pabu.file")
    .removeFile(foldername, filename, isPrivate);

  if (!removeSuccess) {
    strapi.log.error(
      `could not remove ${
        isPrivate ? "private" : "public"
      } file: ${filename} from ${foldername} folder`
    );
  }
};

export default ({ strapi }: { strapi: Strapi }) => ({
  pbUploadChunk,
  insertOrReplaceStrapiUpload,
});
