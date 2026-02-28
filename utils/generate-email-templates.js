import fs from 'fs';
import path from 'path';
import handlebars from 'handlebars';

export const generateEmailTemplate = (templateName, data) => {
    try {
        // Template file ka path
        const filePath = path.join(process.cwd(), 'views', 'email', `${templateName}.hbs`);
        
        // File read karna
        const source = fs.readFileSync(filePath, 'utf-8');
        
        // Handlebars ke saath compile karna
        const template = handlebars.compile(source);
        
        // Data inject karke HTML return karna
        return template(data);
    } catch (error) {
        console.error("Template Error:", error);
        return null;
    }
};