import * as React from 'react'
import * as PropTypes from 'prop-types'
import { IPFSUploaderStatusType } from './IPFSUploader.controller'
import {
  UploaderFileSelector,
  UploadIcon,
  UploadIconContainer,
} from '../../../pages/BecomeSatellite/BecomeSatellite.style'
import { IpfsUploadedImageContainer, IPFSUploaderStyled } from './IPFSUploader.style'
import { Ref } from 'react'

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
  return (
    <IPFSUploaderStyled>
      {title && listNumber && (
        <p>
          {listNumber}- {title}
        </p>
      )}
      <UploaderFileSelector>
        {isUploading ? (
          <div>Uploading...</div>
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
              <UploadIcon>
                <use xlinkHref={`/icons/sprites.svg#upload`} />
              </UploadIcon>
              <div>Upload file</div>
            </UploadIconContainer>
          </div>
        )}
        {isUploaded && (
          <IpfsUploadedImageContainer>{imageIpfsUrl && <img src={imageIpfsUrl} alt="" />}</IpfsUploadedImageContainer>
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
