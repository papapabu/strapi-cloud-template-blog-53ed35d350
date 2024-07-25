import { Strapi } from "@strapi/strapi";
import * as fs from "node:fs";
// @ts-ignore
import crypto from "crypto";
import { join, resolve } from "path";
import { LICENSE_MODULE_UID } from "../constants";
import pbEntityService from "./pbEntityService";

const publicKey = fs.readFileSync(
  resolve(__dirname, "../../../resources/pabu.pub")
);

interface PabuLicense {
  name: string;
  type: string;
  key: string;
}

export default ({ strapi }: { strapi: Strapi }) => ({
  async init() {
    const license: PabuLicense = this.verify(this.readLicense());
    const existingLicense = await pbEntityService.findMany(
      LICENSE_MODULE_UID,
      {}
    );
    if (!existingLicense) {
      await pbEntityService.create(LICENSE_MODULE_UID, {
        data: {
          key: license,
          license: license.type,
          lastCheck: Date.now(),
        },
      });
    } else {
      await pbEntityService.update(LICENSE_MODULE_UID, existingLicense.id, {
        data: {
          key: license,
          license: license.type,
          lastCheck: Date.now(),
        },
      });
    }
  },
  verify(license: any) {
    const [sig, base64Content] = Buffer.from(license, "base64")
      .toString()
      .split("\n");

    if (!sig || !base64Content) {
      throw new Error("[PB] Invalid license.");
    }

    const content = Buffer.from(base64Content, "base64").toString();
    const verify = crypto.createVerify("RSA-SHA256");
    verify.update(content);
    verify.end();

    const validLicense = verify.verify(publicKey, sig, "base64");
    if (!validLicense) {
      throw new Error("[PB] Invalid license.");
    }

    return JSON.parse(content) as PabuLicense;
  },
  readLicense() {
    try {
      return fs.readFileSync(join("pabu-license")).toString();
    } catch (error) {
      throw Error("[PB] Wrong license format.");
    }
  },
});
