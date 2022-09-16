import { color as d3color } from 'https://cdn.skypack.dev/d3-color@3?min';
import { linkHorizontal } from 'https://cdn.skypack.dev/d3-shape@3?min';
import {
    sankey as d3sankey,
    sankeyRight as d3sankeyRight,
} from 'https://cdn.skypack.dev/d3-sankey@0?min';

// import { color as d3color } from 'd3-color';
// import { linkHorizontal } from 'd3-shape';
// import { sankey as d3sankey, sankeyRight as d3sankeyRight } from 'd3-sankey';
import { FE, ID_JOIN } from './config.js';
import { parseToGraph } from './parser.js';
import './preview.js';

const createElementSVG = (tag) =>
    document.createElementNS('http://www.w3.org/2000/svg', tag);
const setAttributes = (el, attrs) => {
    for (const key in attrs) {
        el.setAttribute(key, attrs[key]);
    }
    return el;
};

export const draw = (wrapper) => {
    const originSVG = wrapper.querySelector('svg');
    const originFilter = originSVG.querySelector('filter');

    const graph = parseToGraph(originFilter);
    const data = {
        nodes: graph.nodes.map((item) => ({
            ...item,
            name: item.id,
            color: FE.ALL.get(item.id.split(ID_JOIN)[0]),
        })),
        links: graph.links.map((item) => ({
            ...item,
            value: 1,
        })),
    };

    const width = 1280;
    const height = 800;
    const padding = 2;
    const nodePadding = 24;
    const color = 'rgb(211,211,211)';
    const svg = createElementSVG('svg');
    setAttributes(svg, {
        xmlns: 'http://www.w3.org/2000/svg',
        viewBox: `0 0 ${width} ${height}`,
        width: '100%',
        class: 'graph',
    });

    const sankey = d3sankey()
        .nodeId((d) => d.id)
        .nodeAlign(d3sankeyRight)
        .nodeWidth(width / graph.maxLayer - nodePadding)
        .nodePadding(nodePadding)
        .extent([
            [padding, padding],
            [width - padding, height - padding],
        ]);

    const { nodes, links } = sankey({
        nodes: data.nodes.map((d) => Object.assign({}, d)),
        links: data.links.map((d) => Object.assign({}, d)),
    });

    const nodesDOM = nodes.reduce((memo, d) => {
        const g = createElementSVG('g');
        setAttributes(g, {
            class: 'node',
            id: `node-${d.id}`,
            'data-id': d.id,
            'data-related': d.targetLinks
                .map(({ index, source }) => `#link-${index},#node-${source.id}`)
                .join(','),
        });
        const rect = createElementSVG('rect');
        setAttributes(rect, {
            x: d.x0,
            y: d.y0,
            rx: 4,
            ry: 4,
            height: d.y1 - d.y0,
            width: d.x1 - d.x0,
            fill: '#FEFFFF',
            stroke: d3color(d.color) ?? 'black',
        });
        const foreignObject = createElementSVG('foreignObject');
        setAttributes(foreignObject, {
            x: d.x0 + 2,
            y: d.y0,
            height: d.y1 - d.y0,
            width: d.x1 - d.x0 - 4,
        });
        const preview = document.createElement('svg-preview');
        preview.update({ SVG: originSVG, id: d.name, graph });
        const text = createElementSVG('text');
        text.textContent = d.name.split(ID_JOIN)[0];
        setAttributes(text, {
            font: '10px sans-serif',
            fill: d.color,
            x: d.x1,
            y: d.y1,
            dx: '-0.35em',
            dy: '-0.35em',
            'text-anchor': 'end',
        });

        foreignObject.append(preview);
        g.append(rect);
        g.append(foreignObject);
        g.append(text);
        memo.append(g);
        return memo;
    }, setAttributes(createElementSVG('g'), { class: 'nodes' }));

    const linksDOM = links.reduce((memo, d) => {
        const stroke = d3color(d.target.color || color);
        stroke.opacity = 0.5;
        const g = createElementSVG('g');
        setAttributes(g, {
            class: 'link',
            id: `link-${d.index}`,
            // 'stroke-width': Math.max(1, d.width),
            stroke: stroke,
            'mix-blend-mode': 'multiply',
        });
        const path = createElementSVG('path');
        setAttributes(path, {
            d: linkHorizontal()
                .source(() => [d.source.x1, d.y0])
                .target(() => [d.target.x0, d.y1])(),
        });
        const title = createElementSVG('title');
        title.textContent = `${d.source.name} → ${d.target.name}`;
        g.append(title);
        g.append(path);
        memo.append(g);
        return memo;
    }, setAttributes(createElementSVG('g'), { class: 'links', fill: 'none' }));

    svg.append(nodesDOM);
    svg.append(linksDOM);

    nodesDOM.addEventListener(
        'mouseenter',
        (evt) => {
            if (evt.target === evt.currentTarget) {
                return;
            }
            const target = evt.target.closest('.node') ?? evt.target;
            svg.querySelectorAll('.node,.link').forEach((item) => {
                item.classList.remove('highlight');
                item.classList.add('fade');
            });
            target.classList.add('highlight');
            const related = target.dataset.related;
            if (related) {
                svg.querySelectorAll(related).forEach((item) =>
                    item.classList.add('highlight')
                );
            }
        },
        true
    );
    nodesDOM.addEventListener('mouseleave', (evt) => {
        svg.querySelectorAll('.node,.link').forEach((item) =>
            item.classList.remove('highlight', 'fade')
        );
    });
    nodesDOM.addEventListener('click', (evt) => {
        const target = evt.target.closest('.node');
        const ce = new Event('CLICK_NODE');
        ce.data = {
            SVG: originSVG,
            id: target.dataset.id,
            graph,
        };
        document.body.dispatchEvent(ce);
    });
    return svg;
};
