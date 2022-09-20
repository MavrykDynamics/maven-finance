import React, { FC } from 'react'

// components
import { Button } from 'app/App.components/Button/Button.controller'

// styles
import { PendingSignatureCardStyled } from './PendingSignatureCard.style'

// helpers
import { ACTION_PRIMARY } from '../../../app/App.components/Button/Button.constants'
import { getShortTzAddress } from '../../../utils/tzAdress'

type Props = {
  title: string;
  addressName: string;
  address: string;
  signed: string;
  onClick: () => void;
}

export const PendingSignatureCard: FC<Props> = ({ title, addressName, address, signed, onClick }) => {
  return (
    <PendingSignatureCardStyled>
      <h2>{title}</h2>

      <div className='content'>
        <div>
          <div className='content-name'>{addressName}</div>
          <div className='content-value'>{getShortTzAddress(address)}</div>
        </div> 

        <div>
          <div className='content-name'>Signed</div> 
          <div className='content-value'>{signed}</div>  
        </div>
      </div>

      <Button
        className="stroke-03"
        text="Sign"
        kind={ACTION_PRIMARY}
        icon={'sign'}
        onClick={onClick}
      />
    </PendingSignatureCardStyled>
  )
}
