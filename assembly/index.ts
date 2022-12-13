let width: u32 = 10;
let height: u32 = 10;
let data: Uint32Array = new Uint32Array(width * height);
let nextData: Uint32Array = new Uint32Array(width * height);

const DEAD: u32 = 0xFFFFFFFF;
const ALIVE: u32 = 0x000000FF;

export function resize(width_: u32, height_: u32): void {
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

    for (let y: u32 = 0; y < height; y++) {
        for (let x: u32 = 0; x < width; x++) {
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

    for (let y: u32 = 0; y < height; y++) {
        for (let x: u32 = 0; x < width; x++) {
            const livingNeighbors = countLivingNeighbors(x, y);
            const currentIndex = index(x, y);
            newData[currentIndex] = applyRules(data[currentIndex], livingNeighbors);
        }
    }

    nextData = data;
    data = newData;

    return data;
}

export function makeAlive(x: u32, y: u32): void {
    data[index(x, y)] = ALIVE;
}

@inline function index(x: u32, y: u32): u32 {
    return x + y * width;
}

@inline function isBetween(val: i32, lower: i32, higher: i32): bool {
    return val >= lower && val <= higher;
}

function applyRules(currentStatus: u32, livingNeighbors: u32): u32 {
    if (currentStatus === ALIVE && isBetween(livingNeighbors, 2, 3)) {
        return ALIVE;
    }

    if (currentStatus === DEAD && livingNeighbors === 3) {
        return ALIVE;
    }

    return DEAD;
}

@inline function isAlive(x: u32, y: u32): bool {
    return x < width && y < height && data[index(x, y)] === ALIVE;
}

function countLivingNeighbors(x: u32, y: u32): i32 {
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
