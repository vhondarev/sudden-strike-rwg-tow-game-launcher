const { networkInterfaces } = require('os');


const getIpAddress = (arr) => arr[arr.findIndex((el) => el.family === 'IPv4')]?.address

function getVpnIp() {
  const nets = networkInterfaces();
  const rwgVpn = nets?.['RWG VPN']

  return rwgVpn ? getIpAddress(rwgVpn) : null
}

module.exports = getVpnIp;
