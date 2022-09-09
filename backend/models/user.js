const mongoose = require('mongoose')

const userSchema = new mongoose.Schema({
	name: {
		type: String,
		required: true,
	},
	email: {
		type: String,
		required: true,
	},
	passwordHash: {
		type: String,
		required: true,
	},
	phone: {
		type: String,
		required: true,
	},
	street: {
		type: String,
		default: '',
	},
	apartment: {
		type: String,
		default: '',
	},
	city: {
		type: String,
		required: true,
	},
	zip: {
		type: String,
		default: '',
	},
	country: {
		type: String,
		default: '',
	},
	isAdmin: {
		type: Boolean,
		default: false,
	},
})

const User = mongoose.model('User', userSchema)

module.exports = User

