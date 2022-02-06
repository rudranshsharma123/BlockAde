// function prev(){
// return (
// 		<div className={styles.wordle}>
// 			{submittedGuess.map((guess, index) => {
// 				if (index > 5) return null;

// 				return (
// 					<div className={styles.word}>
// 						{Array.from({ length: 5 }).map((_, i) => {
// 							return (
// 								<>
// 									<br></br>
// 									<span key={i} className={styles.char}>
// 										{guess.length > 0 ? guess[i] : ""}
// 									</span>
// 									<br></br>
// 								</>
// 							);
// 						})}
// 					</div>
// 				);
// 			})}
// }

// function cur(){
// 	<div className={styles.word}>
// 				{Array.from({ length: 5 }).map((_, i) => {
// 					if (submittedGuess.length > 5) {
// 						return <span></span>;
// 					} else {
// 						return (
// 							<>
// 								<br></br>
// 								<span key={i} className={styles.char}>
// 									{guess.length > 0 && submittedGuess.length <= 5
// 										? guess[i]
// 										: ""}
// 								</span>
// 							</>
// 						);
// 					}
// 				})}
// 	</div>
// }

// function empty(){

// 			{Array.from({ length: 5 - submittedGuess.length }).map((_, j) => {
// 				return (
// 					<>
// 						<div className={styles.word} key={j}>
// 							{Array.from({ length: 5 }).map((_, i) => {
// 								return <span key={i} className={styles.char}></span>;
// 							})}
// 						</div>
// 					</>
// 				);
// 			})}

// }

export default function hello() {
	return (
		<div>
			<h1>Hello</h1>
		</div>
	);
}
