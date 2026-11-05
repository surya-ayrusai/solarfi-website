# Solarfi admin: setup guide

The admin area lives at **`/admin/`** on the website, for example `https://solarfi-website.vercel.app/admin/`. It is not linked from the public pages.

**How it stays secure:** login is handled by **Supabase**, which has a free tier. The database itself refuses to show leads to anyone who is not on the admin list, so editing or copying the web page cannot expose data.

Plan about 30–45 minutes.

---

## 1. Create the Supabase project
1. Go to https://supabase.com and sign up. Ideally use a Solarfi-owned Google account so Solarfi owns the project.
2. **New project**:
   - Name: `solarfi`
   - Database password: generate one and store it in a password manager.
   - Region: **Mumbai (ap-south-1)**.
3. Wait about 2 minutes for it to finish setting up.

## 2. Create the tables and security rules
1. Open `supabase/schema.sql` from this repo.
2. **Edit the admin list** near the top. Replace or add emails and choose `admin` or `staff` for each:
   ```sql
   insert into public.admin_users (email, role) values
     ('info.solarfi@gmail.com', 'admin')
   on conflict (email) do nothing;
   ```
   - `admin`: sees all leads, can export CSV, and can deactivate staff.
   - `staff`: sees and updates leads and adds notes. Cannot export.
3. In Supabase, go to **SQL Editor → New query**, paste the whole file and click **Run**. It should say "Success".
4. Optional self-test:
   - Copy the commented block at the bottom of the file, remove the `--` marks and run it.
   - The first two counts must be 0 or "permission denied". The third must be 1 or more.
   - It rolls back, so it leaves nothing behind.

## 3. Turn off public sign-ups (important)
1. Go to **Authentication → Sign In / Providers** (on older dashboards, Authentication → Settings).
2. Switch **"Allow new users to sign up"** to **OFF**.
3. Keep **Email** enabled.

Now nobody can create an account. Staff are added by invitation only (step 6).

## 4. Allow the website addresses (redirect URLs)
In **Authentication → URL Configuration**:
- **Site URL:** `https://solarfi.in/admin/`
  - Until the domain points at Vercel, use `https://solarfi-website.vercel.app/admin/`.
- **Redirect URLs:** add each of these:
  - `https://solarfi-website.vercel.app/admin/`
  - `https://solarfi.in/admin/`
  - `https://www.solarfi.in/admin/`

## 5. Turn on "Sign in with Google" (optional but recommended)
1. In Google Cloud Console (https://console.cloud.google.com), create a project called `Solarfi Admin`.
2. Go to **APIs & Services → OAuth consent screen**:
   - User type: **External**
   - App name: `Solarfi Admin`
   - Support email: your Solarfi email
   - Save.
3. Go to **Credentials → Create credentials → OAuth client ID**:
   - Type: **Web application**
   - Authorised redirect URI: copy the **Callback URL** shown in Supabase under **Authentication → Providers → Google**. It looks like `https://<your-ref>.supabase.co/auth/v1/callback`.
4. Copy the Google **Client ID** and **Client secret** into Supabase → **Providers → Google**, then enable it and save.

If you skip this step, staff can still sign in with the emailed link. The Google button will then show a friendly error.

## 6. Invite each staff member
For each email in the admin list, go to **Authentication → Users → Add user → Send invitation**.

A person needs **both** to get in:
- They have been invited here.
- Their email is in `admin_users` and active.

To remove someone, an admin can set `active = false` in the `admin_users` table (**Table Editor**). Also delete them under Authentication → Users.

## 7. Connect the website
1. In Supabase, open **Project Settings → API** and copy:
   - **Project URL**
   - **anon public** key. This key is meant to be public; the security rules protect the data.
2. Paste both into `admin/config.js`:
   ```js
   supabaseUrl: "https://abcd1234.supabase.co",
   supabaseAnonKey: "eyJ...",
   ```
3. Commit, push, and wait for Vercel to deploy.
4. Open `/admin/` and sign in.

**Never** paste the **service_role** key into the website or the Git repo.

## 8. Send chatbot leads to Supabase from n8n
1. In n8n, go to **Credentials → New → Supabase API**:
   - Host: your Project URL.
   - Service Role Secret: the **service_role** key from Project Settings → API. It stays inside n8n only.
2. In the chatbot workflow, add a **Supabase** node as a tool, or after the existing `save_lead` Google Sheets node:
   - Operation: **Create a row**, Table: `leads`.
   - Map the fields:
     - `name`, `mobile`, `location`, `interest`, `last_message` from the agent's tool arguments.
     - `source` = `chat`
     - `session_id` = `{{ $('When chat message received').item.json.sessionId }}`, adjusted to your trigger node's name.
3. Mobile numbers with `+91`, `0` or spaces are cleaned automatically. Anything that isn't a valid 10-digit Indian mobile is rejected by the database.
4. Keep the Google Sheets step running in parallel until Solarfi is happy with the dashboard.

## 9. Enquiry forms (next step)
The website forms are not connected yet. The safe pattern is: form → n8n webhook → Supabase node (as in step 8). That way the website never needs write access to the database.

---

### Troubleshooting

| Symptom | Fix |
|---|---|
| "Admin setup needed" | `admin/config.js` still has the placeholders. |
| "This account is not authorised" | Email not in `admin_users`, not active, or not invited (step 6). Emails must match exactly (case doesn't matter). |
| Link says expired | Links work once and expire. Request a new one, and open it in the same browser you requested it from. |
| Google button error | Step 5 not done, or the redirect URI doesn't match the Supabase callback URL exactly. |
| Login loops back to sign-in | The site address is missing from Redirect URLs (step 4). |
