export enum ProposalStatus {
  EXECUTED = 'EXECUTED',
  DEFEATED = 'DEFEATED',
  ONGOING = 'ONGOING',
  DISCOVERY = 'DISCOVERY',
}
export interface ProposalData {
  id: number
  title: string
  proposer: string
  votedMVK: number
  details: string
  description: string
  invoiceHash: string
  invoiceTable: string
  version?: string
  status?: ProposalStatus
}

export const MOCK_ONGOING_PROPOSAL_LIST = new Map<string, ProposalData>([
  [
    '0',
    {
      id: 5268202,
      title: 'Grant Program V4',
      version: '1.3',
      status: ProposalStatus.ONGOING,
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E8876N12G741',
      votedMVK: 12324,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
])
export const MOCK_PROPOSAL_LIST = new Map<string, ProposalData>([
  [
    '0',
    {
      id: 0,
      title: 'Grant Program V5',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 12324,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '1',
    {
      id: 1,
      title: 'DeFi Education Fund',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 8293,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '2',
    {
      id: 2,
      title: 'Retroactive Proxy Contract',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 3293,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '3',
    {
      id: 3,
      title: 'Grant Program',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 832,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '4',
    {
      id: 4,
      title: 'Lorem Ipsum',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 60,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '5',
    {
      id: 5,
      title: 'Lorem Ipsum',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 80,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '6',
    {
      id: 6,
      title: 'Lorem Ipsum',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 43,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '7',
    {
      id: 7,
      title: 'Lorem Ipsum',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 67,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '8',
    {
      id: 8,
      title: 'Lorem Ipsum',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 694,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '9',
    {
      id: 9,
      title: 'Lorem Ipsum',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 421,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
])

export const MOCK_PAST_PROPOSAL_LIST = new Map<string, ProposalData>([
  [
    '0',
    {
      id: 5066393,
      version: '1.2',
      status: ProposalStatus.EXECUTED,
      title: 'Grant Program V3',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 12324,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '1',
    {
      id: 8856085,
      version: '1.1',
      status: ProposalStatus.DEFEATED,
      title: "Shalom Le'Yisroel",
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 8293,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '2',
    {
      id: 2360559,
      version: '0.6',
      status: ProposalStatus.EXECUTED,
      title: 'Retroactive Proxy Contract',
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 3293,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        'Mavryk Governance is at a major crossroads, struggling with how to deploy larger tranches of capital from its treasury with effective oversight.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '3',
    {
      id: 6387127,
      title: 'Grant Program',
      version: '1.1.7',
      status: ProposalStatus.EXECUTED,
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 832,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '4',
    {
      id: 9037195,
      title: 'Lorem Ipsum',
      version: '0.1',
      status: ProposalStatus.DEFEATED,
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 60,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '5',
    {
      id: 9326707,
      title: 'Lorem Ipsum',
      version: '0.4',
      status: ProposalStatus.DEFEATED,
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 80,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
  [
    '6',
    {
      id: 9390352,
      title: 'Lorem Ipsum',
      version: '1.5',
      status: ProposalStatus.EXECUTED,
      proposer: '0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44',
      votedMVK: 43,
      details: 'MVK.transfer(0xeCE57FDF9499f343E8d93Cb5c6C938E88769BC44, \n822368000000000000000000)',
      description:
        'Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature from 45 BC, making it over 2000 years old.',
      invoiceHash: 'https://ipfs.infura.io/ipfs/bafybeigce6thkldylhsj6iqhfyl6a3mjef6cv2atf25e2nnuof6qdhtfl4',
      invoiceTable:
        '{"myrows":[{"Satellite Name":"Satellite A","Satellite Address":"tz1VSUr8wwNhLAzempoch5d6hLRiTh8Cjcjb","Purpose":"Code Audit","Amount":"1000","Token":"MVK"},{"Satellite Name":"Satellite B","Satellite Address":"tz1aSkwEot3L2kmUvcoxzjMomb9mvBNuzFK6","Purpose":"Implement Code","Amount":"500","Token":"XTZ"}]}',
    },
  ],
])
