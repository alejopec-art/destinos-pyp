const fs = require('fs');
const path = require('path');

function processDir(dir) {
    fs.readdirSync(dir).forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            processDir(fullPath);
        } else if (fullPath.endsWith('.js') || fullPath.endsWith('.jsx')) {
            let content = fs.readFileSync(fullPath, 'utf8');
            let original = content;
            // Extremely careful regex to remove console logs that take up a whole line
            content = content.replace(/^[ \t]*console\.(log|warn)\(.*?\);?[ \t]*\r?\n/gm, '');
            // For those on the same line as code
            content = content.replace(/console\.(log|warn)\(.*?\.?;?/g, '');
            if (content !== original) {
                fs.writeFileSync(fullPath, content);
                console.log(`Cleaned: ${fullPath}`);
            }
        }
    });
}

processDir(path.join(__dirname, 'src'));
console.log('Done cleaning logs.');
