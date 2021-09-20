import { Button } from 'app/App.components/Button/Button.controller'
import { AdminStyled } from './Admin.style'

type AdminViewProps = {
  mintCallBack: () => Promise<any>
  setMintTransactionPendingCallback: (b: boolean) => void
  connectedUser: string
  mintTransactionPending: boolean
}

export const AdminView = ({
  mintCallBack,
  connectedUser,
  setMintTransactionPendingCallback,
  mintTransactionPending,
}: AdminViewProps) => {
  return (
    <AdminStyled>
      <Button text="Create examples" onClick={() => mintCallBack()} />
    </AdminStyled>
  )
}
