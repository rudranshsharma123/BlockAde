import type { NextPage } from 'next'
import Head from "next/head";
import styles from "../styles/Home.module.css";
import Router, { useRouter } from "next/router";
import { CSSProperties } from "react";

const Home: NextPage = () => {
	const router = useRouter();
	const containerStyles: CSSProperties = {
		display: "flex",
		flexDirection: "column",
		alignItems: "left",
		width: "100%",
		backgroundSize: "cover",
		backgroundPosition: "center",
		padding: "5rem",
		lineHeight: "small",
	};
	const textStyles: CSSProperties = {
		color: "white",
		fontSize: "40px",
		fontWeight: 500,
		padding: "10px",
		border: "4px dashed white",
		width: "fit-content",
	};
	const textSubStyle: CSSProperties = {
		color: "white",
		fontSize: "25px",
		fontWeight: 500,
	};
	return (
		<div>
			<div style={{ background: "#353535" }}>
				<div style={containerStyles}>
					<p style={textStyles}>Welcome to Blockade</p>
					<p style={textSubStyle}>A gaming arcade on Blockchain</p>
					<p style={textSubStyle}>
						Play your Favorate games and Earn money while playing them!
					</p>
				</div>
			</div>
			<div style={{ background: "#DA4167" }}>
				<div style={containerStyles}>
					<p style={textStyles}>The Games We Currently offer{"->"}</p>
					<div style={{ display: "flex", justifyContent: "flex-start" }}>
						<button
							className={styles.button78}
							onClick={() => {
								router.push({ pathname: "/wordle" });
							}}>
							Wordle
						</button>
						<div style={{ width: "100px" }}></div>
						<button
							className={styles.button78}
							onClick={() => {
								router.push({ pathname: "/game" });
							}}>
							2048
						</button>
					</div>
				</div>
			</div>
			<div style={{ background: "#2EC4B6" }}>
				<div style={containerStyles}>
					<p style={textStyles}>How it works?</p>
					<p style={textSubStyle}>Choose you games from the ones we offer</p>
					<p style={textSubStyle}>
						Link up your wallet and play! If you win you earn!
					</p>
					<p style={textSubStyle}>
						You can also donate to us to help out our services
					</p>
				</div>
			</div>
		</div>
	);
};

export default Home;
{
	/* <button
				onClick={() => {
					router.push({ pathname: "/wordle" });
				}}>
				{" "}
				Let's Take you to Wordle
			</button>
			<button
				onClick={() => {
					router.push({ pathname: "/test" });
				}}>
				{" "}
				Let's Take you to Wordle
			</button> */
}