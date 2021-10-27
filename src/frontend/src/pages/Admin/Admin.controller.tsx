// prettier-ignore
import { useAccountPkh, useOnBlock, useReady, useTezos, useWallet } from "dapp/dapp";
import { ADMIN, MVK_TOKEN_ADDRESS } from 'dapp/defaults'
import * as React from 'react'
import { useEffect, useState } from 'react'
import { Message, Page } from 'styles'

import { AdminView } from './Admin.view'

type AdminProp = {
  setTransactionPending: (b: boolean) => void
  transactionPending: boolean
}

export const Admin = ({ setTransactionPending, transactionPending }: AdminProp) => {
  const wallet = useWallet()
  const ready = useReady()
  const tezos = useTezos()
  const accountPkh = useAccountPkh()
  const [contract, setContract] = useState(undefined)
  const [adminAdress, setAdminAdress] = useState(undefined)

  const loadStorage = React.useCallback(async () => {
    if (contract) {
      const storage = await (contract as any).storage()
      setAdminAdress(storage.market.admin)
    }
  }, [contract])

  useEffect(() => {
    loadStorage()
  }, [loadStorage])

  useEffect(() => {
    ;(async () => {
      if (tezos) {
        const ctr = await (tezos as any).wallet.at(MVK_TOKEN_ADDRESS)
        setContract(ctr)
      }
    })()
  }, [tezos, transactionPending])

  useOnBlock(tezos, loadStorage)

  const mint = React.useCallback(async () => {
    const ctr = await (tezos as any).wallet.at(MVK_TOKEN_ADDRESS)
    // prettier-ignore
    const batch = await (tezos as any).wallet
      .batch()
      .withContractCall((ctr as any).methods.mint('horse', '2021-09-10t00:00:00Z', 'https://mavryk.io/examples/horse1.png', -1, ADMIN, ADMIN, 340, Math.floor(Math.random() * 1000000), 130, 0, 0))
      .withContractCall((ctr as any).methods.mint('horse', '2021-09-10t00:00:00Z', 'https://mavryk.io/examples/horse2.png', -1, ADMIN, ADMIN, 340, Math.floor(Math.random() * 1000000), 130, 1, 0))
      .withContractCall((ctr as any).methods.mint('horse', '2021-09-10t00:00:00Z', 'https://mavryk.io/examples/horse4.png', -1, ADMIN, ADMIN, 340, Math.floor(Math.random() * 1000000), 130, 2, 0))
      
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage1.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 0, 0))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage2.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 1, 0))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage3.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 2, 0))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage4.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 0, 1))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage5.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 3, 1))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage6.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 2, 1))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage7.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 0, 2))
      .withContractCall((ctr as any).methods.mint('rage', '2021-09-25t10:10:10Z', 'https://mavryk.io/examples/rage8.png', -1, ADMIN, ADMIN, 100, Math.floor(Math.random() * 1000000), 100, 1, 2))
      
      .withContractCall((ctr as any).methods.mint('comic', '2021-09-15t00:00:00Z', 'https://mavryk.io/examples/comic1.png', -1, ADMIN, ADMIN, 270, Math.floor(Math.random() * 1000000), 192, 0, 0))
      .withContractCall((ctr as any).methods.mint('comic', '2021-09-15t00:00:00Z', 'https://mavryk.io/examples/comic2.png', -1, ADMIN, ADMIN, 270, Math.floor(Math.random() * 1000000), 192, 0, 1))
      .withContractCall((ctr as any).methods.mint('comic', '2021-09-15t00:00:00Z', 'https://mavryk.io/examples/comic3.png', -1, ADMIN, ADMIN, 270, Math.floor(Math.random() * 1000000), 192, 1, 0))
      .withContractCall((ctr as any).methods.mint('comic', '2021-09-15t00:00:00Z', 'https://mavryk.io/examples/comic4.png', -1, ADMIN, ADMIN, 270, Math.floor(Math.random() * 1000000), 192, 1, 1))
      .withContractCall((ctr as any).methods.mint('comic', '2021-09-15t00:00:00Z', 'https://mavryk.io/examples/comic5.png', -1, ADMIN, ADMIN, 270, Math.floor(Math.random() * 1000000), 192, 2, 1))
      .withContractCall((ctr as any).methods.mint('comic', '2021-09-15t00:00:00Z', 'https://mavryk.io/examples/comic6.png', -1, ADMIN, ADMIN, 270, Math.floor(Math.random() * 1000000), 192, 2, 0))

      .withContractCall((ctr as any).methods.mint('miami', '2021-09-15t00:00:00Z', 'https://ipfs.infura.io/ipfs/QmQVi7a2cmE2da4e2YTGXN5FiLCQzKC7jAu2MH8chy34d6', 0, ADMIN, ADMIN, 562, Math.floor(Math.random() * 1000000), 1000, -1, -1))
      .withContractCall((ctr as any).methods.mint('miami', '2021-09-15t00:00:00Z', 'https://ipfs.infura.io/ipfs/QmQa8dhMaTpZwoJbtUExAAHDySfxMYaP4ph5abj3jUidpR', 1, ADMIN, ADMIN, 562, Math.floor(Math.random() * 1000000), 1000, -1, -1))
      .withContractCall((ctr as any).methods.mint('miami', '2021-09-15t00:00:00Z', 'https://ipfs.infura.io/ipfs/QmX4z3m5AuMM1C6CfU1fXu3cRsygEe7bUUUpGBAgexBKY6', 2, ADMIN, ADMIN, 562, Math.floor(Math.random() * 1000000), 1000, -1, -1))
      .withContractCall((ctr as any).methods.mint('miami', '2021-09-15t00:00:00Z', 'https://ipfs.infura.io/ipfs/QmPV9ybZndnywsrgFWq8qwCj4UbVYMVQko1oCxvijrNBbF', 3, ADMIN, ADMIN, 562, Math.floor(Math.random() * 1000000), 1000, -1, -1))
      .withContractCall((ctr as any).methods.mint('miami', '2021-09-15t00:00:00Z', 'https://ipfs.infura.io/ipfs/QmRXGq59ysX9tbr7JeQcUAo9CR1SHS8Y3Yatmo5EGSs2yY', 4, ADMIN, ADMIN, 562, Math.floor(Math.random() * 1000000), 1000, -1, -1))

    const batchOp = await batch.send()
    console.log(batchOp)
  }, [contract])

  return (
    <Page>
      {wallet ? (
        <>
          {ready ? (
            <>
              {accountPkh === adminAdress ? (
                <AdminView
                  mintCallBack={mint}
                  connectedUser={accountPkh as unknown as string}
                  setTransactionPending={setTransactionPending}
                  transactionPending={transactionPending}
                />
              ) : (
                <Message>You are not the admin of this smart contract</Message>
              )}
            </>
          ) : (
            <Message>Please connect your wallet</Message>
          )}
        </>
      ) : (
        <Message>Please install the Temple Wallet Chrome Extension.</Message>
      )}
    </Page>
  )
}
