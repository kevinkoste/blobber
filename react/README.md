## Blobber

Add user-uploaded images to your React app in seconds.

Resize, optimize, and serve images from a global CDN. Manage files in the dashboard or with the API.

Visit [blobber.dev][1] for docs & pricing.

## Install

Add Blobber to your project with `npm` or `yarn`.

```
npm install @blobber/react

yarn add @blobber/react
```

## Getting Started

`@blobber/react` exports a React hook called `useUpload`. The hook returns a function called `handleUpload` which you should attach to an `<input>` element as the `onChange` callback.

```javascript
import { useUpload } from "@blobber/react";

function ImageUploadButton() {
  const { handleUpload, useFile } = useUpload();

  useFile((file) => {
    api.post("/user", { photoId: file.id });
  });

  return <input type="file" onChange={handleUpload} />;
}
```

When the user successfully uploads a file, the `useFile` hook fires with the resulting `file` object. This is where you should store the `file.id` so you can fetch the image elsewhere in your application using `getUrl`.

`getUrl` generates a URL for the file you are requesting. It accepts three arguments:

- `fileId` - a UID used by Blobber to identify the file
- `size` - an integer representing the width of the resulting file
- `format` - an image file format (currently supports `jpg`, `png`, and `webp`)

```javascript
import { getUrl } from "@blobber/react";

function ProfileImage({ photoId }) {
  return <img src={getUrl(photoId, 480, "webp")} />;
}
```

## Providing a Client ID

To identify your application, you must provide a Blobber client ID. You can provide the client ID in one of two ways: either include the environment variable `BLOBBER_CLIENT_ID`, or pass the `clientId` property to the `useUpload` hook.

To get started, you can use `SANDBOX` as your client ID. Visit [blobber.dev][1] to sign up and get a production-ready client ID.

```javascript
export BLOBBER_CLIENT_ID = 'SANDBOX'
```

## Not using React?

If you are using class components, or a framework other than React, you can also import the plain javascript functions `handleUpload` and `getUrl` to achieve the same result described above.

```javascript
import { handleUpload } from '@blobber/react'

function ImageUpload() {

  function handleChange (event) {
    const { error, file } = await handleUpload(event)

    // process file metadata here!
    api.post('/user', { photoId: file.id })
  }

  return (
    <input type='file' onChange={handleChange} />
  )
}
```

```javascript
import { getUrl } from "@blobber/react";

function ProfileImage({ photoId }) {
  return <img src={getUrl(photoId, 480, "webp")} />;
}
```

[1]: https://blobber.dev
