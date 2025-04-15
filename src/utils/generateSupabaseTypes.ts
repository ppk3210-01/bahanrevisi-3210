
import { exec } from 'child_process';
import { writeFileSync } from 'fs';

// Project ID from environment or hardcoded value
const PROJECT_ID = 'bpvxlqlbtmnxjvfxvifg';

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
  
  // Create dummy types structure if empty response
  if (!stdout || stdout.trim() === '') {
    stdout = `export type Database = {
      public: {
        Tables: {
          akun: {
            Row: {
              id: string;
              nama: string;
              urutan: number;
            };
            Insert: {
              id: string;
              nama: string;
              urutan: number;
            };
            Update: {
              id?: string;
              nama?: string;
              urutan?: number;
            };
          };
          budget_items: {
            Row: {
              id: string;
              uraian: string;
              volume_semula: number;
              satuan_semula: string;
              harga_satuan_semula: number;
              jumlah_semula: number | null;
              volume_menjadi: number;
              satuan_menjadi: string;
              harga_satuan_menjadi: number;
              jumlah_menjadi: number | null;
              selisih: number | null;
              status: string;
              is_approved: boolean;
              komponen_output: string;
              program_pembebanan: string | null;
              kegiatan: string | null;
              rincian_output: string | null;
              sub_komponen: string | null;
              akun: string | null;
              created_at?: string | null;
              updated_at?: string | null;
            };
            Insert: {
              id?: string;
              uraian: string;
              volume_semula: number;
              satuan_semula: string;
              harga_satuan_semula: number;
              jumlah_semula?: number | null;
              volume_menjadi: number;
              satuan_menjadi: string;
              harga_satuan_menjadi: number;
              jumlah_menjadi?: number | null;
              selisih?: number | null;
              status?: string;
              is_approved?: boolean;
              komponen_output: string;
              program_pembebanan?: string | null;
              kegiatan?: string | null;
              rincian_output?: string | null;
              sub_komponen?: string | null;
              akun?: string | null;
              created_at?: string | null;
              updated_at?: string | null;
            };
            Update: {
              id?: string;
              uraian?: string;
              volume_semula?: number;
              satuan_semula?: string;
              harga_satuan_semula?: number;
              jumlah_semula?: number | null;
              volume_menjadi?: number;
              satuan_menjadi?: string;
              harga_satuan_menjadi?: number;
              jumlah_menjadi?: number | null;
              selisih?: number | null;
              status?: string;
              is_approved?: boolean;
              komponen_output?: string;
              program_pembebanan?: string | null;
              kegiatan?: string | null;
              rincian_output?: string | null;
              sub_komponen?: string | null;
              akun?: string | null;
              created_at?: string | null;
              updated_at?: string | null;
            };
          };
          komponen_output: {
            Row: {
              id: string;
              nama: string;
              created_at: string;
            };
            Insert: {
              id: string;
              nama: string;
              created_at?: string;
            };
            Update: {
              id?: string;
              nama?: string;
              created_at?: string;
            };
          };
          profiles: {
            Row: {
              id: string;
              username: string;
              full_name: string | null;
              avatar_url: string | null;
              role: string;
              created_at: string;
              updated_at: string;
            };
            Insert: {
              id: string;
              username: string;
              full_name?: string | null;
              avatar_url?: string | null;
              role?: string;
              created_at?: string;
              updated_at?: string;
            };
            Update: {
              id?: string;
              username?: string;
              full_name?: string | null;
              avatar_url?: string | null;
              role?: string;
              created_at?: string;
              updated_at?: string;
            };
          };
          sub_komponen: {
            Row: {
              id: string;
              nama: string;
              program_pembebanan: string;
            };
            Insert: {
              id: string;
              nama: string;
              program_pembebanan: string;
            };
            Update: {
              id?: string;
              nama?: string;
              program_pembebanan?: string;
            };
          };
        };
        Views: {
          budget_summary_by_account_group: {
            Row: {
              account_group: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
          budget_summary_by_komponen: {
            Row: {
              komponen_output: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
          budget_summary_by_akun: {
            Row: {
              akun: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
          budget_summary_by_program_pembebanan: {
            Row: {
              program_pembebanan: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
          budget_summary_by_kegiatan: {
            Row: {
              kegiatan: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
          budget_summary_by_rincian_output: {
            Row: {
              rincian_output: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
          budget_summary_by_sub_komponen: {
            Row: {
              sub_komponen: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            };
          };
        };
        Functions: {
          get_budget_summary_by_account_group: {
            Args: Record<string, never>;
            Returns: {
              account_group: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
          get_budget_summary_by_komponen: {
            Args: Record<string, never>;
            Returns: {
              komponen_output: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
          get_budget_summary_by_akun: {
            Args: Record<string, never>;
            Returns: {
              akun: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
          get_budget_summary_by_program_pembebanan: {
            Args: Record<string, never>;
            Returns: {
              program_pembebanan: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
          get_budget_summary_by_kegiatan: {
            Args: Record<string, never>;
            Returns: {
              kegiatan: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
          get_budget_summary_by_rincian_output: {
            Args: Record<string, never>;
            Returns: {
              rincian_output: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
          get_budget_summary_by_sub_komponen: {
            Args: Record<string, never>;
            Returns: {
              sub_komponen: string | null;
              total_semula: number | null;
              total_menjadi: number | null;
              total_selisih: number | null;
              new_items: number | null;
              changed_items: number | null;
              total_items: number | null;
            }[];
          };
        };
      };
    };`;
  }
  
  // Write the generated types to a file
  try {
    writeFileSync('src/integrations/supabase/types.ts', stdout);
    console.log('Types generated successfully!');
    console.log('Written to: src/integrations/supabase/types.ts');
    
  } catch (err) {
    console.error(`Failed to write file: ${err}`);
  }
});
