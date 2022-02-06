import type { NextPage } from "next";
import Wordle from "../components/wordle/worlde";
import { withRouter, useRouter } from "next/router";
const WordlePage: NextPage = () => {
	const router = useRouter();
	return <Wordle puzzleWord="abbey" />;
};

export default WordlePage;
