const Sequelize = require('sequelize');
const Customer = require("../../models/customer.models");
const Contact = require("../../models/contact.models");

class contactController {

    //[GET] /lien-he
    async index(req, res) {
        return res.render('website/contact/index', {title: "MyPitch - Liên hệ khách hàng", error:"", success:""})
    }

    //[POST] /lien-he/post
    async postContact(req, res) {
        const {id, message} = req.body;

        if(!message){
            return res.render('website/contact/index', {title: "MyPitch - Liên hệ khách hàng", error: "Vui lòng nhập nội dung liên hệ!",success:""})
        }

        try {
            const newContact = await Contact.create({
                CustomerId: id,
                Message: message
            });
            return res.render('website/contact/index', {title: "MyPitch - Liên hệ khách hàng", error:"", success:"Gửi thông tin liên hệ thành công! Chúng tôi sẽ liên hệ với bạn sớm nhất!"})
        } catch (error) {
            // Xử lý lỗi nếu có
            res.status(500).json({ message: 'Đã xảy ra lỗi khi đăng nhập!' });
        }
    }

}

module.exports = new contactController();
