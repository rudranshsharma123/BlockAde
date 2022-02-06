// import games from "../components/game/cardgame";
// import MainScene from "../components/game/MainScene";
import App from "../components/2048/App";
// const handleClick = () => {
// 	const scene = games.scene.keys.MainScene;
// 	scene.scene.start("MainScene");
// };
export default function game() {
	return (
		<div>
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
			<App />
		
		</div>
	);
}
