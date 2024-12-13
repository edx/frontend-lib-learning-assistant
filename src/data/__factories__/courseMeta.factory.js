import { Factory } from 'rosie'; // eslint-disable-line import/no-extraneous-dependencies

Factory.define('coursewareMeta')
  .attr('accessExpiration', null)
  .attr('contentTypeGatingEnabled', false)
  .attr('marketingUrl', 'http://www.example.com')
  .attr('offer', null)
  .attr('timeOffsetMillis', 0);
