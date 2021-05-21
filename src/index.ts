import { createClient } from 'contentful-management';

import { CreateAsset, CreateEntry, FieldResolverFunc, Props } from './types';

export const createContentfulContent = async ({
  accessToken,
  spaceID,
  environment: environmentID = 'master',
  templates,
  dryRun = false,
  publish = !dryRun,
}: Props) => {
  const client = createClient({
    accessToken,
  });
  const space = await client.getSpace(spaceID);
  const environment = await space.getEnvironment(environmentID);

  const createEntry: CreateEntry = async (contentType, data) => {
    try {
      const entryContent = {
        fields: await Object.entries(templates[contentType]).reduce(
          async (acc, [key, value]) => ({
            ...(await acc),
            [key]: {
              // @ts-ignore
              'en-US':
                typeof value === 'function'
                  ? await (value as FieldResolverFunc)(data, {
                      createEntry,
                      createAsset,
                      environment,
                    })
                  : data[value as string],
            },
          }),
          {}
        ),
      };

      if (dryRun) {
        return entryContent;
      }

      const entry = await environment.createEntry(contentType, entryContent);

      if (publish) {
        await entry.publish();
      }

      return {
        sys: {
          type: 'Link',
          linkType: 'Entry',
          id: entry.sys.id,
        },
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  const createAsset: CreateAsset = async ({ name, type, url }) => {
    try {
      const assetContent = {
        fields: {
          title: { 'en-US': name },
          file: {
            'en-US': {
              contentType: type,
              fileName: name,
              upload: url,
            },
          },
        },
      };

      if (dryRun) {
        return assetContent;
      }

      const asset = await environment.createAsset(assetContent);
      await asset.processForAllLocales();

      if (publish) {
        await asset.publish();
      }

      return {
        sys: {
          type: 'Link',
          linkType: 'Asset',
          id: asset.sys.id,
        },
      };
    } catch (e) {
      console.error(e);
      return null;
    }
  };

  return { createAsset, createEntry, environment };
};
