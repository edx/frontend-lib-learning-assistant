import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('courseHomeMeta')
  .option('host', 'http://localhost:18000')
  .attr('number', 'DemoX')
  .attr('title', 'Demonstration Course')
  .attr('org', 'edX')
  .attr('userTimezone', null)
  .attr('verifiedMode', ['host'], (host) => ({
    access_expiration_date: '2050-01-01T12:00:00',
    currency: 'USD',
    currencySymbol: '$',
    price: 149,
    sku: 'ABCD1234',
    upgradeUrl: `${host}/dashboard`,
  }));
