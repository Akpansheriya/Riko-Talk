const Database = require("../../connections/connection");
const Admin = Database.admin;
const adminWallet = Database.adminWallet;
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");





const register = async (req, res) => {
    try {
      const { email, firstName, lastName, password, role } = req.body;
      const admin = await Admin.findOne({ where: { email: email } });
  
      if (admin) {
        return res.status(409).json({
          message: "Admin already exists",
        });
      }
  
      const saltRounds = 10; 
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      const adminData = {
        firstName: firstName,
        lastName: lastName,
        email: email,
        role: role,
        password: hashedPassword, 
      };
  
      const newAdmin = await Admin.create(adminData);
  
      if (role === "admin") {
        await adminWallet.create({
          admin_id: newAdmin.id,
          balance: 0.0,
        });
      }
  
      res.status(201).send({
        message: "Admin created",
        result: newAdmin,
      });
    } catch (error) {
      console.error("Error creating admin:", error);
      res.status(500).send({
        message: "Error creating admin",
        error: error.message,
      });
    }
  };
  const login = async (req, res) => {
    try {
      const { email, password } = req.body;
  
  
      const admin = await Admin.findOne({ where: { email: email } });
  
      if (!admin) {
        return res.status(404).json({
          message: "Admin not found",
        });
      }
  
      
      const isPasswordValid = await bcrypt.compare(password, admin.password);
      if (!isPasswordValid) {
        return res.status(401).json({
          message: "Invalid email or password",
        });
      }
  
    
      const token = jwt.sign(
        { id: admin.id, email: admin.email, role: admin.role },
        process.env.JWT_SECRET || "riko_talk!!!!##$$@##@#", 
        { expiresIn: "1d" } 
      );
  
      admin.token = token;
      await admin.save();
  
      res.status(200).json({
        message: "Login successful",
        token: token,
        admin:admin
      });
    } catch (error) {
      console.error("Error during login:", error);
      res.status(500).json({
        message: "Error during login",
        error: error.message,
      });
    }
  };

  module.exports = {
    register,
    login
  }