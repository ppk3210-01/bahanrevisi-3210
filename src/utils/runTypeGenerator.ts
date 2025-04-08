
// This file is a utility to run the type generator
// You can execute this file directly with: node src/utils/runTypeGenerator.ts

import { exec } from 'child_process';

console.log('Generating Supabase types...');
exec('npx supabase gen types typescript --project-id ohdmjhjcvoigsddwuaaw', (error, stdout, stderr) => {
  if (error) {
    console.error(`Error generating types: ${error}`);
    return;
  }
  
  if (stderr) {
    console.error(`Error output: ${stderr}`);
    return;
  }
  
  console.log('Types generated successfully!');
  console.log(stdout);
});
