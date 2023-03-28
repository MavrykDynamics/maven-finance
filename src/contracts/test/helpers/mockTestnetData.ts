import { bob, eve, mallory } from "../../scripts/sandbox/accounts";

export const mockSatelliteData = {

    "bob" : {
        name            : "Mavryk Dynamics",
        desc            : "The Mavryk Dynamics belongs to one of the core teams contributing to Mavryk Finance. The team as Mavryk Dynamics are heavily focused on building the future of financial independence while ensuring a smooth and simple user experience.",
        image           : "https://infura-ipfs.io/ipfs/QmaqwZAnSWj89kGomozvk8Ng2M5SrSzwibvFyRijWeRbjg",
        website         : "https://mavryk.finance/", 
        satelliteFee    : 500,
        oraclePublicKey : bob.pk,
        oraclePeerId    : bob.peerId
    },

    "eve" : {
        name            : "Buzz Lightyear",
        desc            : "Buzz is a fabled part of our childhood. He was created by Disney and Pixar mainly voiced by Tim Allen. He is a Superhero toy action figure based on the in-universe media franchise Toy Story, consisting of a blockbuster feature film and animated series, a Space Ranger. While Buzz Lightyear's sole mission used to be defeating the evil Emperor Zurg, what he now cares about most is keeping Andy's toy family together. After he feature-film Lightyear starring Chris Evans, Buzz has decided to operate a satellite of the Mavryk Finance network and sign oracle price feeds to further grow and secure the future of financial independence.", 
        image           : "https://infura-ipfs.io/ipfs/QmcbigzB5PVfawr1jhctTWDgGTmLBZFbHPNfosDfq9zckQ",
        website         : "https://toystory.disney.com/buzz-lightyear", 
        satelliteFee    : 350,
        oraclePublicKey : eve.pk,
        oraclePeerId    : eve.peerId
    },

    "mallory" : {
        name            : "Captain Kirk",
        desc            : "James Tiberius \"Jim\" Kirk is a legendary Starfleet officer who lived during the 23rd century. His time in Starfleet, made Kirk arguably one of the most famous and sometimes infamous starship captains in Starfleet history. The highly decorated Kirk served as the commanding officer of the Constitution-class starships USS Enterprise and USS Enterprise-A, where he served Federation interests as an explorer, soldier, diplomat, and time traveler. He currently spends his time as a Mavryk Satellite and signs Oracle price feeds for the Mavryk Finance network.",
        image           : "https://infura-ipfs.io/ipfs/QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn",
        website         : "https://intl.startrek.com/",
        satelliteFee    : 700,
        oraclePublicKey : mallory.pk,
        oraclePeerId    : mallory.peerId
    }

}