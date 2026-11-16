// Punto de entrada de la pantalla (React).
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// Los estilos son los mismos de la versión web, para que se vea idéntico.
import '../../app/css/estilos.css';
import '../../app/css/secciones.css';

createRoot(document.getElementById('root')).render(<App />);
