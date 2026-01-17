'use server';

import fs from 'fs';
import path from 'path';

const LABS_DIR = path.join(process.cwd(), 'app', 'labs');

function getDirectoryStructure(dirPath, depth = 0) {
    const items = fs.readdirSync(dirPath, { withFileTypes: true });
    // Sort items to ensure consistent order (e.g. 01 before 02)
    items.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

    const structure = {};

    for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
            // Depth 0: Labs Root (contains Years)
            // Depth 1: Year (contains Subjects)
            // Depth 2: Subject (contains Experiments)

            // If we are at depth 2 (inside a Subject), a directory represents a Multi-File Experiment
            if (depth === 2) {
                const experimentParts = [];
                const subItems = fs.readdirSync(fullPath, { withFileTypes: true });
                subItems.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' }));

                for (const subItem of subItems) {
                    if (subItem.isFile()) {
                        const subContent = fs.readFileSync(path.join(fullPath, subItem.name), 'utf-8');
                        const subExt = path.extname(subItem.name).toLowerCase();
                        let subLang = 'text';
                        if (subExt === '.py') subLang = 'python';
                        else if (subExt === '.c' || subExt === '.cpp' || subExt === '.h' || subExt === '.ino') subLang = 'c/cpp';
                        else if (subExt === '.js' || subExt === '.jsx') subLang = 'javascript';
                        else if (subExt === '.html') subLang = 'html';
                        else if (subExt === '.css') subLang = 'css';
                        else if (subExt === '.java') subLang = 'java';
                        else if (subExt === '.sh') subLang = 'bash';

                        experimentParts.push({
                            subtitle: path.parse(subItem.name).name.replace(/_/g, ' '),
                            code: subContent,
                            language: subLang
                        });
                    }
                }

                if (experimentParts.length > 0) {
                    structure[item.name] = {
                        title: item.name, // Use folder name as experiment title
                        parts: experimentParts
                    };
                } else {
                    // Empty directory or only contains subdirectories (unexpected for experiment)
                    // Fallback to recursion if needed, or just ignore. 
                    // For now, let's treat it as empty experiment or skip.
                    // But if it contains nested folders, we might need to recurse? 
                    // Given the requirement, let's assume it is empty or invalid if no files.
                    structure[item.name] = { title: item.name, parts: [] };
                }

            } else {
                // Not at experiment level yet, just recurse
                structure[item.name] = getDirectoryStructure(fullPath, depth + 1);
            }
        } else {
            // It's a file (Single File Experiment)
            // Use filename as the experiment title (remove extension)
            const fileName = item.name;
            const title = path.parse(fileName).name; // "01_Hello_World"

            // Read content
            const content = fs.readFileSync(fullPath, 'utf-8');

            // Determine language
            const ext = path.extname(fileName).toLowerCase();
            let language = 'text';
            if (ext === '.py') language = 'python';
            else if (ext === '.c' || ext === '.cpp' || ext === '.h' || ext === '.ino') language = 'c';
            else if (ext === '.js' || ext === '.jsx') language = 'javascript';
            else if (ext === '.html') language = 'html';
            else if (ext === '.css') language = 'css';
            else if (ext === '.java') language = 'java';
            else if (ext === '.sh') language = 'bash';

            // Structure it to match what the frontend expects (parts array)
            structure[item.name] = {  // Use filename as key to ensure uniqueness
                title: title.replace(/_/g, ' '), // "01 Hello World"
                parts: [
                    {
                        code: content,
                        language: language
                    }
                ]
            };
        }
    }

    return structure;
}

export async function getExperiments() {
    try {
        if (!fs.existsSync(LABS_DIR)) {
            return {};
        }
        return getDirectoryStructure(LABS_DIR);
    } catch (error) {
        console.error("Error reading labs:", error);
        return {};
    }
}
