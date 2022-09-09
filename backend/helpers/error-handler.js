const errorHandler = (err, req, res, next) => {
	if (err) {
		//return res.status(400).json(err)
		return res.status(err.status).json({ message: err.inner.message })
	}
}

module.exports = errorHandler
