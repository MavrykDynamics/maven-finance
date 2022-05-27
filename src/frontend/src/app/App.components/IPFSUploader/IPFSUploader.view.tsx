import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Ref } from 'react'
import { useDispatch } from 'react-redux'

// types
import type { IPFSUploaderStatusType, IPFSUploaderTypeFile } from './IPFSUploader.controller'

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
  isUploaded: boolean
  inputFile: Ref<any>
  handleUpload: (e: any) => void
  handleIconClick: () => void
  onBlur: () => void
  ipfsUploaderStatus?: IPFSUploaderStatusType
  errorMessage?: string
}

const IMG_MAX_SIZE = 20

export const IPFSUploaderView = ({
  title,
  typeFile,
  listNumber,
  imageIpfsUrl,
  isUploading,
  isUploaded,
  inputFile,
  disabled,
  handleUpload,
  handleIconClick,
  onBlur,
  ipfsUploaderStatus,
  errorMessage,
}: IPFSUploaderViewProps) => {
  let status = ipfsUploaderStatus !== undefined ? ipfsUploaderStatus : 'none'
  const dispatch = useDispatch()

  const isTypeFileDocument = typeFile === 'document'
  const isTypeFileImage = typeFile === 'image'

  const handleChange = (e: any) => {
    const fileSize = e.target.files[0].size / 1024 / 1024 // in MiB
    if (fileSize <= IMG_MAX_SIZE) {
      handleUpload(e.target.files[0])
    } else {
      dispatch(showToaster(INFO, 'File is too big!', `Max size is ${IMG_MAX_SIZE}MB`))
    }
  }

  return (
    <IPFSUploaderStyled id={'ipfsUploaderContainer'}>
      {title && listNumber && (
        <label>
          {listNumber} - {title}
        </label>
      )}
      <div style={{ opacity: disabled ? 0.4 : 1 }}>
        <UploaderFileSelector>
          {isUploading ? (
            <img className="loading-icon" src="/icons/loading-white.svg" alt="loading" />
          ) : (
            <div>
              <input
                id="uploader"
                type="file"
                disabled={disabled}
                accept={isTypeFileImage ? 'image/*' : '*'}
                required
                ref={inputFile}
                onChange={handleChange}
                onBlur={onBlur}
              />
              <UploadIconContainer onClick={handleIconClick}>
                {imageIpfsUrl ? (
                  <IpfsUploadedImageContainer>
                    {isTypeFileImage ? (
                      <>
                        <img className="uploaded-image" src={imageIpfsUrl} alt="" />
                        <div className="pencil-wrap">
                          <Icon id="pencil-stroke" />
                        </div>
                      </>
                    ) : (
                      <Icon className="uploaded-document" id="pencil-stroke" />
                    )}
                  </IpfsUploadedImageContainer>
                ) : (
                  <figure className="upload-figure">
                    <Icon className="upload-icon" id="upload" />
                    <figcaption>Upload {isTypeFileImage ? 'picture' : 'document'}</figcaption>
                    <small>{`max size is ${IMG_MAX_SIZE}MB`}</small>
                  </figure>
                )}
              </UploadIconContainer>
            </div>
          )}
        </UploaderFileSelector>
      </div>
    </IPFSUploaderStyled>
  )
}
