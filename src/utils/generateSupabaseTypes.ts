
import { exec } from 'child_process';
import { writeFileSync } from 'fs';

// Run Supabase CLI to generate types
exec('npx supabase gen types typescript --project-id vodfnexxrevgrxmmaksy', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating types: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`Error output: ${stderr}`);
    return;
  }
  
  // Write the generated types to a file
  try {
    writeFileSync('src/integrations/supabase/types.ts', stdout);
    console.log('Types generated successfully!');
  } catch (err) {
    console.error(`Failed to write file: ${err}`);
  }
});
