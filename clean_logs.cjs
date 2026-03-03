const fs = require('fs');
const path = require('path');

function cleanFile(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;
    const lines = content.split('\n');
    const newLines = lines.map(line => {
        if (line.includes('console.log(') || line.includes('console.warn(') || line.includes('console.error(')) {
            if (line.trim().startsWith('console.')) {
                return ''; // remove entire line
            } else {
                return line.replace(/console\.(log|warn|error)\(.*?(\);?)/, '');
            }
        }
        return line;
    });
    content = newLines.join('\n');
    if (content !== original) {
        fs.writeFileSync(filePath, content);
        console.log(`Cleaned: ${filePath}`);
    }
}

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            cleanFile(fullPath);
        }
    });
}

processDir(path.join(__dirname, 'src'));
console.log('Done cleaning logs.');
