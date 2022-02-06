import styles from "./navbar.module.css";
import Web3 from "web3";
import { useEffect, useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import PlayerFactory from "../contracts/PlayerFactory.json";
import Player from "../contracts/Player.json";

declare let window: any;
type NavBarProps = {
	game: string;
};
export default function Navbar({ game }: NavBarProps) {
	const [account, setAccount] = useState<string>("");
	const [web3, setWeb3] = useState<Web3>();
	const [playerFactory, setPlayerFactory] = useState<any>();
	const [reg, setReg] = useState<boolean>(false);
	const [dailyLogin, setDailyLogin] = useState<boolean>();
	useEffect(() => {
		window["ethereum"].on("accountsChanged", (accounts: string) => {
			console.log(account);
			toastySuccess(`Account changed to ${accounts}`);
			setAccount(accounts[0]);
			window.location.reload();
		});
	}, []);

	async function registerPlayer() {
		let playerFactoryContract = playerFactory;
		if (!playerFactory) {
			const playerF = await loadBlockchainData().then((res) => {
				return res;
			});
			playerFactoryContract = playerF;
		}

		const check = await playerFactoryContract.methods
			.checkIfPlayerReg()
			.call({ from: account })
			.then((res: string) => {
				return res;
			});

		if (check === "good") {
			toastySuccess("You have already registered");
			setReg((prev) => {
				return true;
			});
			return;
		} else {
			toastySuccess("You have not registered, registering you now");
			setReg((prev) => {
				return false;
			});
		}

		const txt = await playerFactoryContract.methods
			.regiterNewPlayer(game)
			.send({ from: account, gas: 3000000 })
			.then((res: object) => {
				console.log(res);
			});
		toastySuccess("You have been registered, enjoy your game!");
	}

	async function tipContract() {
		const web3 = window.web3;
		let playerFactoryContract = playerFactory;
		if (!playerFactory) {
			const playerF = await loadBlockchainData().then((res) => {
				return res;
			});
			playerFactoryContract = playerF;
		}
		const txt = await playerFactoryContract.methods
			.tip()
			.send({
				from: account,
				gas: 3000000,
				value: web3.utils.toWei("10", "ether"),
			})
			.then((res: object) => {
				console.log(res);
			});
		toastySuccess("You have tipped the contract, We appricite the tip");
	}

	async function loginIntoTheGame() {
		const web3 = window.web3;
		let playerFactoryContract = playerFactory;
		if (!playerFactory) {
			const playerF = await loadBlockchainData().then((res) => {
				return res;
			});
			playerFactoryContract = playerF;
		}

		const response = await playerFactory.methods
			.checkIfPlayerReg()
			.call({ from: account })
			.then((res: string) => {
				return res;
			});

		if (response === "good") {
			const playerGameContract = await playerFactory.methods
				.playerContract()
				.call({ from: account })
				.then((res: string) => {
					return res;
				});
			const contractPlayer = new web3.eth.Contract(
				Player.abi,
				playerGameContract,
			);
			const txn = await contractPlayer.methods
				.login(game)
				.send({ from: account, gas: 3000000 })
				.then((res: object) => {
					return res;
				});
			if (Object.keys(txn["events"]).length === 0) {
				setDailyLogin((prev) => {
					return false;
				});
				toastyFailure("Sorry, you have already logged in today");
			} else {
				toastySuccess("You have successfully logged in, and got your reward");
				setDailyLogin((prev) => {
					return true;
				});
			}
		} else {
			console.log("You need to register");
			toastyFailure("You need to register");
			setReg((prev) => {
				return false;
			});
			return;
		}
	}

	async function seeSomeStuff() {
		const web3 = window.web3;
		let playerFactoryContract = playerFactory;
		if (!playerFactory) {
			const playerF = await loadBlockchainData().then((res) => {
				return res;
			});
			playerFactoryContract = playerF;
		}
		const playerGameContract = await playerFactoryContract.methods
			.playerContract()
			.call({ from: account })
			.then((res: string) => {
				return res;
			});
		const player = new web3.eth.Contract(Player.abi, playerGameContract);
		const txt = await player.methods
			.win(game)
			.send({ from: account, gas: 3000000 })
			.then((res: object) => {
				console.log(res);
			});
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

	// console.log(account);
	// console.log(playerFactory);
	return (
		<nav className={styles.nav}>
			<div className={styles.navItems}>Blockacde</div>
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
			{/* <div
				className={styles.navItems}
				onClick={() => {
					toastySuccess("100");
				}}>
				Test
			</div> */}
			<div
				className={styles.navItems}
				onClick={async () => {
					await tipContract();
				}}>
				Tip Us! (10 eth)
			</div>
			<div
				className={styles.navItems}
				onClick={async () => {
					await loginIntoTheGame();
				}}>
				Login
			</div>
			<div
				className={styles.navItems}
				onClick={async () => {
					await loadWeb3();
					await loadBlockchainData();
					console.log(web3);
					console.log(playerFactory);
					console.log(account);
				}}>
				Connect
			</div>
			<div
				className={styles.navItems}
				onClick={async () => {
					await registerPlayer();
				}}>
				Register
			</div>
		</nav>
	);
}
