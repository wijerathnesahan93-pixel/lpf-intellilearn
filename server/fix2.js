const fs = require('fs');
const path = require('path');

const serverDir = 'c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/server/src';

function processFile(filePath, processFunc) {
  const fullPath = path.join(serverDir, filePath);
  if (!fs.existsSync(fullPath)) return;
  const origContent = fs.readFileSync(fullPath, 'utf8');
  let content = processFunc(origContent);
  if (content !== origContent) {
    fs.writeFileSync(fullPath, content);
    console.log('Updated:', filePath);
  }
}

// ERROR 9: parents.service.ts students -> children
processFile('modules/parents/parents.service.ts', content => {
  return content
    .replace(/students:\s*\{/g, 'children: {')
    .replace(/students:\s*true/g, 'children: true')
    .replace(/parent\.students/g, 'parent.children')
    // ERROR 10
    .replace(/orderBy:\s*\{\s*createdAt:\s*'desc'\s*\}/g, "orderBy: { id: 'desc' }")
    .replace(/orderBy:\s*\{\s*createdAt:\s*params\.sortOrder\s*\}/g, "orderBy: { id: params.sortOrder || 'desc' }");
});

// ERROR 10: students and teachers service
processFile('modules/students/students.service.ts', content => {
  return content
    .replace(/orderBy:\s*\{\s*createdAt:\s*'desc'\s*\}/g, "orderBy: { id: 'desc' }")
    .replace(/orderBy:\s*\{\s*createdAt:\s*params\.sortOrder\s*\}/g, "orderBy: { id: params.sortOrder || 'desc' }");
});

processFile('modules/teachers/teachers.service.ts', content => {
  return content
    .replace(/orderBy:\s*\{\s*createdAt:\s*'desc'\s*\}/g, "orderBy: { id: 'desc' }")
    .replace(/orderBy:\s*\{\s*createdAt:\s*params\.sortOrder\s*\}/g, "orderBy: { id: params.sortOrder || 'desc' }");
});
