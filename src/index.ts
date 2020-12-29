import { useState } from 'react'

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
    xhr.setRequestHeader('x-blubber-client-id', clientId)

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
  onSuccess?: (file: FileData) => void
}

export interface FileUploadState {
  file: FileData | null
  error: string | null
  loading: boolean
}

export interface FileUploadResult {
  file: FileData | null
  error: string | null
  loading: boolean
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  getImageUrl: (fileId: string, extension: string, size: number) => string
}

export const useFileUpload = (config?: FileUploadConfig): FileUploadResult => {
  if (!config?.clientId && !process.env.BLUBBER_CLIENT_ID) {
    throw Error('clientId not found: missing environment variable')
  }

  const clientId = (config?.clientId || process.env.BLUBBER_CLIENT_ID)!

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

  const getImageUrl = (fileId: string, extension: string = 'webp', size: number = 720) => {
    if (!fileId || fileId === '') {
      return config?.placeholderUrl || ''
    }

    const root = 'https://d2v15tqee22i7x.cloudfront.net'
    return `${root}/${clientId}/${fileId}/${fileId}-${size}.${extension}`
  }

  return {
    file: state.file,
    error: state.error,
    loading: state.loading,
    handleUpload: handleUpload,
    getImageUrl: getImageUrl,
  }
}

// MULTIPLE FILE UPLOAD HOOK //

export interface MultipleFileUploadConfig {
  clientId?: string
  placeholderUrl?: string
  onSuccess?: (files: FileData[]) => void
}

export interface MultipleFileUploadState {
  files: FileData[]
  error: string | null
  loading: boolean
}

export interface MultipleFileUploadResult {
  files: FileData[]
  error: string | null
  loading: boolean
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
  getImageUrl: (fileId: string, extension: string, size: number) => string
}

export const useMultipleFileUpload = (config?: MultipleFileUploadConfig): MultipleFileUploadResult => {
  if (!config?.clientId && !process.env.BLUBBER_CLIENT_ID) {
    throw Error('clientId not found: missing environment variable')
  }

  const clientId = (config?.clientId || process.env.BLUBBER_CLIENT_ID)!

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

  const getImageUrl = (fileId: string, extension: string = 'webp', size: number = 720) => {
    if (!fileId || fileId === '') {
      return config?.placeholderUrl || ''
    }

    const root = 'https://d2v15tqee22i7x.cloudfront.net'
    return `${root}/${clientId}/${fileId}/${fileId}-${size}.${extension}`
  }

  return {
    files: state.files,
    error: state.error,
    loading: state.loading,
    handleUpload: handleUpload,
    getImageUrl: getImageUrl,
  }
}

// NON HOOKS EXPORTS //
// These rely on process.env.BLUBBER_CLIENT_ID

export const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
  if (!process.env.BLUBBER_CLIENT_ID) {
    throw Error('clientId not found: missing environment variable')
  }

  const clientId = process.env.BLUBBER_CLIENT_ID

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

export const getImageUrl = (fileId: string, extension: string = 'webp', size: number = 720) => {
  if (!process.env.BLUBBER_CLIENT_ID) {
    throw Error('clientId not found: missing environment variable')
  }

  const clientId = process.env.BLUBBER_CLIENT_ID

  const root = 'https://d2v15tqee22i7x.cloudfront.net'
  return `${root}/${clientId}/${fileId}/${fileId}-${size}.${extension}`
}
