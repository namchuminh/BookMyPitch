class logoutController {
    //[GET] /admin/logout
    async logout(req, res) {
        delete req.session.admin;
        return res.redirect('/admin/login/');
    }
}

module.exports = new logoutController();
