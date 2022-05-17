import * as PropTypes from 'prop-types'
import * as React from 'react'
import { Ref } from 'react'

// components
import Icon from '../Icon/Icon.view'
import { IPFSUploaderStatusType } from './IPFSUploader.controller'
// prettier-ignore
import { IpfsUploadedImageContainer, IPFSUploaderStyled, UploaderFileSelector, UploadIconContainer } from './IPFSUploader.style'

type IPFSUploaderViewProps = {
  title?: string
  listNumber?: number
  imageIpfsUrl?: string
  imageOk: boolean
  isUploading: boolean
  isUploaded: boolean
  inputFile: Ref<any>
  handleUpload: (e: any) => void
  handleIconClick: () => void
  onBlur: () => void
  ipfsUploaderStatus?: IPFSUploaderStatusType
  errorMessage?: string
}

export const IPFSUploaderView = ({
  title,
  listNumber,
  imageIpfsUrl,
  isUploading,
  isUploaded,
  inputFile,
  handleUpload,
  handleIconClick,
  onBlur,
  ipfsUploaderStatus,
  errorMessage,
}: IPFSUploaderViewProps) => {
  let status = ipfsUploaderStatus !== undefined ? ipfsUploaderStatus : 'none'
  console.log('%c ||||| isUploaded', 'color:yellowgreen', isUploaded)
  console.log('%c ||||| imageIpfsUrl', 'color:yellowgreen', imageIpfsUrl)
  return (
    <IPFSUploaderStyled id={'ipfsUploaderContainer'}>
      {title && listNumber && (
        <label>
          {listNumber}- {title}
        </label>
      )}
      <UploaderFileSelector>
        {isUploading ? (
          <img className="loading-icon" src="/icons/loading-white.svg" alt="loading" />
        ) : (
          <div>
            <input
              id="uploader"
              type="file"
              accept="image/*"
              ref={inputFile}
              onChange={(e: any) => {
                e.target && e.target.files && e.target.files[0] && handleUpload(e.target.files[0])
              }}
              onBlur={onBlur}
            />
            <UploadIconContainer onClick={handleIconClick}>
              {imageIpfsUrl ? (
                <IpfsUploadedImageContainer>
                  <img className="loading-icon" src="/icons/loading-white.svg" alt="loading" />
                  <img className="uploaded-image" src={imageIpfsUrl} alt="" />
                  <div className="pencil-wrap">
                    <Icon id="pencil-stroke" />
                  </div>
                </IpfsUploadedImageContainer>
              ) : (
                <>
                  <Icon className="upload-icon" id="upload" />
                  <div>Upload picture</div>
                </>
              )}
            </UploadIconContainer>
          </div>
        )}
      </UploaderFileSelector>
    </IPFSUploaderStyled>
  )
}

IPFSUploaderView.propTypes = {
  icon: PropTypes.string,
  title: PropTypes.string,
  listNumber: PropTypes.number,
  imageIpfsUrl: PropTypes.string,
  isUploading: PropTypes.bool,
  isUploaded: PropTypes.bool,
  inputFile: PropTypes.any,
  handleUpload: PropTypes.func.isRequired,
  handleIconClick: PropTypes.func.isRequired,
  onBlur: PropTypes.func.isRequired,
  ipfsUploaderStatus: PropTypes.string,
  errorMessage: PropTypes.string,
}

IPFSUploaderView.defaultProps = {
  icon: undefined,
  title: undefined,
  listNumber: undefined,
  imageIpfsUrl: undefined,
  isUploading: false,
  isUploaded: false,
  handleUpload: undefined,
  handleIconClick: undefined,
}
