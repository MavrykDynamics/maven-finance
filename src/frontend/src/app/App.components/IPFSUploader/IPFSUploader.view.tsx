import React, { Ref, useCallback, useState } from 'react'
import { useDispatch } from 'react-redux'

// types
import type { IPFSUploaderTypeFile } from './IPFSUploader.controller'

// actions
import { showToaster } from 'app/App.components/Toaster/Toaster.actions'
// const
import { INFO } from 'app/App.components/Toaster/Toaster.constants'
// components
import Icon from '../Icon/Icon.view'
// styles
import {
  IpfsUploadedImageContainer,
  IPFSUploaderStyled,
  UploaderFileSelector,
  UploadIconContainer,
} from './IPFSUploader.style'

type IPFSUploaderViewProps = {
  title?: string
  typeFile: IPFSUploaderTypeFile
  listNumber?: number
  imageIpfsUrl: string
  setIpfsImageUrl: (imageUrl: string) => void
  imageOk: boolean
  disabled?: boolean
  isUploading: boolean
  inputFile: Ref<HTMLInputElement>
  handleUpload: (file: File) => void
  handleIconClick: () => void
  onBlur: () => void
  className?: string
}

const IMG_MAX_SIZE = 20

export const IPFSUploaderView = ({
  title,
  typeFile,
  listNumber,
  imageIpfsUrl,
  setIpfsImageUrl,
  isUploading,
  inputFile,
  disabled,
  handleUpload,
  handleIconClick,
  onBlur,
  className,
}: IPFSUploaderViewProps) => {
  const dispatch = useDispatch()

  const [uploadIsFailed, setUploadIsFailed] = useState(false)
  const [isDocument, setIsDocument] = useState(false)
  const [fileName, setFileName] = useState('')
  const isTypeFileImage = typeFile === 'image'
  const isUploaded = imageIpfsUrl && !isUploading

  const handleChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (!e.target.files?.length) return
  
      const file = e.target?.files?.[0]
      const fileSize = file?.size / 1024 / 1024 // in MiB
      const { name } = file
  
      if (fileSize <= IMG_MAX_SIZE) {
        setUploadIsFailed(false)
        handleUpload(e.target.files[0])
      } else {
        setUploadIsFailed(true)
        dispatch(showToaster(INFO, 'File is too big!', `Max size is ${IMG_MAX_SIZE}MB`))
      }
  
      // check file type
      if (file?.type.toLowerCase().includes('pdf')) {
        setIsDocument(true)
        setFileName(name)
      } else {
        setIsDocument(false)
      }
    }, [dispatch, handleUpload])

  const handleDelete = () => {
    setUploadIsFailed(false)
    setIsDocument(false)
    setFileName('')
    setIpfsImageUrl('')
  }

  return (
    <IPFSUploaderStyled className={className} id={'ipfsUploaderContainer'}>
      {title && (
        <label>
          {listNumber ? `${listNumber} - ` : null}
          {title}
        </label>
      )}
      <div style={{ opacity: disabled ? 0.4 : 1 }}>
        <UploaderFileSelector className={disabled ? 'disabled' : ''}>
          <div>
            <input
              id="uploader"
              type="file"
              disabled={disabled || isUploading}
              accept={'.jpeg, .png, .pdf'}
              // required
              ref={inputFile}
              onChange={handleChange}
              onBlur={onBlur}
            />
            <UploadIconContainer uploadIsFailed={uploadIsFailed} onClick={handleIconClick}>
              {imageIpfsUrl && !isUploading ? (
                <>
                  {isDocument ? (
                    <figure className="upload-figure">
                      <div className="icon-wrap">
                        <Icon className="upload-icon" id="upload" />
                      </div>
                      <figcaption>{fileName}</figcaption>
                      <small></small>
                    </figure>
                  ) : (
                    <IpfsUploadedImageContainer>
                      <img className="uploaded-image" src={imageIpfsUrl} alt="" />
                      <div className="pencil-wrap">
                        <Icon id="pencil-stroke" />
                      </div>
                    </IpfsUploadedImageContainer>
                  )}
                </>
              ) : (
                <figure className="upload-figure">
                  <div className="icon-wrap">
                    {isUploading ? (
                      <img className="loading-icon" src="/icons/loading-white.svg" alt="loading" />
                    ) : (
                      <Icon className="upload-icon" id="upload" />
                    )}
                  </div>
                  <figcaption>Upload {isTypeFileImage ? 'picture' : 'document'}</figcaption>
                  <small className="tip">{`Supports: PNG. JPG. PDF. Max size is ${IMG_MAX_SIZE}MB`}</small>
                </figure>
              )}
            </UploadIconContainer>
            {isUploaded ? (
              <div onClick={handleDelete}>
                <Icon className="delete-icon" id="delete" />
              </div>
            ) : null}
          </div>
        </UploaderFileSelector>
      </div>
    </IPFSUploaderStyled>
  )
}
