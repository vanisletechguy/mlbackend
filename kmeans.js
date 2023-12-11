// kmeans.js
const K_VALUE = 2;
const MAX_ITERATIONS = 1000;

let centroids = new Array(K_VALUE);
let allData = [];

////////////////////////////////////////////////////////////////////////////////
// initializeCentroids
////////////////////////////////////////////////////////////////////////////////
function initializeCentroids(K) {

    if (allData.length < K) {
        throw new Error(`Insufficient data for initializing centroids, need at least ${K_VALUE}`);
    }

    centroids = []; // Reset centroids array
    // Select the first centroid randomly
    centroids.push(allData[Math.floor(Math.random() * allData.length)]);
    
    // Select subsequent centroids based on a weighted distribution
    for (let i = 1; i < K; i++) {
        centroids.push(selectNextCentroidBasedOnDistribution());
    }
}

function selectNextCentroidBasedOnDistribution() {
    let distanceWeights = allData.map(dataPoint => {
        let minDistance = centroids.reduce((min, centroid) => {
            let distance = Math.pow(dataPoint.x - centroid.x, 2) + 
                           Math.pow(dataPoint.y - centroid.y, 2) + 
                           Math.pow(dataPoint.z - centroid.z, 2);
            return Math.min(min, distance);
        }, Infinity);
        return minDistance;
    });

    let sumOfWeights = distanceWeights.reduce((sum, weight) => sum + weight, 0);
    let probabilities = distanceWeights.map(weight => weight / sumOfWeights);
    let cumulativeSum = 0;
    let cumulativeProbabilities = probabilities.map(p => cumulativeSum += p);

    // Randomly select the next centroid based on the weighted probabilities
    let random = Math.random();
    let nextCentroidIndex = cumulativeProbabilities.findIndex(cumulative => random < cumulative);
    return allData[nextCentroidIndex];
}

function calculateSilhouetteScore() {
    let silhouetteScores = allData.map((point, index) => {
        // Calculate a(i): Average distance from point to all other points in the same cluster
        let sameCluster = allData.filter(p => p.clusterId === point.clusterId && p !== point);
        let a_i = sameCluster.reduce((sum, p) => sum + getDistanceBetweenPoints(point, p), 0) / sameCluster.length;

        // Calculate b(i): Minimum average distance from point to points in other clusters
        let b_i = Number.MAX_VALUE;
        for (let i = 0; i < K_VALUE; i++) {
            if (i !== point.clusterId) {
                let otherCluster = allData.filter(p => p.clusterId === i);
                let averageDistanceToOtherCluster = otherCluster.reduce((sum, p) => sum + getDistanceBetweenPoints(point, p), 0) / otherCluster.length;
                b_i = Math.min(b_i, averageDistanceToOtherCluster);
            }
        }

        // Calculate the silhouette score for the point
        let s_i = (b_i - a_i) / Math.max(a_i, b_i);
        return s_i;
    });

    // Calculate the average silhouette score for the dataset
    let averageSilhouetteScore = silhouetteScores.reduce((sum, score) => sum + score, 0) / allData.length;
    return averageSilhouetteScore;
}

// Add this new helper function to calculate distance between two points
function getDistanceBetweenPoints(pointA, pointB) {
    const x = Math.pow(pointA.x - pointB.x, 2);
    const y = Math.pow(pointA.y - pointB.y, 2);
    const z = Math.pow(pointA.z - pointB.z, 2);
    return Math.sqrt(x + y + z);
}


////////////////////////////////////////////////////////////////////////////////
// getDistance
////////////////////////////////////////////////////////////////////////////////
function getDistance(index, centNum) {
    const point = allData[index];
    const centroid = centroids[centNum];

    const x = Math.pow(point.x - centroid.x, 2);
    const y = Math.pow(point.y - centroid.y, 2);
    const z = Math.pow(point.z - centroid.z, 2);

    return Math.sqrt(x + y + z);
}

////////////////////////////////////////////////////////////////////////////////
// assignPoints
////////////////////////////////////////////////////////////////////////////////

function assignPoints() {
    let sums = centroids.map(() => ({ x: 0, y: 0, z: 0, count: 0 }));

    allData.forEach(point => {
        let minDistance = Number.MAX_VALUE;
        let closestCentroidIndex = 0;

        centroids.forEach((centroid, centIndex) => {
            const distance = getDistanceBetweenPoints(point, centroid);
            if (distance < minDistance) {
                minDistance = distance;
                closestCentroidIndex = centIndex;
            }
        });

        point.clusterId = closestCentroidIndex;
        sums[closestCentroidIndex].x += point.x;
        sums[closestCentroidIndex].y += point.y;
        sums[closestCentroidIndex].z += point.z;
        sums[closestCentroidIndex].count++;
    });

    // Update centroids based on the new sums
    centroids = sums.map(sum => ({
        x: sum.count > 0 ? sum.x / sum.count : null,
        y: sum.count > 0 ? sum.y / sum.count : null,
        z: sum.count > 0 ? sum.z / sum.count : null
    })).filter(centroid => centroid.x !== null && centroid.y !== null && centroid.z !== null);

    return centroids.length === sums.length;
}
    
////////////////////////////////////////////////////////////////////////////////
// kmeans
////////////////////////////////////////////////////////////////////////////////
function kmeans(data, specificK, minK = 2, maxK = 5) {
    let startK = specificK !== undefined ? specificK : minK;
    let endK = specificK !== undefined ? specificK : maxK;
    let bestK = specificK || minK;
    let bestSilhouetteScore = -1;
    let bestClusteringResult = null;

    for (let K = startK; K <= endK; K++) {
        centroids = new Array(K);
        allData = data.map(d => ({ x: parseFloat(d.x), y: parseFloat(d.y), z: parseFloat(d.z) }));
        
        initializeCentroids(K);

        let done = false;
        let iterations = 0;

        while (!done && iterations < MAX_ITERATIONS) {
            done = assignPoints(); // assign each point a clusterId based on current centroids
            iterations++;
        }

        // Calculate silhouette score for the current clustering
        let silhouetteScore = calculateSilhouetteScore(); 

        // Compare silhouette scores and save the best clustering
        if (silhouetteScore > bestSilhouetteScore) {
            bestSilhouetteScore = silhouetteScore;
            bestK = K;
            bestClusteringResult = {
                centroids: centroids.map(centroid => ({ ...centroid })),
                data: allData.map(d => ({ ...d })),
                iterations: iterations,
                K: K,
                silhouetteScore: silhouetteScore
            };
        }
    }

    return bestClusteringResult;
}

module.exports = kmeans;

