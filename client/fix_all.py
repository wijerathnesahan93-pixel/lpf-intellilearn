import os
import re

files = [
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
]

types_file = "c:/Users/Sahan Navoda/Desktop/TEXT/lpf-intellilearn/client/src/types/index.ts"

# 5. Add SystemConfig to types
with open(types_file, "r", encoding="utf-8") as f:
    types_content = f.read()

if "export interface SystemConfig" not in types_content:
    types_content += """
export interface SystemConfig {
  id: string;
  key: string;
  value: string;
  description?: string;
  updatedAt: string;
}
"""
    with open(types_file, "w", encoding="utf-8") as f:
        f.write(types_content)
    print("Updated types/index.ts")

for filepath in files:
    try:
        with open(filepath, "r", encoding="utf-8") as f:
            content = f.read()

        # 1. variant="outline" -> variant="secondary"
        content = content.replace('variant="outline"', 'variant="secondary"')

        # 3. Pagination uses currentPage but prop is page
        content = re.sub(
            r'<Pagination\s+currentPage={([^}]+)}\s+totalPages={([^}]+)}\s+onPageChange={([^}]+)}\s*/>',
            r'<Pagination page={\1} totalPages={\2} onPageChange={\3} hasNextPage={\1 < \2} hasPrevPage={\1 > 1} />',
            content
        )

        # 4. ConfirmDialog uses onCancel but prop is onClose
        content = re.sub(
            r'<ConfirmDialog([\s\S]*?)onCancel=',
            r'<ConfirmDialog\1onClose=',
            content
        )

        # 2. DataTable column render function signature
        lines = content.split('\n')
        for i, line in enumerate(lines):
            if 'render:' in line:
                # Find the key in the same line
                key_match = re.search(r"key:\s*'([^']+)'", line)
                if not key_match:
                    # check previous lines
                    for j in range(i, max(-1, i-5), -1):
                        km = re.search(r"key:\s*'([^']+)'", lines[j])
                        if km:
                            key_match = km
                            break
                
                key_val = key_match.group(1) if key_match else "unknown"

                if '(val: any) =>' in line:
                    line = line.replace('(val: any) =>', '(item: any) =>')
                    line = re.sub(r'\bval\b', f'item.{key_val}', line)
                elif '(_: any,' in line:
                    line = re.sub(r'\(_:\s*any,\s*([^)]+)\)\s*=>', r'(\1) =>', line)
                elif '(value: any,' in line:
                    line = re.sub(r'\(value:\s*any,\s*([^)]+)\)\s*=>', r'(\1) =>', line)
                elif '(val: string)' in line:
                    line = line.replace('(val: string) =>', '(item: any) =>')
                    line = re.sub(r'\bval\b', f'item.{key_val}', line)
                elif '(value: string,' in line:
                    line = re.sub(r'\(value:\s*string,\s*([^)]+)\)\s*=>', r'(\1) =>', line)

                lines[i] = line

        content = '\n'.join(lines)

        # 6. Topic has name not title
        if 'TopicsPage.tsx' in filepath:
            content = content.replace('item.title', 'item.name')
            content = content.replace('topic.title', 'topic.name')

        # 7. Teacher.user only has firstName, lastName, email - no phone
        if 'TeachersPage.tsx' in filepath:
            # Change teacher.user?.phone to teacher.phone
            content = content.replace('item.user?.phone', 'item.phone')
            content = content.replace('formData.user.phone', 'formData.phone')

        with open(filepath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"Processed {filepath}")
    except Exception as e:
        print(f"Error processing {filepath}: {e}")
