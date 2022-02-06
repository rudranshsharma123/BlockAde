import React, { useState, useEffect } from "react";
// @ts-ignore
import cloneDeep from "lodash.clonedeep";
import { useEvent, getColors } from "./util";
import Swipe from "react-easy-swipe";
import Web3 from "web3";
import Navbar from "../navbar/navbar";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlayerFactory from "../contracts/PlayerFactory.json";
import Player from "../contracts/Player.json";

const GAMENAME = "2048";

function App() {
	const [account, setAccount] = useState("");
	const [playerFactory, setPlayerFactory] = useState();
	const [win, setWin] = useState(false);
	const [max, setMax] = useState(0);
	const [loose, setLoose] = useState(false);
	const UP_ARROW = 38;
	const DOWN_ARROW = 40;
	const LEFT_ARROW = 37;
	const RIGHT_ARROW = 39;

	const [data, setData] = useState([
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
		[0, 0, 0, 0],
	]);

	const [gameOver, setGameOver] = useState(false);

	async function loadEverything() {
		if (window.ethereum) {
			window.web3 = new Web3(window.ethereum);
			await window.ethereum.enable();
		} else if (window.web3) {
			window.web3 = new Web3(window.web3.currentProvider);
		} else {
			window.alert(
				"Non-Ethereum browser detected. You should consider trying MetaMask!",
			);
		}
		const web3 = window.web3;
		// Load account
		const accounts = await window.ethereum.request({
			method: "eth_accounts",
		});

		// Network ID
		const networkId = await window.ethereum.request({
			method: "net_version",
		});
		// @ts-ignore
		const networkData = PlayerFactory.networks[networkId];
		let proj = new web3.eth.Contract(PlayerFactory.abi, networkData.address);
		return { contract: proj, account: accounts[0] };
	}

	useEffect(() => {
		loadEverything().then((data) => {
			setPlayerFactory(data.contract);
			setAccount(data.account);
		});
	}, []);

	useEffect(() => {
		window["ethereum"].on("accountsChanged", (accounts) => {
			console.log(account);
			toastySuccess(`Account changed to ${accounts}`);
			setAccount(accounts[0]);
			window.location.reload();
		});
	}, []);

	const toastySuccess = (message) => {
		toast(`🦄 ${message}`, {
			position: "top-right",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
		console.log("Showing The Toasty");
	};
	const toastyFailure = (message) => {
		toast.error(`🦄 ${message}`, {
			position: "top-right",
			autoClose: 5000,
			hideProgressBar: false,
			closeOnClick: true,
			pauseOnHover: true,
			draggable: true,
			progress: undefined,
		});
		console.log("Showing The error Toasty");
	};

	useEffect(() => {
		let max = 0;
		const web3 = window.web3;
		data.forEach((val, index) => {
			val.forEach((val, index) => {
				if (val > max) {
					max = val;
				}
			});
		});
		const playerCont = async () => {
			const contractAddress = await playerFactory.methods
				.playerContract()
				.call({ from: account })
				.then((res) => {
					return res;
				});
			const playerContractObj = new web3.eth.Contract(
				Player.abi,
				contractAddress,
			);
			const win = await playerContractObj.methods
				.win(GAMENAME)
				.send({ from: account, gas: 3000000 })
				.then((res) => {
					console.log(res);
				});
			toastySuccess("You have earned your rewards, check you balance");
		};

		setMax((prev) => {
			return max;
		});

		if (max >= 32) {
			setWin((prev) => {
				return true;
			});
			toastySuccess("You Win");
			playerCont();
		}
	}, [data]);

	useEffect(() => {
		const web3 = window.web3;
		if (loose || gameOver) {
			toastyFailure("We are so sorry but, you lost!");
			const playerCont = async () => {
				const contractAddress = await playerFactory.methods
					.playerContract()
					.call({ from: account })
					.then((res) => {
						return res;
					});
				const playerContractObj = new web3.eth.Contract(
					Player.abi,
					contractAddress,
				);
				const loose = await playerContractObj.methods
					.loose(GAMENAME)
					.send({ from: account, gas: 3000000 })
					.then((res) => {
						console.log(res);
					});
				toastyFailure(
					"We are sorry, we have resetted your consecutive wins, now your reward per win would be very less :( ",
				);
			};
			playerCont();
		}
	}, [loose]);

	// Initialize
	console.log(max);
	const initialize = () => {
		// console.log("CALLING INITIALIZE");

		let newGrid = cloneDeep(data);
		console.log(newGrid);

		addNumber(newGrid);
		console.table(newGrid);
		addNumber(newGrid);
		console.table(newGrid);
		setData(newGrid);
	};

	// AddNumber - Add an item
	const addNumber = (newGrid) => {
		let added = false;
		let gridFull = false;
		let attempts = 0;
		while (!added) {
			if (gridFull) {
				break;
			}

			let rand1 = Math.floor(Math.random() * 4);
			let rand2 = Math.floor(Math.random() * 4);
			attempts++;
			if (newGrid[rand1][rand2] === 0) {
				newGrid[rand1][rand2] = Math.random() > 0.5 ? 2 : 4;
				added = true;
			}
			if (attempts > 50) {
				gridFull = true;
				let gameOverr = checkIfGameOver();
				if (gameOverr) {
					toastyFailure("Sorry, you lost the game");
					setLoose(true);
					// setGameOver(true);
				}
				// setGameOver(true);
			}
		}
	};
	// Swipe Left
	const swipeLeft = (dummy) => {
		console.log("swipe left");
		let oldGrid = data;
		let newArray = cloneDeep(data);

		for (let i = 0; i < 4; i++) {
			let b = newArray[i];
			let slow = 0;
			let fast = 1;
			while (slow < 4) {
				if (fast === 4) {
					fast = slow + 1;
					slow++;
					continue;
				}
				if (b[slow] === 0 && b[fast] === 0) {
					fast++;
				} else if (b[slow] === 0 && b[fast] !== 0) {
					b[slow] = b[fast];
					b[fast] = 0;
					fast++;
				} else if (b[slow] !== 0 && b[fast] === 0) {
					fast++;
				} else if (b[slow] !== 0 && b[fast] !== 0) {
					if (b[slow] === b[fast]) {
						b[slow] = b[slow] + b[fast];
						b[fast] = 0;
						fast = slow + 1;
						slow++;
					} else {
						slow++;
						fast = slow + 1;
					}
				}
			}
		}
		if (JSON.stringify(oldGrid) !== JSON.stringify(newArray)) {
			addNumber(newArray);
		}
		if (dummy) {
			return newArray;
		} else {
			setData(newArray);
		}
	};

	const swipeRight = (dummy) => {
		console.log("swipe right");
		let oldData = data;
		let newArray = cloneDeep(data);

		for (let i = 3; i >= 0; i--) {
			let b = newArray[i];
			let slow = b.length - 1;
			let fast = slow - 1;
			while (slow > 0) {
				if (fast === -1) {
					fast = slow - 1;
					slow--;
					continue;
				}
				if (b[slow] === 0 && b[fast] === 0) {
					fast--;
				} else if (b[slow] === 0 && b[fast] !== 0) {
					b[slow] = b[fast];
					b[fast] = 0;
					fast--;
				} else if (b[slow] !== 0 && b[fast] === 0) {
					fast--;
				} else if (b[slow] !== 0 && b[fast] !== 0) {
					if (b[slow] === b[fast]) {
						b[slow] = b[slow] + b[fast];
						b[fast] = 0;
						fast = slow - 1;
						slow--;
					} else {
						slow--;
						fast = slow - 1;
					}
				}
			}
		}
		if (JSON.stringify(newArray) !== JSON.stringify(oldData)) {
			addNumber(newArray);
		}
		if (dummy) {
			return newArray;
		} else {
			setData(newArray);
		}
	};

	const swipeDown = (dummy) => {
		console.log("swipe down");
		console.log(data);
		let b = cloneDeep(data);
		let oldData = JSON.parse(JSON.stringify(data));
		for (let i = 3; i >= 0; i--) {
			let slow = b.length - 1;
			let fast = slow - 1;
			while (slow > 0) {
				if (fast === -1) {
					fast = slow - 1;
					slow--;
					continue;
				}
				if (b[slow][i] === 0 && b[fast][i] === 0) {
					fast--;
				} else if (b[slow][i] === 0 && b[fast][i] !== 0) {
					b[slow][i] = b[fast][i];
					b[fast][i] = 0;
					fast--;
				} else if (b[slow][i] !== 0 && b[fast][i] === 0) {
					fast--;
				} else if (b[slow][i] !== 0 && b[fast][i] !== 0) {
					if (b[slow][i] === b[fast][i]) {
						b[slow][i] = b[slow][i] + b[fast][i];
						b[fast][i] = 0;
						fast = slow - 1;
						slow--;
					} else {
						slow--;
						fast = slow - 1;
					}
				}
			}
		}
		if (JSON.stringify(b) !== JSON.stringify(oldData)) {
			addNumber(b);
		}
		if (dummy) {
			return b;
		} else {
			setData(b);
		}
	};

	const swipeUp = (dummy) => {
		console.log("swipe up");
		let b = cloneDeep(data);
		let oldData = JSON.parse(JSON.stringify(data));
		for (let i = 0; i < 4; i++) {
			let slow = 0;
			let fast = 1;
			while (slow < 4) {
				if (fast === 4) {
					fast = slow + 1;
					slow++;
					continue;
				}
				if (b[slow][i] === 0 && b[fast][i] === 0) {
					fast++;
				} else if (b[slow][i] === 0 && b[fast][i] !== 0) {
					b[slow][i] = b[fast][i];
					b[fast][i] = 0;
					fast++;
				} else if (b[slow][i] !== 0 && b[fast][i] === 0) {
					fast++;
				} else if (b[slow][i] !== 0 && b[fast][i] !== 0) {
					if (b[slow][i] === b[fast][i]) {
						b[slow][i] = b[slow][i] + b[fast][i];
						b[fast][i] = 0;
						fast = slow + 1;
						slow++;
					} else {
						slow++;
						fast = slow + 1;
					}
				}
			}
		}
		if (JSON.stringify(oldData) !== JSON.stringify(b)) {
			addNumber(b);
		}
		if (dummy) {
			return b;
		} else {
			setData(b);
		}
	};

	// Check Gameover
	const checkIfGameOver = () => {
		console.log("CHECKING GAME OVER");
		// let original = cloneDeep(data);
		let checker = swipeLeft(true);

		if (JSON.stringify(data) !== JSON.stringify(checker)) {
			return false;
		}

		let checker2 = swipeDown(true);
		console.log("CHECKER DOWN");
		console.table(data);
		console.table(checker2);
		if (JSON.stringify(data) !== JSON.stringify(checker2)) {
			return false;
		}

		let checker3 = swipeRight(true);

		if (JSON.stringify(data) !== JSON.stringify(checker3)) {
			return false;
		}

		let checker4 = swipeUp(true);

		if (JSON.stringify(data) !== JSON.stringify(checker4)) {
			return false;
		}

		return true;
	};
	// Reset
	const resetGame = () => {
		setGameOver(false);
		const emptyGrid = [
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
			[0, 0, 0, 0],
		];

		addNumber(emptyGrid);
		addNumber(emptyGrid);
		setData(emptyGrid);
		setWin((prev) => {
			return false;
		});
	};

	const handleKeyDown = (event) => {
		if (gameOver) {
			return;
		}
		switch (event.keyCode) {
			case UP_ARROW:
				// alert("up");
				// console.table(data);
				swipeUp();
				// console.table(data);
				break;
			case DOWN_ARROW:
				// console.table(data);
				swipeDown();
				// console.table(data);
				break;
			case LEFT_ARROW:
				// console.table(data);
				swipeLeft();
				// console.table(data);
				break;
			case RIGHT_ARROW:
				// console.table(data);
				swipeRight();
				// console.table(data);
				break;
			default:
				break;
		}

		let gameOverr = checkIfGameOver();
		if (gameOverr) {
			setGameOver(true);
			setLoose(true);
		}
	};

	useEffect(() => {
		initialize();
		// eslint-disable-next-line
	}, []);

	// This is a custom function
	useEvent("keydown", handleKeyDown);

	return (
		<div className="App">
			<Navbar game={GAMENAME} />
			<div
				style={{
					width: 345,
					margin: "auto",
					marginTop: 30,
				}}>
				<div style={{ display: "flex" }}>
					<div
						style={{
							fontFamily: "sans-serif",
							flex: 1,
							fontWeight: "700",
							fontSize: 60,
							color: "#776e65",
						}}>
						2048
					</div>
					<div
						style={{
							flex: 1,
							marginTop: "auto",
						}}>
						<div onClick={resetGame} style={style.newGameButton}>
							NEW GAME
						</div>
					</div>
				</div>
				<div
					style={{
						background: "#AD9D8F",
						width: "max-content",
						height: "max-content",
						margin: "auto",
						padding: 5,
						borderRadius: 5,
						marginTop: 10,
						position: "relative",
					}}>
					{gameOver && (
						<div style={style.gameOverOverlay}>
							<div>
								<div
									style={{
										fontSize: 30,
										fontFamily: "sans-serif",
										fontWeight: "900",
										color: "#776E65",
									}}>
									Game Over
								</div>
								<div>
									<div
										style={{
											flex: 1,
											marginTop: "auto",
										}}>
										<div onClick={resetGame} style={style.tryAgainButton}>
											Try Again
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
					{win && (
						<div style={style.gameOverOverlay}>
							<div>
								<div
									style={{
										fontSize: 30,
										fontFamily: "sans-serif",
										fontWeight: "900",
										color: "#776E65",
									}}>
									You Win!
								</div>
								<div>
									<div
										style={{
											flex: 1,
											marginTop: "auto",
										}}>
										<div onClick={resetGame} style={style.tryAgainButton}>
											Play Again?
										</div>
									</div>
								</div>
							</div>
						</div>
					)}
					<Swipe
						onSwipeDown={() => {
							swipeDown();
						}}
						onSwipeLeft={() => swipeLeft()}
						onSwipeRight={() => swipeRight()}
						onSwipeUp={() => swipeUp()}
						style={{ overflowY: "hidden" }}>
						{data.map((row, oneIndex) => {
							return (
								<div style={{ display: "flex" }} key={oneIndex}>
									{row.map((digit, index) => (
										<Block num={digit} key={index} />
									))}
								</div>
							);
						})}
					</Swipe>
				</div>
				<ToastContainer
					position="top-right"
					autoClose={5000}
					hideProgressBar={false}
					newestOnTop={false}
					closeOnClick
					rtl={false}
					pauseOnFocusLoss
					draggable
					pauseOnHover
				/>
				<div style={{ width: "inherit" }}>
					<p class="game-explanation">
						<strong class="important">How to play:</strong> Use your{" "}
						<strong>arrow keys</strong> to move the tiles. When two tiles with
						the same number touch, they <strong>merge into one!</strong>
					</p>
				</div>
			</div>
		</div>
	);
}

const Block = ({ num }) => {
	const { blockStyle } = style;

	return (
		<div
			style={{
				...blockStyle,
				background: getColors(num),
				color: num === 2 || num === 4 ? "#645B52" : "#F7F4EF",
			}}>
			{num !== 0 ? num : ""}
		</div>
	);
};

const style = {
	blockStyle: {
		height: 80,
		width: 80,
		background: "lightgray",
		margin: 3,
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		fontSize: 45,
		fontWeight: "800",
		color: "white",
	},
	newGameButton: {
		padding: 10,
		background: "#846F5B",
		color: "#F8F5F0",
		width: 95,
		borderRadius: 7,
		fontWeight: "900",
		marginLeft: "auto",
		marginBottom: "auto",
		cursor: "pointer",
	},
	tryAgainButton: {
		padding: 10,
		background: "#846F5B",
		color: "#F8F5F0",
		width: 80,
		borderRadius: 7,
		fontWeight: "900",
		cursor: "pointer",
		margin: "auto",
		marginTop: 20,
	},
	gameOverOverlay: {
		position: "absolute",
		height: "100%",
		width: "100%",
		left: 0,
		top: 0,
		borderRadius: 5,
		background: "rgba(238,228,218,.5)",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		borderRadius: 7,
		padding: 10,
		color: "#F8F5F0",
	},
};

export default App;
