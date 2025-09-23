const mongoose = require("mongoose");

// Define the registration schema
const registrationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"], // Name is a required field
      trim: true, // Trim spaces from both ends of the name
    },
    email: {
      type: String,
      required: [true, "Email is required"], // Email is a required field
      unique: true, // Ensures email is unique
      trim: true, // Trim spaces from email
      lowercase: true, // Convert email to lowercase
      validate: {
        validator: (v) => {
          // Email validation using regex
          return /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(v);
        },
        message: (props) => `${props.value} is not a valid email address!`, // Custom error message
      },
    },
    password: {
      type: String,
      required: [true, "Password is required"], // Password is a required field
      minlength: [6, "Password should be at least 6 characters"], // Password length validation
    },
    u_id: {
      type: Number,
      unique: true, // Ensures the u_id is unique for each user
    },
    removed: {
      type: Boolean,
      default: false, // Default value is false, indicating the user is not removed
    },
    enabled: {
      type: Boolean,
      default: true, // Default value is true, indicating the user is enabled
    },
  },
  { timestamps: true } // Automatically adds createdAt and updatedAt fields
);

// Static method to generate unique u_id by incrementing
registrationSchema.statics.generateUniqueUId = async function () {
  // Find the latest u_id in the collection
  const latestUser = await this.findOne().sort({ u_id: -1 }).exec();

  // If there are no users, start u_id from 1, else increment the latest u_id
  const newUId = latestUser ? latestUser.u_id + 1 : 1;

  return newUId;
};

// Pre-save hook to generate the unique u_id (atomic increment logic)
registrationSchema.pre("save", async function (next) {
  if (this.isNew) {
    try {
      const uId = await this.constructor.generateUniqueUId(); // Get the new u_id
      this.u_id = uId; // Assign the new u_id to the document
    } catch (error) {
      console.error("Error generating u_id:", error);
      throw new Error("Failed to generate u_id");
    }
  }
  next(); // Proceed with saving the document
});

// Create the model from the schema
const Registration = mongoose.model("Registration", registrationSchema);

// Export the model
module.exports = Registration;
