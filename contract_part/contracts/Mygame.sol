// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "hardhat/console.sol";
import "@openzeppelin/contracts/utils/Base64.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";

import "@openzeppelin/contracts/utils/Strings.sol";

contract Mygame is ERC721 {
    struct attributes {
        uint256 characterIndex;
        string name;
        uint256 HP;
        uint256 attackDamage;
        uint256 maxHP;
        string imageURI;
        uint256 lastUpdate;
    }

    struct BigBoss {
        string name;
        string imageURI;
        uint256 HP;
        uint256 maxHP;
        uint256 attackDamage;
    }

    BigBoss public bigBoss;

    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    attributes[] defaultCharacters;

    mapping(uint256 => attributes) public nftHolderAttributes;

    mapping(address => uint256) public nftHolders;

    event CharacterNFTMinted(
        address sender,
        uint256 tokenId,
        uint256 characterIndex
    );

    event AttackComplete(
        address sender,
        uint256 newBossHP,
        uint256 newPlayerHP
    );

    constructor(
        string[] memory characterNames,
        string[] memory characterImageURIs,
        uint256[] memory characterHp,
        uint256[] memory characterAttackDamage,
        string memory bossName,
        string memory bossImageURI,
        uint256 bossHP,
        uint256 bossAttackDamage
    ) ERC721("Heroes", "Hero") {
        bigBoss = BigBoss({
            name: bossName,
            imageURI: bossImageURI,
            HP: bossHP,
            maxHP: bossHP,
            attackDamage: bossAttackDamage
        });

        for (uint256 i = 0; i < characterNames.length; i += 1) {
            defaultCharacters.push(
                attributes({
                    characterIndex: i,
                    name: characterNames[i],
                    imageURI: characterImageURIs[i],
                    HP: characterHp[i],
                    maxHP: characterHp[i],
                    attackDamage: characterAttackDamage[i],
                    lastUpdate:(block.timestamp)*2
                })
            );
            attributes memory c = defaultCharacters[i];
            console.log(
                "Initialized %s w/ HP %s, img %s",
                c.name,
                c.HP,
                c.imageURI
            );
        }

        _tokenIds.increment();
    }

    function tokenURI(uint256 _tokenId)
        public
        view
        override
        returns (string memory)
    {
        attributes memory charAttributes = nftHolderAttributes[_tokenId];
        string memory strHP = Strings.toString(charAttributes.HP);
        string memory strMaxHP = Strings.toString(charAttributes.maxHP);
        string memory strDamage = Strings.toString(charAttributes.attackDamage);

        string memory json = Base64.encode(
            abi.encodePacked(
                   '{"name": "',
        charAttributes.name,
        ' -- NFT #: ',
        Strings.toString(_tokenId),
        '", "description": "This is an NFT that lets people play in the game Metaverse Slayer!", "image": "',
        charAttributes.imageURI,
        '", "attributes": [ { "trait_type": "Health Points", "value": ',strHP,', "max_value":',strMaxHP,'}, { "trait_type": "Attack Damage", "value": ',
        strDamage,'} ]}'
            )
        );

        string memory output = string(
            abi.encodePacked("data:application/json;base64,", json)
        );
        return output;
    }

    function replenishHealth() public {
    uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
    attributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];

    // Calculate time difference since last update
    uint256 timeDiff = block.timestamp - player.lastUpdate;

    // Calculate how much health points should be replenished based on time difference
    uint256 healthToAdd = timeDiff / 60; // Add 1 health point every minute

    // Add replenished health points up to maximum HP
    player.HP = player.HP + healthToAdd;
    if (player.HP > player.maxHP) {
        player.HP = player.maxHP;
    }

    // Update last update time
    player.lastUpdate = block.timestamp;
}

    function mintCharacterNFT(uint256 _characterIndex) external {
        uint256 itemId = _tokenIds.current();
        _safeMint(msg.sender, itemId);

        nftHolderAttributes[itemId] = attributes({
            characterIndex: _characterIndex,
            name: defaultCharacters[_characterIndex].name,
            imageURI: defaultCharacters[_characterIndex].imageURI,
            HP: defaultCharacters[_characterIndex].HP,
            maxHP: defaultCharacters[_characterIndex].maxHP,
            attackDamage: defaultCharacters[_characterIndex].attackDamage,
            lastUpdate:(block.timestamp)*2
        });

        console.log(
            "minted NFT w/ tokenId %s and characterIndex %s",
            itemId,
            _characterIndex
        );
        nftHolders[msg.sender] = itemId;
        _tokenIds.increment();
        emit CharacterNFTMinted(msg.sender, itemId, _characterIndex);
    }

    function attackBoss() public {
        uint256 nftTokenIdOfPlayer = nftHolders[msg.sender];
        attributes storage player = nftHolderAttributes[nftTokenIdOfPlayer];
        console.log(
            "\nPlayer w/ character %s about to attack. Has %s HP and %s AD",
            player.name,
            player.HP,
            player.attackDamage
        );
        console.log(
            "Boss %s has %s HP and %s AD",
            bigBoss.name,
            bigBoss.HP,
            bigBoss.attackDamage
        );
        require(player.HP > 0, "Error: character must have HP to attack boss");
        require(bigBoss.HP > 0, "Error: Boss HP must be greater than zero");

        if (bigBoss.HP < player.attackDamage) {
            bigBoss.HP = 0;
        } else {
            bigBoss.HP -= player.attackDamage;
        }

        if (player.HP < bigBoss.attackDamage) {
            player.HP = 0;
        } else {
            player.HP -= bigBoss.attackDamage;
            player.lastUpdate=block.timestamp;      }

        console.log("Player attacked boss. New boss hp: %s", bigBoss.HP);
        console.log("Boss attacked player. New player hp: %s\n", player.HP);

        emit AttackComplete(msg.sender, bigBoss.HP, player.HP);
    }

    function checkIfUserHasNFT() public view returns (attributes memory) {
        uint256 userNFTTokenId = nftHolders[msg.sender];
        if (userNFTTokenId > 0) {
            return nftHolderAttributes[userNFTTokenId];
        } else {
            attributes memory emptyChar;
            return emptyChar;
        }
    }

    function getAllDefaultCharacters()
        public
        view
        returns (attributes[] memory)
    {
        return defaultCharacters;
    }

    function getBigBoss() public view returns (BigBoss memory) {
        return bigBoss;
    }
}
