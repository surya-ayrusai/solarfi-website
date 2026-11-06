# WhatsApp lead alerts to Uday (Meta WhatsApp Cloud API)

Every new website lead sends Uday (+91 73582 58385) a WhatsApp message through Meta's official API. The n8n side is already built and **switched off**. You do the Meta steps below, then the n8n steps; switching it on and testing is a short last step.

**Never paste the access token into chat, the repo or the website.** It goes only into the n8n credential.

---

## Part A: Meta (about 30–60 minutes, plus template approval)

### 1. Business portfolio
1. Go to https://business.facebook.com and sign in with the Facebook account that should own Solarfi's WhatsApp.
2. Create a business portfolio named **Solarfi Private Limited**, or use the existing one.

### 2. Developer app with WhatsApp
1. Go to https://developers.facebook.com/apps → **Create app**.
2. Use case: **Connect with customers through WhatsApp**. On older screens, choose app type **Business**.
3. Name it `Solarfi Lead Alerts` and attach it to the Solarfi business portfolio.
4. Open **WhatsApp → API Setup** in the app.

### 3. The sending number
Meta gives you a **test number** right away. It can send to up to 5 phone numbers that you verify.

- **Quickest start (fine for internal alerts to Uday only):** use the test number.
  1. Under **To**, add **+91 7358258385**.
  2. Uday receives a code on WhatsApp and you enter it.
- **Proper setup (recommended within a few weeks):** add a real number.
  1. Click **Add phone number** and use a Solarfi SIM or landline that is **not** currently on the WhatsApp or WhatsApp Business app. It cannot be 7358258385, because that's the number receiving the alerts.
  2. Display name: `Solarfi`.
  3. Verify by SMS or voice call.

From **API Setup**, copy the **Phone number ID** for the number you'll use. It's a long number, and it is **not** the phone number itself. It isn't secret, so you can paste it to me.

### 4. Message template
WhatsApp only allows a business to start a conversation with an approved template.

1. Go to https://business.facebook.com/wa/manage/message-templates → **Create template**.
2. Fill in:
   - **Category:** Utility
   - **Name:** `new_lead_alert` (exactly)
   - **Language:** English (`en`)
   - **Body:** paste exactly:

```
New Solarfi website lead.
Name: {{1}}
Mobile: {{2}}
Property: {{3}}, {{4}}
Usage: {{5}} units per month (about {{6}} kW)
Next step: {{7}}
Full details are in your email and the Leads sheet.
```

3. Sample values Meta asks for:

| Variable | Sample |
|---|---|
| {{1}} | Ramesh Reddy |
| {{2}} | +919876543210 |
| {{3}} | home |
| {{4}} | Kadapa |
| {{5}} | 300 |
| {{6}} | 2.5 |
| {{7}} | CALL - ref 7C6E1997 |

4. Submit. Approval usually takes minutes, sometimes up to a day. Wait for status **Active**.

### 5. A permanent access token
The token on the API Setup page expires after 24 hours, so create a permanent one:

1. In https://business.facebook.com/settings, open **Users → System users → Add**.
2. Name: `n8n`, role: **Admin**.
3. **Assign assets:**
   - the app `Solarfi Lead Alerts` (full control)
   - your WhatsApp account (full control)
4. **Generate new token:**
   - app: `Solarfi Lead Alerts`
   - expiry: **Never**
   - permissions: `whatsapp_business_messaging` and `whatsapp_business_management`
5. Copy the token straight into n8n (Part B). Don't save it anywhere else.

Also note the **WhatsApp Business Account ID**, shown on API Setup and in WhatsApp Manager.

### 6. Payment method
In WhatsApp Manager, add a payment method. Meta charges per template message; a utility message to an Indian number costs roughly ₹0.12–0.15. The test number doesn't need this.

---

## Part B: n8n (5 minutes)

1. In n8n, go to **Credentials → Create credential → WhatsApp API** ("WhatsApp Business Cloud").
2. Name it exactly **`Solarfi WhatsApp`**.
3. Fill in:
   - **Access Token:** the permanent token from step 5
   - **Business Account ID:** the WhatsApp Business Account ID
4. Save.

---

## Part C: switching it on (I'll do this with you)

Once the template is **Active** and the credential exists:

1. In **Intake Config**, set `WHATSAPP_PHONE_NUMBER_ID` to the ID from step 3.
2. Select the `Solarfi WhatsApp` credential on the node **WhatsApp Uday: New Lead**.
3. Set `WHATSAPP_ENABLED` to `true`.
4. Send one test lead and check that Uday receives the message.

### Settings (Intake Config)

| Setting | Value | Meaning |
|---|---|---|
| `WHATSAPP_ENABLED` | `false` | Master switch. `false` = no WhatsApp; email still goes out. |
| `WHATSAPP_TO` | `917358258385` | Recipient, country code and number with no `+` |
| `WHATSAPP_PHONE_NUMBER_ID` | from Meta | The **sending** number's ID |
| `WHATSAPP_TEMPLATE` | `new_lead_alert` | Must match the approved template name |
| `WHATSAPP_TEMPLATE_LANG` | `en` | Must match the template language |
| `GRAPH_API_VERSION` | `v23.0` | Meta Graph API version. Bump it when Meta retires this one. |

### How it behaves
- The message is sent **after** the visitor has been answered, alongside the email, so a WhatsApp problem never affects the form.
- n8n retries once if the send fails. If it still fails, the lead is still saved and emailed.
- Only newly saved leads trigger a message. Rejected, spam, rate-limited and retried requests don't.

### Common errors
| Meta error | Fix |
|---|---|
| `(#132001) Template name does not exist in the translation` | The template name or language doesn't match, or it isn't approved yet |
| `(#131030) Recipient phone number not in allowed list` | Test number: add and verify +91 7358258385 under **To** |
| `(#190) Access token has expired` | You used the 24-hour token. Create the system-user token (step 5). |
| `(#131047) Re-engagement message` | Only happens with non-template messages; this setup always sends a template |
