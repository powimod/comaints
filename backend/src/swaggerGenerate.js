import swaggerJSDoc from 'swagger-jsdoc';
import fs from 'fs';
import swaggerConfig from './swaggerConfig.js';

//const swaggerSpec = swaggerJSDoc(swaggerConfig);

fs.writeFileSync('./swagger.json', JSON.stringify(swaggerConfig, null, 2), 'utf-8');

console.log('swagger.json successfuly generated !');

