//SPDX-License-Identifier: Unlicense
pragma solidity ^0.8.0;


import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";

import "@openzeppelin/contracts/utils/Counters.sol";



contract MyNft is ERC721 {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    // 不用通过在合约中记录。  可在 事件（event） 中通过 事件过滤 获取到 某地址相关的 信息
    // // 记录相应账户tokenId
    // mapping(address => uint256[]) public addressOfId;


    constructor() ERC721("MyNft", "MN") {}

    // 铸造nft
    function mintNft(address player) public returns (uint256) {
        _tokenIds.increment();
        uint256 nftTokenId = _tokenIds.current();
        _mint(player, nftTokenId);
        return nftTokenId;
    }
}