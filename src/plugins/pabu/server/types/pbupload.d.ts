export interface ChunkUploadRequest {
  fileBase64Chunk: string;
  fileName: string;
  fileType: string;
  fileBegin: boolean;
  fileSize: number;
  newFileName: string | null;
  isPrivate: boolean;
  fileInformation?: FileInformation;
}

interface FileInformation {
  alternativeText?: string;
  caption?: string;
  folder?: number;
  strapiUploadUpdateId?: number;
}

interface UploadState {
  started: "started";
  progress: "progress";
  finished: "finished";
  failed: "failed";
}

export interface ChunkUploadProgress {
  status: keyof UploadState;
  newFileName?: string | null;
  sliceStart?: number;
  errorMsg?: any;
  uploadId?: number;
  file?: any;
  info?: any;
}
