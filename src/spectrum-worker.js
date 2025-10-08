// Web Worker for FFT Spectrum Analysis
// 处理重计算任务，避免阻塞主线程

// 频谱分析相关变量
let fftSize = 2048;
let sampleRate = 44100;
let frequencyBins = fftSize / 2;

// 频段定义
const FREQUENCY_BANDS = {
    LOW: { start: 0, end: 0.1 },      // 0-10% (0-440Hz)
    MID_LOW: { start: 0.1, end: 0.3 }, // 10-30% (440-1320Hz)
    MID: { start: 0.3, end: 0.6 },     // 30-60% (1320-2640Hz)
    MID_HIGH: { start: 0.6, end: 0.8 }, // 60-80% (2640-3520Hz)
    HIGH: { start: 0.8, end: 1.0 }     // 80-100% (3520-22050Hz)
};

// Beat检测相关
let lastBeatTime = 0;
let beatThreshold = 188; // -4.5 dBFS 对应约 188/255
let beatCooldown = 25; // 25ms冷却时间

// 重Beat检测相关
let heavyBeatBuffer = [];
let lastHeavyBeatTime = 0;
let heavyBeatCooldown = 120; // 120ms冷却时间

// 频谱数据缓存
let spectrumData = null;
let lastProcessTime = 0;

// 监听主线程消息
self.onmessage = function(e) {
    const { type, data } = e.data;
    
    switch (type) {
        case 'init':
            initWorker(data);
            break;
        case 'spectrumData':
            processSpectrumData(data);
            break;
        case 'config':
            updateConfig(data);
            break;
        case 'stop':
            stopWorker();
            break;
    }
};

// 初始化Worker
function initWorker(config) {
    if (config) {
        fftSize = config.fftSize || 2048;
        sampleRate = config.sampleRate || 44100;
        frequencyBins = fftSize / 2;
    }
    
    // 发送初始化完成消息
    self.postMessage({
        type: 'initComplete',
        data: {
            fftSize,
            sampleRate,
            frequencyBins
        }
    });
}

// 更新配置
function updateConfig(config) {
    if (config.fftSize) fftSize = config.fftSize;
    if (config.sampleRate) sampleRate = config.sampleRate;
    if (config.beatThreshold) beatThreshold = config.beatThreshold;
    if (config.beatCooldown) beatCooldown = config.beatCooldown;
    if (config.heavyBeatCooldown) heavyBeatCooldown = config.heavyBeatCooldown;
}

// 处理频谱数据
function processSpectrumData(dataArray) {
    const currentTime = Date.now();
    
    // 防止过于频繁的处理
    if (currentTime - lastProcessTime < 16) { // 约60fps
        return;
    }
    lastProcessTime = currentTime;
    
    // 计算频段能量
    const bandEnergies = calculateBandEnergies(dataArray);
    
    // 检测Beat
    const beatResult = detectBeat(dataArray, currentTime);
    
    // 检测重Beat
    const heavyBeatResult = detectHeavyBeat(bandEnergies, currentTime);
    
    // 计算频谱特征
    const spectrumFeatures = calculateSpectrumFeatures(dataArray, bandEnergies);
    
    // 发送处理结果
    self.postMessage({
        type: 'processedSpectrumData',
        data: {
            bandEnergies,
            beat: beatResult,
            heavyBeat: heavyBeatResult,
            spectrumFeatures,
            timestamp: currentTime
        }
    });
}

// 计算频段能量
function calculateBandEnergies(dataArray) {
    const bands = {};
    
    for (const [bandName, bandRange] of Object.entries(FREQUENCY_BANDS)) {
        const startIndex = Math.floor(bandRange.start * frequencyBins);
        const endIndex = Math.floor(bandRange.end * frequencyBins);
        
        let sum = 0;
        let count = 0;
        
        for (let i = startIndex; i < endIndex && i < dataArray.length; i++) {
            sum += dataArray[i];
            count++;
        }
        
        bands[bandName] = count > 0 ? sum / count : 0;
    }
    
    return bands;
}

// 检测Beat (1500-2250 Hz频段)
function detectBeat(dataArray, currentTime) {
    const startFreq = 1500;
    const endFreq = 2250;
    
    const startIndex = Math.floor((startFreq / (sampleRate / 2)) * frequencyBins);
    const endIndex = Math.floor((endFreq / (sampleRate / 2)) * frequencyBins);
    
    // 计算指定频段的平均能量
    let sum = 0;
    let count = 0;
    
    for (let i = startIndex; i <= endIndex && i < dataArray.length; i++) {
        sum += dataArray[i];
        count++;
    }
    
    const average = count > 0 ? sum / count : 0;
    const isBeat = average > beatThreshold && (currentTime - lastBeatTime) > beatCooldown;
    
    if (isBeat) {
        lastBeatTime = currentTime;
    }
    
    return {
        detected: isBeat,
        intensity: average / 255,
        threshold: beatThreshold / 255,
        frequency: average
    };
}

// 检测重Beat (基于频谱20-25%区域)
function detectHeavyBeat(bandEnergies, currentTime) {
    // 计算20-25%区域的激活状态
    const midHighEnergy = bandEnergies.MID_HIGH || 0;
    const highEnergy = bandEnergies.HIGH || 0;
    const combinedEnergy = (midHighEnergy + highEnergy) / 2;
    
    // 重Beat阈值 (可调整)
    const heavyBeatThreshold = 160; // 约47%的强度
    const isHeavyBeat = combinedEnergy > heavyBeatThreshold;
    
    // 记录到缓冲区
    heavyBeatBuffer.push({
        time: currentTime,
        isActive: isHeavyBeat,
        energy: combinedEnergy
    });
    
    // 清理20ms以前的记录
    heavyBeatBuffer = heavyBeatBuffer.filter(record => 
        currentTime - record.time <= 20
    );
    
    // 检查20ms内是否有重beats
    const recentHeavyBeats = heavyBeatBuffer.filter(record => record.isActive);
    const shouldTrigger = recentHeavyBeats.length > 0 && 
                         (currentTime - lastHeavyBeatTime) > heavyBeatCooldown;
    
    if (shouldTrigger) {
        lastHeavyBeatTime = currentTime;
    }
    
    return {
        detected: shouldTrigger,
        intensity: combinedEnergy / 255,
        threshold: heavyBeatThreshold / 255,
        energy: combinedEnergy,
        recentCount: recentHeavyBeats.length
    };
}

// 计算频谱特征
function calculateSpectrumFeatures(dataArray, bandEnergies) {
    // 计算总体能量
    const totalEnergy = dataArray.reduce((sum, value) => sum + value, 0) / dataArray.length;
    
    // 计算峰值
    const peak = Math.max(...dataArray);
    
    // 计算频谱重心
    let weightedSum = 0;
    let totalSum = 0;
    
    for (let i = 0; i < dataArray.length; i++) {
        weightedSum += i * dataArray[i];
        totalSum += dataArray[i];
    }
    
    const spectralCentroid = totalSum > 0 ? weightedSum / totalSum : 0;
    
    // 计算频谱带宽
    let bandwidthSum = 0;
    for (let i = 0; i < dataArray.length; i++) {
        const deviation = i - spectralCentroid;
        bandwidthSum += deviation * deviation * dataArray[i];
    }
    const spectralBandwidth = totalSum > 0 ? Math.sqrt(bandwidthSum / totalSum) : 0;
    
    return {
        totalEnergy: totalEnergy / 255,
        peak: peak / 255,
        spectralCentroid: spectralCentroid / frequencyBins,
        spectralBandwidth: spectralBandwidth / frequencyBins,
        bandEnergies: {
            low: bandEnergies.LOW / 255,
            midLow: bandEnergies.MID_LOW / 255,
            mid: bandEnergies.MID / 255,
            midHigh: bandEnergies.MID_HIGH / 255,
            high: bandEnergies.HIGH / 255
        }
    };
}

// 停止Worker
function stopWorker() {
    // 清理资源
    heavyBeatBuffer = [];
    spectrumData = null;
    
    self.postMessage({
        type: 'workerStopped',
        data: {}
    });
}

// 错误处理
self.onerror = function(error) {
    self.postMessage({
        type: 'error',
        data: {
            message: error.message,
            filename: error.filename,
            lineno: error.lineno
        }
    });
};
