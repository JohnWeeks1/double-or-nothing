// SPDX-License-Identifier: MIT
pragma solidity >=0.4.21 <0.7.0;

contract Coin {
    
    uint public ownerBalance;
    uint playerBalance;
    
    address payable owner;

    modifier minimumBet(uint deposit) {
        require(msg.value >= deposit, "Sorry, but the minimum bet is 1 ether");
        _;
    }
    
    modifier isOwner() {
        require(msg.sender == owner, "You are not the owner");
        _;
    }
    
    constructor() public {
        owner = msg.sender;
    }
    
    event betResult(bool trueOrFalse, string result);
    
    function setOwnerBalance() public payable isOwner {
        ownerBalance += msg.value;
    }
    
    function startBet() public payable minimumBet(1 ether) {
        require(msg.value <= 3 ether, "Sorry, but the maximum bet is 3 ether");
        playerBalance += msg.value;
        payWinner();
    }
    
    function random() private view returns(uint) {
        return now % 2;
    }
    
    function playerWins() private returns(uint) {
        uint pb = playerBalance * 2;
        ownerBalance = ownerBalance - playerBalance;
        playerBalance = 0;
        msg.sender.transfer(pb);
        emit betResult(true, "You win!");

        return playerBalance;
    }
    
    function ownerWins() private returns(uint) {
        ownerBalance = ownerBalance + playerBalance;
        playerBalance = 0;
        emit betResult(false, "You lose... Try again!");

        return ownerBalance;
    }
    
    function payWinner() private returns(uint) {
        if(random() == 1) {
            playerWins();
        } else {
            ownerWins();
        }
    }
}
