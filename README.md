Link to how it works -> https://www.youtube.com/watch?v=dlDOVm9MX20

## Inspiration
I remeber going to arcades when I was a child. The fun of putting in a coin playing the games and having the thrill of winning the tickets to keep playing stuck with me. After pondering around for a long a time how to recreate the same feeling, I found blockchain tech and created this for anyone who misses the same feeling!

## What it does
BlockAde or Blockchian Arcade, is a DApp that has a collection of games (2 as of now). It has the play to earn model which is coded right to the smart contract governing the whole app. All the features of the app are as follows: 


1. Rewards: You have the shot at earning two different rewards. One is the daily Logins. You log into the game of your choice and earn some money! The amount of money you earn is multiplied for each day you log in so to earn the most amount of money, don't forget to log in! The second type of reward is the one you get after winning. That too again can be increased by winning again and again. Remember the moment you lose a game, your streak is gone and your extra rewards are reset! This same functionality is present on each game offered by BlockAde!

2. Games: Right now BlockAde offers two games, namely the world-famous game Worlde and the second one being the classic casual game we all love 2048. I believe everyone knows how worlde works and as for 2048 instructions are available on its page. Just to keep the theme of winning at the arcade tangible I have not allowed 2048 to run in the endless mode so the moment your score reaches 2048 you win!

3. Tipping: If you like the platform you can choose to donate some money to Blockade which will help in sustaining the platform for a long. There are no signup fees however for each transaction that has to happen on the blockchain, the gas fees is expected to be paid by the player. 

## How I built it
I built the frontend using Next.Js with TypeScript and for the backend I have used Python's Flask and Solidity for writing the smart contact. I also used Truffle for deploying and testing the contracts and Ganache for setting up a local blockchian

## Challenges I ran into
This was my first time using Next js so it took me some time to translate my react knowledge here. I was unable to use libraries like the Styled COmponents, react-bootstrap without significantly changing the code I had already written at that point which made the whole process of making the UI look good difficult. Also, Next has some idiosyncracies which I had to get over to finish the project. 
React and by extension, Next is not a good library to create games. I had made a couple of games using Phaser, however, getting them together with the Next project became a nightmare which I had to abandon and make two different games. That is the only reason why BlockAcde currently only has two games. Getting blockchain to work with TypeScript was another nightmare. 

## Accomplishments that I am proud of
The fact that everything works!

## What I learned
I learned a lot about Next, Solidity, React, Phaser!

## What's next for BlockAde
Getting more games into the platform and making everything onto a testnet!
