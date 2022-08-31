import type { ModalDataType } from './EmergencyGovernanceActiveModal/EmergencyGovernanceActive.controller'

export const MODAL_DATA = new Map<string, ModalDataType>([
  [
    'emergency-governance',
    {
      title: 'Emergency Governance Active',
      subTitle: 'An emergency governance vote has been triggered',
      content:
        'The emergency governance vote is a tool designed for the community to prevent an nefarious action being taken' +
        "against Mavryk through utilizing a core flaw found in Mavryk's smark contracts. If the vote passes then the break glass protocol is triggered, " +
        "during that time, the functions affected by the flaw are paused hence all entrypoints on the site that interact with Mavryk's smart contracts will be disabled",
    },
  ],
])
