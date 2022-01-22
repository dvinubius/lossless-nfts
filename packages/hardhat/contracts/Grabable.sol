pragma solidity >=0.6.0 <0.7.0;
// SPDX-License-Identifier: MIT

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

import "hardhat/console.sol";

contract Grabable is ERC721, Ownable {
    using Counters for Counters.Counter;
    Counters.Counter private _tokenIds;

    //this marks an item in IPFS as "mintable"
    mapping(bytes32 => bool) public mintable;
    //this lets you look up token info by the uri (assuming there is only one of each uri for now)
    mapping(bytes32 => uint256) public uriToTokenId;

    mapping(uint256 => uint256) public price; // tokenId to price
    mapping(uint256 => uint256) public premium; // tokenId to premium (basis points)
    mapping(uint256 => bool) public locked; // tokenId to locked status

    uint256 public lockFee = 1000; // 1 % TODO map authors to lockFees
    event Locked(uint256 indexed tokenId);
    event Unlocked(uint256 indexed tokenId);

    uint256 public constant minPrice = 10**15; // 0.001 ether

    modifier freeToGrab(uint256 tokenId) {
        require(!locked[tokenId], "this one is locked");
        _;
    }

    constructor(bytes32[] memory mintableAssets)
        public
        ERC721("Grabbable", "GRB")
    {
        _setBaseURI("https://ipfs.io/ipfs/");
        for (uint256 i = 0; i < mintableAssets.length; i++) {
            mintable[mintableAssets[i]] = true;
        }
    }

    function getTokenDataByUriHash(bytes32 uri)
        public
        view
        returns (
            uint256 tokenId,
            string memory _tokenUri,
            address _owner,
            uint256 _grabPrice,
            uint256 _premium,
            bool _locked,
            uint256 _lockFee
        )
    {
        tokenId = uriToTokenId[uri];
        _tokenUri = tokenURI(tokenId);
        _owner = ownerOf(tokenId);
        _grabPrice = grabPrice(tokenId);
        _premium = premium[tokenId];
        _locked = locked[tokenId];
        _lockFee = lockFee; // TODO take from mapping when associated with author
    }

    // --------- AUTHOR ---------- //

    // --------- MINTING --------- //

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

    // --------- GRABS --------- //

    function grab(uint256 tokenId)
        public
        payable
        freeToGrab(tokenId)
        returns (uint256)
    {
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

    // -------- LOCKING

    modifier onlyTokenOwner(uint256 _tokenId) {
        require(
            msg.sender == ownerOf(_tokenId),
            "only the owner can lock/unlock"
        );
        _;
    }

    function lockToken(uint256 _tokenId)
        public
        payable
        onlyTokenOwner(_tokenId)
    {
        require(
            !locked[_tokenId],
            "currently locked. you better save your gas"
        );
        require(
            msg.value == lockFee,
            "pay the fee, ser" // TODO take from mapping when associated with author
        );
        locked[_tokenId] = true;
        emit Locked(_tokenId);
    }

    function unlockToken(uint256 _tokenId) public onlyTokenOwner(_tokenId) {
        require(
            locked[_tokenId],
            "currently not locked. you better save your gas"
        );
        locked[_tokenId] = false;
        emit Unlocked(_tokenId);
    }

    // -------- contract money

    receive() external payable {}

    function withdraw() public onlyOwner {
        (bool sent, bytes memory data) = payable(owner()).call{
            value: address(this).balance
        }("");
        require(sent, "Failed to send Ether");
    }
}
