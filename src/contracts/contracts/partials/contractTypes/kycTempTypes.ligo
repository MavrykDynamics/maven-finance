type addMemberActionType is [@layout:comb] record [
    memberAddress   : address;
    country         : string;
    region          : string;
    investorType    : string;
]

type updateMemberActionType is [@layout:comb] record [
    memberAddress   : address;
    country         : option(string);
    region          : option(string);
    investorType    : option(string);
    expireAt        : option(timestamp);
]

type setMemberActionType is 
    |   AddMember               of list(addMemberActionType)
    |   UpdateMember            of list(updateMemberActionType)
    |   RemoveMember            of list(address)