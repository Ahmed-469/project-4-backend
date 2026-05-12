const mongoose = require('mongoose');

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3
    },
    role: {
      type: String,
      enum: ['user', 'owner'],
      default: 'user'
    },
    hashedPassword: {
      type: String,
      minlength: 3,
      required: true
    },
  },
  { timestamps: true }
);

userSchema.set('toJSON', {
    transform: (document, returnedObject) => {
        delete returnedObject.hashedPassword;
    }
});

const User = mongoose.model('User', userSchema);
module.exports = User;
