'use strict';

import {loadFromStorage, storeToStorage} from '../services/utils.service.js';

const STORAGE_KEY = 'Pacman_best_score';

export async function loadBestScore() {
    return await loadFromStorage(STORAGE_KEY);
}

export async function saveScore(score) {
    storeToStorage(STORAGE_KEY, score);
    return Promise.resolve();
}

export async function checkNewHighScore(score) {
    var prevBest = await loadBestScore();
    if (!prevBest) return true;
    return (score > prevBest.score);
}