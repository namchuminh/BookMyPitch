const crypto = require('crypto');
const Customer = require("../../models/customer.models");
const Staff = require("../../models/staff.models");
const Admin = require("../../models/admin.models");

class staffController {
    async index(req, res){
        const perPage = 10;
        const page = parseInt(req.query.page) || 1;

        if (req.session.admin.IsOwner) {
            const { count, rows: staffList } = await Staff.findAndCountAll({
                limit: perPage,
                offset: (page - 1) * perPage,
                order: [['Id', 'DESC']], // Sắp xếp giảm dần theo Id
                where: {
                    CustomerId: req.session.admin.Id
                }
            });

            const totalPages = Math.ceil(count / perPage);

            for (const staff of staffList) {
                const createdAtDate = new Date(staff.createdAt);

                const d = createdAtDate.getDate() < 10 ? "0" + createdAtDate.getDate() : createdAtDate.getDate();
                const m = (createdAtDate.getMonth() + 1) < 10 ? "0" + (createdAtDate.getMonth() + 1) : (createdAtDate.getMonth() + 1);
                const y = createdAtDate.getFullYear();

                const h = createdAtDate.getHours() < 10 ? "0" + createdAtDate.getHours() : createdAtDate.getHours();
                const min = createdAtDate.getMinutes() < 10 ? "0" + createdAtDate.getMinutes() : createdAtDate.getMinutes();
                const sec = createdAtDate.getSeconds() < 10 ? "0" + createdAtDate.getSeconds() : createdAtDate.getSeconds();

                // Format ngày tạo
                staff.created = `${d}-${m}-${y} ${h}:${min}:${sec}`;
            }

            return res.render('admin/staff/index', { staffList, totalPages, currentPage: page });
        }else{
            return res.redirect("/admin");
        }
    }

    async add(req, res){
        return res.render('admin/staff/add', {error: ""});
    }

    async store(req, res) {
        try {
            // Lấy thông tin từ request
            const { FullName, Username, Password } = req.body;
    
            // Kiểm tra nếu các trường bắt buộc không có
            if (!FullName || !Username || !Password) {
                return res.render('admin/staff/add', {error: "Vui lòng điền đầy đủ thông tin."});
            }
    
            // Kiểm tra xem Username đã tồn tại chưa
            const existingStaff = await Staff.findOne({ where: { Username } });
            if (existingStaff) {
                return res.render('admin/staff/add', {error: "Tên đăng nhập đã tồn tại."});
            }

            // Kiểm tra xem Username đã tồn tại chưa
            const existingStaffCustomer = await Customer.findOne({ where: { Username } });
            if (existingStaffCustomer) {
                return res.render('/admin/staff/add', {error: "Tên đăng nhập đã tồn tại."});
            }

            // Kiểm tra xem Username đã tồn tại chưa
            const existingStaffAdmin = await Admin.findOne({ where: { Username } });
            if (existingStaffAdmin) {
                return res.render('/admin/staff/add', {error: "Tên đăng nhập đã tồn tại."});
            }
    
            // Thêm nhân viên mới
            const newStaff = await Staff.create({
                FullName,
                Username,
                Password: crypto.createHash('md5').update(Password).digest('hex'), // Cần mã hóa mật khẩu trước khi lưu vào database
                CustomerId: req.session.admin.Id, // Gán CustomerId từ session
            });
    
            // Trả về kết quả thành công
            return res.redirect('/admin/staff');
        } catch (error) {
            console.error("Error in store staff:", error);
            return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình thêm nhân viên." });
        }
    }

    async destroy(req, res) {
        try {
            // Lấy Id từ params
            const { id } = req.params;

            const staff = await Staff.findOne({ where: { Id: id } });
            if (!staff) {
                return res.redirect('/admin/staff/index');
            }
    
            // Thực hiện xóa nhân viên
            await Staff.destroy({ where: { Id: id } });
    
            // Trả về kết quả thành công
            return res.redirect('/admin/staff');
        } catch (error) {
            console.error("Error in destroy staff:", error);
            return res.status(500).json({ message: "Đã xảy ra lỗi trong quá trình xóa nhân viên." });
        }
    }

    async profile(req, res){
        return res.render('admin/staff/profile', { error: ""});
    }

    async changePassword(req, res){
        const id = req.session.admin.IsStaff;

        const { Password, OldPassword, Password2 } = req.body;
        const admin = await Staff.findByPk(id);

        console.log(admin)

        let PasswordChange = "";

        if(!Password){
          PasswordChange = admin.dataValues.Password;
        }else{
          if(crypto.createHash('md5').update(OldPassword).digest('hex') != admin.dataValues.Password){
            return res.render('admin/staff/profile', { error: "Mật khẩu cũ không đúng!"});
          }

          if(Password != Password2){
            return res.render('admin/staff/profile', { error: "Mật khẩu không trùng khớp!"});
          }

          const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');
          PasswordChange = hashedPassword;
        }

        admin.Password = PasswordChange;
        await admin.save();
        
        return res.render('admin/staff/profile', { success: "Đổi mật khẩu thành công!" });
    }
}

module.exports = new staffController();
