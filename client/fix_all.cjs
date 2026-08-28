const fs = require('fs');
const path = require('path');

const files = [
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/AcademicYearsPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/ClassesPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/CoursesPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/StudentsPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/SubjectsPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/TeachersPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/ParentsPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/TopicsPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/EnrollmentsPage.tsx",
    "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/pages/admin/SystemConfigPage.tsx"
];

const types_file = "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/types/index.ts";

try {
    let types_content = fs.readFileSync(types_file, 'utf-8');
    if (!types_content.includes("export interface SystemConfig")) {
        types_content += `\nexport interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}\n`;
        fs.writeFileSync(types_file, types_content, 'utf-8');
        console.log("Updated types/index.ts");
    }
} catch (e) {
    console.error("Error updating types", e);
}

for (const filepath of files) {
    try {
        let content = fs.readFileSync(filepath, 'utf-8');

        // 1. variant="outline" -> variant="secondary"
        content = content.replace(/variant="outline"/g, 'variant="secondary"');

        // 3. Pagination uses currentPage but prop is page
        content = content.replace(
            /<Pagination\s+currentPage={([^}]+)}\s+totalPages={([^}]+)}\s+onPageChange={([^}]+)}\s*\/>/g,
            '<Pagination page={$1} totalPages={$2} onPageChange={$3} hasNextPage={$1 < $2} hasPrevPage={$1 > 1} />'
        );

        // 4. ConfirmDialog uses onCancel but prop is onClose
        content = content.replace(
            /<ConfirmDialog([\s\S]*?)onCancel=/g,
            '<ConfirmDialog$1onClose='
        );

        // 2. DataTable column render function signature
        let lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            let line = lines[i];
            if (line.includes('render:')) {
                // Find key in same or previous lines
                let keyMatch = line.match(/key:\s*'([^']+)'/);
                if (!keyMatch) {
                    for (let j = i; j >= Math.max(0, i - 5); j--) {
                        let km = lines[j].match(/key:\s*'([^']+)'/);
                        if (km) {
                            keyMatch = km;
                            break;
                        }
                    }
                }
                
                let keyVal = keyMatch ? keyMatch[1] : "unknown";

                if (line.includes('(val: any) =>')) {
                    line = line.replace(/\(val:\s*any\)\s*=>/, '(item: any) =>');
                    // replace val outside quotes
                    line = line.replace(/\bval\b/g, `item.${keyVal}`);
                } else if (line.includes('(_: any,')) {
                    line = line.replace(/\(_:\s*any,\s*([^)]+)\)\s*=>/, '($1) =>');
                } else if (line.includes('(value: any,')) {
                    line = line.replace(/\(value:\s*any,\s*([^)]+)\)\s*=>/, '($1) =>');
                } else if (line.includes('(val: string) =>')) {
                    line = line.replace(/\(val:\s*string\)\s*=>/, '(item: any) =>');
                    line = line.replace(/\bval\b/g, `item.${keyVal}`);
                } else if (line.includes('(value: string,')) {
                    line = line.replace(/\(value:\s*string,\s*([^)]+)\)\s*=>/, '($1) =>');
                }

                lines[i] = line;
            }
        }
        content = lines.join('\n');

        // 6. Topic has name not title
        if (filepath.includes('TopicsPage.tsx')) {
            content = content.replace(/item\.title/g, 'item.name');
            content = content.replace(/topic\.title/g, 'topic.name');
        }

        // 7. Teacher.user only has firstName, lastName, email - no phone
        if (filepath.includes('TeachersPage.tsx')) {
            content = content.replace(/item\.user\?\.phone/g, 'item.phone');
            content = content.replace(/formData\.user\.phone/g, 'formData.phone');
            content = content.replace(/user:\s*\{\s*([^}]*?)phone:\s*(item\.phone|item\.user\?\.phone\s*\|\|\s*'')\s*\}/g, 'user: { $1 }, phone: item.phone || ""');
        }

        fs.writeFileSync(filepath, content, 'utf-8');
        console.log(`Processed ${filepath}`);
    } catch (e) {
        console.error(`Error processing ${filepath}: ${e}`);
    }
}
