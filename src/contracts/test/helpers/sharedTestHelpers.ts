export const packData = async (rpc, packedDataValue, packedDataType) => {

    const referenceDataPacked = await rpc.packData({
        data: packedDataValue,
        type: packedDataType
    }).catch(e => console.error('error:', e));
    
    let packedData;
    if (referenceDataPacked) {
        packedData = referenceDataPacked.packed
        console.log('packedData: ' + packedData);
        return packedData;
    } else {
        throw `Pack data failed`
    };
}