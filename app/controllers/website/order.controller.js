const Sequelize = require('sequelize');
const Order = require("../../models/orders.models");
const Pitchs = require("../../models/pitchs.models");
const Category = require("../../models/category.models");
const nodemailer = require('nodemailer');
const moment = require('moment');

class orderController {

    //[POST] /dat-san
    async index(req, res) {
        const { PitchId, startDate, endDate } = req.body;
        try {
            const pitch = await Pitchs.findOne({
                where: { Id: PitchId, Status: 1 },
                include: [
                    {
                        model: Category,
                        as: 'category',
                        attributes: ['Name']
                    }
                ]
            });
            if (!pitch) return res.redirect('/san-bong/');
    
            if (!req.session.customer) {
                req.session.order = pitch.Id;
                return res.redirect('/khach-hang/dang-nhap/');
            }
    
            // Lấy thời gian hiện tại
            const now = moment();
    
            // Kiểm tra startDate (ngày lớn hơn hoặc bằng ngày hiện tại)
            const startDateOnly = moment(startDate, 'YYYY-MM-DD');
            if (!startDateOnly.isValid() || startDateOnly.isBefore(now, 'day')) {
                return res.render('website/order/index', {
                    pitch,
                    startDate: startDate === "" ? false : startDate,
                    endDate: endDate === "" ? false : endDate,
                    title: "MyPitch - Thông tin Đặt Sân",
                    errorDay: true,
                    errorHour: false,
                    error: "Ngày đặt sân phải bằng hoặc sau ngày hiện tại."
                });
            }
    
            // Kiểm tra endDate (giờ phút giây lớn hơn hoặc bằng giờ phút giây hiện tại)
            const currentTime = moment().format('HH:mm:ss');
            const endTime = moment(endDate, 'HH:mm:ss'); // Chỉ lấy giờ phút giây từ endDate
            if (!endTime.isValid() || endTime.format('HH:mm:ss') < currentTime) {
                return res.render('website/order/index', {
                    pitch,
                    startDate: startDate === "" ? false : startDate,
                    endDate: endDate === "" ? false : endDate,
                    title: "MyPitch - Thông tin Đặt Sân",
                    errorHour: true,
                    errorDay: false,
                    error: "Thời gian đặt sân phải sau thời gian hiện tại."
                });
            }

            // Lấy danh sách các đơn hàng thỏa mãn điều kiện
            const orders = await Order.findAll({
                where: {
                    PitchId: PitchId,
                },
            });

            // Convert thời gian gửi lên thành đối tượng Date
            const requestedTime = new Date(`${startDate}T${endDate}`);

            // Duyệt qua các đơn hàng và kiểm tra thời gian
            for (const order of orders) {
                if(order.Date == startDate){
                    const existingTime = new Date(`${order.Date}T${order.Time}`);

                    const endTime = new Date(existingTime.getTime() + 90 * 60 * 1000);

                    const diffInMinutes = Math.abs((requestedTime - existingTime) / (1000 * 60));

                    if (diffInMinutes < 90) {
                        return res.render('website/order/index',{
                            pitch,
                            startDate: startDate === "" ? false : startDate,
                            endDate: endDate === "" ? false : endDate,
                            title: "MyPitch - Thông tin Đặt Sân",
                            error: "",
                            errorDay: false,
                            errorHour: true,
                            error: `Sân đã có người đặt vào ${order.Time} kết thúc ${endTime.toTimeString().slice(0, 5)}`
                        })
                    }
                }
            }
    
            req.session.order = null;
    
            return res.render('website/order/index', {
                pitch,
                startDate: startDate === "" ? false : startDate,
                endDate: endDate === "" ? false : endDate,
                title: "MyPitch - Thông tin Đặt Sân",
                error: "",
                errorDay: false,
                errorHour: false
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi Đặt Sân.");
        }
    }

    //[GET] /dat-san
    async indexAfterLogin(req, res) {
        const { PitchId  } = req.query;
        try {
            const pitch = await Pitchs.findOne({ 
                where: { Id: PitchId, Status: 1 }, 
                include: [
                    {
                        model: Category,
                        as: 'category', 
                        attributes: ['Name']
                    }
                ] 
            });
            if (!pitch) return res.redirect('/san-bong/'); 

            if(!req.session.customer){  
                req.session.order = pitch.Id;
                return res.redirect('/khach-hang/dang-nhap/');
            }
            
            req.session.order = null;

            return res.render('website/order/index',{pitch, startDate: "", endDate: "", errorDay: false, errorHour: false, title: "MyPitch - Thông tin Đặt Sân"})
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi Đặt Sân.");
        }
    }


    //[POST] /dat-san/thanh-toan
    async pay(req, res) {
        const { PitchId, Start, End, FullName, Email, Phone } = req.body;
        try {
            const pitch = await Pitchs.findOne({ 
                where: { Id: PitchId, Status: 1 }, 
                include: [
                    {
                        model: Category,
                        as: 'category', 
                        attributes: ['Name']
                    }
                ] 
            });
            
            if (!pitch) return res.redirect('/san-bong/'); 

            if(!Start || !End || !FullName || !Email || !Phone) return res.render('website/order/index',{pitch, FullName, Email, Phone, startDate: Start, endDate: Start, title: "MyPitch - Thông tin Đặt Sân", errorDay: false, errorHour: false, error: "Vui lòng nhập đủ thông tin người Đặt Sân!"})

            if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) return res.render('website/order/index',{pitch, FullName, Email, Phone, startDate: Start, endDate: Start, title: "MyPitch - Thông tin Đặt Sân", errorDay: false, errorHour: false, error: "Vui lòng Email hợp lệ!"})

            if(!/^\d{10}$/.test(Phone)) return res.render('website/order/index',{pitch, FullName, Email, Phone, startDate: Start, endDate: Start, title: "MyPitch - Thông tin Đặt Sân", errorDay: false, errorHour: false, error: "Vui lòng số điện thoại hợp lệ!"})
    
            // Lấy thời gian hiện tại
            const now = moment();
    
            // Kiểm tra startDate (ngày lớn hơn hoặc bằng ngày hiện tại)
            const startDateOnly = moment(Start, 'YYYY-MM-DD');
            if (!startDateOnly.isValid() || startDateOnly.isBefore(now, 'day')) {
                return res.render('website/order/index',{
                    pitch, 
                    FullName, 
                    Email, 
                    Phone, 
                    startDate: Start, 
                    endDate: Start, 
                    title: "MyPitch - Thông tin Đặt Sân", 
                    errorDay: true,
                    errorHour: false,
                    error: "Ngày đặt sân phải bằng hoặc sau ngày hiện tại."
                })
            }
    
            // Kiểm tra endDate (giờ phút giây lớn hơn hoặc bằng giờ phút giây hiện tại)
            const currentTime = moment().format('HH:mm:ss');
            const endTime = moment(End, 'HH:mm:ss'); // Chỉ lấy giờ phút giây từ endDate
            if (!endTime.isValid() || endTime.format('HH:mm:ss') < currentTime) {
                return res.render('website/order/index',{
                    pitch, 
                    FullName, 
                    Email, 
                    Phone, 
                    startDate: Start, 
                    endDate: Start, 
                    title: "MyPitch - Thông tin Đặt Sân", 
                    errorHour: true,
                    errorDay: false,
                    error: "Thời gian đặt sân phải sau thời gian hiện tại."
                })
            }

            let Total = pitch.Price;
            let sale = 0;

            const [hour, minute] = End.split(":").map(Number); // Chuyển đổi sang số

            // Kiểm tra điều kiện giảm giá
            if (hour >= 10 && hour < 15) {
                Total *= 0.8; // Giảm giá 20%
                sale = 20;
            } else if (hour >= 22 || hour < 2) {
                Total *= 0.7; // Giảm giá 30%
                sale = 30
            }

            // Lấy danh sách các đơn hàng thỏa mãn điều kiện
            const orders = await Order.findAll({
                where: {
                    PitchId: PitchId,
                },
            });

            // Convert thời gian gửi lên thành đối tượng Date
            const requestedTime = new Date(`${Start}T${End}`);

            // Duyệt qua các đơn hàng và kiểm tra thời gian
            for (const order of orders) {
                if(order.Date == Start){
                    const existingTime = new Date(`${order.Date}T${order.Time}`);

                    const endTime = new Date(existingTime.getTime() + 90 * 60 * 1000);

                    const diffInMinutes = Math.abs((requestedTime - existingTime) / (1000 * 60));

                    if (diffInMinutes < 90) {
                        return res.render('website/order/index',{
                            pitch, 
                            FullName, 
                            Email, 
                            Phone, 
                            startDate: Start, 
                            endDate: Start, 
                            title: "MyPitch - Thông tin Đặt Sân", 
                            errorDay: false,
                            errorHour: true,
                            error: `Sân đã có người đặt vào ${order.Time} kết thúc ${endTime.toTimeString().slice(0, 5)}`
                        })
                    }
                }
            }

            const Code = Array.from({ length: 12 }, () => String.fromCharCode(Math.floor(Math.random() * 26) + 65)).join('').toUpperCase();

            if(req.session.customer){
                const order = await Order.create({ PitchId: pitch.Id, Code, Date: Start, Time: End, CustomerId: req.session.customer.Id, FullName, Email, Phone, Total, StatusOrder: 1, StatusPay: 0, OwnerId: pitch.CustomerId });
            }else{
                const order = await Order.create({ PitchId: pitch.Id, Code, Date: Start, Time: End, FullName, Email, Phone, Total, StatusOrder: 1, StatusPay: 0, OwnerId: pitch.CustomerId });
            }

            let transporter = nodemailer.createTransport({
                service: 'Gmail',
                auth: {
                    user: 'lienhe.shopclone247@gmail.com', 
                    pass: 'mabpkfkgbxlltrsw' 
                }
            });

            let mailOptions = {
                from: 'MyPitch Đặt Sân Bóng & Đá Bóng', // Thay bằng địa chỉ email của bạn
                to: Email, // Địa chỉ email nhận
                subject: 'Xác nhận đơn đặt sân', // Chủ đề email
                text: `Chào ${FullName}, đơn đặt sân của bạn đã được xác nhận. Mã Đặt Sân của bạn là: ${Code}.`, // Nội dung email
            };

            transporter.sendMail(mailOptions, function (err, info) {
                if (err) {
                    console.error(err);
                } else {
                    console.log('Email sent: ' + info.response);
                }
            });

            return res.render('website/order/thankyou',{pitch, Total, Code, FullName, Email, Phone, sale, startDate: Start, endDate: End, title: "MyPitch - Thông tin Đặt Sân"})
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi Đặt Sân.");
        }
    }

    //[GET] /dat-san/tra-cuu
    async viewLockup(req, res) {
        return res.render('website/lockup/index',{title: "MyPitch - Tra cứu thông tin Đặt Sân"})
    }

    //[POST] /dat-san/tra-cuu
    async lockup(req, res) {
        const {Code} = req.body;
        try {
            if(!Code) return res.render('website/lockup/index',{title: "MyPitch - Tra cứu thông tin Đặt Sân"})

            const order = await Order.findOne({ where: { Code: Code.toUpperCase() } });
            if (!order) return res.render('website/lockup/index',{title: "MyPitch - Tra cứu thông tin Đặt Sân", error: "Không tìm thấy đơn đặt sân nào có mã: " + Code.toUpperCase()})

            const pitch = await Pitchs.findOne({ 
                where: { Id: order.PitchId }, 
                include: [
                    {
                        model: Category,
                        as: 'category', 
                        attributes: ['Name']
                    }
                ] 
            });

            let sale = 0;

            const [hour, minute, s] = order.Time.split(":").map(Number); // Chuyển đổi sang số

            // Kiểm tra điều kiện giảm giá
            if (hour >= 10 && hour < 15) {
                sale = 20;
            } else if (hour >= 22 || hour < 2) {
                sale = 30
            }

            return res.render('website/lockup/result',{title: "MyPitch - Kết quả tra cứu thông tin Đặt Sân", order, pitch, sale})
        }catch(error){
            console.error(error);
            return res.status(500).send("Đã xảy ra lỗi khi tra cứu thông tin Đặt Sân.");
        }
    }
}

module.exports = new orderController();
