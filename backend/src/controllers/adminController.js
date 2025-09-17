const adminModel = require('../models/adminModel');
const donorModel = require('../models/donorModel');
const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');

// Configure Nodemailer for sending emails
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
    },
    tls: {
        rejectUnauthorized: false
    }
});

const getDonors = async (req, res) => {
    try {
        // Change: Fetch all donors, not just pending ones
        const result = await adminModel.getAllDonors();
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Failed to retrieve donors:", err);
        res.status(500).json({ message: "Failed to retrieve donors." });
    }
};

const approve = async (req, res) => {
    const { id } = req.params;
    try {
        // First, update the donor status in the database
        const result = await adminModel.approveDonor(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }

        // Now, fetch donor details to get their email
        const donorResult = await donorModel.findDonorById(id);
        const donor = donorResult.rows[0];

        if (donor) {
            // Send the approval email only after the database update is confirmed
            const mailOptions = {
                from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
                to: donor.email,
                subject: '🎉 Welcome to HopeBites - Your Account is Approved!',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
                            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-bottom: 20px;">🎉 Congratulations! Your Account is Approved</h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Dear ${donor.name},
                            </p>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                We are thrilled to welcome you to the HopeBites community! Your donor account has been successfully approved and you can now start posting food donations to help reduce waste and serve communities in need.
                            </p>
                            
                            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #155724; margin: 0; font-weight: 500;">
                                    <strong>Account Status:</strong> Active and Ready to Use
                                </p>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                You can now log in to your account and start posting surplus food items. Our intelligent matching system will connect you with local NGOs and community organizations that can distribute your donations to those in need.
                            </p>
                            
                            <div style="background: #e8f5e8; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #155724; margin: 0; font-size: 14px;">
                                    <strong>🍽️ What you can do now:</strong><br/>
                                    • Post surplus food items with photos and details<br/>
                                    • Set pickup preferences and availability<br/>
                                    • Track your donations and impact<br/>
                                    • Connect with local community organizations
                                </p>
                            </div>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #999; font-size: 14px; margin: 0;">
                                    Best regards,<br>
                                    <strong>The HopeBites Team</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };
            
            // Wait for the email to be sent successfully
            await transporter.sendMail(mailOptions);
            console.log(`Approval email sent to ${donor.email}`);
        } else {
            console.error(`Donor with ID ${id} not found after database update. Email not sent.`);
        }

        // Only send the success response to the client after all other operations are complete
        res.status(200).json({ message: "Donor approved successfully." });

    } catch (err) {
        // This catch block will now handle errors from both the database and the email sending
        console.error("Failed to approve donor or send email:", err);
        res.status(500).json({ message: "Failed to approve donor." });
    }
};

const reject = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await adminModel.rejectDonor(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }

        // Fetch donor details to send rejection email
        const donorResult = await donorModel.findDonorById(id);
        const donor = donorResult.rows[0];

        if (donor) {
            const mailOptions = {
                from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
                to: donor.email,
                subject: 'Account Application Update - HopeBites Platform',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
                            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-bottom: 20px;">Application Status Update</h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Dear ${donor.name},
                            </p>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Thank you for your interest in joining HopeBites as a food donor. After careful review of your application, we regret to inform you that we are unable to approve your account at this time.
                            </p>
                            
                            <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #856404; margin: 0; font-weight: 500;">
                                    <strong>Next Steps:</strong> You may reapply in the future with updated documentation or contact our support team for more information about our requirements.
                                </p>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                We appreciate your commitment to reducing food waste and helping communities in need. Please don't hesitate to reach out if you have any questions.
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #999; font-size: 14px; margin: 0;">
                                    Best regards,<br>
                                    <strong>The HopeBites Team</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`Rejection email sent to ${donor.email}`);
        }

        res.status(200).json({ message: "Donor rejected successfully." });
    } catch (err) {
        console.error("Failed to reject donor or send email:", err);
        res.status(500).json({ message: "Failed to reject donor." });
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;
    try {
        const result = await adminModel.findAdminByUsername(username);
        const user = result.rows[0];

        if (!user || !bcrypt.compareSync(password, user.password)) {
            return res.status(401).json({ message: "Invalid username or password." });
        }
        res.status(200).json({ message: "Login successful." });
    } catch (err) {
        res.status(500).json({ message: "An error occurred during login." });
    }
};
const getAllDonors = async (req, res) => {
    try {
        const result = await adminModel.getAllDonors();
        res.status(200).json(result.rows);
    } catch (err) {
        console.error("Failed to retrieve all donors:", err);
        res.status(500).json({ message: "Failed to retrieve all donors." });
    }
};
const block = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await adminModel.blockDonor(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }

        // Fetch donor details to send block notification email
        const donorResult = await donorModel.findDonorById(id);
        const donor = donorResult.rows[0];

        if (donor) {
            const mailOptions = {
                from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
                to: donor.email,
                subject: 'Account Suspension Notice - HopeBites Platform',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
                            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-bottom: 20px;">Account Suspension Notice</h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Dear ${donor.name},
                            </p>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                We are writing to inform you that your HopeBites donor account has been temporarily suspended due to a violation of our platform policies.
                            </p>
                            
                            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #721c24; margin: 0; font-weight: 500;">
                                    <strong>Account Status:</strong> Temporarily Suspended
                                </p>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                During this suspension period, you will not be able to access your account or post food donations. If you believe this action was taken in error, please contact our support team immediately.
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #999; font-size: 14px; margin: 0;">
                                    Best regards,<br>
                                    <strong>The HopeBites Team</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`Block notification email sent to ${donor.email}`);
        }

        res.status(200).json({ message: "Donor blocked successfully." });
    } catch (err) {
        console.error("Failed to block donor or send email:", err);
        res.status(500).json({ message: "Failed to block donor." });
    }
};

const remove = async (req, res) => {
    const { id } = req.params;
    try {
        // Fetch donor details before deletion to send notification email
        const donorResult = await donorModel.findDonorById(id);
        const donor = donorResult.rows[0];

        const result = await adminModel.deleteDonor(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }

        // Send deletion notification email
        if (donor) {
            const mailOptions = {
                from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
                to: donor.email,
                subject: 'Account Deletion Notice - HopeBites Platform',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
                            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-bottom: 20px;">Account Deletion Notice</h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Dear ${donor.name},
                            </p>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                We are writing to inform you that your HopeBites donor account has been permanently deleted from our platform.
                            </p>
                            
                            <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #721c24; margin: 0; font-weight: 500;">
                                    <strong>Account Status:</strong> Permanently Deleted
                                </p>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                All your account data, including donation history and profile information, has been removed from our system. If you believe this action was taken in error, please contact our support team immediately.
                            </p>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Thank you for your past contributions to our mission of reducing food waste and helping communities in need.
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #999; font-size: 14px; margin: 0;">
                                    Best regards,<br>
                                    <strong>The HopeBites Team</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`Deletion notification email sent to ${donor.email}`);
        }

        res.status(200).json({ message: "Donor deleted successfully." });
    } catch (err) {
        console.error("Failed to delete donor or send email:", err);
        res.status(500).json({ message: "Failed to delete donor." });
    }
};
const unblock = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await adminModel.unblockDonor(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }

        // Fetch donor details to send unblock notification email
        const donorResult = await donorModel.findDonorById(id);
        const donor = donorResult.rows[0];

        if (donor) {
            const mailOptions = {
                from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
                to: donor.email,
                subject: 'Account Restored - Welcome Back to HopeBites',
                html: `
                    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
                        <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
                            <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
                            <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
                        </div>
                        
                        <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
                            <h2 style="color: #333; margin-bottom: 20px;">Account Restored</h2>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Dear ${donor.name},
                            </p>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                Great news! Your HopeBites donor account has been restored and you can now access all platform features again.
                            </p>
                            
                            <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                                <p style="color: #155724; margin: 0; font-weight: 500;">
                                    <strong>Account Status:</strong> Active and Ready to Use
                                </p>
                            </div>
                            
                            <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                                You can now log in to your account and continue helping reduce food waste in your community. Thank you for your patience and continued commitment to our mission.
                            </p>
                            
                            <div style="text-align: center; margin-top: 30px;">
                                <p style="color: #999; font-size: 14px; margin: 0;">
                                    Best regards,<br>
                                    <strong>The HopeBites Team</strong>
                                </p>
                            </div>
                        </div>
                        
                        <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
                            <p>This is an automated message. Please do not reply to this email.</p>
                        </div>
                    </div>
                `
            };
            
            await transporter.sendMail(mailOptions);
            console.log(`Unblock notification email sent to ${donor.email}`);
        }

        res.status(200).json({ message: "Donor unblocked successfully." });
    } catch (err) {
        console.error("Failed to unblock donor or send email:", err);
        res.status(500).json({ message: "Failed to unblock donor." });
    }
};
const getNgos = async (req, res) => {
  try {
    const result = await adminModel.getAllNgos();
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Failed to retrieve NGOs:", err);
    res.status(500).json({ message: "Failed to retrieve NGOs." });
  }
};

const approveNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.approveNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    
    // Fetch NGO details to send approval email
    const ngoModel = require('../models/ngoModel');
    const ngoResult = await ngoModel.findNgoById(id);
    const ngo = ngoResult.rows[0];

    if (ngo) {
      const mailOptions = {
        from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
        to: ngo.email,
        subject: 'Welcome to HopeBites - Your NGO Account is Approved!',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">🎉 Congratulations! Your Account is Approved</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Dear ${ngo.name} Team,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We are thrilled to welcome you to the HopeBites community! Your NGO account has been successfully approved and you can now start connecting with food donors to serve your community.
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #155724; margin: 0; font-weight: 500;">
                  <strong>Account Status:</strong> Active and Ready to Use
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                You can now log in to your account and start requesting food donations from our network of generous donors. Together, we can make a significant impact in reducing food waste and helping those in need.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The HopeBites Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Approval email sent to NGO ${ngo.email}`);
    }
    
    res.status(200).json({ message: "NGO approved successfully." });
  } catch (err) {
    console.error("Failed to approve NGO or send email:", err);
    res.status(500).json({ message: "Failed to approve NGO." });
  }
};

const rejectNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.rejectNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    
    // Fetch NGO details to send rejection email
    const ngoModel = require('../models/ngoModel');
    const ngoResult = await ngoModel.findNgoById(id);
    const ngo = ngoResult.rows[0];

    if (ngo) {
      const mailOptions = {
        from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
        to: ngo.email,
        subject: 'Application Status Update - HopeBites Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Application Status Update</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Dear ${ngo.name} Team,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your interest in joining HopeBites as a partner organization. After careful review of your application, we regret to inform you that we are unable to approve your account at this time.
              </p>
              
              <div style="background: #fff3cd; border: 1px solid #ffeaa7; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #856404; margin: 0; font-weight: 500;">
                  <strong>Next Steps:</strong> You may reapply in the future with updated documentation or contact our support team for more information about our requirements.
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We appreciate your commitment to serving communities in need. Please don't hesitate to reach out if you have any questions.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The HopeBites Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Rejection email sent to NGO ${ngo.email}`);
    }
    
    res.status(200).json({ message: "NGO rejected successfully." });
  } catch (err) {
    console.error("Failed to reject NGO or send email:", err);
    res.status(500).json({ message: "Failed to reject NGO." });
  }
};

const blockNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.blockNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    
    // Fetch NGO details to send block notification email
    const ngoModel = require('../models/ngoModel');
    const ngoResult = await ngoModel.findNgoById(id);
    const ngo = ngoResult.rows[0];

    if (ngo) {
      const mailOptions = {
        from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
        to: ngo.email,
        subject: 'Account Suspension Notice - HopeBites Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Account Suspension Notice</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Dear ${ngo.name} Team,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We are writing to inform you that your HopeBites NGO account has been temporarily suspended due to a violation of our platform policies.
              </p>
              
              <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #721c24; margin: 0; font-weight: 500;">
                  <strong>Account Status:</strong> Temporarily Suspended
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                During this suspension period, you will not be able to access your account or request food donations. If you believe this action was taken in error, please contact our support team immediately.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The HopeBites Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Block notification email sent to NGO ${ngo.email}`);
    }
    
    res.status(200).json({ message: "NGO blocked successfully." });
  } catch (err) {
    console.error("Failed to block NGO or send email:", err);
    res.status(500).json({ message: "Failed to block NGO." });
  }
};

const unblockNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.unblockNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    
    // Fetch NGO details to send unblock notification email
    const ngoModel = require('../models/ngoModel');
    const ngoResult = await ngoModel.findNgoById(id);
    const ngo = ngoResult.rows[0];

    if (ngo) {
      const mailOptions = {
        from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
        to: ngo.email,
        subject: 'Account Restored - Welcome Back to HopeBites',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Account Restored</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Dear ${ngo.name} Team,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Great news! Your HopeBites NGO account has been restored and you can now access all platform features again.
              </p>
              
              <div style="background: #d4edda; border: 1px solid #c3e6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #155724; margin: 0; font-weight: 500;">
                  <strong>Account Status:</strong> Active and Ready to Use
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                You can now log in to your account and continue requesting food donations from our network of generous donors. Thank you for your patience and continued commitment to our mission.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The HopeBites Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Unblock notification email sent to NGO ${ngo.email}`);
    }
    
    res.status(200).json({ message: "NGO unblocked successfully." });
  } catch (err) {
    console.error("Failed to unblock NGO or send email:", err);
    res.status(500).json({ message: "Failed to unblock NGO." });
  }
};

const deleteNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    // Fetch NGO details before deletion to send notification email
    const ngoModel = require('../models/ngoModel');
    const ngoResult = await ngoModel.findNgoById(id);
    const ngo = ngoResult.rows[0];

    const result = await adminModel.deleteNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });

    // Send deletion notification email
    if (ngo) {
      const mailOptions = {
        from: `"HopeBites Admin" <${process.env.EMAIL_USER}>`,
        to: ngo.email,
        subject: 'Account Deletion Notice - HopeBites Platform',
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
            <div style="background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%); padding: 30px; border-radius: 10px; text-align: center; margin-bottom: 20px;">
              <h1 style="color: white; margin: 0; font-size: 28px;">HopeBites</h1>
              <p style="color: white; margin: 10px 0 0 0; font-size: 16px;">Food Distribution Platform</p>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 10px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
              <h2 style="color: #333; margin-bottom: 20px;">Account Deletion Notice</h2>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Dear ${ngo.name} Team,
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                We are writing to inform you that your HopeBites NGO account has been permanently deleted from our platform.
              </p>
              
              <div style="background: #f8d7da; border: 1px solid #f5c6cb; border-radius: 8px; padding: 15px; margin: 20px 0;">
                <p style="color: #721c24; margin: 0; font-weight: 500;">
                  <strong>Account Status:</strong> Permanently Deleted
                </p>
              </div>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                All your account data, including request history and profile information, has been removed from our system. If you believe this action was taken in error, please contact our support team immediately.
              </p>
              
              <p style="color: #666; line-height: 1.6; margin-bottom: 20px;">
                Thank you for your past contributions to our mission of reducing food waste and helping communities in need.
              </p>
              
              <div style="text-align: center; margin-top: 30px;">
                <p style="color: #999; font-size: 14px; margin: 0;">
                  Best regards,<br>
                  <strong>The HopeBites Team</strong>
                </p>
              </div>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #999; font-size: 12px;">
              <p>This is an automated message. Please do not reply to this email.</p>
            </div>
          </div>
        `
      };
      
      await transporter.sendMail(mailOptions);
      console.log(`Deletion notification email sent to NGO ${ngo.email}`);
    }

    res.status(200).json({ message: "NGO deleted successfully." });
  } catch (err) {
    console.error("Failed to delete NGO or send email:", err);
    res.status(500).json({ message: "Failed to delete NGO." });
  }
};

module.exports = {
    getDonors,
    getAllDonors,
    approve,
    reject,
    login,
    block,
    remove,
    unblock,
    getNgos,
    approveNgoController,
    rejectNgoController,
    blockNgoController,
    unblockNgoController,
    deleteNgoController
};