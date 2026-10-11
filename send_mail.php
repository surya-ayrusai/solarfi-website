<?php
/**
 * Solarfi Contact Form - PHP Mail Handler
 * File: send_mail.php
 *
 * Receives POST data from the contact form on contact-us.html,
 * validates inputs, and sends a formatted HTML email.
 *
 * Requirements: PHP with mail() enabled (or configure SMTP via PHPMailer).
 */

// ─── Configuration ────────────────────────────────────────────────────────────
define('RECIPIENT_EMAIL', 'info@solarfi.in');          // Where inquiries are sent
define('RECIPIENT_NAME', 'Solarfi Team');
define('FROM_EMAIL', 'noreply@solarfi.in');        // Sender "from" address
define('FROM_NAME', 'Solarfi Website');
define('SUBJECT', 'New Solar Inquiry from Website');
define('ALLOWED_ORIGIN', 'https://solarfi.in');        // Change to your domain
// ─────────────────────────────────────────────────────────────────────────────

// ── CORS / Origin headers (adjust for your domain) ───────────────────────────
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
// Allow localhost for development or your live domain
$allowed = [ALLOWED_ORIGIN, 'http://localhost', 'http://127.0.0.1'];
if (in_array($origin, $allowed)) {
  header("Access-Control-Allow-Origin: $origin");
} else {
  header("Access-Control-Allow-Origin: " . ALLOWED_ORIGIN);
}
header('Access-Control-Allow-Methods: POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Content-Type: application/json; charset=UTF-8');

// Handle preflight
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
  http_response_code(200);
  exit;
}

// ── Only accept POST ──────────────────────────────────────────────────────────
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
  http_response_code(405);
  echo json_encode(['success' => false, 'message' => 'Method not allowed.']);
  exit;
}

// ── Read & decode input (supports both JSON body and form-data) ───────────────
$contentType = $_SERVER['CONTENT_TYPE'] ?? '';
if (str_contains($contentType, 'application/json')) {
  $raw = file_get_contents('php://input');
  $data = json_decode($raw, true) ?? [];
} else {
  $data = $_POST;
}

// ── Helper: sanitise a string value ──────────────────────────────────────────
function clean(string $value): string
{
  return htmlspecialchars(strip_tags(trim($value)), ENT_QUOTES, 'UTF-8');
}

// ── Extract & validate fields ─────────────────────────────────────────────────
$name = clean($data['name'] ?? '');
$phone = clean($data['phone'] ?? '');
$email = filter_var(trim($data['email'] ?? ''), FILTER_SANITIZE_EMAIL);
$property_type = clean($data['property_type'] ?? '');
$city = clean($data['city'] ?? '');
$monthly_bill = clean($data['monthly_bill'] ?? '');
$message = clean($data['message'] ?? '');

$errors = [];

if (empty($name))
  $errors[] = 'Full Name is required.';
if (empty($phone))
  $errors[] = 'Phone Number is required.';
if (empty($email) || !filter_var($email, FILTER_VALIDATE_EMAIL)) {
  $errors[] = 'A valid Email Address is required.';
}
if (empty($property_type))
  $errors[] = 'Property Type is required.';
if (empty($city))
  $errors[] = 'City / State is required.';
if (empty($monthly_bill))
  $errors[] = 'Average Electricity Bill is required.';

if (!empty($errors)) {
  http_response_code(422);
  echo json_encode(['success' => false, 'message' => implode(' ', $errors)]);
  exit;
}

// ── Spam protection: honeypot check ──────────────────────────────────────────
// Add a hidden field named "website" to your form; bots fill it, humans don't.
if (!empty($data['website'])) {
  http_response_code(200); // Appear successful to the bot
  echo json_encode(['success' => true, 'message' => 'Thank you!']);
  exit;
}

// ── Build HTML email ──────────────────────────────────────────────────────────
$year = date('Y');
$submitted = date('d M Y, h:i A');

$htmlBody = <<<HTML
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<style>
  body      { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7f6; margin: 0; padding: 0; }
  .wrap     { max-width: 640px; margin: 40px auto; background: #fff; border-radius: 12px;
               overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .header   { background: linear-gradient(135deg, #1a8c3e 0%, #0f5e28 100%);
               padding: 36px 40px; text-align: center; }
  .header h1{ color: #fff; margin: 0; font-size: 1.6rem; letter-spacing: .5px; }
  .header p { color: #b7f5cf; margin: 6px 0 0; font-size: 0.9rem; }
  .body     { padding: 36px 40px; }
  .label    { font-size: 0.75rem; font-weight: 700; text-transform: uppercase;
               letter-spacing: 1px; color: #1a8c3e; margin-bottom: 4px; }
  .value    { font-size: 1rem; color: #1e1b4b; padding: 10px 14px; background: #f8fafc;
               border-radius: 8px; border-left: 4px solid #1a8c3e; margin-bottom: 20px;
               word-break: break-word; }
  .row      { display: flex; gap: 20px; }
  .row .col { flex: 1; }
  .divider  { border: none; border-top: 1px solid #e2e8f0; margin: 28px 0; }
  .footer   { background: #1e1b4b; padding: 20px 40px; text-align: center;
               color: #94a3b8; font-size: 0.8rem; }
  .badge    { display: inline-block; background: #fbbf24; color: #1e1b4b;
               font-weight: 700; font-size: 0.75rem; padding: 3px 10px;
               border-radius: 20px; margin-bottom: 8px; }
</style>
</head>
<body>
<div class="wrap">
  <div class="header">
    <span class="badge">⚡ New Solar Inquiry</span>
    <h1>Solarfi — Lead Notification</h1>
    <p>Submitted on $submitted</p>
  </div>

  <div class="body">
    <div class="row">
      <div class="col">
        <div class="label">Full Name</div>
        <div class="value">$name</div>
      </div>
      <div class="col">
        <div class="label">Phone Number</div>
        <div class="value">$phone</div>
      </div>
    </div>

    <div class="label">Email Address</div>
    <div class="value">$email</div>

    <div class="row">
      <div class="col">
        <div class="label">Property Type</div>
        <div class="value">$property_type</div>
      </div>
      <div class="col">
        <div class="label">City / State</div>
        <div class="value">$city</div>
      </div>
    </div>

    <div class="label">Average Monthly Electricity Bill</div>
    <div class="value">$monthly_bill</div>

    <hr class="divider">

    <div class="label">Additional Message</div>
    <div class="value">{$message}</div>
  </div>

  <div class="footer">
    © $year Solarfi &nbsp;|&nbsp; This is an automated lead notification.
  </div>
</div>
</body>
</html>
HTML;

// Plain-text fallback
$plainBody = "New Solar Inquiry – Solarfi\n"
  . "================================\n"
  . "Submitted : $submitted\n\n"
  . "Name        : $name\n"
  . "Phone       : $phone\n"
  . "Email       : $email\n"
  . "Property    : $property_type\n"
  . "City/State  : $city\n"
  . "Bill (Avg)  : $monthly_bill\n\n"
  . "Message:\n$message\n";

// ── Build MIME email ──────────────────────────────────────────────────────────
$boundary = '=_' . md5(uniqid('', true));

$headers = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
$headers .= "Reply-To: $name <$email>\r\n";
$headers .= "To: " . RECIPIENT_NAME . " <" . RECIPIENT_EMAIL . ">\r\n";
$headers .= "MIME-Version: 1.0\r\n";
$headers .= "Content-Type: multipart/alternative; boundary=\"$boundary\"\r\n";
$headers .= "X-Mailer: PHP/" . PHP_VERSION . "\r\n";
$headers .= "X-Priority: 1 (Highest)\r\n";

$body = "--$boundary\r\n";
$body .= "Content-Type: text/plain; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $plainBody . "\r\n";

$body .= "--$boundary\r\n";
$body .= "Content-Type: text/html; charset=UTF-8\r\n";
$body .= "Content-Transfer-Encoding: 8bit\r\n\r\n";
$body .= $htmlBody . "\r\n";

$body .= "--$boundary--";

// ── Send email ────────────────────────────────────────────────────────────────
$sent = mail(RECIPIENT_EMAIL, SUBJECT, $body, $headers);

if ($sent) {
  // Optional: Also send a confirmation/auto-reply to the lead
  $autoSubject = 'Thank you for contacting Solarfi – We\'ll reach out shortly!';
  $autoHeaders = "From: " . FROM_NAME . " <" . FROM_EMAIL . ">\r\n";
  $autoHeaders .= "Reply-To: " . RECIPIENT_EMAIL . "\r\n";
  $autoHeaders .= "MIME-Version: 1.0\r\n";
  $autoHeaders .= "Content-Type: text/html; charset=UTF-8\r\n";

  $autoBody = <<<AUTOBODY
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8">
<style>
  body { font-family: 'Segoe UI', Arial, sans-serif; background: #f4f7f6; margin:0; padding:0; }
  .wrap { max-width: 600px; margin: 40px auto; background: #fff; border-radius: 12px;
          overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.10); }
  .hdr  { background: linear-gradient(135deg,#1a8c3e,#0f5e28); padding:36px 40px; text-align:center; }
  .hdr h1 { color:#fff; margin:0; font-size:1.5rem; }
  .hdr p  { color:#b7f5cf; margin:8px 0 0; }
  .bdy  { padding:36px 40px; color:#334155; line-height:1.7; }
  .btn  { display:inline-block; margin-top:24px; background:#1a8c3e; color:#fff;
          padding:14px 32px; border-radius:8px; text-decoration:none; font-weight:700; }
  .ftr  { background:#1e1b4b; padding:18px 40px; color:#94a3b8; font-size:0.8rem; text-align:center; }
</style>
</head>
<body>
<div class="wrap">
  <div class="hdr">
    <h1>⚡ Thank You, $name!</h1>
    <p>Your solar inquiry has been received.</p>
  </div>
  <div class="bdy">
    <p>Hi <strong>$name</strong>,</p>
    <p>Thank you for reaching out to <strong>Solarfi</strong>. We have received your inquiry and one of our solar experts will contact you within <strong>24 hours</strong> to discuss your requirements.</p>
    <p><strong>Your Submission Summary:</strong></p>
    <ul>
      <li><strong>Phone:</strong> $phone</li>
      <li><strong>Property Type:</strong> $property_type</li>
      <li><strong>Location:</strong> $city</li>
      <li><strong>Monthly Bill:</strong> $monthly_bill</li>
    </ul>
    <p>In the meantime, feel free to explore our website or WhatsApp us directly:</p>
    <a class="btn" href="https://wa.me/917358258385">Chat on WhatsApp ➔</a>
  </div>
  <div class="ftr">© $year Solarfi &nbsp;|&nbsp; info@solarfi.in &nbsp;|&nbsp; +91 7358258385</div>
</div>
</body>
</html>
AUTOBODY;

  mail($email, $autoSubject, $autoBody, $autoHeaders);

  http_response_code(200);
  echo json_encode([
    'success' => true,
    'message' => 'Your inquiry has been submitted successfully! We\'ll contact you within 24 hours.'
  ]);
} else {
  http_response_code(500);
  echo json_encode([
    'success' => false,
    'message' => 'Sorry, we could not send your message right now. Please try calling us directly.'
  ]);
}
