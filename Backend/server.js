const express = require("express");
const cors = require("cors");
const path = require("path");

const app = express();

// Middleware
app.use(cors());

// Body Parser with higher limit for Base64 Profile Photos
app.use(express.json({ limit: '50mb' })); 
app.use(express.urlencoded({ limit: '50mb', extended: true }));

// Static folder for images (if needed for local storage)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Import Routes
const admissionRoutes = require("./admission-db");
const enquiryRoutes = require("./stud-enquiry-db");
const paymentRoutes = require("./payment-db");
const instructorRoutes = require("./instructor-db");
const viewcoursesRoutes = require("./view-courses-db");
const analyticsRoutes = require("./analytics-db");
const dashboardDB = require("./dashboard-db");
const notificationRoutes = require("./notification-db");
const authRoutes = require("./auth-db");
const receiptRouter = require("./receipt-db"); // File path sahi check karein
// Use Routes
app.use("/", admissionRoutes); 
app.use("/", enquiryRoutes);
app.use("/", paymentRoutes); 
app.use("/", instructorRoutes); 
app.use("/", viewcoursesRoutes); 
app.use("/", analyticsRoutes);
app.use("/", dashboardDB);
app.use("/", notificationRoutes);
app.use("/", authRoutes);
app.use("/api/payments", receiptRouter);// Server Start
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
const PORT = 5000;
app.listen(PORT, () => {
  console.log(`🚀 Master Server running on http://localhost:${PORT}`);
});