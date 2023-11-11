import { DecodedIdToken } from "firebase-admin/auth";
import { Response } from "node-fetch";
import {
  PutObjectCommand,
  GetObjectCommand,
  GetObjectCommandOutput,
} from "@aws-sdk/client-s3";
import { ulid } from "ulid";
import s3Client from "../../lib/server/s3Client";
import { Blob } from "buffer";

export type Play = {
  id?: string;
  parent?: string;
  name: string;
  frames: Array<any>;
  token?: any;
};

const COMMAND_DEFAULTS = {
  Bucket: process.env.WHITEBOARD_BUCKET!,
};

type cmd = PutObjectCommand | GetObjectCommand;

class DocStore {
  async get(id: string): Promise<Play> {
    const command = new GetObjectCommand({
      ...COMMAND_DEFAULTS,
      Key: `plays/${id}.json`,
    });

    const resp: GetObjectCommandOutput = await this.executeCommand(command);
    const body = resp.Body;
    if (body) {
      const r = new Response(body as NodeJS.ReadableStream);
      const play: Play = (await r.json()) as Play;

      return play;
    }

    throw "Invalid response from doc store";
  }
  async save(token: DecodedIdToken, doc: Play): Promise<Play> {
    if (doc.id) {
      doc.parent = doc.id;
    }

    doc.id = ulid();

    doc.token = {
      provider_id: token.provider_id,
      user_id: token.user_id,
    };

    const commands: Array<PutObjectCommand> = [
      new PutObjectCommand({
        ...COMMAND_DEFAULTS,
        Key: `plays/${doc.id}.json`,
        Body: JSON.stringify(doc),
      }),
    ];

    if (token.provider_id !== "anonymous") {
      commands.push(
        new PutObjectCommand({
          ...COMMAND_DEFAULTS,
          Key: `plays/${token.uid}/${doc.id}`,
          Body: "",
        })
      );
    }

    await this.executeCommands(commands);

    return doc;
  }

  private async executeCommands(commands: Array<cmd>) {
    for (let index = 0; index < commands.length; index++) {
      const cmd = commands[index];
      await this.executeCommand(cmd);
    }
  }

  private async executeCommand(command: cmd) {
    try {
      return await s3Client.send(command);
    } catch (e) {
      console.log("Error", e, "Command", command);
      throw "Failed to execute s3 command";
    }
  }
}

export default new DocStore();
