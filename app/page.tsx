'use client';

import {useState, useEffect, useCallback, useRef, ChangeEvent} from "react";
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
			}
		};

		setHeight(window.innerHeight);
		setWidth(window.innerWidth);
		fetchData();

	}, []);

	async function changeTheme(e:ChangeEvent<HTMLSelectElement>) {
		// If konami is working.
		setIsExploding(false);

		const audio = document.getElementById('audio') as HTMLAudioElement;
		audio.pause();

		const target = e.target as HTMLSelectElement;
		if (target) {
			setTheme(target.value);

			if (target.value == 'paris2024' || target.value == 'olympic') {
				Object.entries(data).map(([continent, medals]) => {

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
			setIsExploding(true);
			const audio = document.getElementById('audio') as HTMLAudioElement;
			audio.play();
			setTheme('paris2024 france');
		}
	}

	const medalsData = data as MedalsMap;

  return (
    <main className={theme} id="main">
			<Konami action={easterEgg}>
				<audio id="audio">
					<source src="/marseillaise.mp3" type="audio/mpeg" />
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

			<h1>Médailles olympiques par continent à Paris 2024</h1>

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
