const axios = require('axios');
const http = require('http');

const options = {
  hostname: '127.0.0.1',
  port: 8000,
  path: '/api/penerimaan',
  method: 'GET',
};

const req = http.request(options, res => {
  let data = '';
  res.on('data', chunk => { data += chunk; });
  res.on('end', () => {
    try {
      const json = JSON.parse(data);
      console.log("JSON Length:", json.length);
      const trx = json[0];
      console.log("Transaksi 1:", trx.id);
      const dt = trx.detail_transaksi[0];
      console.log("Detail Transaksi 1 batch_barang Keys:", Object.keys(dt.batch_barang));
      console.log("Kondisi:", dt.batch_barang.kondisi);
      console.log("Tgl Kadaluarsa:", dt.batch_barang.tgl_kadaluarsa);
      console.log("No PO:", dt.batch_barang.no_po);
    } catch (e) {
      console.log("Error:", e.message);
      console.log("Data snippet:", data.substring(0, 100));
    }
  });
});
req.on('error', e => {
  console.error(e);
});
req.end();
