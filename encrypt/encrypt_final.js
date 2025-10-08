import CryptoJS from 'crypto-js';
import fs from 'fs';

// 原始Card内容
const cardContent = `<div class="card-container" id="cardContainer">
            <div class="card" id="card">
                <div class="card-front">
                    <img src="./img/TKCTF512.svg" alt="TKCTF Logo" class="card-logo">
                </div>
                <div class="card-back">
                    <div class="card-content">
                        <p>Some secrets I didn't push here</p>
                    </div>
                </div>
            </div>
        </div>`;

// 模拟前端的密钥还原逻辑
function getDecryptionKey() {
    // 密钥片段（base64编码，逆序存储）
    const keyFragments = [
        'IUAj',  
        'S2V5', 
        'U2VjcmV0', 
        'MjAyNQ==',
        'Q1RG', 
        'VEs='  
    ];
    
    // 字符替换映射表（混淆映射）
    const obfuscationMap = {
        '!': 'A', '@': 'B', '#': 'C', 'T': 'D', 'K': 'E',
        'C': 'F', 'F': 'G', '2': 'H', '0': 'I', '5': 'J',
        'S': 'K', 'e': 'L', 'c': 'M', 'r': 'N', 't': 'O',
        'K': 'P', 'e': 'Q', 'y': 'R', '!': 'S', '@': 'T'
    };
    
    // 解码所有片段
    let decodedParts = [];
    for (let fragment of keyFragments) {
        decodedParts.push(Buffer.from(fragment, 'base64').toString());
    }
    
    // 组合解码后的片段
    let combinedKey = decodedParts.join('');
    
    // 应用反向字符替换还原原始密钥
    const reverseMap = {};
    for (const [original, obfuscated] of Object.entries(obfuscationMap)) {
        reverseMap[obfuscated] = original;
    }
    
    // 还原密钥
    let finalKey = '';
    for (let char of combinedKey) {
        finalKey += reverseMap[char] || char;
    }
    
    return finalKey;
}

// 获取还原后的密钥
const secretKey = getDecryptionKey();
console.log('还原的密钥:', secretKey);

// 使用还原的密钥进行加密
const encrypted = CryptoJS.AES.encrypt(cardContent, secretKey).toString();

console.log('加密后的内容:');
console.log(encrypted);

// 将加密内容写入文件
fs.writeFileSync('./data/Card.encrypted', encrypted);

console.log('加密内容已保存到 ./data/Card.encrypted');