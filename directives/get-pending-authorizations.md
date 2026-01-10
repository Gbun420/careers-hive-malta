# Get Pending Authorizations

## Goal
To retrieve a list of pending employer verifications and pending user profiles from the Supabase database. This information is used for manual authorization by an administrator.

## Inputs
- Supabase URL (e.g., `http://127.0.0.1:54321`)
- Supabase Service Role Key (e.g., `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJwaG9uZV9rZXkiOiJzYl9zZWNyZXRfTjdVTkQwVWdqS1RWSy1Vb2RrbTBIZ194U3ZFTVB2eiIsImlhdCI6MTcwNzQxODgwNCwiZXhwIjoxNzQ1NDc4ODA0fQ.zJp2P13_L5bZzI5kX8M9yD3g8c6_P6_v5Z4V1K0bXo0`)

## Tools/Scripts to Use
- A Supabase client library (e.g., `@supabase/supabase-js`) in a Node.js environment or direct SQL client access.

## Steps

1.  **Initialize Supabase Client**:
    *   Use the provided Supabase URL and Service Role Key to initialize a Supabase client with admin privileges.

2.  **Fetch Pending Employer Verifications**:
    *   Query the `employer_verifications` table.
    *   Filter results where the `status` column is equal to `'pending'`.
    *   Select relevant fields such as `id`, `employer_id`, `status`, `company_name`, `contact_email`, etc.

3.  **Fetch Pending User Profiles**:
    *   Query the `profiles` table.
    *   Filter results where the `status` column is equal to `'PENDING'`.
    *   Select relevant fields such as `id`, `full_name`, `email`, `status`, `role`, etc.

4.  **Present Results**:
    *   Format the retrieved data into a readable list.
    *   Output the list to the console or a file.

## Expected Output
A structured list of pending employer verifications and pending user profiles.

## Edge Cases
- No pending verifications or profiles: The output should clearly state that no pending items were found for that category.
- Database connection errors: Gracefully handle and report any connection or query errors.
- Invalid Supabase credentials: Report authentication failures.
