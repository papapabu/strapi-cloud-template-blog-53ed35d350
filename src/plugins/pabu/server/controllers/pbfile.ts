import { Strapi } from "@strapi/strapi";
import { Context } from "koa";
import { StrapiUploadFolder } from "../../custom";
import {
  BulkDeleteFoldersRequest,
  CreateFolderRequest,
  PbFileDownload,
  UpdateFileRequest,
  UpdateFolderRequest,
} from "../types/pbfile";
import { getService } from "../utils/functions";

export default ({ strapi }: { strapi: Strapi }) => ({
  async filesHandler(ctx: Context) {
    const { folderPath, folder = null } = ctx.request.query;
    if (Array.isArray(folderPath)) {
      return ctx.badRequest();
    }
    const service = getService("pbfile");
    try {
      ctx.body = await service.filesHandler(folderPath, folder);
    } catch (error) {
      strapi.log.error(error);
      return ctx.badRequest();
    }
  },
  async getFileById(ctx: Context) {
    const { id } = ctx.params;
    if (!id) {
      return ctx.badRequest();
    }
    const service = getService("pbfile");
    try {
      ctx.body = await service.getFileById(id);
    } catch (error) {
      strapi.log.error(error);
      return ctx.badRequest();
    }
  },
  async search(ctx: Context) {
    const { name } = ctx.request.query;
    if (Array.isArray(name)) {
      return ctx.badRequest();
    }
    const service = getService("pbfile");
    try {
      ctx.body = await service.search(name);
    } catch (error) {
      strapi.log.error(error);
      return ctx.badRequest();
    }
  },
  async findReferences(ctx: any) {
    const { id } = ctx.params;
    if (!id) {
      return ctx.badRequest();
    }
    ctx.body = await getService("pbfile")
      .findReferences(id)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async updateFile(ctx: any) {
    ctx.body = await getService("pbfile")
      .updateFile(ctx.request.body as UpdateFileRequest)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async deleteFile(ctx: any) {
    const { id } = ctx.params;
    if (!id) {
      return ctx.badRequest();
    }
    ctx.body = await getService("pbfile")
      .deleteFile(id)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async createFolder(ctx: any) {
    ctx.body = await getService("pbfile")
      .createFolder(ctx.request.body as CreateFolderRequest)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async updateFolder(ctx: any) {
    const { id } = ctx.params;
    const { user } = ctx.state;
    ctx.body = await getService("pbfile")
      .updateFolder(id, user, ctx.request.body as UpdateFolderRequest)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async bulkDeleteFolders(ctx: any) {
    ctx.body = await getService("pbfile")
      .bulkDeleteFolders(ctx.request.body as BulkDeleteFoldersRequest)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });
  },
  async fileDownloadById(ctx: Context) {
    const { id } = ctx.params;

    if (!id) {
      return ctx.badRequest();
    }
    const service = getService("pbfile");
    const pbFileDownload: PbFileDownload | null = await service
      .fileDownloadById(id)
      .catch((err: Error) => {
        ctx.throw(400, err);
      });

    if (pbFileDownload) {
      ctx.response.body = pbFileDownload.readStream;
      ctx.response.attachment(pbFileDownload.name);
      return ctx.response;
    }
  },
  async mediaManagerFolder(ctx: Context) {
    const service = getService("pbfile");
    const mediaManagerRootFolder: StrapiUploadFolder | null =
      await service.mediaManagerRootFolder();
    if (!mediaManagerRootFolder) {
      ctx.throw(404, "media manager root folder not found");
    }
    ctx.response.body = mediaManagerRootFolder;
    return ctx.response;
  },
});
