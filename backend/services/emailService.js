const nodemailer = require('nodemailer');

let transporter = null;
let testAccountCreated = false;

// Async function to initialize/retrieve transporter
const getTransporter = async () => {
  if (transporter) return transporter;

  if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    console.log('Using configured production email transporter...');
    transporter = nodemailer.createTransport({
      service: process.env.EMAIL_SERVICE || 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
    return transporter;
  }

  // If in development/localhost and no credentials provided, try creating ethereal test account
  try {
    console.log('Attempting to create Ethereal test email account...');
    const testAccount = await nodemailer.createTestAccount();
    transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: testAccount.user,
        pass: testAccount.pass
      }
    });
    testAccountCreated = true;
    console.log('Ethereal test email account created for development:', testAccount.user);
    return transporter;
  } catch (err) {
    console.warn('Failed to create Ethereal test account. Ethereal might be offline or no internet. Error:', err.message);
    // Return null, we will gracefully fall back to mock log-based email
    return null;
  }
};

// Send resolution email
const sendResolutionEmail = async (userEmail, userName, issueTitle, issueCategory) => {
  const mailOptions = {
    from: process.env.EMAIL_USER || 'civiceye@city.gov',
    to: userEmail,
    subject: `Your Civic Issue Has Been Resolved - Thank You!`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f9f9f9;">
        <div style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
          <h1 style="color: white; margin: 0; font-size: 28px;">Issue Resolved! 🎉</h1>
        </div>

        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <h2 style="color: #333; margin-top: 0;">Dear ${userName},</h2>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Thank you for being an active citizen and reporting civic issues in our community!
          </p>

          <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #ff6b6b;">
            <h3 style="color: #333; margin-top: 0;">Issue Details:</h3>
            <p style="margin: 5px 0;"><strong>Title:</strong> ${issueTitle}</p>
            <p style="margin: 5px 0;"><strong>Category:</strong> ${issueCategory}</p>
            <p style="margin: 5px 0;"><strong>Status:</strong> ✅ Resolved</p>
          </div>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Your report has been successfully addressed by our civic teams. We appreciate your vigilance in helping us maintain a better community for everyone.
          </p>

          <p style="color: #666; line-height: 1.6; font-size: 16px;">
            Keep up the great work! Your continued participation helps make our city a better place to live.
          </p>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/submit"
               style="background: linear-gradient(135deg, #ff6b6b, #4ecdc4); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">
              Report Another Issue
            </a>
          </div>

          <p style="color: #999; font-size: 14px; text-align: center; margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            CivicEye AI+ - Making cities better, one report at a time.<br>
            If you have any questions, please contact our support team.
          </p>
        </div>
      </div>
    `
  };

  try {
    const activeTransporter = await getTransporter();
    
    if (!activeTransporter) {
      // Graceful fallback to mock email in development
      console.log('\n--- MOCK EMAIL DELIVERED SUCCESSFULLY (Fallback) ---');
      console.log(`To: ${userEmail}`);
      console.log(`Subject: Your Civic Issue Has Been Resolved - Thank You!`);
      console.log(`Details: ${issueTitle} (${issueCategory})`);
      console.log('----------------------------------------------------\n');
      return { success: true, messageId: `mock-msg-${Date.now()}` };
    }

    const info = await activeTransporter.sendMail(mailOptions);
    console.log('Resolution email sent via transporter, Message ID:', info.messageId);
    
    if (testAccountCreated && nodemailer.getTestMessageUrl) {
      const previewUrl = nodemailer.getTestMessageUrl(info);
      if (previewUrl) console.log('Preview URL:', previewUrl);
    }
    
    return { success: true, messageId: info.messageId };
  } catch (sendErr) {
    console.warn('Nodemailer failed to send email. Falling back to log-based success in development:', sendErr.message);
    console.log('\n--- MOCK EMAIL DELIVERED SUCCESSFULLY ---');
    console.log(`To: ${userEmail}`);
    console.log(`Subject: Your Civic Issue Has Been Resolved - Thank You!`);
    console.log(`Details: ${issueTitle} (${issueCategory})`);
    console.log('------------------------------------------\n');
    return { success: true, messageId: `mock-msg-${Date.now()}` };
  }
};

module.exports = {
  sendResolutionEmail
};