let width: number = 10;
let height: number = 10;
let data: Uint32Array = new Uint32Array(width * height);
let nextData: Uint32Array = new Uint32Array(width * height);

// rgba little-endian
const DEAD: number = 0xFFFFFFFF;
const ALIVE: number = 0xFFFF9600;

export function resize(width_: number, height_: number): void {
    assertTrue(width > 0, `width must be greater than 0 but was ${width}`);
    assertTrue(height > 0, `height must be greater than 0 but was ${height}`);

    if (width === width_ && height === height_) {
        return;
    }

    const oldWidth = width;
    const oldHeight = height;
    const oldData = data;

    width = width_;
    height = height_;
    data = new Uint32Array(width * height);
    nextData = new Uint32Array(width * height);

    for (let y: number = 0; y < height; y++) {
        for (let x: number = 0; x < width; x++) {
            const newIndex = index(x, y);

            if (y < oldHeight && x < oldWidth) {
                data[newIndex] = oldData[x + y * oldWidth];
            } else {
                data[newIndex] = DEAD;
            }
        }
    }
}

export function redraw(): Uint32Array {
    return data;
}

export function next(): Uint32Array {
    const newData = nextData;

    for (let y: number = 0; y < height; y++) {
        for (let x: number = 0; x < width; x++) {
            const livingNeighbors = countLivingNeighbors(x, y);
            const currentIndex = index(x, y);
            newData[currentIndex] = applyRules(data[currentIndex], livingNeighbors);
        }
    }

    nextData = data;
    data = newData;

    return data;
}

export function makeAlive(x: number, y: number): void {
    data[index(x, y)] = ALIVE;
}

function index(x: number, y: number): number {
    return x + y * width;
}

function isBetween(val: number, lower: number, higher: number): boolean {
    return val >= lower && val <= higher;
}

function applyRules(currentStatus: number, livingNeighbors: number): number {
    if (currentStatus === ALIVE && isBetween(livingNeighbors, 2, 3)) {
        return ALIVE;
    }

    if (currentStatus === DEAD && livingNeighbors === 3) {
        return ALIVE;
    }

    return DEAD;
}

function isAlive(x: number, y: number): boolean {
    return x < width && y < height && data[index(x, y)] === ALIVE;
}

function countLivingNeighbors(x: number, y: number): number {
    let livingNeighbors = 0;

    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            if ((i !== 0 || j !== 0) && isAlive(x + i, y + j)) livingNeighbors++;
        }
    }

    return livingNeighbors;
}

function assertTrue(condition: boolean, message: string): void {
    if (!condition) {
        throw new Error(message);
    }
}
