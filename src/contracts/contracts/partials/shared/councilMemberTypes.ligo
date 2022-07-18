// ------------------------------------------------------------------------------
// Council Types
// ------------------------------------------------------------------------------

type councilActionAddMemberType is [@layout:comb] record [
    memberAddress       : address;
    memberName          : string;
    memberWebsite       : string;
    memberImage         : string;
]

type councilActionChangeMemberType is [@layout:comb] record [
    oldCouncilMemberAddress           : address;
    newCouncilMemberAddress           : address;
    newCouncilMemberName              : string;
    newCouncilMemberWebsite           : string;
    newCouncilMemberImage             : string;
]

type councilMemberInfoType is [@layout:comb] record [
    name          : string;
    website       : string;
    image         : string;
]
type councilMembersType is map(address, councilMemberInfoType)
