import { ProposalRecordType, ProposalStatus, ProposalVote } from '../../utils/TypesAndInterfaces/Governance'

export const MOCK_ONGOING_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 1,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Grant Program V2',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
])
export const MOCK_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 0,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      title: 'Grant Program V5',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '1',
    {
      id: 1,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'DeFi Education Fund',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,
      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '2',
    {
      id: 2,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Retroactive Proxy Contract',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '3',
    {
      id: 3,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Grant Program',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '4',
    {
      id: 4,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Lorem Ipsum',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '5',
    {
      id: 5,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Lorem Ipsum',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '6',
    {
      id: 6,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Lorem Ipsum',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '7',
    {
      id: 7,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Lorem Ipsum',

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '8',
    {
      id: 8,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Lorem Ipsum',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '9',
    {
      id: 9,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Lorem Ipsum',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
])

export const MOCK_PAST_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 5066393,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Grant Program V3',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '1',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '1',
    {
      id: 8856085,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: "Shalom Le'Yisroel",
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '2',
    {
      id: 2360559,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      status: 1,
      title: 'Retroactive Proxy Contract',

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '3',
    {
      id: 6387127,
      title: 'Grant Program',

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      status: 1,

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,
      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '4',
    {
      id: 9037195,
      title: 'Lorem Ipsum',

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      status: 1,

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '5',
    {
      id: 9326707,
      title: 'Lorem Ipsum',

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      status: 1,

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
  [
    '6',
    {
      id: 9390352,
      title: 'Lorem Ipsum',

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      status: 1,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteMvkTotal: 0,

      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,

      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
])

export const MOCK_EXEC_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 5066393,

      proposerId: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',

      title: 'Grant Program V3',
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteMvkTotal: 0,
      upvoteMvkTotal: 4898123,
      abstainMvkTotal: 50000,
      downvoteMvkTotal: 340998,
      votes: new Map<string, ProposalVote>(),

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: 1,

      minProposalRoundVoteRequirement: 0,
      minProposalRoundVotePercentage: 0,
      currentRoundProposal: '0',
      roundHighestVotedProposal: '0',
      cycle: 0,
      timelockProposal: '',
    },
  ],
])

