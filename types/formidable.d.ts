declare module 'formidable' {
  import { IncomingMessage } from 'http'
  export interface File {
    filepath?: string
    newFilename?: string
    originalFilename?: string
    mimetype?: string
  }
  export interface Options { multiples?: boolean }
  export default function formidable(options?: Options): any
}
