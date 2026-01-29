
const pdf = require('pdf-parse');
console.log('Type of pdf:', typeof pdf);
console.log('Is function?', typeof pdf === 'function');
console.log('Keys:', Object.keys(pdf));
if (typeof pdf !== 'function') {
    if (pdf.default) {
        console.log('Type of pdf.default:', typeof pdf.default);
        console.log('Is pdf.default function?', typeof pdf.default === 'function');
    }
}
