## What is Blobber?

Blobber is an image management platform for React apps including:

- An image upload hook
- Managed file storage
- on-the-fly image optimization
- global CDN distribution

It's the fastest way to add production-ready user-uploaded images to any React app.

### Install

```
npm install @blobber/react

yarn add @blobber/react
```

### Configure

Before you get started, you'll need a `clientId` to identify your app. [Log in to the dashboard](https://blobber.dev/auth/login) to get one for free, or use `"SANDBOX"` to get started right away.

### Upload an Image

The `useUpload` hook provides everything you'll need to start accepting image uploads.

- `handleUpload` &rarr; handler for `onChange` event of `<input>` element
- `previewUrl` &rarr; local url for the uploaded image
- `file` &rarr; [`FileData`](https://docs.blobber.dev/filedata) object describing the uploaded image

```jsx
import { useEffect } from 'react'
import { useUpload } from '@blobber/react'

function ImageUploadButton() {
  const { handleUpload, file, previewUrl } = useUpload({
    // your app's Client ID
    clientId: 'YOUR-CLIENT-ID-HERE',
  })

  useEffect(() => {
    if (file) {
      // save the file.id to your server
      api.post('/user', { photoId: file.id })
    }
  }, [file])

  return (
    <div>
      <img src={previewUrl} />
      <input type="file" onChange={handleUpload} />
    </div>
  )
}
```

Once the image is successfully uploaded, save `file.id` to your backend/server. Usually, you'll want to associate it with the authenticated user.

### Serve an Image

To serve an image, pass the `file.id` you saved in the previous step to the `getUrl` function along with any transformations.

```jsx
import { getUrl } from '@blobber/react'

// pass saved photo ID to profileImage component
function ProfileImage({ photoId }) {
  const imageUrl = getUrl({
    id: photoId,
    clientId: 'YOUR-CLIENT-ID-HERE',
    width: 120,
    format: 'webp',
  })

  return <img src={imageUrl} />
}
```

### Done!

Take a look at the [Guides](https://docs.blobber.dev/installation) & [API Reference](https://docs.blobber.dev/useupload) for more details.

[Log in to the dashboard](https://blobber.dev/auth/login) to view and manage uploaded images.
