
const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');

const envPath = path.resolve(process.cwd(), '.env.local');

console.log('--- Checking Environment Variables ---');
console.log('Expected Path:', envPath);


if (fs.existsSync(envPath)) {
    console.log('✅ Found .env.local file');


    // Debug Raw Content
    const rawBuffer = fs.readFileSync(envPath);
    console.log('File Size:', rawBuffer.length, 'bytes');

    let contentStr = '';

    // Check for UTF-16 LE BOM (FF FE)
    if (rawBuffer.length >= 2 && rawBuffer[0] === 0xFF && rawBuffer[1] === 0xFE) {
        console.log('⚠️ DETECTED UTF-16 LE ENCODING (Notepad default?)');
        console.log('🔄 Converting to UTF-8...');
        contentStr = rawBuffer.toString('utf16le');

        // Remove BOM char if present in string (it usually is handled by encoding but safer to trim)
        if (contentStr.charCodeAt(0) === 65279) {
            contentStr = contentStr.slice(1);
        }

        // Write back as UTF-8
        fs.writeFileSync(envPath, contentStr, 'utf8');
        console.log('✅ File rewritten as UTF-8. Please restart your server!');
    } else {
        contentStr = rawBuffer.toString('utf8');
    }

    const envConfig = dotenv.parse(contentStr);
    console.log('Parsed Keys:', Object.keys(envConfig));

    // Check Email
    if (envConfig.ADDA_EMAIL) {
        console.log(`✅ ADDA_EMAIL found: ${envConfig.ADDA_EMAIL.substring(0, 3)}***@***`);
    } else {
        console.log('❌ ADDA_EMAIL is MISSING or EMPTY');
    }

    // Check Password
    if (envConfig.ADDA_PASSWORD) {
        console.log('✅ ADDA_PASSWORD found: (length ' + envConfig.ADDA_PASSWORD.length + ')');
    } else {
        console.log('❌ ADDA_PASSWORD is MISSING or EMPTY');
    }

} else {
    console.log('❌ .env.local file NOT FOUND at expected path!');
    console.log('Contents of current directory:');
    fs.readdirSync(process.cwd()).forEach(file => {
        console.log(' - ' + file);
    });
}
console.log('--- End Check ---');
