import { store } from "@/store";
import {
  ListObjectsV2Command,
  ListObjectsV2Output,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { createApi, fakeBaseQuery } from "@reduxjs/toolkit/query/react";
import { withReauth } from "./utils";
import { AwsCredentials } from "@/features/appSlice";
import { S3Action } from "@/features/s3Slice";
import { invoke } from "@tauri-apps/api/core";
import { formatLocalDate } from "@/lib/utils";

export type File = {
  type: Exclude<ContentType, "folder">;
  key: string;
  name: string;
  size: number;
  lastModified: string;
};
export type Folder = {
  type: Exclude<ContentType, "file">;
  prefix: string;
  name: string;
};
export type Content = File | Folder;
export type ContentType = "file" | "folder";
export type UploadObjectArgs = {
  filePath: string;
  folder: string;
};

function getStateInfo(): {
  creds: AwsCredentials;
  region: string;
} {
  const state = store.getState().app;

  const creds = state.awsCredentials!;
  const region = state.setting?.region!;

  return {
    creds,
    region,
  };
}

function createS3ClientAndPrefix(): {
  client: S3Client;
  folderPrefix: string;
} {
  const { creds, region } = getStateInfo();

  const client = new S3Client({
    region,
    credentials: {
      ...creds,
    },
  });

  return {
    client,
    folderPrefix: `private/${creds.identityId}`,
  };
}

const bucket = "s3-app-1234";

export const s3Api = createApi({
  reducerPath: "s3Api",
  baseQuery: fakeBaseQuery(),
  endpoints: (builder) => ({
    listContents: builder.query<Content[], string>({
      queryFn: withReauth<Content[], string>(async (folder) => {
        const { client, folderPrefix } = createS3ClientAndPrefix();
        const prefix = `${folderPrefix}${folder}`;

        const command = new ListObjectsV2Command({
          Bucket: bucket,
          Prefix: prefix,
          Delimiter: "/",
        });

        try {
          const response: ListObjectsV2Output = await client.send(command);
          let contents: Content[] = [];

          for (const content of response.Contents ?? []) {
            const { Key, LastModified, Size } = content;
            if (
              Key === undefined ||
              LastModified === undefined ||
              Size === undefined
            ) {
              return { error: "contents have undefined field" };
            }
            const name = Key.replace(prefix, "");
            if (name !== "") {
              contents.push({
                type: "file",
                key: Key,
                name,
                lastModified: formatLocalDate(LastModified),
                size: Size,
              });
            }
          }

          for (const p of response.CommonPrefixes ?? []) {
            const { Prefix } = p;
            if (Prefix === undefined) {
              return { error: "prefixes have undefined field" };
            }

            const name = Prefix.replace(prefix, "");
            contents.push({
              type: "folder",
              prefix: Prefix,
              name,
            });
          }

          return { data: contents };
        } catch (error) {
          return { error };
        }
      }),
    }),
    createFolder: builder.mutation<string, string>({
      queryFn: withReauth<string, string>(async (folder) => {
        const { client, folderPrefix } = createS3ClientAndPrefix();
        const prefix = `${folderPrefix}${folder}`;

        const command = new PutObjectCommand({
          Bucket: bucket,
          Key: prefix,
        });
        try {
          await client.send(command);

          return { data: folder };
        } catch (error) {
          return { error };
        }
      }),
      async onQueryStarted(_, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(S3Action.setFolder(data));
      },
    }),
    uploadObject: builder.mutation<null, UploadObjectArgs>({
      queryFn: withReauth<null, UploadObjectArgs>(async (args) => {
        const { creds, region } = getStateInfo();

        await invoke("upload_file_multipart", {
          filePath: args.filePath,
          region,
          bucket,
          creds: {
            access_key_id: creds.accessKeyId,
            secret_access_key: creds.secretAccessKey,
            session_token: creds.sessionToken,
            identity_id: creds.identityId,
          },
          key: `private/${creds.identityId}${args.folder}`,
        });

        return { data: null };
      }),
    }),
  }),
});

export const { useListContentsQuery, useCreateFolderMutation } = s3Api;
