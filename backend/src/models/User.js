import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const addressSchema = new mongoose.Schema(
	{
		street: { type: String },
		city: { type: String },
		state: { type: String },
		pincode: { type: String },
	},
	{ _id: false }
);

const userSchema = new mongoose.Schema(
	{
		businessName: { type: String, required: true },
		name: { type: String, required: true },
		email: { type: String, required: true, unique: true, lowercase: true },
		password: { type: String, required: true },
		role: { type: String, enum: ['user', 'admin'], default: 'user' },
		company: { type: String },
		phone: { type: String },
		address: { type: addressSchema },
		approved: { type: Boolean, default: true },
	},
	{ timestamps: true }
);

userSchema.pre('save', async function hashPassword() {
	if (!this.isModified('password')) return;
	const salt = await bcrypt.genSalt(10);
	this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function matchPassword(entered) {
	return bcrypt.compare(entered, this.password);
};

const User = mongoose.model('User', userSchema);

export default User;
