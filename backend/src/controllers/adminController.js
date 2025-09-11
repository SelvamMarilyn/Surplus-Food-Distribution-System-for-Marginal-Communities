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
                from: `"Surplus Food" <${process.env.EMAIL_USER}>`,
                to: donor.email,
                subject: 'Your Account Has Been Approved!',
                html: `<p>Hello ${donor.name},</p><p>We are pleased to inform you that your donor account has been approved. You can now log in and start using our service to help reduce food waste.</p><p>Thank you for joining our mission!</p>`
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
        res.status(200).json({ message: "Donor rejected successfully." });
    } catch (err) {
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
        res.status(200).json({ message: "Donor blocked successfully." });
    } catch (err) {
        console.error("Failed to block donor:", err);
        res.status(500).json({ message: "Failed to block donor." });
    }
};

const remove = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await adminModel.deleteDonor(id);
        if (result.rowCount === 0) {
            return res.status(404).json({ message: "Donor not found." });
        }
        res.status(200).json({ message: "Donor deleted successfully." });
    } catch (err) {
        console.error("Failed to delete donor:", err);
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
        res.status(200).json({ message: "Donor unblocked successfully." });
    } catch (err) {
        console.error("Failed to unblock donor:", err);
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
    // Optionally send approval email here (like donors)
    res.status(200).json({ message: "NGO approved successfully." });
  } catch (err) {
    console.error("Failed to approve NGO:", err);
    res.status(500).json({ message: "Failed to approve NGO." });
  }
};

const rejectNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.rejectNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    res.status(200).json({ message: "NGO rejected successfully." });
  } catch (err) {
    console.error("Failed to reject NGO:", err);
    res.status(500).json({ message: "Failed to reject NGO." });
  }
};

const blockNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.blockNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    res.status(200).json({ message: "NGO blocked successfully." });
  } catch (err) {
    console.error("Failed to block NGO:", err);
    res.status(500).json({ message: "Failed to block NGO." });
  }
};

const unblockNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.unblockNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    res.status(200).json({ message: "NGO unblocked successfully." });
  } catch (err) {
    console.error("Failed to unblock NGO:", err);
    res.status(500).json({ message: "Failed to unblock NGO." });
  }
};

const deleteNgoController = async (req, res) => {
  const { id } = req.params;
  try {
    const result = await adminModel.deleteNgo(id);
    if (result.rowCount === 0) return res.status(404).json({ message: "NGO not found." });
    res.status(200).json({ message: "NGO deleted successfully." });
  } catch (err) {
    console.error("Failed to delete NGO:", err);
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