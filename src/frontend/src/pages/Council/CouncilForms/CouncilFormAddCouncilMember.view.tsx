import { AvatarStyle } from '../../../app/App.components/Avatar/Avatar.style'
import { TzAddress } from '../../../app/App.components/TzAddress/TzAddress.view'
import { Input } from '../../../app/App.components/Input/Input.controller'
import { Button } from '../../../app/App.components/Button/Button.controller'
import Icon from '../../../app/App.components/Icon/Icon.view'
import { IPFSUploader } from '../../../app/App.components/IPFSUploader/IPFSUploader.controller'

// style
import { CouncilFormStyled } from './CouncilForms.style'

export const CouncilFormAddCouncilMember = () => {
  const disabled = false

  return (
    <CouncilFormStyled>
      <a className="info-link" href="https://mavryk.finance/litepaper#mavryk-council" target="_blank" rel="noreferrer">
        <Icon id="question" />
      </a>
      <h1 className="form-h1">Add Council Member</h1>
      <p>Please enter valid function parameters for adding a council member</p>
      <div className="form-grid">
        <div>
          <label>Council Member Address</label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>

        <div>
          <label>Council Member Name</label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>

        <div>
          <label>Council Member Website URL</label>
          <Input type="text" value={''} onChange={() => null} onBlur={() => {}} />
        </div>
      </div>
      <IPFSUploader
        disabled={disabled}
        typeFile="image"
        imageIpfsUrl={''}
        className="form-ipfs"
        setIpfsImageUrl={(e: any) => {
          // setForm({ ...form, image: e })
          // setValidForm({ ...validForm, image: Boolean(e) })
          // setFormInputStatus({ ...formInputStatus, image: Boolean(e) ? 'success' : 'error' })
        }}
        title={'Upload Profile Pic'}
        //listNumber={6}
      />
      <div className="btn-group">
        <Button
          text="Add Council Member"
          className="plus-btn"
          kind={'actionPrimary'}
          icon="plus"
          onClick={() => null}
        />
      </div>
    </CouncilFormStyled>
  )
}
