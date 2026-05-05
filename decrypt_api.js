const fs = require('fs');
const path = require('path');

// 配置信息
const CONFIG = {
    inputFile: 'api.json',
    outputFile: 'decoded_api.json',
    githubPrefix: 'https://ghfast.top/https://raw.githubusercontent.com/cpu_iy2/main/'
};

function decrypt() {
    const inputPath = path.join(__dirname, CONFIG.inputFile);
    const outputPath = path.join(__dirname, CONFIG.outputFile);

    if (!fs.existsSync(inputPath)) {
        console.error(`错误：找不到输入文件 ${CONFIG.inputFile}`);
        return;
    }

    let content = fs.readFileSync(inputPath, 'utf8');

    // 1. 去除所有的 Unicode 混淆注释 (/* ... */)
    content = content.replace(/\/\*[\s\S]*?\*\//g, '');

    try {
        // 尝试解析并修复路径
        let json = JSON.parse(content);

        const fixPath = (str) => {
            if (typeof str !== 'string') return str;
            let newStr = str;
            // 修复相对路径
            if (newStr.startsWith('./')) {
                newStr = CONFIG.githubPrefix + newStr.substring(2);
            }
            // 替换 Gitee 为 GitHub 代理
            if (newStr.includes('gitee.com/cpu-iy/iy')) {
                newStr = newStr.replace('gitee.com/cpu-iy/iy', 'ghfast.top/https://raw.githubusercontent.com/cpu_iy');
            }
            return newStr;
        };

        // 递归处理 JSON 对象中的所有字符串
        const processObject = (obj) => {
            for (let key in obj) {
                if (typeof obj[key] === 'string') {
                    obj[key] = fixPath(obj[key]);
                } else if (typeof obj[key] === 'object' && obj[key] !== null) {
                    processObject(obj[key]);
                }
            }
        };

        processObject(json);

        // 2. 将处理后的明文同步到根目录
        fs.writeFileSync(outputPath, JSON.stringify(json, null, 2), 'utf8');
        console.log(`成功！明文已生成至: ${CONFIG.outputFile}`);

    } catch (e) {
        // 如果 JSON 解析失败，则直接输出去注释后的文本
        console.warn("警告：内容不是标准 JSON 格式，仅执行去注释操作。");
        fs.writeFileSync(outputPath, content.trim(), 'utf8');
        console.log(`去注释后的文件已生成至: ${CONFIG.outputFile}`);
    }
}

decrypt();
