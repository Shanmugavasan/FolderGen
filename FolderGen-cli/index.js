#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

// Helper to clean AI junk and comments
function cleanLineText(line) {
    let clean = line.split('#')[0].split('//')[0].split('--')[0];
    clean = clean.replace(/[│├└─]/g, '');
    clean = clean.trim().replace(/[/\\]$/, '');
    return clean;
}

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

console.log('\x1b[32m%s\x1b[0m', '🌲 FolderGen CLI');
console.log('\x1b[90m%s\x1b[0m', 'Paste your folder structure below. Press Enter on an empty line to build.');
console.log('--------------------------------------------------');

let lines = [];

rl.on('line', (line) => {
    // Stop taking input when the user hits Enter on an empty line
    if (line.trim() === "") {
        rl.close();
        return;
    }
    lines.push(line);
});

rl.on('close', () => {
    console.log('\n\x1b[36m%s\x1b[0m', '🏗️  Scaffolding project...');
    
    // Start at the current working directory where the user ran the command
    const lastAtDepth = { [-1]: process.cwd() };

    lines.forEach(line => {
        const name = cleanLineText(line);
        if (!name) return;

        // Determine depth by counting leading spaces
        const depth = line.search(/\S/);

        // Find the correct parent directory
        const parentDepth = Object.keys(lastAtDepth)
            .map(Number)
            .filter(d => d < depth)
            .sort((a, b) => b - a)[0] ?? -1;

        const parentPath = lastAtDepth[parentDepth];
        const currentPath = path.join(parentPath, name);

        try {
            if (name.includes('.')) {
                // If it has a dot, create a file
                if (!fs.existsSync(currentPath)) {
                    fs.writeFileSync(currentPath, `// Created by FolderGen CLI\n`);
                    console.log(`  📄 ${name}`);
                }
            } else {
                // Otherwise, create a folder
                if (!fs.existsSync(currentPath)) {
                    fs.mkdirSync(currentPath, { recursive: true });
                }
                lastAtDepth[depth] = currentPath;
                console.log(`  📁 ${name}`);
            }
        } catch (err) {
            console.log(`  ❌ Error creating ${name}: ${err.message}`);
        }
    });

    console.log('\n\x1b[32m%s\x1b[0m', '✨ Structure created successfully!');
    process.exit(0);
});