# create-contentful-content

An easier way to programmatically create nested contentful content

## Installation

- With `npm`

  ```shell
  npm i(install) create-contentful-content
  ```

- With `yarn`
  ```shell
  yarn add create-contentful-content
  ```

## Basic Usage

```javascript
import { createContentfulContent } from 'create-content-client';
import data from './data.json';

const { SPACE, TOKEN, ENVIRONMENT } = process.env;

const templates = {
  article: {...},
  author: {...}
};

const createContent = async () => {
  const { createEntry } = await createContentfulContent({
    spaceID: SPACE,
    accessToken: TOKEN,
    environment: ENVIRONMENT,
    templates,
  });

  const articles = await Promise.all(data.map(item => createEntry('article', item)));
}
```

## Templates
`create-contentful-content` relies on the `templates` argument to determine how to go about
creating a specific type of entry. `templates` should be an object with fields that relate
to each content type that will need to be created by the script. In the example above the two
fields provided are `article` and `author`, meaning that the initialized `createEntry` will 
know how to handle these two content types. The example calls `createEntry('article', item)`,
so it will use the contents of `item` to create an `article` entry in Contentful based off the
`article` value in the template. 

The value of a specific template should be another object with all of the fields needed to create
that entry in Contentful. Each field can either be a string or a function. A string will simply 
be used as a property-accessor for the object passed to create entry. A function will be given the
object passed to `createEntry` along with the resolution methods created by `createContentfulContent`.

This is probably more easily understand by example. Below is an example of what the templates might 
looks like for the example above, creating a simple blog site.

`/data.json`

```json
[
  {
    "title": "The blog post title",
    "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "publishDate": "1969-12-31",
    "heroImage": "https://via.placeholder.com/1500/500",
    "author": {
      "name": "John Doe",
      "headshot": "https://via.placeholder.com/500",
      "title": "Chief Person"
    }
  },
  {
    "title": "Another blog post title",
    "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "publishDate": "1969-12-31",
    "heroImage": "https://via.placeholder.com/1500/500",
    "author": {
      "name": "Jane Doe",
      "headshot": "https://via.placeholder.com/500",
      "title": "Co-Chief Person"
    }
  },
  {
    "title": "A third blog post title",
    "body": "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    "publishDate": "1969-12-31",
    "heroImage": "https://via.placeholder.com/1500/500",
    "author": {
      "name": "Third Name",
      "headshot": "https://via.placeholder.com/500",
      "title": "EVP Person"
    }
  }
]
```


```javascript
const templates = {
  article: {
    title: 'title',
    body: 'body',
    publishDate: 'publishDate',
    heroImage(article, { createAsset }) {
      return createAsset({
        url: article.heroImage,
        title: `${article.title} Hero Image`,
        type: 'image/png',
      })
    },
    author(article, { createEntry }) {
      return createEntry('author', article.author);
    }
  },
  author: {
    name: 'name',
    headshot(author, { createAsset }) {
      return createAsset({
        url: author.headshot,
        title: `${author.name} Headshot`,
        type: 'image/png'
      })
    },
    title: 'title'
  }
};
```

Given these templates and data, the example above will start at the first item in the data array 
and try to create an `article` content type from this object. Following the order of the fields 
provided in the article template, it will first look at the `title` field, which corresponds 
directly with the `title` field from the data object (_'The blog post title'_). Next, it looks
at `body` and `publishDate` which behave the same way with a direct relationship to the data object.

It then gets to the `heroImage` field which is a function. This function is passed the whole article 
object as the first argument and an object of methods as the second argument, specifically `createAsset`.
`createAsset` takes specific arguments which are described below, but this will create an "Asset" in 
Contentful and return the necessary structure to link it to the article that is being created.

Finally, it gets to the `author` field which is another function. This time the function uses the 
`createEntry` method instead of `createAsset`. `createEntry` here is exactly the same as the top-level
`createEntry` used to create the `article`. In this case, we're telling it to create an `author` and
passing it the author data that's inside the `article` object.

Now it looks at the `author` template. Equivalently, it looks at the individual fields. `name` and
`title` correspond directly to the fields within the author object. `headshot` is used to create
an asset, similarly to the `heroImage` in the article. The whole `createEntry` function will return
the necesssary structure to link the newly-created author to the article being created, equilavent to
`createAsset`.

## API Docs

- `createContentfulContent({ accessToken, spaceID, environment, templates, dryRun, publish})`
  - `accessToken` (required) - A _Contentful Management Token_ which can be created in the
    Contentful  dashboard.
  - `spaceID` (required) - The ID of the Contentful space where the content should be created. 
    This can also be found in the contentful dashboard.
  - `environment` (optional, defaults to `master`) - The Contentful environment where the content
    should be created
  - `templates` (required) - The entry templates as described in the section above.
  - `dryRun` (optional, default to `false`) - If this is set to `true` content will not be created
    and instead the complete structure of the content to be created will be returned.
  - `publish` (optional, defaults to the opposite value of `dryRun`) - If set to `false`, content
    will be created in the "Draft" state. If set to `true` the content will be "Published" after
    creation.
    
- `createEntry(contentType,data)`
  - `contentType` - Corresponds to a field from `templates`. Specifies which type of entry to
    create.
  - `data` - The data object used to create the entry.
- `createAsset({ url, name, type })`
  - `url` - The asset URL.
  - `name` - Used to populate the name of the asset in contentful.
  - `type` - The mime type of the file (e.g. `image/png`, `image/jpeg`, `video/mp4`). 
