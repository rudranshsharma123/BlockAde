// SPDX-License-Identifier: GPL-3.0

pragma solidity >=0.7.0 <0.9.0;

import './playerFactory.sol';

contract Player {
    // uint public lastLoginTime;
    uint256 public timeOfCreation;
    uint256 public amountWonTillNow;
    string[] public gamesPlayed;
    address public gamerAddress;
    string public currentGame;
    uint256 public totalAmountIn;
    PlayerFactory public deployer;
    uint256 public winMultiplier = 1 ether;
    uint256 public minWinAmount = 1 ether;
    address public actualOwner;
    uint256 public minDailyRewardAmount = 1000 gwei;
    uint256 public dailyRewardMultiplier = 100 gwei;

    mapping(string => uint256) public gameToLastLogin;
    mapping(string => uint256) public gameToDailyLogins;
    mapping(string => uint256) public gameToDailyRewardAmount;
    mapping(string => uint256) public gameToPayoutAmount;
    mapping(string => uint256) public gamesToConsecWins;
    mapping(string => uint256) public gamesToWins;

    event PayoutDone(uint256 amount, address playerAddress, uint256 time);
    event DailyPayoutDone(uint256 amount, address playerAddress, uint256 time);

    constructor(
        address newPlayer,
        uint256 creationTime,
        string memory game,
        address actualOwnerOfTheGame
    ) payable {
        gamerAddress = newPlayer;
        amountWonTillNow = 0;
        gameToLastLogin[game] = creationTime;
        gameToDailyLogins[game]++;
        timeOfCreation = creationTime;
        gamesPlayed.push(game);
        currentGame = game;
        deployer = PlayerFactory(address(msg.sender));
        totalAmountIn = 1 ether;
        gamesToWins[game] = 0;
        actualOwner = actualOwnerOfTheGame;
    }

    modifier onlyOwner() {
        require(msg.sender == gamerAddress);
        _;
    }

    modifier onlyActualOwner() {
        require(msg.sender == actualOwner);
        _;
    }

    modifier onlyThisContract() {
        require(msg.sender == address(this));
        _;
    }

    function changeMinWinAamount(uint256 _amount) external onlyActualOwner {
        minWinAmount = _amount * 1 ether;
    }

    function dailyReward(string memory game) internal {
        if (gameToDailyLogins[game] <= 1) {
            gameToDailyRewardAmount[game] = minDailyRewardAmount;
            gameToDailyLogins[game]++;
            dailyPayout(gameToDailyRewardAmount[game], gamerAddress);
            emit DailyPayoutDone(
                gameToDailyRewardAmount[game],
                gamerAddress,
                block.timestamp
            );
            return;
        }

        gameToDailyRewardAmount[game] =
            gameToDailyRewardAmount[game] +
            gameToDailyLogins[game] *
            dailyRewardMultiplier;
        dailyPayout(gameToDailyRewardAmount[game], gamerAddress);
        // gameToDailyRewardAmount[ga]
        emit DailyPayoutDone(
            gameToDailyRewardAmount[game],
            gamerAddress,
            block.timestamp
        );
        return;

        // @TODO implement a function which should depending upon the number of daily log ins increase the amount of payout
    }

    function dailyPayout(uint256 _amount, address _to) public payable {
        require(
            _amount >= minDailyRewardAmount,
            "Sorry something is wrong about ether"
        );
        bool sent = payable(_to).send(_amount);
        require(sent, "Sorry the payout wasnt processed");
    }

    function login(string memory game)
        external
        onlyOwner
        returns (string memory)
    {
        if ((block.timestamp - gameToLastLogin[game]) >= 1 days) {
            dailyReward(game);
            if (
                keccak256(abi.encode(game)) !=
                keccak256(abi.encode(currentGame))
            ) {
                currentGame = game;

                bool isPresent = false;
                for (uint256 i = 0; i < gamesPlayed.length; i++) {
                    if (
                        keccak256(abi.encode(game)) ==
                        keccak256(abi.encode(gamesPlayed[i]))
                    ) {
                        isPresent = true;
                        gameToDailyLogins[game]++;
                        break;
                    }
                }
                if (!isPresent) {
                    gamesPlayed.push(game);
                    gamesToWins[game] = 0;
                }
            }

            gameToLastLogin[game] = block.timestamp;
            return "Congrats, you got your daily reward welcome back";
        } else {
            if (
                keccak256(abi.encode(game)) !=
                keccak256(abi.encode(currentGame))
            ) {
                currentGame = game;

                bool isPresent = false;

                for (uint256 i = 0; i < gamesPlayed.length; i++) {
                    if (
                        keccak256(abi.encode(game)) ==
                        keccak256(abi.encode(gamesPlayed[i]))
                    ) {
                        isPresent = true;
                        gameToDailyLogins[game]++;
                        break;
                    }
                }
                if (!isPresent) {
                    gamesPlayed.push(game);
                    gamesToWins[game] = 0;
                }
            }

            return "a day has not yet passed";
        }
    }

    function win(string memory game) external payable {
        gamesToWins[game]++;
        if (gamesToConsecWins[game] <= 1) {
            gameToPayoutAmount[game] = minWinAmount;
            payout(gameToPayoutAmount[game], gamerAddress);
            gamesToConsecWins[game]++;
            emit PayoutDone(
                gameToPayoutAmount[game],
                gamerAddress,
                block.timestamp
            );
            return;
        }
        gamesToConsecWins[game]++;
        gameToPayoutAmount[game] =
            gameToPayoutAmount[game] +
            winMultiplier *
            gamesToConsecWins[game];
        payout(gameToPayoutAmount[game], gamerAddress);
        emit PayoutDone(
            gameToPayoutAmount[game],
            gamerAddress,
            block.timestamp
        );
        return;
        // @TODO GET THE MATH WORKING -> Figure out a right multiplier which will reduce the total money and get finish the thingy about consecutive wins.
        // @TODO add the payout function which will pay the guy of this contract out
        // @TODO Ensure that wins from every other game is counted and treated separately
    }

    function loose(string memory game) external {
        gamesToConsecWins[game] = 0;
        gameToPayoutAmount[game] = minWinAmount;
    }

    function payout(uint256 _amount, address _to) public payable {
        require(
            _amount >= 1 ether,
            "Sorry the amount should be greater than 1 ether"
        );
        uint256 currentAmount = address(this).balance;
        if (currentAmount < _amount) {
            (this).request(_amount / (10**18));
        }

        bool sent = payable(_to).send(_amount);
        require(sent, "Sorry the payout wasnt processed");
    }

    function request(uint256 amount) public payable {
        deployer.requestFunds(amount);
        totalAmountIn = totalAmountIn + 1 ether;
    }

    function currentBalance() external view returns (uint256) {
        return address(this).balance;
    }

    receive() external payable {}

    fallback() external payable {}
}