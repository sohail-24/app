import Razorpay from "razorpay";
import "dotenv/config";

if (!process.env.RAZORPAY_KEY_ID || !process.env.RAZORPAY_KEY_SECRET) {
  console.warn("Razorpay credentials are not set in the environment.");
}

export const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID || "rzp_test_fallback",
  key_secret: process.env.RAZORPAY_KEY_SECRET || "fallback_secret",
});
