import { useAccountPkh, useConnect, useOnBlock, useReady, useTezos, useWallet } from 'dapp/dapp'
import { MVK_TOKEN_ADDRESS, NETWORK } from 'dapp/defaults'
import * as React from 'react'
import { useState, useEffect } from 'react'
import { useAlert } from 'react-alert'

import { MenuView } from './Menu.view'

export const Menu = () => {
  const wallet = useWallet()
  const ready = useReady()
  const tezos = useTezos()
  const accountPkh = useAccountPkh()
  const [contract, setContract] = useState(undefined)
  const [myMvkBalance, setMyMvkBalance] = useState(0)
  const [loading, setLoading] = useState(false)
  const connect = useConnect()
  const alert = useAlert()

  const loadStorage = React.useCallback(async () => {
    setLoading(true)
    if (contract) {
      const storage = await (contract as any).storage()
      const myLedgerEntry = await storage['ledger'].get(accountPkh)
      const myMvkBalanceMu = myLedgerEntry?.balance.toNumber()
      const myMvkBalance = myMvkBalanceMu > 0 ? myMvkBalanceMu / 1000000 : 0
      setMyMvkBalance(myMvkBalance)
      setLoading(false)
    }
    setLoading(false)
  }, [contract, accountPkh])

  useEffect(() => {
    loadStorage()
  }, [loadStorage, accountPkh])

  useEffect(() => {
    ;(async () => {
      if (tezos) {
        const ctr = await (tezos as any).wallet.at(MVK_TOKEN_ADDRESS)
        setContract(ctr)
      }
    })()
  }, [tezos])

  useOnBlock(tezos, loadStorage)

  const handleConnect = React.useCallback(async () => {
    try {
      await connect(NETWORK)
    } catch (err: any) {
      alert.show(err.message)
      console.error(err.message)
    }
  }, [alert, connect])

  const accountPkhPreview = React.useMemo(() => {
    if (!accountPkh) return undefined
    else {
      const accPkh = accountPkh as unknown as string
      const ln = accPkh.length
      return `${accPkh.slice(0, 7)}...${accPkh.slice(ln - 4, ln)}`
    }
  }, [accountPkh])

  const handleNewConnect = React.useCallback(() => {
    connect(NETWORK, { forcePermission: true })
  }, [connect])

  return (
    <MenuView
      loading={loading}
      myMvkBalance={myMvkBalance}
      accountPkhPreview={accountPkhPreview}
      handleNewConnect={handleNewConnect}
      wallet={wallet}
      ready={ready}
      handleConnect={handleConnect}
    />
  )
}
