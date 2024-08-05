'use client';

import {useState, useEffect, useRef, ChangeEvent} from "react";
import ReactDOM from 'react-dom'
import Konami from 'react-konami-code';
import '@/app/styles.scss';
import ConfettiExplosion from 'confetti-explosion-react';

interface Medal {
	gold: number;
	silver: number;
	bronze: number;
	total: number;
}

type MedalsMap = {
	[key: string]: Medal;
};

interface Position {
	position: string;
	sign: string;
}

type PositionsMap = {
	[key: string]: Position;
}

type ContinentsMap = {
	[key: string]: string;
}

export default function Home() {
	const [theme, setTheme] = useState('paris2024');
	const [data, setData] = useState({})
	const [isExploding, setIsExploding] = useState(false);
	const [height, setHeight] = useState(0);
	const [width, setWidth] = useState(0);
	const [title, setTitle] = useState('Médailles olympiques par continent à Paris 2024');
	const [franceMedals, setFranceMedals] = useState('44');
	const [soundUrl, setSoundUrl] = useState('');

	const audioElement = useRef<HTMLAudioElement>(null);

	const continents : ContinentsMap = {
		'EU': 'Europe',
		'AS': 'Asie',
		'AF': 'Afrique',
		'AM': 'Amérique',
		'OC': 'Océanie'
	}
	const position : PositionsMap = {
		'EU': {
			'position': 'top',
			'sign': '-'
		},
		'AF': {
			'position': 'top',
			'sign': '-'
		},
		'AM': {
			'position': 'top',
			'sign': '-'
		},
		'AS': {
			'position': 'bottom',
			'sign': '+'
		},
		'OC': {
			'position': 'bottom',
			'sign': '+'
		}
	}

	useEffect(() => {
		const fetchData = async () => {
			try {
				const response = await fetch('https://olympics.lucas-trebouet.fr/medals/continents');
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const result = await response.json();
				setData(result);
			} catch (error) {
				console.log(error);
			}
		};

		const fetchFranceMedals = async () => {
			try {
				const response = await fetch('https://olympics.lucas-trebouet.fr/medals/continents/countries');
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const result = await response.json();
				setFranceMedals(result.EU.FRA.total);
			} catch (error) {
				console.log(error);
			}
		};

		const fetchSoundUrl = async () => {
			try {
				const response = await fetch('https://olympics.lucas-trebouet.fr/sounds/france');
				if (!response.ok) {
					throw new Error('Network response was not ok');
				}
				const result = await response.json();
				setSoundUrl(result.preview);
			} catch (error) {
				console.log(error);
			}
		};

		setHeight(window.innerHeight);
		setWidth(window.innerWidth);
		fetchData();
		fetchFranceMedals();
		fetchSoundUrl();
	}, []);

	async function changeTheme(e:ChangeEvent<HTMLSelectElement>) {
		const target = e.target as HTMLSelectElement;
		if (target) {
			setTheme(target.value);

			if (target.value == 'paris2024' || target.value == 'olympic') {
				Object.entries(data).map(([continent, medals]) => {

					//@TODO : Find a better way to redraw page and replay CSS animation.
					try {
						let elm = document.getElementById(continent) as HTMLElement;
						let newone = elm.cloneNode(true);

						if (elm && elm.parentNode) {
							elm.parentNode.replaceChild(newone, elm);
						}

					} catch (e) {
						console.log(e);
					}
				});
			}
		}
	}

	const easterEgg = () => {
		if (theme == 'paris2024') {
			// Confettis.
			setIsExploding(true);

			// Play sound.
			if (audioElement.current) {
				audioElement.current.src = soundUrl;
				audioElement.current?.play();
			}
			setTheme('paris2024 france');
			setTitle(franceMedals + ' médailles françaises ! 🇫🇷');
		}
	}

	const medalsData = data as MedalsMap;

	ReactDOM.preload('/LM.png', { as: 'image' });
	ReactDOM.preload('/TEDDY.png', { as: 'image' });
	ReactDOM.preload('/CB.png', { as: 'image' });
	ReactDOM.preload('/PFP.png', { as: 'image' });
	ReactDOM.preload('/MAB.png', { as: 'image' });

	return (
    <main className={theme} id="main">
			<Konami
				action={easterEgg}
				code={[76, 69, 79, 78]}
				resetDelay={0}
			>
				<audio id="audio" ref={audioElement}>
				</audio>
			</Konami>

			<div className="explosion">
				{isExploding &&
						<ConfettiExplosion
								width={width}
								height={height}
								duration={10000}
								particleCount={150}
								force={0.4}
								colors={[
									'#e62737',
									'#e62737',
									'#002391',
									'#002391',
									'#FFFFFF'
								]}
						/>
				}
			</div>

			<h1>{title}</h1>

			<div className="theme">
				<label htmlFor="theme" className="sr-only">Choisir un thème</label>
				<select name="theme" id="theme" className="select" onChange={changeTheme}>
					<option value="paris2024">Thème Paris 2024</option>
					<option value="olympic">Thème Olympique</option>
					<option value="a11y">Version accessible</option>
				</select>
			</div>

			<div className="logo">
				{data && Object.entries(medalsData).map(([continent, medals]) => (
						<div
							key={continent}
							className={"ring " + continent.toLowerCase()}
							style={{
								borderWidth: (medals.total/40) + 'vh',
							}}
							id={continent}
						>
							<div
								className={"stats " + continent.toLowerCase()}
								style={{
									[position[continent].position]: position[continent].position === 'top' ? -((medals.total/40)+15) + 'vh' : -(37-(medals.total/40)) + 'vh',
								}}
							>
								<h2>{ continents[continent] } : <strong>{ medals.total }<span className="sr-only">&nbsp; médailles</span></strong></h2>
								<ul className="medals">
									<li className="medal gold">{ medals.gold }<span className="sr-only">&nbsp;médailles d&apos;or</span></li>
									<li className="medal silver">{ medals.silver }<span className="sr-only">&nbsp;médailles d&apos;argent</span></li>
									<li className="medal bronze">{ medals.bronze }<span className="sr-only">&nbsp;médailles de bronze</span></li>
								</ul>
							</div>
						</div>
				))}
			</div>
		</main>
  );
}
