const Sequelize = require('sequelize');
const crypto = require('crypto');
const Admin = require("../../models/admin.models");
const Customer = require("../../models/customer.models");
const Staff = require("../../models/staff.models");

class loginController {
    //[GET] /admin/login
    async viewLogin(req, res) {
        return res.render('admin/login/index', {error: ""})
    }

    //[POST] /admin/login
    async login(req, res) {
        const { Username, Password } = req.body;
        try {

            if(!Username || !Password) return res.render('admin/login/index', {error: "Vui lòng nhập đủ thông tin đăng nhập!"})

            const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');

            const admin = await Admin.findOne({
                where: {
                    Username,
                    Password: hashedPassword
                }
            });

            if (admin) {
                req.session.admin = admin;
                return res.redirect('/admin/'); 
            } 

            const customer = await Customer.findOne({
                where: {
                    Username,
                    Password: hashedPassword
                }
            });

            const staff = await Staff.findOne({
                where: {
                    Username,
                    Password: hashedPassword
                }
            });

            
            if (customer && (customer.IsOwner == 1)) {
                req.session.admin = customer;
                return res.redirect('/admin/'); 
            }else if(customer && (customer.IsOwner == 0)){
                return res.render('admin/login/index', {error: "Bạn không có quyền chủ sân để đăng nhập!"})
            }else if(staff){
                staff.dataValues.IsStaff = staff.dataValues.Id;
                staff.dataValues.Id = staff.dataValues.CustomerId;
                staff.dataValues.IsOwner = 1;
                req.session.admin = staff;

                return res.redirect('/admin/'); 
            }else{
                return res.render('admin/login/index', {error: "Sai tên đăng nhập hoặc mật khẩu!"})
            } 


                
        } catch (error) {
            // Xử lý lỗi nếu có
            res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập!' });
        }
    }
}

module.exports = new loginController();
