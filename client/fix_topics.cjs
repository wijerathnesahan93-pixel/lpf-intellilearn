const fs = require('fs');
let filepath = "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/TopicsPage.tsx";
let content = fs.readFileSync(filepath, 'utf-8');

content = content.replace(/formData\.title/g, 'formData.name');
content = content.replace(/title: item\.name/g, 'name: item.name');
content = content.replace(/title: ''/g, "name: ''");
content = content.replace(/key: 'title'/g, "key: 'name'");

fs.writeFileSync(filepath, content, 'utf-8');
console.log("TopicsPage fixed");
