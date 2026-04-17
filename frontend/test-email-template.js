// Test the updated email template
const { EmailTemplateService } = require('./db/services/email-templates');

console.log('🧪 Testing Updated Email Template\n');

// Test the waitlist welcome email template
const testName = 'John Doe';
const template = EmailTemplateService.waitlistWelcome(testName);

console.log('📧 Email Template Test Results:');
console.log('Subject:', template.subject);
console.log('\n📝 HTML Content (excerpt):');

// Extract the button link from HTML
const buttonMatch = template.html.match(/<a href="([^"]*)"[^>]*>([^<]*)<\/a>/);
if (buttonMatch) {
  console.log('Button URL:', buttonMatch[1]);
  console.log('Button Text:', buttonMatch[2]);
} else {
  console.log('❌ Button not found in HTML');
}

// Extract logo src from HTML
const logoMatch = template.html.match(/<img src="([^"]*)"[^>]*alt="Persa Logo"/);
if (logoMatch) {
  console.log('Logo URL:', logoMatch[1]);
} else {
  console.log('❌ Logo not found in HTML');
}

console.log('\n📄 Text Content (excerpt):');
// Extract the waitlist link from text
const textLines = template.text.split('\n');
const waitlistLine = textLines.find((line) => line.includes('waitlist:'));
if (waitlistLine) {
  console.log('Waitlist Link:', waitlistLine.trim());
} else {
  console.log('❌ Waitlist link not found in text version');
}

console.log('\n✅ Email template test complete!');
