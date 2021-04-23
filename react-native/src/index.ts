import { useEffect, useState } from 'react'

// metadata returned to the client from upload.blobber.dev after a file is uploaded
export interface FileData {
  id: string
  name: string
  extension: string
  mimetype: string
  size: number
}

// helper function to execute request to Blubber Beluga API
const uploadFile = (data: FormData, clientId: string): Promise<FileData[]> => {
  return new Promise((resolve, reject) => {
    let xhr = new XMLHttpRequest()

    xhr.open('POST', 'https://upload.blobber.dev')
    xhr.setRequestHeader('x-blobber-client-id', clientId)

    // for react native, set the content-type header (browser does this for you on web)
    xhr.setRequestHeader('Content-Type', 'multipart/form-data')

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        const result = JSON.parse(xhr.response)
        resolve(result as FileData[])
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        })
      }
    }
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      })
    }
    xhr.send(data)
  })
}

// SINGLE FILE UPLOAD HOOK //

export interface UploadConfig {
  clientId?: string
  placeholderUrl?: string
}

export interface HandleUploadParams {
  uri: string
  name?: string
  type?: string
}

export interface UploadResult {
  handleUpload: (config: HandleUploadParams) => Promise<FileData>
  previewUrl: string | null
  file: FileData | null
  loading: boolean
  error: string | null
  useFile: (onSuccess: UploadSuccess) => void
}

export type UploadSuccess = (file: FileData | null, error: string | null) => void

export function useUpload({ clientId, placeholderUrl }: UploadConfig = {}): UploadResult {
  let resolvedPlaceholderUrl: string
  if (placeholderUrl) {
    resolvedPlaceholderUrl = placeholderUrl
  } else {
    resolvedPlaceholderUrl = ''
  }

  const resolvedClientId = ResolveClientId(clientId, 'useUpload')

  const [file, setFile] = useState<FileData | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(resolvedPlaceholderUrl)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleUpload = async ({ uri, name, type }: HandleUploadParams) => {
    setLoading(true)

    try {
      const resolvedName = name ? name : 'none'
      const resolvedType = type ? type : 'image/*'

      const file = {
        uri: uri,
        name: resolvedName,
        type: resolvedType,
      }

      // set selected file to populate previewUrl
      setPreviewUrl(uri)

      // create form and file
      const form = new FormData()
      // @ts-ignore
      form.append('file', file)

      // call helper function to send XMLHttpRequest
      const res = await uploadFile(form, resolvedClientId)
      setFile(res[0])
      setLoading(false)
      // for RN, return the file (useFile less useful for RN)
      return res[0]
    } catch (err) {
      setError(err)
      setLoading(false)
      throw err
    }
  }

  const useFile = (onSuccess: UploadSuccess) => {
    useEffect(() => {
      if (file) {
        onSuccess(file, null)
      } else if (error) {
        onSuccess(null, error)
      }
    }, [file])
  }

  return {
    handleUpload: handleUpload,
    previewUrl: previewUrl,
    file: file,
    loading: loading,
    error: error,
    useFile: useFile,
  }
}

// getUrl generates a url at cdn.blobber.dev

export interface GetUrlConfig {
  id: string
  clientId?: string
  height?: number
  width?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'oustide'
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
}

export function getUrl({ id, width, height, fit, format, clientId }: GetUrlConfig) {
  const root = 'https://cdn.blobber.dev'

  if (!id) {
    throw Error(`getUrl: File ID not found. Pass Blobber File ID as 'id' property to getUrl config`)
  }

  const resolvedClientId = ResolveClientId(clientId, 'getUrl')

  const paramList = []
  if (fit) paramList.push('fit-' + fit)
  if (height) paramList.push('height-' + height)
  if (width) paramList.push('width-' + width)

  let paramsString = ''
  if (paramList.length) {
    paramsString = `${paramList.join(',')}/`
  }

  let extension = format ? `.${format}` : ''

  return `${root}/${resolvedClientId}/${paramsString}${id}${extension}`
}

function ResolveClientId(clientId: string | undefined, functionName: string) {
  let resolvedClientId: string

  if (clientId) {
    resolvedClientId = clientId
  } else if (process.env.BLOBBER_CLIENT_ID) {
    resolvedClientId = process.env.BLOBBER_CLIENT_ID
  } else if (process.env.REACT_APP_BLOBBER_CLIENT_ID) {
    resolvedClientId = process.env.REACT_APP_BLOBBER_CLIENT_ID
  } else if (process.env.NEXT_PUBLIC_BLOBBER_CLIENT_ID) {
    resolvedClientId = process.env.NEXT_PUBLIC_BLOBBER_CLIENT_ID
  } else {
    throw Error(
      `${functionName}: Blobber Client ID not found. Pass clientId property to ${functionName} config, or provide BLOBBER_CLIENT_ID environment variable.`
    )
  }

  return resolvedClientId
}
