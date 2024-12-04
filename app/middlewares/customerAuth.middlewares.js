function requireLogin(req, res, next) {
    if (req.session.customer) {
        next();
    } else {
        res.redirect('/khach-hang/dang-nhap/'); 
    }
}

function requireLogout(req, res, next) {
    if (!req.session.customer) {
        next();
    } else {
        res.redirect('/khach-hang/'); 
    }
}


module.exports = {
    requireLogin,
    requireLogout
};
