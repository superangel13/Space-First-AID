import React from 'react';
import {AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig} from 'remotion';

// Animaciones en bucle de los dispositivos médicos de a bordo, para la app Space First AID.
const FONDO = '#0B0F14';
const CIAN = '#5FD3F3';
const VERDE = '#34E39A';

const Pulso: React.FC<{x: number; y: number; color: string; delay?: number}> = ({x, y, color, delay = 0}) => {
	const f = useCurrentFrame();
	const t = ((f + delay) % 45) / 45;
	return <circle cx={x} cy={y} r={6 + t * 26} fill="none" stroke={color} strokeWidth={3} opacity={1 - t} />;
};

/* Actígrafo: reloj de muñeca que mide sueño, actividad y luz. */
export const Actigrafo: React.FC = () => {
	const f = useCurrentFrame();
	const barras = Array.from({length: 14}, (_, i) => 18 + 30 * Math.abs(Math.sin(i * 0.9 + f / 12)));
	const giro = interpolate(f, [0, 90], [0, 360]);
	return (
		<AbsoluteFill style={{background: FONDO}}>
			<svg viewBox="0 0 480 320" width="100%" height="100%">
				<rect x="200" y="20" width="80" height="60" rx="16" fill="#1B2430" />
				<rect x="200" y="240" width="80" height="60" rx="16" fill="#1B2430" />
				<rect x="150" y="70" width="180" height="180" rx="42" fill="#11161D" stroke={CIAN} strokeWidth={4} />
				<rect x="172" y="92" width="136" height="136" rx="28" fill="#05070A" />
				{barras.map((h, i) => <rect key={i} x={182 + i * 9} y={200 - h} width={6} height={h} rx={3} fill={i % 3 ? '#5B9DFF' : '#A28CFF'} />)}
				<path d="M240 112 a18 18 0 1 0 14 30 a14 14 0 1 1 -14 -30z" fill="#E6EBFF" transform={`rotate(${giro / 12} 240 128)`} />
				<Pulso x={330} y={90} color={VERDE} />
				<circle cx={330} cy={90} r={7} fill={VERDE} />
			</svg>
		</AbsoluteFill>
	);
};

/* Bio-Monitor: camiseta inteligente y banda que miden pulso, respiración, oxígeno, presión y temperatura. */
export const BioMonitor: React.FC = () => {
	const f = useCurrentFrame();
	const {durationInFrames} = useVideoConfig();
	const desplaza = (f / durationInFrames) * 200;
	const ecg = 'M0 0 L30 0 L36 -6 L42 0 L50 0 L55 18 L62 -60 L70 26 L76 0 L100 0';
	const resp = 1 + 0.04 * Math.sin(f / 8);
	return (
		<AbsoluteFill style={{background: FONDO}}>
			<svg viewBox="0 0 480 320" width="100%" height="100%">
				<g transform={`translate(240 170) scale(${resp}) translate(-240 -170)`}>
					<path d="M170 70 L210 50 Q240 72 270 50 L310 70 L345 120 L315 140 L305 120 L305 280 L175 280 L175 120 L165 140 L135 120 Z" fill="#11161D" stroke={CIAN} strokeWidth={4} strokeLinejoin="round" />
					<path d="M180 150 H300" stroke="#243041" strokeWidth={3} />
					<path d="M180 190 H300" stroke="#243041" strokeWidth={3} />
				</g>
				<g transform={`translate(${-desplaza} 0)`}>
					{[0, 1, 2, 3, 4].map(i => <path key={i} d={ecg} transform={`translate(${170 + i * 100} 175)`} fill="none" stroke="#FF6B7D" strokeWidth={4} strokeLinejoin="round" />)}
				</g>
				<rect x="0" y="0" width="170" height="320" fill={FONDO} />
				<rect x="310" y="0" width="170" height="320" fill={FONDO} />
				<path d="M170 70 L210 50 Q240 72 270 50 L310 70" fill="none" stroke={CIAN} strokeWidth={4} />
				<Pulso x={240} y={140} color="#FF6B7D" />
			</svg>
		</AbsoluteFill>
	);
};

/* Bio-Analyzer: analiza gotas de sangre, orina y saliva. */
export const BioAnalyzer: React.FC = () => {
	const f = useCurrentFrame();
	const gota = interpolate(f % 45, [0, 30, 45], [70, 150, 150]);
	const barra = interpolate(f, [0, 90], [0, 1]);
	return (
		<AbsoluteFill style={{background: FONDO}}>
			<svg viewBox="0 0 480 320" width="100%" height="100%">
				<rect x="120" y="120" width="240" height="150" rx="24" fill="#11161D" stroke={CIAN} strokeWidth={4} />
				<rect x="150" y="150" width="120" height="60" rx="10" fill="#05070A" />
				<rect x="160" y="190" width={100 * barra} height="10" rx="5" fill={VERDE} />
				<text x="165" y="178" fill="#8B96A6" fontSize="18" fontFamily="sans-serif" fontWeight={700}>ANALIZANDO</text>
				<rect x="290" y="150" width="44" height="90" rx="10" fill="#1B2430" />
				<rect x="300" y="160" width="24" height="70" rx="8" fill="#05070A" />
				<path d={`M312 ${gota - 20} q-12 18 0 26 q12 -8 0 -26z`} fill="#FF5468" opacity={gota < 150 ? 1 : 0} />
				<rect x="306" y="60" width="12" height="40" rx="5" fill="#8B96A6" />
				<Pulso x={180} y={245} color={VERDE} />
				<circle cx={180} cy={245} r={6} fill={VERDE} />
			</svg>
		</AbsoluteFill>
	);
};
