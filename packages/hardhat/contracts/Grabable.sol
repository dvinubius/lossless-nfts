pragma solidity >=0.6.0 <0.7.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract Grabable is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    mapping(uint256 => uint256) public price; // tokenId to price
    mapping(uint256 => uint256) public premium; // tokenId to premium (basis points)

    uint256 public constant minPrice = 10**14; // 0.0001 ether

    constructor(bytes32[] memory mintableAssets)
        public
        ERC721("Grabbable", "GRB")
    {
        _setBaseURI("https://ipfs.io/ipfs/");
        for (uint256 i = 0; i < mintableAssets.length; i++) {
            mintable[mintableAssets[i]] = true;
        }
    }

    //this marks an item in IPFS as "mintable"
    mapping(bytes32 => bool) public mintable;
    //this lets you look up token info by the uri (assuming there is only one of each uri for now)
    mapping(bytes32 => uint256) public uriToTokenId;

    function getTokenDataByUriHash(bytes32 uri)
        public
        view
        returns (
            uint256 tokenId,
            string memory _tokenUri,
            address _owner,
            uint256 _grabPrice,
            uint256 _premium
        )
    {
        tokenId = uriToTokenId[uri];
        _tokenUri = tokenURI(tokenId);
        _owner = ownerOf(tokenId);
        _grabPrice = grabPrice(tokenId);
        _premium = premium[tokenId];
    }

    function mintItem(string memory tokenURI, uint256 _premium)
        public
        payable
        returns (uint256)
    {
        // the money first
        uint256 _price = msg.value;
        require(_price >= minPrice, "price must be above minimum");

        bytes32 uriHash = keccak256(abi.encodePacked(tokenURI));

        //make sure they are only minting something that is marked "mintable"
        require(mintable[uriHash], "NOT MINTABLE");
        mintable[uriHash] = false;

        _tokenIds.increment();

        uint256 id = _tokenIds.current();
        _mint(msg.sender, id);
        _setTokenURI(id, tokenURI);

        uriToTokenId[uriHash] = id;

        price[id] = _price;
        premium[id] = _premium;

        return id;
    }

    function grab(uint256 tokenId) public payable returns (uint256) {
        require(_exists(tokenId), "token id has no owner");
        uint256 total = grabPrice(tokenId);
        require(msg.value >= total, "pay the price plus premium, ser");

        _safeTransfer(ownerOf(tokenId), msg.sender, tokenId, "");
        price[tokenId] = total;
    }

    function grabPrice(uint256 tokenId) public view returns (uint256) {
        return price[tokenId] + _calcPremium(tokenId);
    }

    function premiumFor(uint256 tokenId) public view returns (uint256) {
        return premium[tokenId];
    }

    function _calcPremium(uint256 _tokenId) private view returns (uint256) {
        // not necessary to check as long as minPrice is >= 10000 wei
        // require(
        //     (_price / 10000) * 10000 == _price,
        //     "amount too small to accurately apply the premium"
        // );
        uint256 _price = price[_tokenId];
        uint256 _premium = premium[_tokenId];
        return (_price * _premium) / 10000; // 100 for percentage and 100 for 2-decimal precision
    }

    function withdraw() public onlyOwner {
        (bool sent, bytes memory data) = payable(owner()).call{
            value: address(this).balance
        }("");
        require(sent, "Failed to send Ether");
    }
}
