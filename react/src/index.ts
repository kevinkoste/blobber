import { useEffect, useState } from 'react'

export interface FileData {
  id: string
  fileId: string
  extension: string
  mimetype: string
  name: string
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

export interface FileUploadConfig {
  clientId?: string
}

export interface FileUploadState {
  file: FileData | null
  preview: string | null
  selectedFile: File | null
  error: string | null
  loading: boolean
}

export type FileUploadSuccess = (file: FileData | null, error: string | null) => void

export interface FileUploadResult {
  file: FileData | null
  preview: string | null
  error: string | null
  loading: boolean
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  useFile: (onSuccess: FileUploadSuccess) => void
}

export const useUpload = (config: FileUploadConfig = {}): FileUploadResult => {
  let clientId: string
  if (config.clientId) {
    clientId = config.clientId
  } else if (process.env.BLOBBER_CLIENT_ID) {
    clientId = process.env.BLOBBER_CLIENT_ID
  } else {
    throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable,
      or pass clientId property to useUpload params `)
  }

  // state that is exposed from hook
  const [state, setState] = useState<FileUploadState>({
    file: null,
    preview: null,
    selectedFile: null,
    error: null,
    loading: false,
  })

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, loading: true })

    const files = event.target.files
    if (!files || files.length < 1) {
      setState({ ...state, loading: false, error: 'No files were uploaded' })
      return
    }

    // set selected file to populate preview
    setState({ ...state, selectedFile: files[0] })

    // create form and append all files
    const form = new FormData()
    for (let i = 0; i < files.length; i++) {
      form.append('file', files[i])
    }

    try {
      // call helper function to send XMLHttpRequest
      const res = await uploadFile(form, clientId)
      setState({
        ...state,
        file: res[0],
        loading: false,
      })
    } catch (err) {
      setState({
        ...state,
        error: err,
        loading: false,
      })
    }
  }

  const useFile = (onSuccess: FileUploadSuccess) => {
    useEffect(() => {
      if (!state.loading) {
        if (state.file) {
          onSuccess(state.file, null)
        } else if (state.error) {
          onSuccess(null, state.error)
        }
      }
    }, [state])
  }

  // handle generating preview URL from selected file
  useEffect(() => {
    if (!state.selectedFile) {
      setState({ ...state, preview: null })
      return
    }

    const preview = URL.createObjectURL(state.selectedFile)
    setState({ ...state, preview: preview })

    // free memory when this component unmounts
    return () => URL.revokeObjectURL(preview)
  }, [state.selectedFile])

  return {
    file: state.file,
    preview: state.preview,
    error: state.error,
    loading: state.loading,
    handleUpload: handleUpload,
    useFile: useFile,
  }
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

// NON HOOKS EXPORTS //
// These rely on process.env.BLOBBER_CLIENT_ID

export const handleUpload = async (event: any) => {
  let clientId: string
  if (process.env.BLOBBER_CLIENT_ID) {
    clientId = process.env.BLOBBER_CLIENT_ID
  } else {
    throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable`)
  }

  const files = event.target.files
  if (!files) {
    return { error: 'No file uploaded', file: null }
  }

  // create form and append all files
  const form = new FormData()
  for (let i = 0; i < files.length; i++) {
    form.append('file', files[i])
  }

  let fileData: FileData[] | null = null
  try {
    // call helper function to send XMLHttpRequest
    fileData = await uploadFile(form, clientId)
  } catch (err) {
    return { error: err, file: null }
  }

  return { error: null, file: fileData[0] }
}

export interface GetUrlParams {
  id: string
  height?: number
  width?: number
  fit?: 'cover' | 'contain' | 'fill' | 'inside' | 'oustide'
  format?: 'jpg' | 'jpeg' | 'png' | 'webp' | 'avif'
  clientId?: string
}

export const getUrl = ({ id, width, height, fit, format, clientId }: GetUrlParams) => {
  const root = 'https://cdn.blobber.dev'

  let resolvedClientId: string
  if (clientId) {
    resolvedClientId = clientId
  } else if (process.env.BLOBBER_CLIENT_ID) {
    resolvedClientId = process.env.BLOBBER_CLIENT_ID
  } else {
    throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable,
      or pass clientId property to getUrl params`)
  }

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
