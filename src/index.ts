/*
1. React Hook
2. Vanilla JS... maybe just a "handleUpload" function to run as callback to <input> element onChange
*/
import { useState } from 'react'

interface FileUploadConfig {
  clientId: string
}

interface FileData {
  fileId: string
  name: string
  size: number
}

interface FileUploadState {
  data: FileData[]
  error: string | null
  loading: boolean
}

interface FileUploadResult {
  data: FileData[]
  error: string | null
  loading: boolean
  handleUpload: (event: React.ChangeEvent<HTMLInputElement>) => void
}

export const useFileUpload = (config: FileUploadConfig): FileUploadResult => {
  const [state, setState] = useState<FileUploadState>({
    data: [],
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

    // call helper function to send XMLHttpRequest
    const res = await uploadFile(form)

    console.log('got result from API', res)

    // process result and update state
  }

  // helper function to execute request to Blubber Beluga API
  const uploadFile = (data: FormData) => {
    return new Promise((resolve, reject) => {
      let xhr = new XMLHttpRequest()

      xhr.open('POST', 'http://localhost:8000/upload')
      xhr.setRequestHeader('Content-Type', 'multipart/form-data')
      xhr.setRequestHeader('x-blubber-client-id', config.clientId)

      xhr.onload = function () {
        if (this.status >= 200 && this.status < 300) {
          resolve(xhr.response)
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

  return {
    data: state.data,
    error: state.error,
    loading: state.loading,
    handleUpload: handleUpload,
  }
}

// const readFile = (file: File) => {
//   return new Promise((resolve, reject) => {
//     const reader = new FileReader()

//     // Read the image via FileReader API and save image result in state.
//     reader.onload = (event: any) => {
//       // Add the file name to the data URL
//       let dataURL = event.target.result
//       dataURL = dataURL.replace(';base64', `;name=${file.name};base64`)
//       resolve({ file, dataURL })
//     }

//     reader.readAsDataURL(file)
//   })
// }
