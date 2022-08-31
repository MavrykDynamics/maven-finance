import React, { Ref } from 'react'
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
  isUploading,
  inputFile,
  disabled,
  handleUpload,
  handleIconClick,
  onBlur,
  className,
}: IPFSUploaderViewProps) => {
  const dispatch = useDispatch()
  const isTypeFileImage = typeFile === 'image'

  const isUploadedDocument = imageIpfsUrl && !isTypeFileImage && !isUploading

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return

    const fileSize = e.target?.files?.[0]?.size / 1024 / 1024 // in MiB
    if (fileSize <= IMG_MAX_SIZE) {
      handleUpload(e.target.files[0])
    } else {
      dispatch(showToaster(INFO, 'File is too big!', `Max size is ${IMG_MAX_SIZE}MB`))
    }
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
              accept={isTypeFileImage ? 'image/*' : '*'}
              required
              ref={inputFile}
              onChange={handleChange}
              onBlur={onBlur}
            />
            <UploadIconContainer onClick={handleIconClick}>
              {imageIpfsUrl && !isUploading ? (
                <>
                  {isTypeFileImage ? (
                    <IpfsUploadedImageContainer>
                      <img className="uploaded-image" src={imageIpfsUrl} alt="" />
                      <div className="pencil-wrap">
                        <Icon id="pencil-stroke" />
                      </div>
                    </IpfsUploadedImageContainer>
                  ) : (
                    <figure className="upload-figure">
                      <div className="icon-wrap">
                        <Icon className="upload-icon" id="upload" />
                      </div>
                      <figcaption>Document uploaded</figcaption>
                      <small></small>
                    </figure>
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
                  <small>{`max size is ${IMG_MAX_SIZE}MB`}</small>
                </figure>
              )}
            </UploadIconContainer>
            {isUploadedDocument ? <Icon className="delete-icon" id="delete" /> : null}
          </div>
        </UploaderFileSelector>
      </div>
    </IPFSUploaderStyled>
  )
}
