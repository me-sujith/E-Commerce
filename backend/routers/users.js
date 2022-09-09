const express = require('express')
const User = require('../models/user')
const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const users = await User.find().select('-passwordHash')
		if (!users) {
			return res.status(404).send('No user Data available')
		}
		res.status(200).json(users)
	} catch (error) {
		console.log('check :', error)
		res.status(500).json({ message: error.message, success: false })
	}
})
router.get('/:id', async (req, res) => {
	try {
		const user = await User.findById(req.params.id).select('-passwordHash')
		if (!user) {
			return res.status(404).send('The User with the given ID was not found.')
		}
		res.status(200).json(user)
	} catch (error) {
		res.status(500).json({ message: error.message, success: false })
	}
})

router.post('/', async (req, res) => {
	try {
		let user = new User({
			name: req.body.name,
			email: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
			phone: req.body.phone,
			isAdmin: req.body.isAdmin,
			apartment: req.body.apartment,
			street: req.body.street,
			zip: req.body.zip,
			city: req.body.city,
			country: req.body.country,
		})
		user = await user.save()
		if (!user) {
			return res.status(403).send('Failed to create user')
		}
		res.status(200).json(user)
	} catch (error) {
		res.status(500).json({ message: error.message, success: false })
	}
})

router.put('/:id', async (req, res) => {
	try {
		const userExist = await User.findById(req.params.id)
		let newPassword = req.body.password
			? req.body.password
			: userExist.passwordHash
		const user = await User.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				email: req.body.email,
				passwordHash: bcrypt.hashSync(newPassword, 10),
				phone: req.body.phone,
				isAdmin: req.body.isAdmin,
				apartment: req.body.apartment,
				street: req.body.street,
				zip: req.body.zip,
				city: req.body.city,
				country: req.body.country,
			},
			{ new: true }
		).select('-passwordHash')
		if (!user) {
			return res.status(404).send('The User with the given ID was not found.')
		}
		res.status(200).json(user)
	} catch (error) {
		res.status(500).json({ message: error.message, success: false })
	}
})

router.post('/login', async (req, res) => {
	try {
		const user = await User.findOne({ email: req.body.email })
		if (!user) {
			return res.status(400).send('The user not found')
		}
		if (user && bcrypt.compareSync(req.body.password, user.passwordHash)) {
			const token = jwt.sign(
				{
					userId: user.id,
					isAdmin: user.isAdmin,
				},
				process.env.SECRET,
				{ expiresIn: '1d' }
			)
			res.status(200).json({ token })
		} else {
			res.status(400).send('Password is wrong')
		}
	} catch (error) {
		res.status(500).json({ message: error.message, success: false })
	}
})

router.post('/register', async (req, res) => {
	try {
		let user = new User({
			name: req.body.name,
			email: req.body.email,
			passwordHash: bcrypt.hashSync(req.body.passwordHash, 10),
			phone: req.body.phone,
			isAdmin: req.body.isAdmin,
			apartment: req.body.apartment,
			street: req.body.street,
			zip: req.body.zip,
			city: req.body.city,
			country: req.body.country,
		})
		user = await user.save()
		if (!user) {
			return res.status(403).send('Failed to create user')
		}
		res.status(200).json(user)
	} catch (error) {
		res.status(500).json({
			message: error.message,
			success: false,
		})
	}
})

router.get('/get/count', async (req, res) => {
	try {
		const usersCount = await User.countDocuments()
		if (!usersCount) {
			return res.status(404).json({ success: false })
		}
		res.status(200).json({ usersCount })
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.delete('/:id', async (req, res) => {
	try {
		const user = User.findByIdAndDelete(req.params.id)
		if (!user) {
			return res
				.status(404)
				.json({ success: false, message: 'product not found!' })
		}
		res.status(200).json({ success: true, message: 'the product is deleted' })
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

module.exports = router
