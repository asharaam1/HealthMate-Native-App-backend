config/email.js
import nodemailer from "nodemailer";

// Create transporter
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: false, // true for 465, false for other ports
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

const sendEmail = async (options) => {
  try {
    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: options.to,
      subject: options.subject,
      html: options.html,
      text: options.text,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("✅ Email sent:", info.messageId);
    return info;
  } catch (error) {
    console.error("❌ Email sending failed:", error);
    throw new Error("Failed to send email");
  }
};

const sendBookingConfirmation = async (userEmail, bookingDetails) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #F9FAFB; padding: 30px; }
        .booking-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); }
        .detail-row { display: flex; justify-content: space-between; padding: 10px 0; border-bottom: 1px solid #E5E7EB; }
        .label { font-weight: 600; color: #6B7280; }
        .value { color: #111827; }
        .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #FACC15; color: #111827; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🎉 Booking Confirmed!</h1>
          <p>Your venue has been successfully booked</p>
        </div>
        <div class="content">
          <p>Dear ${bookingDetails.userName},</p>
          <p>Thank you for choosing VenueWala! Your booking has been confirmed.</p>
          
          <div class="booking-card">
            <h2 style="color: #1E40AF; margin-top: 0;">Booking Details</h2>
            <div class="detail-row">
              <span class="label">Booking ID:</span>
              <span class="value">#${bookingDetails.bookingId}</span>
            </div>
            <div class="detail-row">
              <span class="label">Venue:</span>
              <span class="value">${bookingDetails.hallName}</span>
            </div>
            <div class="detail-row">
              <span class="label">Date:</span>
              <span class="value">${bookingDetails.date}</span>
            </div>
            <div class="detail-row">
              <span class="label">Capacity:</span>
              <span class="value">${bookingDetails.capacity} guests</span>
            </div>
            <div class="detail-row">
              <span class="label">Total Amount:</span>
              <span class="value" style="font-size: 18px; font-weight: 700; color: #10B981;">Rs. ${bookingDetails.amount}</span>
            </div>
          </div>

          <p>The hall owner will contact you shortly to confirm the arrangements.</p>
          
          <center>
            <a href="${process.env.FRONTEND_URL}/dashboard/user" class="btn">View My Bookings</a>
          </center>
        </div>
        <div class="footer">
          <p>&copy; 2025 VenueWala. All rights reserved.</p>
          <p>Need help? Contact us at support@venuewala.com</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: "🎉 Booking Confirmed - VenueWala",
    html: html,
  });
};

const sendWelcomeEmail = async (userEmail, userName) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 40px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #F9FAFB; padding: 30px; }
        .footer { text-align: center; padding: 20px; color: #6B7280; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 24px; background: #FACC15; color: #111827; text-decoration: none; border-radius: 8px; font-weight: 600; margin: 20px 0; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>Welcome to VenueWala! 🎊</h1>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Welcome to VenueWala - Pakistan's premier venue booking platform!</p>
          <p>You can now browse hundreds of verified wedding halls and event venues across Karachi and book instantly.</p>
          <center>
            <a href="${process.env.FRONTEND_URL}/explore" class="btn">Explore Venues</a>
          </center>
        </div>
        <div class="footer">
          <p>&copy; 2025 VenueWala. All rights reserved.</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: "Welcome to VenueWala! 🎊",
    html: html,
  });
};

const sendAdminBookingNotification = async (adminEmail, bookingDetails) => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #1E40AF; color: white; padding: 30px; text-align: center; }
        .content { background: #F9FAFB; padding: 30px; }
        .btn { display: inline-block; padding: 12px 24px; background: #10B981; color: white; text-decoration: none; border-radius: 8px; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Booking Alert!</h1>
        </div>
        <div class="content">
          <p>You have received a new booking for your venue.</p>
          <p><strong>Booking ID:</strong> #${bookingDetails.bookingId}</p>
          <p><strong>Customer:</strong> ${bookingDetails.userName}</p>
          <p><strong>Date:</strong> ${bookingDetails.date}</p>
          <p><strong>Amount:</strong> Rs. ${bookingDetails.amount}</p>
          <center>
            <a href="${process.env.FRONTEND_URL}/dashboard/admin" class="btn">View Booking</a>
          </center>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: "🔔 New Booking - Action Required",
    html: html,
  });
};

const sendInquiryResponse = async (userEmail, inquiryDetails) => {
  const { name, subject, originalMessage, response, respondedBy } =
    inquiryDetails;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #F9FAFB; padding: 30px; }
        .response-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #3B82F6; }
        .original-message { background: #F3F4F6; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #9CA3AF; }
        .footer { background: #111827; color: #9CA3AF; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 30px; background: #3B82F6; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #1E40AF; margin-top: 0; }
        .label { font-weight: 600; color: #6B7280; font-size: 14px; margin-bottom: 5px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>💬 VenueWala Response</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">We've responded to your inquiry</p>
        </div>
        
        <div class="content">
          <p>Hi <strong>${name}</strong>,</p>
          <p>Thank you for contacting VenueWala. Our team has reviewed your inquiry and here's our response:</p>
          
          <div class="original-message">
            <p class="label">YOUR MESSAGE:</p>
            <p style="margin: 5px 0 0 0;"><strong>Subject:</strong> ${
              subject || "General Inquiry"
            }</p>
            <p style="margin: 10px 0 0 0; color: #374151;">${originalMessage}</p>
          </div>

          <div class="response-card">
            <h2>📩 Our Response</h2>
            <p style="color: #374151; white-space: pre-wrap;">${response}</p>
            <p style="margin-top: 20px; color: #6B7280; font-size: 14px;">
              <strong>Responded by:</strong> ${
                respondedBy || "VenueWala Support Team"
              }
            </p>
          </div>

          <p>If you have any additional questions or need further assistance, please don't hesitate to reach out to us.</p>
          
          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.CLIENT_URL
            }/contact" class="btn">Contact Us Again</a>
          </div>
        </div>
        
        <div class="footer">
          <p><strong>VenueWala</strong></p>
          <p>Your trusted venue booking platform in Pakistan</p>
          <p style="margin-top: 15px;">
            📧 support@venuewala.com | 📱 +92 300 1234567<br>
            🌐 <a href="${
              process.env.CLIENT_URL
            }" style="color: #3B82F6;">www.venuewala.com</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: userEmail,
    subject: `✅ Response to your inquiry: ${
      subject || "Your VenueWala Inquiry"
    }`,
    html: html,
  });
};

const sendNewInquiryNotification = async (adminEmail, inquiryDetails) => {
  const { name, email, phone, subject, message, inquiryId } = inquiryDetails;

  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <style>
        body { font-family: 'Inter', Arial, sans-serif; line-height: 1.6; color: #111827; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: linear-gradient(135deg, #DC2626 0%, #EF4444 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
        .content { background: #F9FAFB; padding: 30px; }
        .inquiry-card { background: white; padding: 20px; border-radius: 8px; margin: 20px 0; box-shadow: 0 1px 3px rgba(0,0,0,0.1); border-left: 4px solid #EF4444; }
        .footer { background: #111827; color: #9CA3AF; padding: 20px; text-align: center; border-radius: 0 0 10px 10px; font-size: 14px; }
        .btn { display: inline-block; padding: 12px 30px; background: #EF4444; color: white; text-decoration: none; border-radius: 6px; margin: 10px 0; }
        h1 { margin: 0; font-size: 28px; }
        h2 { color: #DC2626; margin-top: 0; }
        .info-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #E5E7EB; }
        .label { font-weight: 600; color: #6B7280; }
        .value { color: #111827; }
        .urgent { background: #FEE2E2; color: #991B1B; padding: 10px 15px; border-radius: 6px; margin: 10px 0; text-align: center; font-weight: 600; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>🔔 New Contact Inquiry</h1>
          <p style="margin: 10px 0 0 0; opacity: 0.9;">Action Required</p>
        </div>
        
        <div class="content">
          <div class="urgent">
            ⚠️ New inquiry requires your attention
          </div>

          <p>A new contact inquiry has been submitted on VenueWala. Please review and respond as soon as possible.</p>
          
          <div class="inquiry-card">
            <h2>📋 Inquiry Details</h2>
            
            <div class="info-row">
              <span class="label">Name:</span>
              <span class="value">${name}</span>
            </div>
            
            <div class="info-row">
              <span class="label">Email:</span>
              <span class="value">${email}</span>
            </div>
            
            ${
              phone
                ? `
            <div class="info-row">
              <span class="label">Phone:</span>
              <span class="value">${phone}</span>
            </div>
            `
                : ""
            }
            
            <div class="info-row">
              <span class="label">Subject:</span>
              <span class="value">${subject || "General Inquiry"}</span>
            </div>
            
            <div style="margin-top: 20px; padding-top: 15px; border-top: 2px solid #E5E7EB;">
              <p class="label" style="margin-bottom: 10px;">MESSAGE:</p>
              <p style="color: #374151; background: #F3F4F6; padding: 15px; border-radius: 6px; white-space: pre-wrap;">${message}</p>
            </div>
          </div>

          <div style="text-align: center; margin: 30px 0;">
            <a href="${
              process.env.CLIENT_URL
            }/dashboard/super/contacts" class="btn">View & Respond to Inquiry</a>
          </div>

          <p style="color: #6B7280; font-size: 14px; margin-top: 20px;">
            <strong>Quick Action:</strong> Login to your Super Admin dashboard to view this inquiry and send a response. The customer will receive your response via email.
          </p>
        </div>
        
        <div class="footer">
          <p><strong>VenueWala Admin Panel</strong></p>
          <p>Inquiry ID: ${inquiryId}</p>
        </div>
      </div>
    </body>
    </html>
  `;

  await sendEmail({
    to: adminEmail,
    subject: "🔔 New Contact Inquiry - Action Required",
    html: html,
  });
};

export {
  sendEmail,
  sendBookingConfirmation,
  sendWelcomeEmail,
  sendAdminBookingNotification,
  sendInquiryResponse,
  sendNewInquiryNotification,
};
