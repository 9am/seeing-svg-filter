import { FE, LINK_JOIN, ID_JOIN } from './config.js';

export const findRelatedSources = (graph, id) => {
    if (!graph.sourceMap.has(id)) {
        return [id];
    }
    return [
        ...new Set([
            ...graph.sourceMap.get(id),
            ...graph.sourceMap
                .get(id)
                .flatMap((source) => findRelatedSources(graph, source)),
        ]),
    ];
};

export const parseToGraph = (filter) => {
    // ['feName']
    const nodesArr = [...FE.SOURCE].map(([feName]) => feName);
    // ['source->target']
    const linkSet = new Set();
    const list = [...filter.children];
    const len = list.length;
    for (let i = 0; i < len; i += 1) {
        const node = list[i];
        node.id = `${node.tagName}${ID_JOIN}${i}`;
        nodesArr.push(node.id);
        getLinks(node, filter).forEach((link) => {
            if (link) {
                linkSet.add(link);
            }
        });
    }
    // [[source, target]]
    const linkTuple = [...linkSet].map((link) => link.split(LINK_JOIN));
    // [id]
    const linkNodeSet = new Set(linkTuple.flatMap((item) => item));
    // [{ id }]
    const nodes = nodesArr.filter((id) => linkNodeSet.has(id)).map((id) => ({ id }));
    // [{ source, target }]
    const links = linkTuple.map(([source, target]) => ({ source, target }));
    // { target: [...sources] }
    const sourceMap = linkTuple.reduce((memo, [source, target]) => {
        memo.set(target, memo.has(target) ? [...memo.get(target), source] : [source]);
        return memo;
    }, new Map());
    const maxLayer = getLayer(list.at(-1)?.id, sourceMap);
    return { nodes, links, linkSet, sourceMap, maxLayer };
};

const getLinks = (node, container) => {
    if (FE.NO_SOURCE.has(node.tagName)) {
        return [null];
    }
    if (FE.WITH_MERGE.has(node.tagName)) {
        return [...node.children].map((child) => {
            const inStr = child.getAttribute('in');
            const source = container.querySelector(`[result="${inStr}"]`);
            return `${source?.id ?? inStr}${LINK_JOIN}${node.id}`;
        });
    }
    if (FE.WITH_INPUT.has(node.tagName)) {
        const ins = [
            getInputs(node, 'in'),
            FE.WITH_INPUT2.has(node.tagName) ? getInputs(node, 'in2') : null,
        ].filter((item) => item !== undefined && item !== null);
        return ins.map((inStr) => {
            const source = container.querySelector(`[result="${inStr}"]`);
            return `${source?.id ?? inStr}${LINK_JOIN}${node.id}`;
        });
    }
    throw new Error(`no links found ${node.id}`);
    return [node];
};

const getInputs = (node, attr = 'in') => {
    const val = node.getAttribute(attr);
    if (val) {
        return val;
    }
    if (node.isSameNode(node.parentNode.firstElementChild)) {
        return 'SourceGraphic';
    }
    const children = [...node.parentNode.children];
    let index = children.findIndex((item) => item.isSameNode(node));
    return children[index - 1].id;
};

const getLayer = (node, sourceMap) => {
    if (!sourceMap.has(node)) {
        return 1;
    }
    const sourceLayers = sourceMap.get(node).map((source) => getLayer(source, sourceMap));
    return Math.max.apply(null, sourceLayers) + 1;
};
