import * as React from 'react'
import { useRef, useState } from 'react'

import { IPFSUploaderView } from './IPFSUploader.view'
import { create } from 'ipfs-http-client'
import { showToaster } from '../Toaster/Toaster.actions'
import { ERROR } from '../Toaster/Toaster.constants'
import { useDispatch } from 'react-redux'
import { isHexadecimalByteString } from '../../../utils/validatorFunctions'

export type IPFSUploaderStatusType = 'success' | 'error' | '' | undefined
export type IPFSUploaderTypeFile = 'document' | 'image'
type IPFSUploaderProps = {
  className?: string
  title?: string
  typeFile: IPFSUploaderTypeFile
  listNumber?: number
  disabled?: boolean
  imageIpfsUrl: string
  setIpfsImageUrl: (imageUrl: string) => void
  formInputStatus?: any
  setFormInputStatus?: (obj: any) => void
}

const client = create({ url: 'https://ipfs.infura.io:5001/api/v0' })

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
  const [isUploaded, setIsUploaded] = useState(false)
  const [imageOk, setImageOk] = useState(false)
  const inputFile = useRef<HTMLInputElement>(null)
  let ipfsUploaderStatus: IPFSUploaderStatusType = 'success',
    errorMessage = ''

  async function handleUpload(file: any) {
    try {
      setIsUploading(true)
      const added = await client.add(file)
      const image = `https://ipfs.infura.io/ipfs/${added.path}`
      setIpfsImageUrl(image)
      setIsUploading(false)
      setIsUploaded(!isUploading)
    } catch (error: any) {
      dispatch(showToaster(ERROR, error.message, ''))
      console.error(error)
      setIsUploading(false)
      setIsUploaded(false)
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
      isUploaded={isUploaded}
      isUploading={isUploading}
      inputFile={inputFile}
      handleUpload={handleUpload}
      handleIconClick={handleIconClick}
      onBlur={handleOnBlur}
      ipfsUploaderStatus={ipfsUploaderStatus}
      errorMessage={errorMessage}
    />
  )
}
