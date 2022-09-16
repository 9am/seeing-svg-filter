import { findRelatedSources } from './parser.js';

class SVGPreview extends HTMLElement {
    constructor(props) {
        super(props);
        this.attachShadow({ mode: 'open' });
    }

    update(option) {
        const svg = this.getPreview(option);
        this.shadowRoot.appendChild(svg);
    }

    getPreview({ SVG, id, graph }) {
        const svg = SVG.cloneNode(true);
        let html = svg.innerHTML;
        svg.dataset.id = id;
        let filter = svg.querySelector('filter');
        const prevID = filter.id;
        const nextID = `filter-${id}`;
        html = html
            .replace(new RegExp(`id="${prevID}"`, 'g'), `id="${nextID}"`)
            .replace(new RegExp(`url\\(#${prevID}\\)`, 'g'), `url(#${nextID})`);
        svg.innerHTML = html;
        filter = svg.querySelector('filter');
        const sources = [id, ...findRelatedSources(graph, id)];
        [...filter.children].forEach((fe) => {
            if (!sources.includes(fe.id)) {
                filter.removeChild(fe);
            }
        });
        const [topSource = {}] = sources.slice(-1);
        if (topSource === 'SourceAlpha') {
            const alpha = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'feColorMatrix'
            );
            alpha.setAttribute('in', 'SourceGraphic');
            alpha.setAttribute(
                'values',
                `
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 0 0
                0 0 0 1 0
            `
            );
            filter.prepend(alpha);
        }
        if (topSource === 'SourceGraphic') {
            const graphic = document.createElementNS(
                'http://www.w3.org/2000/svg',
                'feColorMatrix'
            );
            graphic.setAttribute('in', 'SourceGraphic');
            graphic.setAttribute(
                'values',
                `
                1 0 0 0 0
                0 1 0 0 0
                0 0 1 0 0
                0 0 0 1 0
            `
            );
            filter.prepend(graphic);
        }
        return svg;
    }
}

window.customElements.define('svg-preview', SVGPreview);
