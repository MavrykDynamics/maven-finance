import { ProposalRecordType, ProposalStatus } from '../../utils/TypesAndInterfaces/Governance'

export const MOCK_ONGOING_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 0,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.ONGOING,
    },
  ],
])
export const MOCK_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 0,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '1',
    {
      id: 1,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '2',
    {
      id: 2,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '3',
    {
      id: 3,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '4',
    {
      id: 4,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      title: 'Lorem Ipsum',

      votedMVK: 60,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '5',
    {
      id: 5,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '6',
    {
      id: 6,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      title: 'Lorem Ipsum',

      votedMVK: 43,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '7',
    {
      id: 7,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      title: 'Lorem Ipsum',

      votedMVK: 67,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '8',
    {
      id: 8,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
  [
    '9',
    {
      id: 9,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.DISCOVERY,
    },
  ],
])

export const MOCK_PAST_PROPOSAL_LIST = new Map<string, ProposalRecordType>([
  [
    '0',
    {
      id: 5066393,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.EXECUTED,
    },
  ],
  [
    '1',
    {
      id: 8856085,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,

      status: ProposalStatus.EXECUTED,
    },
  ],
  [
    '2',
    {
      id: 2360559,

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      status: ProposalStatus.EXECUTED,
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

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,
    },
  ],
  [
    '3',
    {
      id: 6387127,
      title: 'Grant Program',

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      status: ProposalStatus.EXECUTED,

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,
    },
  ],
  [
    '4',
    {
      id: 9037195,
      title: 'Lorem Ipsum',

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      status: ProposalStatus.DEFEATED,

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,
    },
  ],
  [
    '5',
    {
      id: 9326707,
      title: 'Lorem Ipsum',

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      status: ProposalStatus.DEFEATED,

      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: false,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,
    },
  ],
  [
    '6',
    {
      id: 9390352,
      title: 'Lorem Ipsum',

      proposerAddress: 'tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6',
      proposalMetadata: {},

      status: ProposalStatus.EXECUTED,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old..',
      invoice: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',

      successReward: 1235,
      executed: true,
      locked: false,

      passVoteCount: 0,
      passVoteMvkTotal: 0,
      passVotersMap: {},

      upvoteCount: 14,
      upvoteMvkTotal: 4898123,
      abstainCount: 5,
      abstainMvkTotal: 50000,
      downvoteCount: 3,
      downvoteMvkTotal: 340998,
      voters: {},

      minQuorumMvkTotal: 5000000,
      minQuorumPercentage: 64.89,
      quorumCount: 0,
      quorumMvkTotal: 0,
      startDateTime: new Date(),

      currentCycleEndLevel: 626004,
      currentCycleStartLevel: 591444,
    },
  ],
])
