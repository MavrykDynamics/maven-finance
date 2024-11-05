import { alice, susie, eve, trudy, oscar } from "../../scripts/sandbox/accounts";

export const mockSatelliteData = {

    "susie" : {
        name            : "Mavryk Dynamics",
        desc            : "The Mavryk Dynamics satellite belongs to one of the core teams contributing to Maven Finance. The team as Mavryk Dynamics are heavily focused on building the future of financial independence while ensuring a smooth and simple user experience.",
        image           : "ipfs://QmbnsXuzsofafMnQ3Qc2kypRGV4XfwxTrwskttknjCC6zF",
        website         : "https://https://mavrykdynamics.com//",
        satelliteFee    : 500,
        oraclePublicKey : susie.pk,
        oraclePeerId    : susie.peerId
    },

    "eve" : {
        name            : "Buzz Lightyear",
        desc            : "Buzz is a fabled part of our childhood. He was created by Disney and Pixar mainly voiced by Tim Allen. He is a Superhero toy action figure based on the in-universe media franchise Toy Story, consisting of a blockbuster feature film and animated series, a Space Ranger. While Buzz Lightyear's sole mission used to be defeating the evil Emperor Zurg, what he now cares about most is keeping Andy's toy family together. After he feature-film Lightyear starring Chris Evans, Buzz has decided to operate a satellite of the Maven Finance network and sign oracle price feeds to further grow and secure the future of financial independence.",
        image           : "ipfs://QmcbigzB5PVfawr1jhctTWDgGTmLBZFbHPNfosDfq9zckQ",
        website         : "https://toystory.disney.com/buzz-lightyear",
        satelliteFee    : 350,
        oraclePublicKey : eve.pk,
        oraclePeerId    : eve.peerId
    },

    "trudy" : {
        name            : "Captain Kirk",
        desc            : "James Tiberius \"Jim\" Kirk is a legendary Starfleet officer who lived during the 23rd century. His time in Starfleet, made Kirk arguably one of the most famous and sometimes infamous starship captains in Starfleet history. The highly decorated Kirk served as the commanding officer of the Constitution-class starships USS Enterprise and USS Enterprise-A, where he served Federation interests as an explorer, soldier, diplomat, and time traveler. He currently spends his time as a Maven Satellite and signs Oracle price feeds for the Maven Finance network.",
        image           : "ipfs://QmT5aHNdawngnruJ2QtKxGd38H642fYjV7xqZ7HX5CuwRn",
        website         : "https://intl.startrek.com/",
        satelliteFee    : 700,
        oraclePublicKey : trudy.pk,
        oraclePeerId    : trudy.peerId
    },

    "alice" : {
        name            : "Bender Bending Rodriguez",
        desc            : "Bender Bending Rodriguez, the rebellious robot with a heart of gold, has found a new passion in the decentralized finance (DeFi) ecosystem. With his sharp wit and cunning, Bender has become a maverick in the blockchain and crypto space, always on the lookout for the latest trends and opportunities.\n\nNow, Bender uses his unique skills to navigate the DeFi world, taking risks and reaping the rewards. With his sharp mind and quick reflexes, Bender is a force to be reckoned with in the crypto space.\n\nBender frequently shouts \"Bite my shiny metal node!\" but don't be startled, despite his rough exterior, Bender has a soft spot for his fellow robots and Mavens, he is fiercely loyal to the Maven Ecosystem.\n\nIn DeFi, Bender is a true original, pushing the boundaries and exploring new frontiers. With his wit, charm, and unyielding determination, Bender is a force to be reckoned with in the crypto world.",
        image           : "ipfs://QmQa5omWRpxHhsFV5qu9TUHorASbhXEvPEm1md5g5J1CN1",
        website         : "https://futurama.fandom.com/wiki/Bender_Bending_Rodr%C3%ADguez",
        satelliteFee    : 810,
        oraclePublicKey : alice.pk,
        oraclePeerId    : alice.peerId
    },

    "oscar" : {
        name            : "R2-D2",
        desc            : "R2-D2 run's his Maven Satellite with unparalleled technical expertise and has a talent for solving complex problems. As an astromech droid, he's uniquely equipped to navigate the challenging terrain of DeFi and identify new opportunities for growth. R2-D2 is a natural leader with a deep sense of loyalty and compassion, always willing to lend a helping hand to his fellow maintainers and platform users. His adaptability and innovative spirit make him an invaluable asset to the DeFi ecosystem, and he's thrilled to be contributing to the future of finance through his work on the platform. In short, R2-D2 is a DeFi pioneer, leading the charge towards a more decentralized and equitable financial future.",
        image           : "ipfs://QmXxsjcko74KDHNqscANwzjihC6xPVpHTciUGZL5147aKi",
        website         : "https://starwars.fandom.com/wiki/R2-D2",
        satelliteFee    : 320,
        oraclePublicKey : oscar.pk,
        oraclePeerId    : oscar.peerId
    }

}
