import { Environment } from 'contentful-management/types';

export interface ContentfulLink {
  sys: {
    type: string;
    linkType: string;
    id: string;
  };
}

export interface AssetProps {
  name: string;
  type: string;
  url: string;
}

export interface EntryContent {
  fields: Record<string, any>;
}

export interface AssetContent {
  fields: {
    title: { 'en-US': string };
    file: {
      'en-US': {
        contentType: string;
        fileName: string;
        upload: string;
      };
    };
  };
}

export type CreateEntry = (
  contentType: string,
  data: any
) => Promise<ContentfulLink | EntryContent | null>;

export type CreateAsset = ({
  name,
  type: url,
}: AssetProps) => Promise<ContentfulLink | AssetContent | null>;

export type FieldResolverFunc = (
  item: any,
  methods: {
    createEntry: CreateEntry;
    createAsset: CreateAsset;
    environment: Environment;
  }
) => any;

export interface EntryResolver {
  [field: string]: string | FieldResolverFunc;
}

export interface Templates {
  [contentType: string]: EntryResolver;
}

export interface Props {
  accessToken: string;
  spaceID: string;
  environment?: string;
  templates: Templates;
  dryRun?: boolean;
  publish?: boolean;
}
