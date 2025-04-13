import { exec } from 'child_process';
import { promisify } from 'util';

const execPromise = promisify(exec);

async function runScript(scriptPath) {
  console.log(`Running script: ${scriptPath}`);
  try {
    const { stdout, stderr } = await execPromise(`node ${scriptPath}`);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    return true;
  } catch (error) {
    console.error(`Error executing ${scriptPath}:`, error);
    return false;
  }
}

async function main() {
  console.log('Starting image fix process...');
  
  // Step 1: Upload images to Supabase storage
  const uploadSuccess = await runScript('./copy-images-to-supabase.js');
  if (!uploadSuccess) {
    console.error('Image upload failed. Stopping process.');
    return;
  }
  
  // Step 2: Update image URLs in the database
  const updateSuccess = await runScript('./update-announcement-image-urls.js');
  if (!updateSuccess) {
    console.error('Image URL update failed.');
    return;
  }
  
  console.log('Image fix process completed successfully!');
}

main().catch(error => {
  console.error('An error occurred:', error);
});
