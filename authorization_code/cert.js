const openssl = require('openssl-nodejs')
openssl(['req', '-config', 'csr.conf', '-out', 'CSR.csr', '-new', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'privateKey.key'], function (err, buffer) {
    console.log(err.toString(), buffer.toString());
    });