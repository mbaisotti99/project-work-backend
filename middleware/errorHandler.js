const errorHandler = (err, req, resp, next) => {
    resp.status(404).json({
        message: "Route not found" // rotta non funzionante
    })
}

// EXPORT
module.exports = errorHandler;