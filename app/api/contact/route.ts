import nodemailer from "nodemailer";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, email, countryCode, contact, service, requirement } = body;

    if (!name || !email || !countryCode || !contact || !service || !requirement) {
      return new Response(JSON.stringify({ error: "All fields are required" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return new Response(JSON.stringify({ error: "Invalid email format" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!/^\d{10}$/.test(contact)) {
      return new Response(JSON.stringify({ error: "Contact number must be exactly 10 digits" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (!countryCode.startsWith("+")) {
      return new Response(JSON.stringify({ error: "Invalid country code" }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { EMAIL_HOST, EMAIL_USER, EMAIL_PASS, EMAIL_TO } = process.env;
    if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS || !EMAIL_TO) {
      console.error("Missing email environment variables");
      return new Response(JSON.stringify({ error: "Server email configuration missing" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      });
    }

    const transporter = nodemailer.createTransport({
      host: EMAIL_HOST,
      port: 465,
      secure: true,
      auth: { user: EMAIL_USER, pass: EMAIL_PASS },
      tls: { rejectUnauthorized: false },
    });

    const mailOptions = {
      from: `"Contact Form" <${EMAIL_USER}>`,
      to: EMAIL_TO,
      replyTo: email,
      subject: `New Inquiry: ${service} – ${name}`,
      html: `
        <div style="font-family: Arial, sans-serif; color:#333; max-width:600px;">
          <h2 style="color:#0ebac7;">🚀 New Contact Form Submission</h2>
          <hr style="border:1px solid #eee; margin:20px 0;" />
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> ${countryCode} ${contact}</p>
          <p><strong>Service:</strong> ${service}</p>
          <p><strong>Requirement:</strong></p>
          <blockquote style="background:#f9f9f9; padding:12px; border-left:4px solid #0ebac7; margin:16px 0;">
            ${requirement?.replace(/\n/g, "<br>")}
          </blockquote>
          <hr style="border:1px solid #eee; margin:20px 0;" />
          <small style="color:#777;">Sent via website contact form</small>
        </div>
      `,
      text: `
New Contact Form Submission

Name: ${name}
Email: ${email}
Phone: ${countryCode} ${contact}
Service: ${service}
Requirement: ${requirement}

Sent via website contact form
      `.trim(),
    };

    await transporter.sendMail(mailOptions);

    return new Response(JSON.stringify({ success: true, message: "Mail sent successfully!" }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err: any) {
    console.error("Mail Error:", err);
    return new Response(
      JSON.stringify({
        success: false,
        error: err?.message || "Unknown error",
        message: "Failed to send email.",
      }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
}
