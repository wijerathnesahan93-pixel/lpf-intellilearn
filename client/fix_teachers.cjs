const fs = require('fs');

let filepath = "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/TeachersPage.tsx";
let content = fs.readFileSync(filepath, 'utf-8');

// fix initialization
content = content.replace(
  "user: { firstName: '', lastName: '', email: '', password: '', phone: '' },",
  "user: { firstName: '', lastName: '', email: '', password: '' }, phone: '',"
);

content = content.replace(
  "user: { firstName: '', lastName: '', email: '', password: '', phone: '' }",
  "user: { firstName: '', lastName: '', email: '', password: '' }, phone: ''"
);

// fix handleOpenModal formData
content = content.replace(
  /user:\s*\{\s*firstName: item\.user\?\.firstName \|\| '',\s*lastName: item\.user\?\.lastName \|\| '',\s*email: item\.user\?\.email \|\| '',\s*password: '',\s*phone: item\.phone \|\| ''\s*\},/g,
  "user: { \n          firstName: item.user?.firstName || '', \n          lastName: item.user?.lastName || '', \n          email: item.user?.email || '', \n          password: '' \n        },\n        phone: item.phone || '',"
);

// fix onChange
content = content.replace(
  "onChange={(e) => setFormData({...formData, user: {...formData.user, phone: e.target.value}})}",
  "onChange={(e) => setFormData({...formData, phone: e.target.value})}"
);

fs.writeFileSync(filepath, content, 'utf-8');
console.log("TeachersPage fixed");
