import { draw } from './painter.js';
import { parseToGraph } from './parser.js';

const app = document.querySelector('.app');
const parseBtn = document.querySelector('#svg-parse');
const textarea = document.querySelector('#svg-text');
const svgInput = document.querySelector('#svg-input');
const dropzone = document.querySelector('#svg-dropzone');
const detailPreview = document.querySelector('.detail-preview');
const detailFilter = document.querySelector('.detail-filter');
const output = document.querySelector('.output');
const logo = document.querySelector('.logo');

textarea.value = logo.outerHTML;

const readFileAync = async (file) =>
    new Promise((resolve, reject) => {
        if (!file) {
            reject('no file!');
        }
        const reader = new FileReader();
        reader.addEventListener('load', () => {
            resolve(reader.result);
        });
        reader.addEventListener('error', (err) => {
            reject(err);
        });
        reader.readAsText(file);
    });

parseBtn.addEventListener('click', () => {
    //reset
    detailPreview.innerHTML = '';
    detailFilter.innerHTML = '';
    output.innerHTML = '';
    const div = document.createElement('div');
    div.innerHTML = textarea.value;
    const sankey = draw(div);
    output.appendChild(sankey);
    app.classList.toggle('parsed', true);
});

svgInput.addEventListener('change', async (evt) => {
    const [file] = evt.currentTarget.files;
    const fileContent = await readFileAync(file);
    textarea.value = fileContent;
});

dropzone.addEventListener('dragover', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
});
dropzone.addEventListener('dragenter', (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    evt.currentTarget.classList.add('active');
});
dropzone.addEventListener('dragleave', (evt) => {
    if (evt.currentTarget.contains(evt.relatedTarget)) {
        return;
    }
    evt.stopPropagation();
    evt.preventDefault();
    evt.currentTarget.classList.remove('active');
});

dropzone.addEventListener('drop', async (evt) => {
    evt.stopPropagation();
    evt.preventDefault();
    evt.currentTarget.classList.remove('active');
    const [file] = evt.dataTransfer.files;
    const fileContent = await readFileAync(file);
    textarea.value = fileContent;
});

document.body.addEventListener('CLICK_NODE', async (evt) => {
    detailPreview.innerHTML = '';
    detailFilter.innerHTML = '';
    const { data } = evt;
    const preview = document.createElement('svg-preview');
    preview.update(data);
    detailPreview.appendChild(preview);
    const svgCode = data.SVG.querySelector(`#${data.id}`)?.outerHTML;
    if (!svgCode) {
        return;
    }
    try {
        const { default: prettier } = await import(
            'https://cdn.skypack.dev/prettier@2.7.1/esm/standalone.mjs?min'
        );
        const { default: parserHtml } = await import(
            'https://cdn.skypack.dev/prettier@2.7.1/esm/parser-html.mjs?min'
        );
        const formatted = prettier.format(svgCode, {
            parser: 'html',
            plugins: [parserHtml],
        });
        detailFilter.textContent = formatted;
    } catch (err) {}
});
