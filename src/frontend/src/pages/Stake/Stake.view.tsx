import { useState } from 'react'
import { useAlert } from 'react-alert'

import { StakeCallback } from './Stake.controller'
// prettier-ignore
import { StakeStyled } from "./Stake.style";

type StakeViewProps = {
  loading: boolean
  stakeCallback: (stakeProps: StakeCallback) => Promise<any>
  setTransactionPending: (b: boolean) => void
  connectedUser: string
  transactionPending: boolean
}

export const StakeView = ({
  loading,
  stakeCallback,
  connectedUser,
  setTransactionPending,
  transactionPending,
}: StakeViewProps) => {
  // Remove if unecessary
  return <StakeStyled></StakeStyled>
}
