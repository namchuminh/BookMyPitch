const Contact = require("../../models/contact.models");
const Customer = require("../../models/customer.models");

class contactController {
  //[GET] /admin/contact
  async index(req, res) {
    try {
      const perPage = 10;
      const page = parseInt(req.query.page) || 1;

      const { count, rows: contactList } = await Contact.findAndCountAll({
        limit: perPage,
        offset: (page - 1) * perPage,
        order: [['Id', 'DESC']], // Thêm điều kiện ORDER BY Id DESC
        include: [
            {
              model: Customer,
              as: 'customer',
            }
        ]
      });

      const totalPages = Math.ceil(count / perPage);

      for (const contact of contactList) {
        const createdAtDate = new Date(contact.createdAt);
    
        const d = createdAtDate.getDate() < 10 ? "0" + createdAtDate.getDate() : createdAtDate.getDate();
        const m = (createdAtDate.getMonth() + 1) < 10 ? "0" + (createdAtDate.getMonth() + 1) : (createdAtDate.getMonth() + 1);
        const y = createdAtDate.getFullYear();
        
        const h = createdAtDate.getHours() < 10 ? "0" + createdAtDate.getHours() : createdAtDate.getHours();
        const min = createdAtDate.getMinutes() < 10 ? "0" + createdAtDate.getMinutes() : createdAtDate.getMinutes();
        const sec = createdAtDate.getSeconds() < 10 ? "0" + createdAtDate.getSeconds() : createdAtDate.getSeconds();

        contact.created = `${d}-${m}-${y} ${h}:${min}:${sec}`;
      }

      return res.render('admin/contact/index', { contactList, totalPages, currentPage: page });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải liên hệ.");
    }
  }

  //[GET] /admin/contact/view
  async view(req, res) {
    const { id } = req.params;
    try {
        const contact = await Contact.findByPk(id);

        if(!contact){
            return res.redirect('back');
        }

        return res.render('admin/contact/view', { contact });
    } catch (err) {
        console.error(err);
        return res.status(500).send("Đã xảy ra lỗi khi tải liên hệ.");
    }
    // Code để hiển thị trang thêm danh mục
    return res.render('admin/contact/view');
  }

}

module.exports = new contactController();
