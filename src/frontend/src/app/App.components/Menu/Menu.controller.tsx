import { getHeadData } from './Menu.actions'
import { MenuView } from './Menu.view'
import { getMvkTokenStorage, getUserData } from 'pages/Doorman/Doorman.actions'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { State } from 'reducers'

export const Menu = ({
  isExpandedMenu,
  setisExpandedMenu,
}: {
  isExpandedMenu: boolean
  setisExpandedMenu: (value: boolean) => void
}) => {
  const dispatch = useDispatch()
  const loading = useSelector((state: State) => state.loading)
  const { wallet, ready, tezos, accountPkh } = useSelector((state: State) => state.wallet)

  useEffect(() => {
    if (accountPkh) {
      dispatch(getUserData(accountPkh))
      dispatch(getMvkTokenStorage(accountPkh))
    }
    GetHeadData()
  }, [dispatch, accountPkh])

  async function GetHeadData() {
    dispatch(getHeadData())
  }

  return (
    <MenuView
      loading={loading}
      accountPkh={accountPkh}
      ready={ready}
      isExpandedMenu={isExpandedMenu}
      setisExpandedMenu={setisExpandedMenu}
    />
  )
}
