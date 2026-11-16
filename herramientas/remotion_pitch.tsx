import React from 'react';
import {AbsoluteFill, Audio, Easing, Img, interpolate, random, Sequence, spring, staticFile, useCurrentFrame, useVideoConfig} from 'remotion';
import {loadFont} from '@remotion/google-fonts/Sora';
import {Mark} from './Mark';

const {fontFamily} = loadFont('normal', {weights: ['400', '600', '700'], subsets: ['latin']});

const BG = '#05070A';
const INK = '#F2F5F8';
const ACCENT = '#34E39A';
const RED = '#FF5468';
const MUTED = '#8B96A6';

export const PITCH_FRAMES = 830;

/* Escenas sincronizadas con las pausas de la voz (30 fps). */
type Escena = {
	desde: number;
	hasta: number;
	img: string;
	foco: [number, number];
	zoom: number;
	etiqueta: string;
	titulo: string;
	sub?: string;
	chips?: string[];
	color?: string;
	toque?: boolean;
};

const ESCENAS: Escena[] = [
	{desde: 78, hasta: 172, img: '12-sin-senal', foco: [0.5, 0.32], zoom: 1.45, etiqueta: '100 % OFFLINE', titulo: 'Works inside the spacecraft', sub: 'No signal from Earth? Everything keeps running and is saved on board.'},
	{desde: 172, hasta: 221, img: '03-vitales', foco: [0.42, 0.3], zoom: 1.7, etiqueta: 'MONITORS', titulo: 'Vital signs', sub: 'Pulse · oxygen · pressure · temperature · breathing'},
	{desde: 221, hasta: 285, img: '05-cuerpo', foco: [0.42, 0.52], zoom: 1.45, etiqueta: 'MONITORS', titulo: 'Symptoms each astronaut reports'},
	{desde: 285, hasta: 342, img: '06-dispositivos', foco: [0.56, 0.3], zoom: 1.4, etiqueta: 'MEDICAL DEVICES', titulo: 'Data from onboard devices', chips: ['Actigraph', 'Bio-Monitor', 'Bio-Analyzer']},
	{desde: 342, hasta: 400, img: '04-tripulacion', foco: [0.5, 0.38], zoom: 1.3, etiqueta: 'EARLY DETECTION', titulo: 'Catches health problems early', sub: '10 spaceflight problems · 6 body systems scored 0–100'},
	{desde: 400, hasta: 444, img: '07-emergencia', foco: [0.5, 0.45], zoom: 1.35, etiqueta: 'EMERGENCY', titulo: 'Step-by-step emergency protocols', color: RED},
	{desde: 444, hasta: 491, img: '08-accidente', foco: [0.5, 0.42], zoom: 1.35, etiqueta: 'ACCIDENTS', titulo: 'Accident protocols from NASA risks', color: RED},
	{desde: 491, hasta: 540, img: '09-mision', foco: [0.45, 0.45], zoom: 1.3, etiqueta: 'DYNAMIC INTERFACE', titulo: 'Visual, simple, made for astronauts', sub: 'Gravity · radiation · distance to Earth'},
	{desde: 540, hasta: 594, img: '10-orbita', foco: [0.5, 0.5], zoom: 1.3, etiqueta: 'GAMES THAT MEASURE', titulo: 'Attention, coordination and vision', chips: ['Orbit · PVT', 'Hand–eye', 'Vision test']},
	{desde: 594, hasta: 713, img: '01-panel', foco: [0.41, 0.42], zoom: 1.5, etiqueta: '3D DIGITAL TWIN', titulo: 'Tap the body to report symptoms', toque: true},
	{desde: 713, hasta: 789, img: '02-persona', foco: [0.45, 0.42], zoom: 1.3, etiqueta: 'CROSS-CHECK', titulo: 'Cross-checked with vital signs', sub: 'Some indicators → alert · all → emergency'},
];

const Estrellas: React.FC = () => {
	const frame = useCurrentFrame();
	return (
		<AbsoluteFill>
			{new Array(110).fill(0).map((_, i) => {
				const r = random(`r${i}`) * 1.8 + 0.4;
				return (
					<div
						key={i}
						style={{
							position: 'absolute',
							left: `${random(`x${i}`) * 100}%`,
							top: `${(random(`y${i}`) * 100 + frame * (random(`d${i}`) * 0.05 + 0.01)) % 100}%`,
							width: r * 2,
							height: r * 2,
							borderRadius: '50%',
							background: INK,
							opacity: 0.25 + 0.5 * Math.abs(Math.sin(frame / 25 + random(`t${i}`) * 6)),
						}}
					/>
				);
			})}
		</AbsoluteFill>
	);
};

/* Ventana con la captura: entra con giro, se acerca al foco (Ken Burns) y sale. */
const Ventana: React.FC<{e: Escena; dur: number}> = ({e, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const ent = spring({frame, fps, config: {damping: 200}, durationInFrames: 14});
	const sal = interpolate(frame, [dur - 7, dur], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const zoom = interpolate(frame, [0, dur], [1.04, e.zoom], {easing: Easing.inOut(Easing.cubic), extrapolateRight: 'clamp'});
	const color = e.color || ACCENT;
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', perspective: 1800}}>
			<div
				style={{
					width: 1600,
					height: 900,
					marginTop: -40,
					borderRadius: 26,
					overflow: 'hidden',
					position: 'relative',
					border: `1.5px solid ${color}55`,
					boxShadow: `0 40px 120px rgba(0,0,0,.7), 0 0 80px ${color}22`,
					transform: `translateY(${(1 - ent) * 60 - sal * 30}px) rotateX(${(1 - ent) * 10}deg) scale(${0.94 + ent * 0.06 - sal * 0.03})`,
					opacity: Math.min(ent, 1 - sal),
				}}
			>
				<Img
					src={staticFile(`pitch/${e.img}.png`)}
					style={{
						width: '100%',
						height: '100%',
						objectFit: 'cover',
						transformOrigin: `${e.foco[0] * 100}% ${e.foco[1] * 100}%`,
						transform: `scale(${zoom})`,
					}}
				/>
				{e.toque && <Toque frame={frame} x={e.foco[0] * 1600} y={e.foco[1] * 900} />}
				<div style={{position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(5,7,10,0) 55%, rgba(5,7,10,.92) 100%)'}} />
			</div>
		</AbsoluteFill>
	);
};

/* Toques sobre el gemelo digital: ondas y un cursor. */
const Toque: React.FC<{frame: number; x: number; y: number}> = ({frame, x, y}) => {
	const toques = [20, 55, 90];
	return (
		<>
			{toques.map(t => {
				const p = interpolate(frame, [t, t + 22], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
				if (p <= 0 || p >= 1) return null;
				return (
					<div
						key={t}
						style={{
							position: 'absolute',
							left: x - 60,
							top: y - 60,
							width: 120,
							height: 120,
							borderRadius: '50%',
							border: `4px solid ${ACCENT}`,
							transform: `scale(${0.3 + p * 1.4})`,
							opacity: 1 - p,
						}}
					/>
				);
			})}
			<div
				style={{
					position: 'absolute',
					left: x - 18,
					top: y - 18,
					width: 36,
					height: 36,
					borderRadius: '50%',
					background: `${ACCENT}`,
					boxShadow: `0 0 30px ${ACCENT}`,
					opacity: interpolate(frame, [10, 18], [0, 0.9], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'}),
					transform: `scale(${1 - 0.25 * Math.max(0, Math.sin(((frame - 20) / 35) * Math.PI * 2))})`,
				}}
			/>
		</>
	);
};

/* Texto de cada escena: etiqueta, título palabra por palabra, subtítulo y chips. */
const Texto: React.FC<{e: Escena; dur: number}> = ({e, dur}) => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const color = e.color || ACCENT;
	const sal = interpolate(frame, [dur - 6, dur], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const chip = spring({frame: frame - 3, fps, config: {damping: 14, stiffness: 160}});
	const palabras = e.titulo.split(' ');
	return (
		<AbsoluteFill style={{justifyContent: 'flex-end', padding: '0 0 96px 200px', opacity: sal, fontFamily}}>
			<div style={{display: 'flex', alignItems: 'center', gap: 14, marginBottom: 16, transform: `scale(${chip})`, transformOrigin: 'left center'}}>
				<span style={{width: 12, height: 12, borderRadius: 6, background: color, boxShadow: `0 0 18px ${color}`}} />
				<span style={{color, fontSize: 24, fontWeight: 700, letterSpacing: 4}}>{e.etiqueta}</span>
			</div>
			<div style={{display: 'flex', flexWrap: 'wrap', gap: '0 18px', maxWidth: 1450}}>
				{palabras.map((p, i) => {
					const s = spring({frame: frame - 6 - i * 2.5, fps, config: {damping: 200}, durationInFrames: 12});
					return (
						<span key={i} style={{color: INK, fontSize: 74, fontWeight: 700, lineHeight: 1.08, letterSpacing: -1.5, transform: `translateY(${(1 - s) * 40}px)`, opacity: s, textShadow: '0 6px 30px rgba(0,0,0,.6)'}}>
							{p}
						</span>
					);
				})}
			</div>
			{e.sub && (
				<div style={{color: '#C9D2DD', fontSize: 30, fontWeight: 400, marginTop: 14, opacity: interpolate(frame, [14, 24], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'})}}>
					{e.sub}
				</div>
			)}
			{e.chips && (
				<div style={{display: 'flex', gap: 14, marginTop: 18}}>
					{e.chips.map((c, i) => {
						const s = spring({frame: frame - 12 - i * 5, fps, config: {damping: 12, stiffness: 170}});
						return (
							<span key={c} style={{padding: '10px 22px', borderRadius: 999, background: `${color}22`, border: `1.5px solid ${color}`, color: INK, fontSize: 28, fontWeight: 600, transform: `scale(${s})`}}>
								{c}
							</span>
						);
					})}
				</div>
			)}
		</AbsoluteFill>
	);
};

/* Inicio: marca + nombre. */
const Inicio: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const pRing = interpolate(frame, [0, 26], [0, 1], {extrapolateRight: 'clamp', easing: Easing.out(Easing.cubic)});
	const pPulse = interpolate(frame, [10, 36], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const t = spring({frame: frame - 18, fps, config: {damping: 200}});
	const s = interpolate(frame, [32, 44], [0, 1], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	const sal = interpolate(frame, [70, 78], [1, 0], {extrapolateLeft: 'clamp', extrapolateRight: 'clamp'});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily, opacity: sal}}>
			<Mark size={250} pRing={pRing} pPulse={pPulse} pSat={pPulse} glow={0.6} />
			<div style={{marginTop: 26, fontSize: 104, fontWeight: 700, letterSpacing: 2, color: INK, opacity: t, transform: `translateY(${(1 - t) * 30}px)`}}>
				SPACE FIRST <span style={{color: ACCENT}}>AID</span>
			</div>
			<div style={{marginTop: 12, fontSize: 36, color: MUTED, opacity: s, letterSpacing: 1}}>First-aid assistant for astronauts · fully offline</div>
		</AbsoluteFill>
	);
};

/* Cierre. */
const Cierre: React.FC = () => {
	const frame = useCurrentFrame();
	const {fps} = useVideoConfig();
	const e = spring({frame, fps, config: {damping: 200}, durationInFrames: 14});
	return (
		<AbsoluteFill style={{alignItems: 'center', justifyContent: 'center', fontFamily, opacity: e}}>
			<Mark size={170} glow={0.7} />
			<div style={{marginTop: 18, fontSize: 84, fontWeight: 700, color: INK, letterSpacing: 2}}>
				SPACE FIRST <span style={{color: ACCENT}}>AID</span>
			</div>
			<div style={{marginTop: 10, fontSize: 32, color: '#C9D2DD'}}>Offline medical support for deep-space crews</div>
			<div style={{marginTop: 22, display: 'flex', gap: 14}}>
				{['NASA Space Apps Challenge 2026', 'English · Español', 'Windows · macOS · Linux'].map(c => (
					<span key={c} style={{padding: '9px 20px', borderRadius: 999, border: `1.5px solid ${ACCENT}88`, color: INK, fontSize: 24, fontWeight: 600}}>{c}</span>
				))}
			</div>
		</AbsoluteFill>
	);
};

export const Pitch: React.FC = () => {
	const frame = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	return (
		<AbsoluteFill style={{background: `radial-gradient(120% 80% at 50% 0%, #0D1B2A 0%, ${BG} 60%)`}}>
			<Estrellas />
			<Audio src={staticFile('pitch/voz.mp3')} />
			<Sequence durationInFrames={78}>
				<Inicio />
			</Sequence>
			{ESCENAS.map(e => (
				<Sequence key={e.img} from={e.desde} durationInFrames={e.hasta - e.desde}>
					<Ventana e={e} dur={e.hasta - e.desde} />
					<Texto e={e} dur={e.hasta - e.desde} />
				</Sequence>
			))}
			<Sequence from={789}>
				<Cierre />
			</Sequence>
			{/* Barra de progreso */}
			<div style={{position: 'absolute', left: 0, bottom: 0, height: 6, width: `${(frame / durationInFrames) * 100}%`, background: ACCENT, boxShadow: `0 0 16px ${ACCENT}`}} />
		</AbsoluteFill>
	);
};
