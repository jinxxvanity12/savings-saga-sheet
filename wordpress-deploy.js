
/**
 * WordPress Deployment Script for Budget Tracker
 * 
 * This script helps prepare the build for WordPress plugin integration
 * Run with: node wordpress-deploy.js
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

console.log('Building React app for WordPress...');

try {
  // Run the build command
  execSync('npm run build', { stdio: 'inherit' });
  
  // Make sure the wordpress-plugin/dist directory exists
  if (!fs.existsSync('wordpress-plugin/dist')) {
    fs.mkdirSync('wordpress-plugin/dist', { recursive: true });
  }
  
  // Copy the dist folder contents to the wordpress-plugin/dist directory
  console.log('Copying build files to WordPress plugin directory...');
  
  // Function to copy directory recursively
  const copyDirectory = (source, destination) => {
    if (!fs.existsSync(destination)) {
      fs.mkdirSync(destination, { recursive: true });
    }
    
    const files = fs.readdirSync(source);
    
    for (const file of files) {
      const currentPath = path.join(source, file);
      const destPath = path.join(destination, file);
      
      if (fs.lstatSync(currentPath).isDirectory()) {
        copyDirectory(currentPath, destPath);
      } else {
        fs.copyFileSync(currentPath, destPath);
      }
    }
  };
  
  copyDirectory('dist', 'wordpress-plugin/dist');
  
  console.log('WordPress plugin is ready!');
  console.log('To install:');
  console.log('1. Zip the wordpress-plugin directory');
  console.log('2. Upload to WordPress via Plugins > Add New > Upload Plugin');
  console.log('3. Activate the plugin');
  console.log('4. Add to any page with shortcode: [budget_tracker]');
} catch (error) {
  console.error('Error preparing WordPress plugin:', error);
  process.exit(1);
}
