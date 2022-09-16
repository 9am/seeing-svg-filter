const source = new Map([
    ['SourceGraphic', ''],
    ['SourceAlpha', ''],
    ['BackgroundImage', ''],
    ['BackgroundAlpha', ''],
    ['FillPaint', ''],
    ['StrokePaint', ''],
]);
const withMerge = new Map([['feMerge', 'yellowgreen']]);
const noSource = new Map([
    ['feImage', 'orange'],
    ['feTurbulence', 'drakorange'],
    ['feFlood', 'orangered'],
]);
const withInput2 = new Map([
    ['feBlend', 'blueviolet'],
    ['feComposite', 'royalblue'],
    ['feDisplacementMap', 'darkslateblue'],
]);
const withInput = new Map([
    ...withInput2,
    ['feColorMatrix', 'blue'],
    ['feComponentTransfer', 'steelblue'],
    ['feConvolveMatrix', 'slateblue'],
    ['feDiffuseLighting', 'skyblue'],
    ['feSpecularLighting', 'lightblue'],
    ['feDropShadow', 'powderblue'],
    ['feGaussianBlur', 'midnightblue'],
    ['feMergeNode', 'drakblue'],
    ['feMorphology', 'dodgerblue'],
    ['feOffset', 'cadetblue'],
    ['feTile', 'cornflowerblue'],
]);

export const FE = {
    SOURCE: source,
    WITH_MERGE: withMerge,
    NO_SOURCE: noSource,
    WITH_INPUT: withInput,
    WITH_INPUT2: withInput2,
    ALL: new Map([...source, ...withMerge, ...noSource, ...withInput]),
};

export const LINK_JOIN = '->';
export const ID_JOIN = '--';
