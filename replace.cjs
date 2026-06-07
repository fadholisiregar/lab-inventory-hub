const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'resources', 'js', 'components', 'RuangLaboratorium.jsx');
let content = fs.readFileSync(filePath, 'utf8');

content = content.replace(/Satuan/g, 'RuangLaboratorium');
content = content.replace(/Master RuangLaboratorium/g, 'Master Ruang Laboratorium');
content = content.replace(/Tambah RuangLaboratorium/g, 'Tambah Ruang Laboratorium');
content = content.replace(/Detail RuangLaboratorium/g, 'Detail Ruang Laboratorium');
content = content.replace(/satuans/g, 'ruangs');
content = content.replace(/satuan/g, 'ruang');
content = content.replace(/simbol/g, 'kode');
content = content.replace(/nama_ruang/g, 'nama'); // since satuan -> ruang, nama_satuan became nama_ruang
content = content.replace(/Simbol \/ Singkatan/g, 'Kode Ruangan');
content = content.replace(/Nama RuangLaboratorium/g, 'Nama Ruangan');
content = content.replace(/Ruler/g, 'MapPin');
content = content.replace(/Cari ruang\.\.\./g, 'Cari ruangan...');
content = content.replace(/ruangLaboratorium/g, 'ruang');
content = content.replace(/ruang-laboratorium/g, 'ruang-laboratorium');

fs.writeFileSync(filePath, content);
console.log('Replacement done');
