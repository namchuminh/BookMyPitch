const Sequelize = require('sequelize');
const crypto = require('crypto');
const Customer = require("../../models/customer.models");
const { error } = require('console');

class customerController {

    //[GET] /khach-hang
    async index(req, res) {
        return res.render('website/customer/index', {title: "MyPitch - Thông tin khách hàng", errorOld: "", errorPassword: "", errorPassword2: "", name: req.session.customer.FullName, phone: req.session.customer.Phone, email: req.session.customer.Email, username: req.session.customer.Username})
    }

    //[GET] /khach-hang/update
    async update(req, res) {
        const {name, phone, email, password, old_password, password2} = req.body;
        try{
            const customer = await Customer.findOne({
                where: {
                    Username: req.session.customer.Username
                }
            });

            let passwordCurrent = customer.Password;

            if(password != '' || password){
                if(crypto.createHash('md5').update(old_password).digest('hex') != passwordCurrent){
                    return res.render('website/customer/index', {title: "MyPitch - Thông tin khách hàng", errorPassword: "", errorPassword2: "", errorOld: "Mật khẩu cũ không đúng!", name: req.session.customer.FullName, phone: req.session.customer.Phone, email: req.session.customer.Email, username: req.session.customer.Username})
                }

                if(password != password2){
                    return res.render('website/customer/index', {title: "MyPitch - Thông tin khách hàng", errorPassword: "", errorOld: "", errorPassword2: "Xác nhận mật khẩu không trùng khớp!", name: req.session.customer.FullName, phone: req.session.customer.Phone, email: req.session.customer.Email, username: req.session.customer.Username})
                }

                const hashedPassword = crypto.createHash('md5').update(password).digest('hex');
                passwordCurrent = hashedPassword
            }

            customer.FullName = name;
            customer.Phone = phone;
            customer.Email = email;
            customer.Password = passwordCurrent;
            await customer.save();

            const customerUpdate = await Customer.findOne({
                where: {
                    Username: req.session.customer.Username
                }
            });

            req.session.customer = customerUpdate;

            return res.render('website/customer/index', {title: "MyPitch - Thông tin khách hàng", errorOld: "", errorPassword: "", errorPassword2: "", name: req.session.customer.FullName, phone: req.session.customer.Phone, email: req.session.customer.Email, username: req.session.customer.Username})
        }catch(error){
            res.status(500).json({ message: 'Đã xảy ra lỗi khi cập nhật thông tin khách hàng!' });
        }
    }

    //[GET] /khach-hang/dang-nhap
    async viewLogin(req, res) {
        return res.render('website/customer/login', {title: "MyPitch - Đăng nhập"})
    }

    //[POST] /khach-hang/dang-nhap
    async login(req, res) {
        const { Username, Password } = req.body;
        try {

            if(!Username || !Password) return res.render('website/customer/login', {title: "MyPitch - Đăng nhập", error: "Vui lòng nhập đủ thông tin đăng nhập!"})

            const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');

            const customer = await Customer.findOne({
                where: {
                    Username,
                    Password: hashedPassword
                }
            });

            if (customer) {
                req.session.customer = customer;

                if(req.session.order && req.session.order != null){
                    return res.redirect('/dat-san/?PitchId='+req.session.order);
                }

                return res.redirect('/khach-hang/'); 
            } else {
                return res.render('website/customer/login', {title: "MyPitch - Đăng nhập", error: "Sai tên đăng nhập hoặc mật khẩu!"})
            }
        } catch (error) {
            // Xử lý lỗi nếu có
            res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập!' });
        }
    }

    //[GET] /khach-hang//dang-ky
    async viewRegister(req, res) {
        return res.render('website/customer/register', {title: "MyPitch - Đăng ký"})
    }

    //[POST] /khach-hang//dang-ky
    async register(req, res) {
        const { FullName, Phone, Email, Username, Password } = req.body;

        try {

            if(!FullName || !Phone || !Email || !Username || !Password) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Vui lòng nhập đủ thông tin!"})

            if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Vui lòng nhập Email hợp lệ!"})

            if(!/^\d{10}$/.test(Phone)) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Vui lòng nhập số điện thoại hợp lệ!"})

            if(/\s/.test(Username)) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Vui lòng nhập tài khoản hợp lệ và không có dấu cách!"})
            
            if(await Customer.findOne({where: {Email}})) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Email khách hàng đã tồn tại trong hệ thống!"})
            
            if(await Customer.findOne({where: {Phone}})) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Số điện thoại khách hàng đã tồn tại trong hệ thống!"})

            if(await Customer.findOne({where: {Username}})) return res.render('website/customer/register', {title: "MyPitch - Đăng ký", error: "Tên tài khoản đã tồn tại trong hệ thống!"})

            const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');

            const newCustomer = await Customer.create({
                FullName,
                Phone,
                Email,
                Username,
                Password: hashedPassword // Lưu mật khẩu đã được mã hóa
            });

            return res.render('website/customer/register', {title: "MyPitch - Đăng ký", success: "Đăng ký tài khoản thành công!"})
        } catch (error) {
            // Xử lý lỗi nếu có
            res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng ký!', error: error.message });
        }
    }

    //[GET] /khach-hang/dang-xuat
    async logout(req, res){
        req.session.customer = null;
        return res.redirect('/khach-hang/dang-nhap/')
    }

    //[GET] /khach-hang/dang-ky-chu-san
    async registerOwner(req, res){
        if(req.session.customer.IsOwner == 1){
            return res.redirect('back');
        }
        return res.render('website/owner/index', {title: "MyPitch - Đăng ký làm chủ sân"})
    }

    //[GET] /khach-hang/dang-ky-chu-san
    async registerOwnerPedding(req, res){
        const customer = await Customer.findOne({
            where: {
                Username: req.session.customer.Username
            }
        });

        customer.IsOwner = -1;
        await customer.save();

        req.session.customer.IsOwner = -1;

        return res.render('website/owner/index', {title: "MyPitch - Đăng ký làm chủ sân"})
    }
}

module.exports = new customerController();
