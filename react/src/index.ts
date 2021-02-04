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
  placeholderUrl?: string
}

export interface FileUploadState {
  file: FileData | null
  error: string | null
  loading: boolean
}

export type FileUploadSuccess = (file: FileData | null, error: string | null) => void

export interface FileUploadResult {
  file: FileData | null
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

  const [state, setState] = useState<FileUploadState>({
    file: {
      id: '',
      fileId: '',
      extension: '',
      mimetype: '',
      name: '',
      size: 0,
    },
    error: null,
    loading: false,
  })

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, loading: true })

    const files = event.target.files
    if (!files) {
      setState({ ...state, loading: false, error: 'No files were uploaded' })
      return
    }

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
        if (state.file && state.file.id !== '') {
          onSuccess(state.file, null)
        } else if (state.error) {
          onSuccess(null, state.error)
        }
      }
    }, [state])
  }

  return {
    file: state.file,
    error: state.error,
    loading: state.loading,
    handleUpload: handleUpload,
    useFile: useFile,
  }
}

// MULTIPLE FILE UPLOAD HOOK //

export interface MultipleFileUploadConfig {
  clientId?: string
  placeholderUrl?: string
}

export interface MultipleFileUploadState {
  files: FileData[]
  error: string | null
  loading: boolean
}

export type MultipleFileUploadSuccess = (files: FileData[] | null, error: string | null) => void

export interface MultipleFileUploadResult {
  files: FileData[]
  error: string | null
  loading: boolean
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  useFiles: (onSuccess: MultipleFileUploadSuccess) => void
}

export const useMultipleUpload = (config: MultipleFileUploadConfig = {}): MultipleFileUploadResult => {
  let clientId: string
  if (config.clientId) {
    clientId = config.clientId
  } else if (process.env.BLOBBER_CLIENT_ID) {
    clientId = process.env.BLOBBER_CLIENT_ID
  } else {
    throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable,
      or pass clientId property to useMultipleUpload params `)
  }

  const [state, setState] = useState<MultipleFileUploadState>({
    files: [],
    error: null,
    loading: false,
  })

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    setState({ ...state, loading: true })

    const files = event.target.files
    if (!files) {
      setState({ ...state, loading: false, error: 'No files were uploaded' })
      return
    }

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
        files: res,
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

  const useFiles = (onSuccess: MultipleFileUploadSuccess) => {
    useEffect(() => {
      if (!state.loading) {
        if (state.files.length > 0) {
          onSuccess(state.files, null)
        } else if (state.error) {
          onSuccess([], state.error)
        }
      }
    }, [state])
  }

  return {
    files: state.files,
    error: state.error,
    loading: state.loading,
    handleUpload: handleUpload,
    useFiles: useFiles,
  }
}

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

  let res: FileData[] | null = null
  try {
    // call helper function to send XMLHttpRequest
    res = await uploadFile(form, clientId)
  } catch (err) {
    return { error: err, file: null }
  }

  return { error: null, file: res }
}

export interface GetUrlParams {
  id: string
  height?: number
  width?: number
  format?: string
  clientId?: string
}

export const getUrl = ({ id, width, height, format, clientId: providedClientId }: GetUrlParams) => {
  const root = 'https://cdn.blobber.dev'

  let clientId: string
  if (providedClientId) {
    clientId = providedClientId
  } else if (process.env.BLOBBER_CLIENT_ID) {
    clientId = process.env.BLOBBER_CLIENT_ID
  } else {
    throw Error(`Blobber Client ID not found. Provide BLOBBER_CLIENT_ID environment variable,
      or pass clientId property to getUrl params `)
  }

  const params = []
  if (width) params.push('w=' + width)
  if (height) params.push('h=' + height)

  let paramsString = ''
  if (params.length) {
    paramsString = '?' + params.join('&')
  }

  let extension = format ? `.${format}` : ''

  return `${root}/${clientId}/${id}${extension}${paramsString}`
}
