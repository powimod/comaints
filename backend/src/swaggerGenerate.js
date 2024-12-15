import fs from 'fs';
import swaggerConfig from './swaggerConfig.js';

fs.writeFileSync('./swagger.json', JSON.stringify(swaggerConfig, null, 2), 'utf-8');
console.log('swagger.json successfuly generated !');

