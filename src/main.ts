import * as as from "../build/release.js";
import * as ts from "./nowasm";
import { fps } from "./fps.js";
import { GLIDER, GLIDER_GUN, PULSAR } from "./shapes.js";

const params = new URLSearchParams(location.search);
const { resize, makeAlive, next, redraw } = params.get('mode') === 'ts' ? ts : as;
const factor = parseInt(params.get('factor') ?? '5');

(document.getElementById('factor') as HTMLInputElement).value = `${factor}`;
(document.getElementById('as') as HTMLInputElement).checked = params.get('mode') !== 'ts';
(document.getElementById('ts') as HTMLInputElement).checked = params.get('mode') === 'ts';

const canvas = document.getElementById('canvas') as HTMLCanvasElement;
const ctx = canvas.getContext('2d')!;

enum State {
    AUTO,
    STEP,
}

let img: ImageData;
let width: number;
let height: number;
let state = State.AUTO;

const performResize = () => {
    const rect = canvas.getBoundingClientRect();
    width = Math.floor(rect.width / factor);
    height = Math.floor(rect.height / factor);

    canvas.width = width;
    canvas.height = height;

    img = ctx.createImageData(width, height);

    resize(width, height);
};

const performStep = () => {
    const data = next();

    img.data.set(new Uint8Array(data.buffer, 8));

    ctx.putImageData(img, 0, 0);
};

const animate = () => {
    performStep();

    fps.tick();

    if (state === State.AUTO) {
        requestAnimationFrame(animate);
    }
};

const makeShape = (shape: string, x: number, y: number) => {
    let dx = 0;
    let dy = 0;

    for (const ch of shape) {
        switch (ch) {
            case '1':
                makeAlive(x + dx++, y + dy);
                break;
            case '\n':
                dx = 0;
                dy++;
                break;
            default:
                dx++;
                break;
        }
    }
};

performResize();
requestAnimationFrame(animate);

window.addEventListener('resize', performResize);

canvas.addEventListener('pointermove', e => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.x) / factor);
    const y = Math.floor((e.clientY - rect.y) / factor);

    makeAlive(x, y);
});

canvas.addEventListener('mousedown', e => {
    const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    const x = Math.floor((e.clientX - rect.x) / factor);
    const y = Math.floor((e.clientY - rect.y) / factor);
    const size = Math.floor(Math.random() * 15) + 5;

    for (let i = -size; i < size; i++) {
        for (let j = -size; j < size; j++) {
            makeAlive(x + i, y + j);
        }
    }
});

const fpsElement = document.getElementById('fps') as HTMLElement;
const widthPixel = document.getElementById('widthPixel') as HTMLElement;
const heightPixel = document.getElementById('heightPixel') as HTMLElement;
const widthCell = document.getElementById('widthCell') as HTMLElement;
const heightCell = document.getElementById('heightCell') as HTMLElement;

setInterval(() => {
    fpsElement.innerText = `${fps.value}`;
    widthPixel.innerText = `${width * factor}`;
    heightPixel.innerText = `${height * factor}`;
    widthCell.innerText = `${width}`;
    heightCell.innerText = `${height}`;
}, 1000);

const shapeMaker = (shape: string, count = 20) => () => {
    for (let i = 0; i < count; i++) {
        const x = Math.floor(Math.random() * width);
        const y = Math.floor(Math.random() * height);

        makeShape(shape, x, y);
    }

    const data = redraw();
    img.data.set(new Uint8Array(data.buffer, 8));
    ctx.putImageData(img, 0, 0);
};

document.getElementById('gliders')!.addEventListener('click', shapeMaker(GLIDER));
document.getElementById('pulsars')!.addEventListener('click', shapeMaker(PULSAR));
document.getElementById('gliderGun')!.addEventListener('click', shapeMaker(GLIDER_GUN, 1));
document.getElementById('step')!.addEventListener('click', performStep);

document.getElementById('toggleAnimation')!.addEventListener('click', () => {
    state = state === State.AUTO ? State.STEP : State.AUTO;

    if (state === State.AUTO) {
        animate();
    }
});
