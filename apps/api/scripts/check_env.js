require("dotenv").config();

console.log("Checking Environment Variables...");
console.log("R2_ENDPOINT:", process.env.R2_ENDPOINT ? "✅ SET" : "❌ MISSING");
console.log("R2_ACCESS_KEY_ID:", process.env.R2_ACCESS_KEY_ID ? "✅ SET" : "❌ MISSING");
console.log("R2_SECRET_ACCESS_KEY:", process.env.R2_SECRET_ACCESS_KEY ? "✅ SET" : "❌ MISSING");
console.log("R2_BUCKET_NAME:", process.env.R2_BUCKET_NAME ? "✅ SET" : "❌ MISSING");
console.log("SENDGRID_API_KEY:", process.env.SENDGRID_API_KEY ? "✅ SET" : "❌ MISSING");
