const mongoose = require('mongoose')

const express = require('express')
const { Order } = require('../models/order')
const { OrderItem } = require('../models/order-item')
const router = express.Router()

router.get('/', async (req, res) => {
	try {
		const orders = await Order.find()
			.populate('user', 'name')
			.sort({ dateCreated: -1 })
		if (!orders) {
			return res.status(500).json({ success: false })
		}
		res.status(200).json(orders)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.get('/:id', async (req, res) => {
	try {
		const orders = await Order.findById(req.params.id)
			.populate('user', 'name')
			.populate({
				path: 'orderItems',
				populate: {
					path: 'product',
					populate: 'category',
				},
			})

		if (!orders) {
			return res.status(500).json({ success: false })
		}
		res.status(200).json(orders)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.post('/', async (req, res) => {
	try {
		const orderItemsIds = await Promise.all(
			req.body.orderItems.map(async (orderItem) => {
				let newOrderItem = new OrderItem({
					quantity: orderItem.quantity,
					product: orderItem.product,
				})

				newOrderItem = await newOrderItem.save()

				return newOrderItem._id
			})
		)
		totalPrices = await Promise.all(
			orderItemsIds.map(async (orderItemId) => {
				const orderItem = await OrderItem.findById(orderItemId).populate(
					'product'
				)
				return orderItem.product.price * orderItem.quantity
			})
		)
		const totalPrice = totalPrices.reduce((a, b) => {
			return a + b
		})

		let order = new Order({
			orderItems: orderItemsIds,
			shippingAddress1: req.body.shippingAddress1,
			shippingAddress2: req.body.shippingAddress2,
			city: req.body.city,
			zip: req.body.zip,
			country: req.body.country,
			phone: req.body.phone,
			status: req.body.status,
			totalPrice: totalPrice,
			user: req.body.user,
		})

		order = await order.save()
		if (!order) {
			return res.status(404).send('The order cannot be placed!')
		}
		res.status(201).json(order)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.put('/:id', async (req, res) => {
	try {
		const order = await Order.findOneAndUpdate(
			req.params.id,
			{
				status: req.body.status,
			},
			{
				new: true,
			}
		)
		if (!order) {
			return res.status(404).send('The order cannot be updated!')
		}
		res.status(200).json(order)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.delete('/:id', async (req, res) => {
	try {
		let order = await Order.findByIdAndRemove(req.params.id)
		if (order) {
			order = await order.orderItems.map(async (orderItem) => {
				await OrderItem.findByIdAndRemove(orderItem)
			})
		} else {
			return res
				.status(404)
				.json({ success: false, message: 'order not found!' })
		}

		res.status(200).json({ success: true, message: 'the order is deleted' })
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.get('/get/totalSales', async (req, res) => {
	try {
		const totalSales = await Order.aggregate([
			{ $group: { _id: null, totalSales: { $sum: '$totalPrice' } } },
		])
		if (!totalSales) {
			return res.status(400).send('The order sales cannot be generated')
		}
		res.status(200).json({ totalSales: totalSales.pop().totalSales })
	} catch (error) {}
})

router.get('/get/count', async (req, res) => {
	try {
		const orderCount = await Order.countDocuments()
		if (!orderCount) {
			return res.status(404).json({ success: false })
		}
		res.status(200).json({ orderCount })
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

router.get('/get/userorders/:userId', async (req, res) => {
	try {
		const userOrders = await Order.find({ user: req.params.userId })
			.populate({
				path: 'orderItems',
				populate: {
					path: 'product',
					populate: 'category',
				},
			})
			.sort({ dateCreated: -1 })
		if (!userOrders) {
			return res.status(500).json({ success: false })
		}
		res.status(200).json(userOrders)
	} catch (error) {
		res
			.status(500)
			.json({ message: error.message, error: error.stack, success: false })
	}
})

module.exports = router
