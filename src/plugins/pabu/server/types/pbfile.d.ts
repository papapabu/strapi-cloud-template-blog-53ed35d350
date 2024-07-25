import { StrapiUploadFile, StrapiUploadFolder } from "../../custom";

/**
 * Represents a PbFile object.
 */
export interface PbFile {
  /**
   * The unique identifier for the PbFile.
   */
  id: number;

  /**
   * The identifier for the associated file.
   */
  fileId: number;

  /**
   * The name of the PbFile.
   */
  name: string;

  /**
   * The alternative text for the PbFile.
   */
  alternativeText: string;

  /**
   * The title of the PbFile.
   */
  title: string;

  /**
   * The timestamp when the PbFile was created.
   */
  createdAt: string;

  /**
   * The timestamp when the PbFile was last updated.
   */
  updatedAt: string;

  /**
   * The locale of the PbFile.
   */
  locale: string;

  /**
   * Optional localizations for the PbFile based on different locales.
   */
  localizations?: Array<PbFile>;
}

/**
 * Represents localizations for PbFile based on different locales.
 */
export interface PbFileLocalizations {
  /**
   * An index signature to represent localizations for different locales.
   * The key is the locale code, and the value is an object containing localization details.
   */
  [locale: string]: {
    /**
     * The alternative text for the PbFile in the specified locale.
     */
    alternativeText: string;

    /**
     * The title of the PbFile in the specified locale.
     */
    title: string;

    /**
     * Indicates whether the localization is the default for Strapi.
     */
    isStrapiDefault: boolean;
  };
}

/**
 * Represents the response structure for PbFile operations.
 */
export interface PbFileResponse {
  /**
   * An array of StrapiUploadFolder objects representing parent folders.
   */
  parents: Array<StrapiUploadFolder>;

  /**
   * An array of StrapiUploadFolder objects representing subfolders.
   */
  folders: Array<StrapiUploadFolder>;

  /**
   * An array of StrapiUploadFile objects representing files.
   */
  files: Array<StrapiUploadFile>;
}

/**
 * Represents a request to create a folder.
 */
export interface CreateFolderRequest {
  /**
   * The name of the folder to be created.
   */
  name: string;

  /**
   * Optional description for the folder.
   */
  description?: string;

  /**
   * The unique identifier of the parent folder.
   */
  parentId: number;
}

/**
 * Represents a request to update a folder.
 */
export interface UpdateFolderRequest {
  /**
   * The new name for the folder.
   */
  name: string;

  /**
   * Optional new description for the folder.
   */
  description?: string;
}
/**
 * Represents a request to bulk delete folders.
 */
export interface BulkDeleteFoldersRequest {
  /**
   * An array of folder IDs to be deleted.
   */
  folderIds: Array<number>;
}

/**
 * Represents a request to update a file.
 */
export interface UpdateFileRequest {
  /**
   * The file object to be updated.
   */
  file: StrapiUploadFile;
}

/**
 * Represents a reference to Strapi upload files, specifying details about the file references.
 */
export interface StrapiUploadFileReference {
  /**
   * The type of model associated with the upload files.
   */
  modelType: string;

  /**
   * A description of the upload file reference.
   */
  description: string;

  /**
   * The number of upload files associated with the reference.
   */
  amount: number;
}

export interface PbFileDownload {
  readStream: any;
  name: string;
}