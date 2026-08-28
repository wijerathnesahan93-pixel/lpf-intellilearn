const fs = require('fs');
const path = require('path');

const serverDir = 'c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/server/src';

function replaceAll(str, find, replace) {
  return str.split(find).join(replace);
}

function processFile(filePath, processFunc) {
  const fullPath = path.join(serverDir, filePath);
  if (!fs.existsSync(fullPath)) {
    console.log('Not found:', fullPath);
    return;
  }
  const origContent = fs.readFileSync(fullPath, 'utf8');
  let content = origContent;
  
  content = processFunc(content);
  
  if (content !== origContent) {
    fs.writeFileSync(fullPath, content);
    console.log('Updated:', filePath);
  }
}

// 1. bcrypt -> bcryptjs
const bcryptFiles = [
  'modules/users/users.service.ts',
  'modules/students/students.service.ts',
  'modules/teachers/teachers.service.ts',
  'modules/parents/parents.service.ts'
];
bcryptFiles.forEach(f => {
  processFile(f, content => {
    return content.replace(/from 'bcrypt'/g, "from 'bcryptjs'");
  });
});

// 2. PaginationParams skip/take
const paginationFiles = [
  'modules/users/users.service.ts',
  'modules/students/students.service.ts',
  'modules/teachers/teachers.service.ts',
  'modules/parents/parents.service.ts',
  'modules/courses/courses.service.ts',
  'modules/classes/classes.service.ts'
];
paginationFiles.forEach(f => {
  processFile(f, content => {
    // Replace skip: params.skip, take: params.take with const skip = (params.page - 1) * params.limit; and skip, take: params.limit
    // This regex might be tricky, let's just do a string replacement if possible.
    // Instead of complex regex, let's look for how it's used.
    // It's probably `skip: params.skip` and `take: params.take`.
    return content
      .replace(/skip:\s*params\.skip/g, "skip: (params.page - 1) * params.limit")
      .replace(/take:\s*params\.take/g, "take: params.limit");
  });
});

// 3. authorize
const routeFiles = [
  'modules/config/config.routes.ts', // might be in config/ or something else
  'modules/enrollments/enrollments.routes.ts',
  'modules/lessons/lessons.routes.ts',
  'modules/materials/materials.routes.ts',
  'modules/subjects/subjects.routes.ts',
  'modules/teacher-assignments/teacher-assignments.routes.ts',
  'modules/topics/topics.routes.ts'
];
routeFiles.forEach(f => {
  processFile(f, content => {
    // replace authorize(['ROLE1', 'ROLE2']) with authorize('ROLE1', 'ROLE2')
    return content.replace(/authorize\(\[\s*([^\]]+?)\s*\]\)/g, "authorize($1)");
  });
});
// Need to search all routes just in case
function walk(dir) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = dir + '/' + file;
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) { 
            results = results.concat(walk(file));
        } else { 
            if (file.endsWith('.routes.ts')) results.push(file);
        }
    });
    return results;
}
const allRoutes = walk(serverDir);
allRoutes.forEach(f => {
  const rel = path.relative(serverDir, f);
  processFile(rel, content => {
    return content.replace(/authorize\(\[\s*(.+?)\s*\]\)/g, "authorize($1)");
  });
});


// 4. prisma.material
processFile('modules/materials/materials.service.ts', content => {
  return content.replace(/prisma\.material/g, "prisma.learningMaterial");
});

// 5 & 9 & 10. parents.service.ts
processFile('modules/parents/parents.service.ts', content => {
  content = content.replace(/prisma\.parentStudent/g, "prisma.parentChild");
  
  // ERROR 9: children instead of students
  // Need to replace students with children: { include: { student: { include: { user: { select: { firstName: true, lastName: true, email: true } } } } } }
  // This is tricky without knowing exact code.
  return content;
});

// 6. classes.service.ts
processFile('modules/classes/classes.service.ts', content => {
  return content.replace(/_count:\s*\{\s*select:\s*\{\s*students:\s*true\s*\}\s*\}/g, "_count: { select: { enrollments: true } }");
});

// 7. controllers create
const controllerFiles = [
  'modules/users/users.controller.ts',
  'modules/students/students.controller.ts',
  'modules/teachers/teachers.controller.ts',
  'modules/parents/parents.controller.ts',
  'modules/courses/courses.controller.ts'
];
controllerFiles.forEach(f => {
  processFile(f, content => {
    // This is trickier, let's leave it for manual replacement or specific string replace if possible.
    return content;
  });
});

// 8. req.user.userId
processFile('modules/parents/parents.controller.ts', content => {
  return content.replace(/req\.user\.userId/g, "req.user!.id");
});

// 10. OrderBy createdAt
const orderFiles = [
  'modules/students/students.service.ts',
  'modules/teachers/teachers.service.ts',
  'modules/parents/parents.service.ts'
];
orderFiles.forEach(f => {
  processFile(f, content => {
    return content.replace(/createdAt:\s*params\.sortOrder/g, "id: params.sortOrder || 'desc'");
  });
});

