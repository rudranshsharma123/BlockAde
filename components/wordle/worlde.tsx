import { useEffect, useMemo, useState } from "react";
import Navbar from "../navbar/navbar";
import styles from "./wordle.module.css";
import Web3 from "web3";

import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlayerFactory from "../contracts/PlayerFactory.json";
import Player from "../contracts/Player.json";
type worldeProps = {
	puzzleWord: string;
};
declare let window: any;
const GAMENAME = "wordle";

export default function Wordle({ puzzleWord }: worldeProps) {
	const [guess, setGuess] = useState<Array<string>>([]);
	const [submittedGuess, setSubmittedGuess] = useState<Array<Array<string>>>(
		[],
	);
	const [account, setAccount] = useState<string>("");
	const [web3, setWeb3] = useState<Web3>();
	const [playerFactory, setPlayerFactory] = useState<any>();
	const [won, setWon] = useState<boolean>(false);
	const [playerContractHandle, setPlayerContractHandle] = useState<any>();

	if (puzzleWord.length !== 5) {
		throw new Error("Puzzle word must be 5 characters");
	}

	useEffect(() => {
		function handleKeyDown({ key }: { key: string }) {
			console.log(key);
			const isChar = /^[a-zA-Z]$/.test(key);
			const isBackSpace = key === "Backspace";
			const isGuessFinished = guess.length === 5;
			const isEnter = key === "Enter";
			const isCorrect =
				submittedGuess.length > 0 &&
				submittedGuess[submittedGuess.length - 1].join("") === puzzleWord;
			const isFail = !isCorrect && submittedGuess.length === 6;

			if (isBackSpace) {
				setGuess((prev) => prev.slice(0, -1));
			} else if (isChar && !isGuessFinished) {
				setGuess((prev) => [...prev, key]);
			} else if (isEnter && isGuessFinished && !isCorrect && !isFail) {
				setSubmittedGuess((prev) => [...prev, guess]);
				setGuess([]);
			}
		}

		window.addEventListener("keydown", handleKeyDown);
		return () => {
			window.removeEventListener("keydown", handleKeyDown);
		};
	}, [guess.length]);

	useEffect(() => {
		window["ethereum"].on("accountsChanged", (accounts: string) => {
			console.log(account);
			toastySuccess(`Account changed to ${accounts}`);
			setAccount(accounts[0]);
			window.location.reload();
		});
	}, []);
	const isCorrect =
		submittedGuess.length > 0 &&
		submittedGuess[submittedGuess.length - 1].join("") === puzzleWord;
	const isFail = !isCorrect && submittedGuess.length === 6;

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

	console.log(account);
	console.log(playerFactory);
	useEffect(() => {
		const web3 = window.web3;
		if (isCorrect) {
			console.log("see I was correct");
			toastySuccess("You won!");
			const playerCont = async () => {
				const contractAddress = await playerFactory.methods
					.playerContract()
					.call({ from: account })
					.then((res: string) => {
						return res;
					});
				const playerContractObj = new web3.eth.Contract(
					Player.abi,
					contractAddress,
				);
				const win = await playerContractObj.methods
					.win(GAMENAME)
					.send({ from: account, gas: 3000000 })
					.then((res: object) => {
						console.log(res);
					});
				toastySuccess("You have earned your rewards, check you balance");
			};
			playerCont();
		}
	}, [isCorrect]);

	useEffect(() => {
		const web3 = window.web3;
		if (isFail) {
			toastyFailure("We are so sorry but, you lost!");
			const playerCont = async () => {
				const contractAddress = await playerFactory.methods
					.playerContract()
					.call({ from: account })
					.then((res: string) => {
						return res;
					});
				const playerContractObj = new web3.eth.Contract(
					Player.abi,
					contractAddress,
				);
				const loose = await playerContractObj.methods
					.loose(GAMENAME)
					.send({ from: account, gas: 3000000 })
					.then((res: object) => {
						console.log(res);
					});
				toastyFailure(
					"We are sorry, we have resetted your consecutive wins, now your reward per win would be very less :( ",
				);
			};
			playerCont();
		}
	}, [isFail]);
	async function loadWeb3() {
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
	}
	async function loadBlockchainData() {
		const web3 = window.web3;
		// Load account
		const accounts = await web3.eth.getAccounts();
		toastySuccess(`Account changed to ${accounts[0]}`);
		setAccount(accounts[0]);
		setWeb3(web3);
		// Network ID
		const networkId = await web3.eth.net.getId();
		//@ts-ignore
		const networkData = PlayerFactory.networks[networkId];
		if (networkData) {
			setPlayerFactory(
				new web3.eth.Contract(PlayerFactory.abi, networkData.address),
			);
		}
		return new web3.eth.Contract(PlayerFactory.abi, networkData.address);
		console.log(networkData);
	}

	async function test() {
		const web3 = window.web3;
		const playerCont = async () => {
			const contractAddress = await playerFactory.methods
				.playerContract()
				.call({ from: account })
				.then((res: string) => {
					return res;
				});
			const playerContractObj = new web3.eth.Contract(
				Player.abi,
				contractAddress,
			);
			const win = await playerContractObj.methods
				.gamesToConsecWins(GAMENAME)
				.call()
				.then((res: object) => {
					console.log(res);
				});
		};
		await playerCont();
	}

	const toastySuccess = (message: string) => {
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
	const toastyFailure = (message: string) => {
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

	console.log(guess);
	console.log(submittedGuess);

	const charMap = useMemo(() => {
		const x = puzzleWord
			.split("")
			.reduce<Record<string, number>>((acc, char) => {
				if (!acc.hasOwnProperty(char)) {
					acc[char] = 1;
				} else {
					acc[char] += 1;
				}

				return acc;
			}, {});
		return x;
	}, [puzzleWord]);
	console.log(charMap);
	return (
		<>
			<Navbar game={"wordle"} />
			{/* <button
				onClick={async () => {
					await test();
				}}>
				{" "}
				HELLO TEST ME
			</button> */}

			<div className={styles.wordle}>
				<style jsx global>
					{`
						:root {
							--black: #141414;
							--white: #eef0f2;
							--yellow: #eec643;
							--greeen: #419d78;

							background-color: var(--black);
							color: var(--white);
						}
					`}
				</style>
				<div className={styles.text}>Welcome to Worlde </div>
				<div className={styles.text2}>
					(It is the Same game you know and love
				</div>
				<div className={styles.text2}>
					On the blockchain, You earn money each time you Win!)
				</div>
				<div className={styles.board}>
					<SubmittedGuess
						submittedGuess={submittedGuess}
						puzzleWord={puzzleWord}
						dict={charMap}
					/>
					{!isCorrect && !isFail && <CurrentGuess guess={guess} />}
					{Array.from({
						length: 6 - submittedGuess.length - (isCorrect ? 0 : 1),
					}).map((_, index) => {
						return <EmptyGuess key={index} />;
					})}
					{isCorrect && (
						<>
							<div className={styles.correct}> You did it </div>
						</>
					)}
					{isFail && (
						<div className={styles.wrong}>
							{" "}
							Sorry you failed, the correct word was {puzzleWord}{" "}
						</div>
					)}
				</div>
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
		</>
	);
}

type CurrentGuessProps = {
	guess: Array<string>;
};

type EachSubmittedGuessProps = {
	guess: Array<string>;
	puzzleWord: string;
	dict: Record<string, number>;
};

type SubmittedGuessProps = {
	submittedGuess: Array<Array<string>>;
	puzzleWord: string;
	dict: { [key: string]: number };
};

function CurrentGuess({ guess }: CurrentGuessProps) {
	return (
		<div className={`${styles.word} ${styles.currentGuess}`}>
			{Array.from({ length: 5 }).map((_, i) => {
				return (
					<span key={i} className={` ${styles.char} `}>
						{guess[i] ? guess[i] : ""}
					</span>
				);
			})}
		</div>
	);
}

function EmptyGuess() {
	return (
		<div className={styles.word}>
			{Array.from({ length: 5 }).map((_, i) => {
				return <span key={i} className={styles.char}></span>;
			})}
		</div>
	);
}

function SubmittedGuess({
	submittedGuess,
	puzzleWord,
	dict,
}: SubmittedGuessProps) {
	return (
		<>
			{submittedGuess.map((guess, index) => {
				return (
					<EachSubmittedGuess
						guess={guess}
						key={index}
						puzzleWord={puzzleWord}
						dict={dict}
					/>
				);
			})}
		</>
	);
}

function EachSubmittedGuess({
	guess,
	puzzleWord,
	dict,
}: EachSubmittedGuessProps) {
	const charMap = { ...dict };

	guess.forEach((char, i) => {
		const isCorrect = char === puzzleWord[i];
		if (isCorrect) {
			charMap[char] -= 1;
		}
	});

	return (
		<div className={`${styles.word} ${styles.submittedGuess} `}>
			{guess.map((char, i) => {
				const isCorrect = char === puzzleWord[i];
				let isPresent = false;
				if (!isCorrect && charMap[char]) {
					isPresent = true;
					charMap[char] -= 1;
				}
				return (
					<span
						className={`${styles.char} ${
							isCorrect ? styles.correctChar : styles.guessedChar
						} ${isPresent ? styles.presentChar : styles.guessedChar}  `}
						key={i}>
						{guess[i]}
					</span>
				);
			})}
		</div>
	);
}
