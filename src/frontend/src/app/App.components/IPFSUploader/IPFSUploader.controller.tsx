import { useRef, useState } from 'react'

import { IPFSUploaderView } from './IPFSUploader.view'
import { create, Options } from 'ipfs-http-client'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { useDispatch } from 'react-redux'
import { isHexadecimalByteString } from '../../../utils/validatorFunctions'

export type IPFSUploaderTypeFile = 'document' | 'image'
type IPFSUploaderProps = {
  className?: string
  title?: string
  typeFile: IPFSUploaderTypeFile
  listNumber?: number
  disabled?: boolean
  imageIpfsUrl: string
  setIpfsImageUrl: (imageUrl: string) => void
  formInputStatus?: Record<string, unknown>
  setFormInputStatus?: (obj: Record<string, unknown>) => void
}

const projectId = process.env.REACT_APP_IPFS_PROJECT_ID
const projectSecret = process.env.REACT_APP_IPFS_API_KEY
const auth = 'Basic ' + Buffer.from(projectId + ':' + projectSecret).toString('base64')

const client = create({
  host: 'ipfs.infura.io',
  port: 5001,
  protocol: 'https',
  headers: {
      authorization: auth,
  },
})

export const IPFSUploader = ({
  title,
  listNumber,
  typeFile,
  disabled,
  imageIpfsUrl,
  setIpfsImageUrl,
  formInputStatus,
  setFormInputStatus,
  className,
}: IPFSUploaderProps) => {
  const dispatch = useDispatch()
  const [isUploading, setIsUploading] = useState(false)
  const [imageOk, setImageOk] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)

  async function handleUpload(file: File) {
    try {
      setIsUploading(true)
      const added = await client.add(file)
      const image = `https://infura-ipfs.io/ipfs/${added.path}`

      setIpfsImageUrl(image)
      setIsUploading(false)
    } catch (error) {
      if (error instanceof Error) {
        dispatch(showToaster(ERROR, error.message, ''))
        console.error(error)
        setIsUploading(false)
      }
    }
  }

  const handleOnBlur = () => {
    const validityCheckResult = isHexadecimalByteString(imageIpfsUrl)
    setImageOk(validityCheckResult)
    if (setFormInputStatus) {
      setFormInputStatus({ ...formInputStatus, image: validityCheckResult ? 'success' : 'error' })
    }
  }

  const handleIconClick = () => {
    inputFile?.current?.click()
  }

  return (
    <IPFSUploaderView
      typeFile={typeFile}
      className={className}
      title={title}
      disabled={disabled}
      listNumber={listNumber}
      imageIpfsUrl={imageIpfsUrl}
      imageOk={imageOk}
      isUploading={isUploading}
      inputFile={inputFile}
      handleUpload={handleUpload}
      handleIconClick={handleIconClick}
      onBlur={handleOnBlur}
    />
  )
}
