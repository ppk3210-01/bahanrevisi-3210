
import { exec } from 'child_process';
import { writeFileSync } from 'fs';

// Project ID from environment or hardcoded value
const PROJECT_ID = 'ohdmjhjcvoigsddwuaaw';

console.log(`Generating Supabase types for project ID: ${PROJECT_ID}...`);

// Run Supabase CLI to generate types
exec(`npx supabase gen types typescript --project-id ${PROJECT_ID}`, (error, stdout, stderr) => {
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
    
    // Also copy to tempTypes.ts as a backup
    writeFileSync('src/integrations/supabase/tempTypes.ts', stdout);
    
    console.log('Types generated successfully!');
    console.log('Written to: src/integrations/supabase/types.ts');
    console.log('Also backed up to: src/integrations/supabase/tempTypes.ts');
    
  } catch (err) {
    console.error(`Failed to write file: ${err}`);
  }
});
