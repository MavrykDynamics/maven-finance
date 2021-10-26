import { Button } from 'app/App.components/Button/Button.controller'
import { AdminStyled } from './Admin.style'

type AdminViewProps = {
  mintCallBack: () => Promise<any>
  setTransactionPending: (b: boolean) => void
  connectedUser: string
  transactionPending: boolean
}

export const AdminView = ({
  mintCallBack,
  connectedUser,
  setTransactionPending,
  transactionPending,
}: AdminViewProps) => {
  return (
    <AdminStyled>
      <Button text="Mint examples" onClick={() => mintCallBack()} />
    </AdminStyled>
  )
}
