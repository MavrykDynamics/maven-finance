// Governance Contract
// Things to clarify: 
//   1. Incentive formula for voting on governance decisions - 10,000 vMVK (only if proposal is successful)
//          - distributed proportionally to satellites ? 
//          - from hackmd: based on the time the delegate's stake is locked 
//                         | weighted based on the stake and time duration of the lock

        - 10,000 vMVK should be adjustable - to be decided by governance vote
        - incentives - to be minted / from treasury after all the tokens have been minted 
        - weightage (amount staked, time duration) to be decided  

//   2. Quorum - should this be included

        - calculate based on current percentage of vMVK holders / not moving average like Tezos

//   3. Assume multiple proposals ongoing at the same time? 
//         When a proposal is proposed, the delegate's stake becomes locked
//         - can the delegate choose the amount to stake or is his entire amount staked (converted to sMVK)

        - require minimum amount e.g. 0.03% (to be decided and adjustable) of total vMVK supply 

//   4. Execution period: execution of a proposal is timelocked 
//        - does proposal execution mean off-chain activities that have to be done within the time length (e.g. 2 days)
//           or a list of operations to update the contract

        - some proposals may be on-chain, some may be off-chain 
        - some execution may be on-chain, some may be off-chain 

//   5. Should there be a base fixed fee included for submitting a proposal?
//        - to confirm: no fee for rejected proposals? all to be returned minus potential gas fees
//   6. Where will the proposal writeup be stored at?
//        - following BaseDAO - using the post id of Tezos Agora  
//   7. Penalty fee - from Litepaper: However, if the Satellite behaves maliciously then a portion of those vMVK 
//                     might be confiscated by the system
//         - what is the calculation of penalty fee portion
//         - what will determine malicious behaviour
//         - who/what will execute penalty - council / automatic / approval required  
//   8. What would determine the voting period?
//         - for quick changes (e.g. parameter changes) vs longer/complex changes
//         - who/what decides the voting period - proposer?
//            - option: fast (3 hours) vs slow (2 days)  - fixed

// Considerations
//   - set max proposal size - large proposals can be costly to run in terms of gas fees
//   - separation of decisions to those that require tez and those that dont (e.g. config options)
