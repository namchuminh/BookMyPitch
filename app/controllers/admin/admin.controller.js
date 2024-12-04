const crypto = require('crypto');
const Admin = require("../../models/admin.models");
const Customer = require("../../models/customer.models");

class adminController {
  //[GET] /admin/profile/
  async view(req, res) {
    const id = req.session.admin.Id;

    try {
        if(!req.session.admin.IsOwner){
          const admin = await Admin.findByPk(id);
          return res.render('admin/admin/index', {admin});
        }else{
          const admin = await Customer.findByPk(id);
          return res.render('admin/admin/index', {admin});
        }
    } catch (err) {
        console.error(err);
        return res.status(500).send("Đã xảy ra lỗi khi cập nhật cá nhân.");
    }    
  }

  //[POST] /admin/profile/
  async update(req, res) {
    const id = req.session.admin.Id;
    const { FullName, Phone, Email, Username, Password, OldPassword, Password2 } = req.body;

    try {
      if(!req.session.admin.IsOwner){
        const admin = await Admin.findByPk(id);

        let PasswordChange = "";

        if (!FullName || !Phone || !Email || !Username ) return res.render('admin/admin/index', { admin, error: "Vui lòng nhập đủ thông tin quản trị viên!" });
      
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) return res.render('admin/admin/index', {error: "Vui lòng nhập Email hợp lệ!"})

        if(!/^\d{10}$/.test(Phone)) return res.render('admin/admin/index', {error: "Vui lòng nhập số điện thoại hợp lệ!"})

        if(/\s/.test(Username)) return res.render('admin/admin/index', {error: "Vui lòng nhập tài khoản hợp lệ và không có dấu cách!"})

        if(!Password){
          PasswordChange = admin.dataValues.Password;
        }else{
          if(crypto.createHash('md5').update(OldPassword).digest('hex') != admin.dataValues.Password){
            return res.render('admin/admin/index', {admin, error: "Mật khẩu cũ không đúng!"});
          }

          if(Password != Password2){
            return res.render('admin/admin/index', {admin, error: "Mật khẩu không trùng khớp!"});
          }

          const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');
          PasswordChange = hashedPassword;
        }

        admin.FullName = FullName;
        admin.Phone = Phone;
        admin.Email = Email;
        admin.Username = Username;
        admin.Password = PasswordChange;
        await admin.save();

        req.session.admin.FullName = FullName;
        
        return res.render('admin/admin/index', { admin, success: "Cập nhật thông tin quản trị thành công!" });
      }else{
        const admin = await Customer.findByPk(id);

        let PasswordChange = "";

        if (!FullName || !Phone || !Email ) return res.render('admin/admin/index', { admin, error: "Vui lòng nhập đủ thông tin quản trị viên!" });
      
        if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(Email)) return res.render('admin/admin/index', {error: "Vui lòng nhập Email hợp lệ!"})

        if(!/^\d{10}$/.test(Phone)) return res.render('admin/admin/index', {error: "Vui lòng nhập số điện thoại hợp lệ!"})

        if(!Password){
          PasswordChange = admin.dataValues.Password;
        }else{
          if(crypto.createHash('md5').update(OldPassword).digest('hex') != admin.dataValues.Password){
            return res.render('admin/admin/index', {admin, error: "Mật khẩu cũ không đúng!"});
          }

          if(Password != Password2){
            return res.render('admin/admin/index', {admin, error: "Mật khẩu không trùng khớp!"});
          }

          const hashedPassword = crypto.createHash('md5').update(Password).digest('hex');
          PasswordChange = hashedPassword;
        }

        admin.FullName = FullName;
        admin.Phone = Phone;
        admin.Email = Email;
        admin.Password = PasswordChange;
        await admin.save();

        req.session.admin.FullName = FullName;
        
        return res.render('admin/admin/index', { admin, success: "Cập nhật thông tin chủ sân thành công!" });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi cập nhật cá nhân.");
    }
  }

}

module.exports = new adminController();
