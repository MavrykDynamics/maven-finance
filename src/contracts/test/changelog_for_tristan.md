1. Governance Contract
- remove minProposalRoundVotesRequired in Governance Config as it is no longer used
- remove ConfigMinProposalRoundVotesReq in governanceUpdateConfigActionType 
- rename ConfigProposalDatTitleMaxLength to ConfigDataTitleMaxLength
- added nextProposalId in governanceSatelliteSnapshot
- added satelliteLastSnapshotLedger bigmap

2. Aggregator Contract
- spelling error: rename "HeartBeatSeconds" to HeartbeatSeconds": Heartbeat is one word
- duplicate view: remove getContractName view as getName view already exists and is consistent with the getName view in the treasury and farm contracts

3. Break Glass Contract
- rename views to be consistent with Council Contract
- getActionOpt to getCouncilActionOpt, and getActionSignerOpt to getCouncilActionSignerOpt

Changes for Receiver Address in Requesting Tokens and Mint from Council to Governance Financial
4. Governance Financial Contract
- add receiverAddress in financialRequestRecordType

5. Council Contract
- add receiverAddress to councilActionRequestTokensType and councilActionRequestMintType

6. Lending Controller Contract and Lending Controller Mock Time Contract
- both: remove storage: whitelistContracts, generalContracts, and whitelistTokenContracts
- both: remove entrypoint updateWhitelistTokenContracts 
- both: remove tempMap

7. Treasury Contract
- Rename entrypoints: stakeMvk to stakeToken, unstakeMvk to unstakeToken, updateMvkOperators to updateTokenOperators
- Change param input: stakeToken to accept stakeTokenType (record of contract address and stakeAmount)
- Change param input: unstakeToken to accept unstakeTokenType (record of contract address and unstakeAmount)
- Change param input: updateTokenOperators to accept updateTokenOperatorsType (record of token contract address and updateOperators)
- Rename corresponding break glass entrypoints (e.g. stakeMvkIsPaused to stakeTokenIsPaused) 
- Rename corresponding treasuryTogglePauseEntrypointType (stakeMvk to stakeToken)
- Add updateTokenOperatorsIsPaused to break glass config and treasuryTogglePauseEntrypointType

8. Emergency Governance Contract
- remove dropEmergencyGovernance entrypoint
- remove dropped boolean in emergencyGovernanceRecord
- voteExpiryDays changed to durationInMinutes
