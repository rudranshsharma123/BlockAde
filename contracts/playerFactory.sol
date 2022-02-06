// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './player.sol';
contract PlayerFactory {
    Player[] public players;
    uint256 public numberOfPlayers;
    uint256 public totalDonation;
    uint256 public currentAmount;
    address public owner;
    mapping(address => address) public playerAddressToPlayerContractAddress;
    mapping(address => uint256) public playerToAmountTipped;
    address public myAddress = address(this);
    event PlayerRegisterd(address player, uint256 regTime, string gameName);

    event TipRecieved(address tipper, uint256 amountTipped);

    modifier onlyOwner() {
        require(msg.sender == owner);
        _;
    }

    constructor() {
        owner = msg.sender;
    }

    function sendAllValues() public view returns(
        Player[] memory player, uint256 playerNumbers, uint256 totDona, uint256 ca
    ) {
        ca = currentAmount;
        playerNumbers = numberOfPlayers;
        player = players;
        totDona = totalDonation;

    }

    function regiterNewPlayer(string calldata gameName)
        external
        payable
        returns (string memory)
    {
        address playerAddress = msg.sender;
        if (playerAddressToPlayerContractAddress[playerAddress] != address(0)) {
            return "sorry you are already registered";
        }

        Player player = new Player(
            playerAddress,
            block.timestamp,
            gameName,
            owner
        );
        // player.getTipped{value:msg.value};
        transferFunds(payable(address(player)), 1);
        numberOfPlayers++;
        players.push(player);
        playerAddressToPlayerContractAddress[msg.sender] = address(player);
        emit PlayerRegisterd(msg.sender, block.timestamp, gameName);

        return "Done";
    }

    function checkIfPlayerReg() external view returns (string memory) {
        if (playerAddressToPlayerContractAddress[msg.sender] == address(0)) {
            return "Player not found please register";
        } else {
            return "good";
        }
    }

    function playerContract() external view returns (address) {
        if (playerAddressToPlayerContractAddress[msg.sender] != address(0)) {
            return playerAddressToPlayerContractAddress[msg.sender];
        }
        return address(0);
    }

    function tip() external payable {
        require(msg.value > 0, "Please tip us over 0 eth :(");
        totalDonation = totalDonation + msg.value;
        playerToAmountTipped[msg.sender] =
            playerToAmountTipped[msg.sender] +
            msg.value;
        currentAmount = currentAmount + msg.value;
        emit TipRecieved(msg.sender, msg.value);
    }

    function withdrawFunds() external payable onlyOwner {
        payable(owner).transfer(address(this).balance);
    }

    function currentFundsPresent() external view returns (uint256) {
        return address(this).balance;
    }

    function requestFunds(uint256 amount) external payable {
        bool isPresent = false;
        for (uint256 i = 0; i < players.length; i++) {
            if (address(players[i]) == msg.sender) {
                isPresent = true;
                break;
            }
        }
        require(isPresent, "sorry you cannot ask for funds");
        require(
            amount < address(this).balance,
            "Sorry there is not enough money in the contract"
        );
        transferFunds(payable(msg.sender), amount);
    }

    function transferFunds(address payable _to, uint256 _amount)
        public
        payable
    {
        require(
            address(this).balance > 1 ether,
            "Sorry The contract does not have enough money now"
        );
        bool sent = _to.send(_amount * 1 ether);
        require(sent, "Failed to send the ether");
    }
}

