import { readdir } from 'node:fs/promises';
import { extname } from 'node:path';

const cdnBaseUrl = 'https://cdn.wopian.me/photos';

async function generateYamlList() {
	const files = await readdir('.');
	const avifFiles = files.filter(file => extname(file).toLowerCase() === '.avif');

	console.log(`Found ${avifFiles.length} AVIF files.`);

	const yamlLines = avifFiles.map(file => `- ${cdnBaseUrl}/year/${file}`);
	const yamlContent = yamlLines.join('\n');

	console.log(yamlContent);
}

generateYamlList().catch(err => {
	console.error('Error generating YAML list:', err);
});
