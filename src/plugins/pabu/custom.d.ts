declare module "@strapi/design-system/*";
declare module "@strapi/design-system";
declare module "@strapi/icons";
declare module "@strapi/icons/*";
declare module "@strapi/helper-plugin";

export interface StrapiUploadFile {
  id: number;
  name: string;
  alternativeText?: string;
  caption?: string;
  width?: number;
  height?: number;
  formats?: {
    [key: string]: StrapiUploadFileFormat;
  };
  hash: string;
  ext?: string;
  mime: string;
  size: number;
  url: string;
  previewUrl?: string;
  provider: string;
  folderPath?: string;
  createdAt: string;
  updatedAt: string;
  localizations?: {
    [locale: string]: StrapiUploadFileLocalization;
  };
  pbFile?: PbFile;
}

declare type StrapiUploadFileFormat = {
  name: string;
  hash: string;
  ext?: string;
  mime: string;
  path?: string;
  width?: number;
  height?: number;
  size: number;
  url: string;
};

export interface StrapiUploadFileLocalization {
  alternativeText: string;
  caption?: string;
  title?: string;
  description?: string;
  isStrapiDefault: boolean;
}

export interface StrapiUploadFolder {
  id: number;
  name: string;
  pathId: number;
  path: string;
  createdAt: string;
  updatedAt: string;
}

export interface PbFile {
  id: number;
  fileId: number;
  name: string;
  alternativeText: string;
  caption: string;
  title: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  locale: string;
  localizations?: PbFile[];
}

export interface PbFileLocalizations {
  [locale: string]: {
    alternativeText: string;
    caption: string;
    title: string;
    isStrapiDefault: boolean;
  };
}

export interface PbFileResponse {
  breadcrumb: string;
  parents: Array<StrapiUploadFolder>;
  folders: Array<StrapiUploadFolder>;
  files: Array<StrapiUploadFile>;
}
