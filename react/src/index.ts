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

export interface UploadResult {
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
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
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState<boolean>(false)

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setLoading(true)

    const files = event.target.files
    if (!files || files.length < 1) {
      setError('No files were uploaded')
      setLoading(false)
      return
    }

    // set selected file to populate previewUrl
    setSelectedFile(files[0])

    // create form and append all files
    const form = new FormData()
    for (let i = 0; i < files.length; i++) {
      form.append('file', files[i])
    }

    try {
      // call helper function to send XMLHttpRequest
      const res = await uploadFile(form, resolvedClientId)
      setFile(res[0])
      setLoading(false)
    } catch (err) {
      setError(err)
      setLoading(false)
    }
  }

  // handle generating previewUrl URL from selected file
  useEffect(() => {
    if (!selectedFile) {
      return
    }

    const previewUrl = URL.createObjectURL(selectedFile)
    setPreviewUrl(previewUrl)

    // free memory when this component unmounts
    return () => URL.revokeObjectURL(previewUrl)
  }, [selectedFile])

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

// // MULTIPLE FILE UPLOAD HOOK //

// export interface MultipleFileUploadConfig {
//   clientId?: string
//   placeholderUrl?: string
// }

// export interface MultipleFileUploadState {
//   files: FileData[]
//   error: string | null
//   loading: boolean
// }

// export type MultipleFileUploadSuccess = (files: FileData[] | null, error: string | null) => void

// export interface MultipleFileUploadResult {
//   files: FileData[]
//   error: string | null
//   loading: boolean
//   handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
//   useFiles: (onSuccess: MultipleFileUploadSuccess) => void
// }

// export const useMultipleUpload = (config: MultipleFileUploadConfig = {}): MultipleFileUploadResult => {
//   let clientId: string
//   if (config.clientId) {
//     clientId = config.clientId
//   } else if (process.env.BLOBBER_CLIENT_ID) {
//     clientId = process.env.BLOBBER_CLIENT_ID
//   } else {
//     throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable,
//       or pass clientId property to useMultipleUpload params `)
//   }

//   const [state, setState] = useState<MultipleFileUploadState>({
//     files: [],
//     error: null,
//     loading: false,
//   })

//   const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
//     setState({ ...state, loading: true })

//     const files = event.target.files
//     if (!files) {
//       setState({ ...state, loading: false, error: 'No files were uploaded' })
//       return
//     }

//     // create form and append all files
//     const form = new FormData()
//     for (let i = 0; i < files.length; i++) {
//       form.append('file', files[i])
//     }

//     try {
//       // call helper function to send XMLHttpRequest
//       const res = await uploadFile(form, clientId)
//       setState({
//         ...state,
//         files: res,
//         loading: false,
//       })
//     } catch (err) {
//       setState({
//         ...state,
//         error: err,
//         loading: false,
//       })
//     }
//   }

//   const useFiles = (onSuccess: MultipleFileUploadSuccess) => {
//     useEffect(() => {
//       if (!state.loading) {
//         if (state.files.length > 0) {
//           onSuccess(state.files, null)
//         } else if (state.error) {
//           onSuccess([], state.error)
//         }
//       }
//     }, [state])
//   }

//   return {
//     files: state.files,
//     error: state.error,
//     loading: state.loading,
//     handleUpload: handleUpload,
//     useFiles: useFiles,
//   }
// }

// // NON HOOKS EXPORTS //
// // These rely on process.env.BLOBBER_CLIENT_ID

// export const handleUpload = async (event: any) => {
//   let clientId: string
//   if (process.env.BLOBBER_CLIENT_ID) {
//     clientId = process.env.BLOBBER_CLIENT_ID
//   } else {
//     throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable`)
//   }

//   const files = event.target.files
//   if (!files) {
//     return { error: 'No file uploaded', file: null }
//   }

//   // create form and append all files
//   const form = new FormData()
//   for (let i = 0; i < files.length; i++) {
//     form.append('file', files[i])
//   }

//   let fileData: FileData[] | null = null
//   try {
//     // call helper function to send XMLHttpRequest
//     fileData = await uploadFile(form, clientId)
//   } catch (err) {
//     return { error: err, file: null }
//   }

//   return { error: null, file: fileData[0] }
// }
