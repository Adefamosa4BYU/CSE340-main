exports.triggerError = async (req, res, next) => {
    try {
        const err = new Error('This is an intentionally triggered 500 error.');
        err.status = 500;
        throw err; 
    } catch (err) {
        next(err);
    }
};
