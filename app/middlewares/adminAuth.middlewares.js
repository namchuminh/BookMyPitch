function requireLogin(req, res, next) {
    if (req.session.admin) {
        next();
    } else {
        res.redirect('/admin/login/'); 
    }
}

function requireLogout(req, res, next) {
    if (!req.session.admin) {
        next();
    } else {
        res.redirect('/admin/'); 
    }
}


module.exports = {
    requireLogin,
    requireLogout
};
