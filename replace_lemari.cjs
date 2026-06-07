const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources', 'js', 'components', 'Lemari.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Replace standard names
content = content.replace(/RuangLaboratorium/g, 'Lemari');
content = content.replace(/Ruang Laboratorium/g, 'Lemari');
content = content.replace(/ruangs/g, 'lemaris');
content = content.replace(/ruang/g, 'lemari');
content = content.replace(/ruang-laboratorium/g, 'lemari');

// Remove kode logic since Lemari only has nama
content = content.replace(/setFormData\({ id: null, kode: '', nama: '', keterangan: '' }\);/g, "setFormData({ id: null, nama: '', keterangan: '' });");
content = content.replace(/kode: lemari.kode, /g, "");

// Remove form input for kode
const kodeFormInputRegex = /<div>\s*<label className="block text-sm font-semibold text-slate-700 mb-1.5">Kode Ruangan.*?<\/div>/s;
content = content.replace(kodeFormInputRegex, "");

// Update form input for nama
content = content.replace(/Kepanjangan \/ Nama Ruangan/g, "Nama Lemari");
content = content.replace(/Contoh: Meter, Kilogram, Pieces/g, "Contoh: R-WS-01");

// Update table headers
content = content.replace(/<th className="py-4 px-4 text-sm font-semibold text-slate-600">Kode Ruangan<\/th>/g, "");
content = content.replace(/Nama Ruangan/g, "Nama Lemari");

// Update table data rendering
content = content.replace(/<td className="py-3 px-4 text-sm font-medium text-slate-800">{sat.kode}<\/td>/g, "");
content = content.replace(/sat.nama/g, "sat.nama"); // sat is the loop variable from previous copy

// Update view modal
const viewModalKodeRegex = /<div>\s*<p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Simbol<\/p>\s*<p className="text-sm font-medium text-slate-800">{itemToView.kode}<\/p>\s*<\/div>/s;
content = content.replace(viewModalKodeRegex, "");

// Replace MapPin with Archive
content = content.replace(/MapPin/g, "Archive");

fs.writeFileSync(filePath, content);
console.log('Replacement for Lemari done');
