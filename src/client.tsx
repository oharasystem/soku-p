import { hydrateRoot } from 'react-dom/client';
import { App } from './App';
import './styles/globals.css';

declare global {
    interface Window {
        __INITIAL_PATH__: string;
    }
}

const root = document.getElementById('root');

if (root) {
    hydrateRoot(
        root,
        <App path={window.__INITIAL_PATH__ || window.location.pathname} />
    );
}
