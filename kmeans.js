// kmeans.js

const K_VALUE = 2;
const MAX_ITERATIONS = 1000;
const NUMBER_OF_POINTS = 50;

let centroids = new Array(K_VALUE);
let allData = new Array(NUMBER_OF_POINTS);

function initializeCentroids() {

    if (allData.length < 34) {
        throw new Error('Insufficient data for initializing centroids');
    }

    centroids[0] = allData[5];
    centroids[1] = allData[33];
}

function getDistance(index, centNum) {
    const point = allData[index];
    const centroid = centroids[centNum];

    const x = Math.pow(point.x - centroid.x, 2);
    const y = Math.pow(point.y - centroid.y, 2);
    const z = Math.pow(point.z - centroid.z, 2);

    return Math.sqrt(x + y + z);
}

function assignPoints() {
    let sums = Array(K_VALUE).fill().map(() => ({ x: 0, y: 0, z: 0, count: 0 }));

    for (let index = 0; index < NUMBER_OF_POINTS; index++) {
        let minDistance = Number.MAX_VALUE, closestCentroid = 0;

        for (let centNum = 0; centNum < K_VALUE; centNum++) {
            const distance = getDistance(index, centNum);
            if (distance < minDistance) {
                minDistance = distance;
                closestCentroid = centNum;
            }
        }

        allData[index].clusterId = closestCentroid;

        sums[closestCentroid].x += allData[index].x;
        sums[closestCentroid].y += allData[index].y;
        sums[closestCentroid].z += allData[index].z;
        sums[closestCentroid].count++;
    }

    let centroidsMoved = false;
    for (let i = 0; i < K_VALUE; i++) {
        if (sums[i].count > 0) {
            const newX = sums[i].x / sums[i].count;
            const newY = sums[i].y / sums[i].count;
            const newZ = sums[i].z / sums[i].count;

            if (newX !== centroids[i].x || newY !== centroids[i].y || newZ !== centroids[i].z) {
                centroids[i] = { x: newX, y: newY, z: newZ };
                centroidsMoved = true;
            }
        }
    }

    return !centroidsMoved;
}

function kmeans(data) {
    allData = data; // Assuming data is an array of {x, y, z} objects
    console.log("kmeans loaded data is: ", data);
    allData = data.map(d => ({ x: parseFloat(d.A), y: parseFloat(d.B), z: parseFloat(d.C) }));
    console.log("kmeans transformed data is: ", data);

    initializeCentroids();

    let done = false;
    let iterations = 0;

    while (!done && iterations < MAX_ITERATIONS) {
        done = assignPoints();
        iterations++;
    }

    const outputData = allData.map(point => ({
        ID: point.ID,
        X: point.x,
        Y: point.y,
        Z: point.z,
        Class: point.clusterId
    }));

    return { centroids, data: allData, iterations };
}

module.exports = kmeans;

