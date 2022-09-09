const Category = require('../models/category')
const mongoose = require('mongoose')

const express = require('express')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const categories = await Category.find()
		if (!categories) {
			return res.status(500).json({ success: false })
		}
		res.status(200).json(categories)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const category = await Category.findById(req.params.id)
		if (!category) {
			return res
				.status(500)
				.json({ message: 'The Category with the given ID was not found.' })
		}
		res.status(200).json(category)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.post('/', async (req, res) => {
	try {
		let category = new Category({
			name: req.body.name,
			icon: req.body.icon,
			color: req.body.color,
		})

		category = await category.save()
		if (!category) {
			return res.status(404).send('The category cannot be created!')
		}
		res.status(201).json(category)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.put('/:id', async (req, res) => {
	try {
		if (!mongoose.isValidObjectId(req.params.id)) {
			return res.status(400).send('Invalid category ID')
		}
		const category = await Category.findByIdAndUpdate(
			req.params.id,
			{
				name: req.body.name,
				icon: req.body.icon,
				color: req.body.color,
			},
			{ new: true }
		)
		if (!category) {
			return res.status(404).send('The category cannot be updated!')
		}
		res.status(201).json(category)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.delete('/:id', async (req, res) => {
	try {
		const category = await Category.findByIdAndRemove(req.params.id)
		if (!category) {
			return res
				.status(404)
				.json({ success: false, message: 'category not found!' })
		}
		res.status(200).json({ success: true, message: 'the category is deleted' })
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

module.exports = router
