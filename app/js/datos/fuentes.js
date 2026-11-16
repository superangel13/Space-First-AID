'use strict';
/* ================= fuentes (verificadas) ================= */
const SRC={
  cdss:{t:'NASA ExMC · Arquitectura del sistema de apoyo a decisiones clínicas (CDSS), HRP-48032',u:'https://ntrs.nasa.gov/citations/20220017856',ev:'A',s:'CDSS de NASA'},
  eimo:{t:'NASA ExMC · Operaciones médicas independientes de la Tierra (EIMO): confianza de la tripulación y salud conductual',u:'https://ntrs.nasa.gov/citations/20240011658',ev:'A',s:'EIMO de NASA'},
  russell:{t:'NASA · Russell et al. 2023: valor de un CDSS; en Marte la comunicación tarda más de 20 minutos',u:'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC10284846/',ev:'A',s:'Russell 2023'},
  cog:{t:'NASA Standard Measures · batería Cognition (UPenn, financiada por NASA), incluye la PVT',u:'https://www.med.upenn.edu/uep/cognition.html',ev:'A',s:'Cognition de NASA'},
  pvtb:{t:'Basner, Mollicone y Dinges 2011 · Validación de la PVT-B: 3 min, intervalos de 1 a 4 s, lapso ≥ 355 ms, anticipación < 100 ms',u:'https://pubmed.ncbi.nlm.nih.gov/22025811/',ev:'A',s:'PVT-B 2011'},
  sleep:{t:'NASA Human Research Roadmap · Reporte de evidencia de sueño: 6.1 h promedio en la ISS (21 astronautas); la PVT es la prueba más sensible a la falta de sueño',u:'https://humanresearchroadmap.nasa.gov/evidence/reports/Sleep.pdf',ev:'A',s:'Sueño · NASA HRR'},
  under:{t:'National Academies para NASA · Safe Passage (2001): los astronautas tienden a no reportar síntomas',u:'https://www.nationalacademies.org/read/10218/chapter/8',ev:'B',s:'Safe Passage'},
  sanshw:{t:'NASA · Hardware y datos de SANS en la ISS: agudeza y Amsler los días 30, 90 y R-30 desde 2010; tonometría de la ESA',u:'https://ntrs.nasa.gov/citations/20180004916',ev:'A',s:'SANS en la ISS'},
  sansrep:{t:'NASA Human Research Roadmap · Reporte de evidencia SANS (2022)',u:'https://humanresearchroadmap.nasa.gov/evidence/reports/SANS%20EB%202022%20FINAL_8-15-22.pdf',ev:'A',s:'SANS · NASA HRR'},
  cancer:{t:'NASA Human Research Roadmap · Reporte de cáncer por radiación: límite de carrera de 600 mSv (NASA-STD-3001)',u:'https://humanresearchroadmap.nasa.gov/evidence/reports/HRP-ER-CANCER-SR-20260811.pdf',ev:'A',s:'Radiación · NASA HRR'},
  std:{t:'NASA-STD-3001 Vol. 1 Rev C · Norma de salud de la tripulación',u:'https://standards.nasa.gov/sites/default/files/standards/NASA/C//nasa-std-3001-vol-1-rev-c-signature.pdf',ev:'A',s:'NASA-STD-3001'},
  waiver:{t:'NASA OCHMO-MTB-002 · Condiciones médicas aprobadas con dispensa en astronautas',u:'https://www.nasa.gov/wp-content/uploads/2024/09/ochmo-mtb-002-waivered-health-conditions.pdf',ev:'A',s:'Dispensas NASA'},
  agha:{t:'NASA · Agha et al. 2020: condición física previa y reactivación viral en 22 astronautas de la ISS',u:'https://doi.org/10.1096/fj.201902327R',ev:'B',s:'Agha 2020'},
  zwart:{t:'NASA · Zwart et al. 2016: genotipo y vitaminas B se asocian con cambios oculares en 49 astronautas',u:'https://pubmed.ncbi.nlm.nih.gov/26316272/',ev:'B',s:'Zwart 2016'},
  sex:{t:'NASA/NSBRI 2014 · Impacto del sexo y el género en la adaptación al espacio',u:'https://pmc.ncbi.nlm.nih.gov/articles/PMC4235984/',ev:'B',s:'Sexo y género 2014'},
  clot:{t:'NASA · Auñón-Chancellor et al. 2020: trombosis venosa yugular durante el vuelo espacial',u:'https://doi.org/10.1056/NEJMc1905875',ev:'B',s:'Trombosis 2020'},
  kidney:{t:'NASA NTRS · Cálculos renales en astronautas',u:'https://ntrs.nasa.gov/citations/20150020958',ev:'B',s:'Riñón NTRS'},
  af:{t:'NASA · Khine et al. 2018: cambios auriculares tras 6 meses en la ISS',u:'https://pubmed.ncbi.nlm.nih.gov/29752376/',ev:'B',s:'Khine 2018'},
  osteo:{t:'NASA Human Research Roadmap · Reporte de evidencia de osteoporosis: pérdida de densidad ósea de 1 a 1.5 % por mes en misiones largas',u:'https://humanresearchroadmap.nasa.gov/evidence/reports/Osteo.pdf',ev:'A',s:'Hueso · NASA HRR'},
  msl:{t:'NASA · Zeitlin et al. 2013 (rover Curiosity): 0.66 Sv en un viaje redondo a Marte, cerca de 1.8 mSv por día en el espacio profundo',u:'https://pubmed.ncbi.nlm.nih.gov/23723233/',ev:'A',s:'Curiosity RAD 2013'},
  concordia:{t:'ESA · Estudios de aislamiento en la estación Concordia (Antártida)',u:'https://www.esa.int/Science_Exploration/Human_and_Robotic_Exploration/Exploration/Isolation_studies_in_Antarctica',ev:'B',s:'ESA Concordia'},
};
const sLink=k=>`<a href="${SRC[k].u}" target="_blank" rel="noopener">${esc(SRC[k].s)}</a>`;

