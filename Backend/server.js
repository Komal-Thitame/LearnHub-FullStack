const express = require("express");
const cors = require("cors");
const app = express();

app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Saari logic files ko yahan import karein
const admissionRoutes = require("./admission-db");
const enquiryRoutes = require("./stud-enquiry-db");
const paymentRoutes = require("./payment-db")
const instructorRoutes = require("./instructor-db")
const viewcoursesRoutes = require("./view-courses-db")
const analyticsRoutes = require("./analytics-db");



// const instructorRoutes = require("./instructor-db"); // Future ke liye

// Routes ko "use" karein
app.use("/", admissionRoutes); 
app.use("/", enquiryRoutes);
app.use("/", paymentRoutes); 
app.use("/", instructorRoutes); 
app.use("/", viewcoursesRoutes); 
app.use("/", analyticsRoutes);




// app.use("/", instructorRoutes);

app.listen(5000, () => {
  console.log("🚀 Master Server running on http://localhost:5000");
});