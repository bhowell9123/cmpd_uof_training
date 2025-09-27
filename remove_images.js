// Script to remove all image paths from content_mapping.json
import { readFile, writeFile } from 'fs/promises';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Get the directory name
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Path to the content mapping file
const contentMappingPath = join(__dirname, 'src', 'assets', 'content_mapping', 'content_mapping.json');

async function removeImages() {
  try {
    // Read the content mapping file
    const data = await readFile(contentMappingPath, 'utf8');
    
    // Parse the JSON data
    const contentMapping = JSON.parse(data);
    
    // Remove the "images" property from each slide
    let removedCount = 0;
    Object.keys(contentMapping).forEach(slideKey => {
      if (contentMapping[slideKey].images) {
        delete contentMapping[slideKey].images;
        console.log(`Removed images from ${slideKey}`);
        removedCount++;
      }
    });
    
    // Write the updated content mapping back to the file
    await writeFile(contentMappingPath, JSON.stringify(contentMapping, null, 2), 'utf8');
    
    console.log(`Successfully removed images from ${removedCount} slides in content_mapping.json`);
  } catch (error) {
    console.error('Error:', error);
  }
}

// Run the function
removeImages();