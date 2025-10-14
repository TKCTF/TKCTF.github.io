#!/usr/bin/env node

import { exec } from 'child_process';
import { platform } from 'os';
import { promisify } from 'util';

const execAsync = promisify(exec);

const PORT = 18980;
const isWindows = platform() === 'win32';

// 日志时间戳工具
function ts() {
    const d = new Date();
    const pad = (n) => String(n).padStart(2, '0');
    return `[${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}]`;
}
const log = (...args) => console.log(ts(), ...args);
const warn = (...args) => console.warn(ts(), ...args);
const err = (...args) => console.error(ts(), ...args);

// 查找占用端口的进程
async function findProcessOnPort(port) {
    try {
        if (isWindows) {
            // Windows: 使用 netstat
            const { stdout } = await execAsync(`netstat -ano | findstr :${port}`);
            const lines = stdout.trim().split('\n');
            const pids = new Set();
            
            for (const line of lines) {
                const parts = line.trim().split(/\s+/);
                const pid = parts[parts.length - 1];
                if (pid && pid !== '0') {
                    pids.add(pid);
                }
            }
            return Array.from(pids);
        } else {
            // Unix/Linux/Mac: 使用 lsof
            const { stdout } = await execAsync(`lsof -ti:${port}`);
            return stdout.trim().split('\n').filter(pid => pid);
        }
    } catch (error) {
        // 端口未被占用或命令不存在
        return [];
    }
}

// 结束进程
async function killProcess(pid) {
    try {
        if (isWindows) {
            await execAsync(`taskkill /F /PID ${pid}`);
        } else {
            await execAsync(`kill -9 ${pid}`);
        }
        return true;
    } catch (error) {
        err(`❌ 无法终止进程 ${pid}:`, error.message);
        return false;
    }
}

// 清理端口
async function cleanPort(port) {
    log(`🔍 检查端口 ${port} 占用情况...`);
    
    const pids = await findProcessOnPort(port);
    
    if (pids.length === 0) {
        log(`✅ 端口 ${port} 可用`);
        return true;
    }
    
    warn(`⚠️  发现 ${pids.length} 个进程占用端口 ${port}`);
    
    for (const pid of pids) {
        log(`🔄 正在终止进程 ${pid}...`);
        await killProcess(pid);
    }
    
    // 等待端口释放
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // 再次检查
    const remainingPids = await findProcessOnPort(port);
    if (remainingPids.length === 0) {
        log(`✅ 端口 ${port} 已释放`);
        return true;
    } else {
        warn(`❌ 端口 ${port} 仍被占用`);
        return false;
    }
}

// 启动服务器
async function startServer() {
    log('🚀 启动 TKCTF 测试服务器...\n');
    
    // 清理端口
    await cleanPort(PORT);
    
    log('\n📡 正在启动 http-server...\n');
    
    // 启动 http-server
    const serverProcess = exec('http-server ./publish -p 18980 -c-1 --cors -o');
    
    // 转发输出
    serverProcess.stdout.pipe(process.stdout);
    serverProcess.stderr.pipe(process.stderr);
    
    // 处理 Ctrl+C
    process.on('SIGINT', async () => {
        log('\n\n⏹️  收到停止信号，正在清理...');
        
        // 终止服务器进程
        if (isWindows) {
            exec(`taskkill /F /PID ${serverProcess.pid} /T`);
        } else {
            serverProcess.kill('SIGTERM');
        }
        
        // 再次清理端口（确保彻底释放）
        await cleanPort(PORT);
        
        log('👋 服务器已停止\n');
        process.exit(0);
    });
    
    // 处理进程退出
    serverProcess.on('exit', (code) => {
        if (code !== 0 && code !== null) {
            err(`❌ 服务器异常退出，代码: ${code}`);
            process.exit(code);
        }
    });
}

// 主函数
(async () => {
    try {
        await startServer();
    } catch (error) {
        err('❌ 启动失败:', error.message);
        process.exit(1);
    }
})();

