#include "stakingTypes.ligo"

function getReward(const parameters : getRewardParam) : nat is
block {
    const k : nat = 10_000_000_000n;
    var period : nat := abs(parameters.stop - parameters.start);
    var timeRatio : nat := k * period;
    timeRatio := abs(timeRatio / 31536000);
    var reward : nat := timeRatio * parameters.rate * parameters.amount;
    reward := reward / (k * 100n);
} with reward

function createStakingOption(const parameters : createStakingOptionParam; var s : storage) : return is 
block {
    if Tezos.sender =/= s.admin then block {
        if Tezos.sender =/= s.votingContract then failwith("Access denied")
        else skip;
    }
    else skip;
    if Map.mem(parameters.id,s.stakingOptions) then failwith("Pack already exists")
    else skip;
    s.stakingOptions[parameters.id] := parameters.pack
} with (noOperations, s)

function get_fa12_token_contract(
  const token_address : address) : contract(transfer_type_fa12) is
  case (Tezos.get_entrypoint_opt(
      "%transfer",
      token_address) : option(contract(transfer_type_fa12))) of
    Some(contr) -> contr
  | None -> (failwith("Dex/not-token") : contract(transfer_type_fa12))
  end;

(* Helper function to prepare the token transfer *)
function wrap_fa12_transfer_trx(
  const owner : address;
  const receiver : address;
  const value : nat) : transfer_type_fa12 is
  TransferTypeFA12(owner, (receiver, value))

(* Helper function to transfer fa1.2 tokens *)
function transfer_fa12(
  const sender_ : address;
  const receiver : address;
  const amount_ : nat;
  const contract_address : address) : operation is
  Tezos.transaction(
    wrap_fa12_transfer_trx(
      sender_,
      receiver,
      amount_),
    0mutez,
    get_fa12_token_contract(contract_address)
  );
  
function stakingLock(const parameter : stakeLockParam; var s : storage) : return is 
block {
    if parameter.pack = 0n then failwith("Can't stake lock with pack 0")
    else skip;
    var spack : stakingOption := case s.stakingOptions[parameter.pack] of
        Some(_staking) -> _staking
        | None -> failwith("Pack doesn't exists")
    end;
    const newStake  : stakeLock = record [
                time = Tezos.now;
                amount = parameter.am;
                rate = spack.rate;
                period = spack.stakingPeriod
            ];
    if  spack.minStake > parameter.am then failwith("Amount too low")
    else skip;
    if spack.maxStake < parameter.am then failwith("Amount too high")
    else skip;
    (* Nested maps comme en smartpy il faut initialiser chaque sous map exemple : 
    map(nat, map(nat,nat)) m[1n][1n] := 1n ne fonctionne pas il faut faire m[1n] := map [1n -> 1n] *)
    var user : map(nat, map(nat, stakeLock)) := case s.userStakeLockPack[Tezos.sender] of
        Some(_user) -> _user
        | None -> map []
    end;  
    var pack : map(nat, stakeLock) := case user[parameter.pack] of
        Some(_pack) -> _pack
        | None -> map []
    end;

    pack[size(pack)] := newStake;
    user[parameter.pack] := pack;
    s.userStakeLockPack[Tezos.sender] := user;
    const tx : operation = transfer_fa12(
        Tezos.sender,
        s.reserve,
        parameter.am,
        s.contract);
    const operations : list(operation) = list [tx]
} with (operations, s)

function setMaxVal(const parameters : nat; var s :storage) : return is 
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.maxValuesNb := parameters;
} with(noOperations, s)

function setContractA(const parameters : address; var s : storage) : return is
block {
    if Tezos.sender =/= s.admin then failwith("Access denied")
    else skip;
    s.contract := parameters;
} with (noOperations, s)

function setReserve(const parameters : address; var s : storage) : return is
block {
    s.reserve := parameters;
} with (noOperations, s)

function stakingFlex(const parameters : nat; var s : storage) : return is 
block {
    var spack : stakingOption := case s.stakingOptions[0n] of
        Some(_staking) -> _staking
        | None -> failwith("Pack doesn't exists")
    end;

    if parameters > spack.maxStake then failwith("Amount too high")
    else skip;
    if parameters < spack.minStake then failwith("Amount too low")
    else skip;

    const rate : nat = spack.rate;
    const temp : map(address, stakeFlex) = case s.userStakeFlexPack[s.stakeFlexLength] of
        Some(_val) -> _val
        | None -> map []
    end;

    if size(temp) >= s.maxValuesNb then s.stakeFlexLength := s.stakeFlexLength + 1n
    else skip;

    const userId : nat = case s.addressId[Tezos.sender] of
        Some(_val) -> _val
        | None -> s.stakeFlexLength
    end;

    s.addressId[Tezos.sender] := userId;

    var container : map(address, stakeFlex) := case s.userStakeFlexPack[userId] of 
        Some(_val) -> _val
        | None -> map []
    end;

    var user : stakeFlex := case container[Tezos.sender] of 
        Some(_val) -> record [
            reward = getReward(record [
                start = _val.time;
                stop = Tezos.now;
                amount = _val.amount;
                rate = rate
            ]);
            amount = _val.amount + parameters;
            time = Tezos.now;
            rate = rate
        ]
        | None -> record [
                time = Tezos.now;
                amount = parameters;
                reward = 0n;
                rate = rate
            ]
    end;
    
    container[Tezos.sender] := user;
    s.userStakeFlexPack[userId] := container;

    const cont : map(address, stakeFlex) = case s.userStakeFlexPack[s.stakeFlexLength] of
        Some(_container) -> _container
        | None -> map []
    end;

    if size(cont) = s.maxValuesNb then s.stakeFlexLength := s.stakeFlexLength + 1n
    else skip;

    const tx = transfer_fa12(
        Tezos.sender,
        s.reserve,
        parameters,
        s.contract);
    const operations : list(operation) = list [tx]
} with (operations, s)


function unstakeLock(const parameters: unstakeLockParam; var s : storage) : return is
block {
    var user : map(nat, map(nat, stakeLock)) := case s.userStakeLockPack[Tezos.sender] of
        Some(_user) -> _user
        | None -> failwith("User never staked")
    end;
    var pack : map(nat, stakeLock) := case user[parameters.pack] of
        Some(_pack) -> _pack
        | None -> failwith("User never used this pack")
    end;
    const staking : stakeLock = case pack[parameters.index] of
        Some(_staking) -> _staking
        | None -> failwith("Invalid staking index")
    end;
    var amt : nat := staking.amount;
    if staking.time + staking.period = Tezos.now then
    begin
        amt := amt + getReward(record [ 
            start = staking.time;
            stop = staking.time + staking.period;
            rate = staking.rate;
            amount = staking.amount
        ])
    end;
    else
    begin
        skip;
    end;
    const tx = transfer_fa12(
        s.reserve,
        Tezos.sender,
        amt,
        s.contract);
    const operations : list(operation) = list [tx];
    remove parameters.index from map pack;
    user[parameters.pack]:= pack;
    s.userStakeLockPack[Tezos.sender]:= user;
} with (operations, s)

function unstakeFlex(const parameters : nat; var s : storage) : return is
block {
    const contId : nat = case s.addressId[Tezos.sender] of
        Some(_id) -> _id
        | None -> failwith("User not found in address id")
    end;
    var container : map(address, stakeFlex) := case s.userStakeFlexPack[contId] of
        Some(_container) -> _container
        | None -> failwith("Container not found")
    end;
    var staking : stakeFlex := case container[Tezos.sender] of
        Some(_staking) -> _staking
        | None -> failwith("User not found in container")
    end;
    if staking.amount < parameters then failwith("Can't withdraw more than staked")
    else skip; 
    staking.reward := getReward(record [
        start = staking.time;
        stop = Tezos.now;
        amount = staking.amount;
        rate = staking.rate
    ]);
    staking.amount := abs(staking.amount - parameters);
    const spack : stakingOption = case s.stakingOptions[0n] of
        Some(_staking) -> _staking
        | None -> failwith("Pack doesn't exists")
    end;
    staking.rate := spack.rate;
    staking.time := Tezos.now;
    container[Tezos.sender]:=staking;
    s.userStakeFlexPack[contId]:= container;
    const tx = transfer_fa12(
        s.reserve,
        Tezos.sender,
        parameters,
        s.contract);
    const operations : list(operation) = list [tx]
} with (operations, s)

function claimRewardFlex(const _parameters : unit; var s : storage) : return is 
block {
    const contId : nat = case s.addressId[Tezos.sender] of
        Some(_id) -> _id
        | None -> failwith("User not found in address id")
    end;
    var container : map(address, stakeFlex) := case s.userStakeFlexPack[contId] of
        Some(_contain) -> _contain
        | None -> failwith("Container not found")
    end;
    var staking : stakeFlex := case container[Tezos.sender] of
        Some(_staking) -> _staking
        | None -> failwith("User not found in container")
    end;
    staking.reward := staking.reward + getReward(record [
        start = staking.time;
        stop = Tezos.now;
        amount = staking.amount;
        rate = staking.rate
    ]);
    
    
    if contId < s.stakeFlexLength then
        block {
            var lastContainer : map(address, stakeFlex) := case s.userStakeFlexPack[s.stakeFlexLength] of
                Some(_cont) -> _cont
                | None -> case s.userStakeFlexPack[abs(s.stakeFlexLength -1n)] of 
                            Some(_val) -> _val
                            | None -> failwith("Please reset the stakeFlexLength value")
                        end
            end;
            var _swap : address := Tezos.self_address;
            for key -> _value in map lastContainer 
            begin
                _swap := key;
            end;
            container[_swap] := case lastContainer[_swap] of 
                Some(_val) -> _val
                | None -> staking
            end;
            remove _swap from map lastContainer;
            s.userStakeFlexPack[s.stakeFlexLength] := lastContainer;
            s.userStakeFlexPack[contId] := container;
            if size(lastContainer) = 0n then
            begin
                remove s.stakeFlexLength from map s.userStakeFlexPack;
                s.stakeFlexLength := abs(s.stakeFlexLength - 1n);
            end
            else skip;

        }
    else skip;
    const tx = transfer_fa12(
        s.reserve,
        Tezos.sender,
        staking.reward,
        s.contract);
    const operations : list(operation) = list [tx];
    staking.reward := 0n;
    container[Tezos.sender] := staking;
    if staking.amount = 0n then 
    block {
        remove Tezos.sender from map container;
        remove Tezos.sender from map s.addressId;
    }
    else skip;
    s.userStakeFlexPack[contId] := container
} with (operations, s)
