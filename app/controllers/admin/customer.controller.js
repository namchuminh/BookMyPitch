const Customer = require("../../models/customer.models");
const Pitch = require("../../models/pitchs.models");
const Order = require("../../models/orders.models");

class customerController {
  //[GET] /admin/customer
  async index(req, res) {
    try {
      const perPage = 10;
      const page = parseInt(req.query.page) || 1;

      if(!req.session.admin.IsOwner){
        const { count, rows: customerList } = await Customer.findAndCountAll({
          limit: perPage,
          offset: (page - 1) * perPage,
          order: [['Id', 'DESC']], // Thêm điều kiện ORDER BY Id DESC
        });
  
        const totalPages = Math.ceil(count / perPage);
  
        for (const customer of customerList) {
          const createdAtDate = new Date(customer.createdAt);
      
          const d = createdAtDate.getDate() < 10 ? "0" + createdAtDate.getDate() : createdAtDate.getDate();
          const m = (createdAtDate.getMonth() + 1) < 10 ? "0" + (createdAtDate.getMonth() + 1) : (createdAtDate.getMonth() + 1);
          const y = createdAtDate.getFullYear();
          
          const h = createdAtDate.getHours() < 10 ? "0" + createdAtDate.getHours() : createdAtDate.getHours();
          const min = createdAtDate.getMinutes() < 10 ? "0" + createdAtDate.getMinutes() : createdAtDate.getMinutes();
          const sec = createdAtDate.getSeconds() < 10 ? "0" + createdAtDate.getSeconds() : createdAtDate.getSeconds();
  
          customer.created = `${d}-${m}-${y} ${h}:${min}:${sec}`;
        }
  
        return res.render('admin/customer/index', { customerList, totalPages, currentPage: page });
      }else{
        const { count, rows: orderList } = await Order.findAndCountAll({
          limit: perPage,
          offset: (page - 1) * perPage,
          order: [['Id', 'DESC']],
          include: [
              {
                model: Customer,
                as: 'customer',
              },
          ],
          where: {OwnerId: req.session.admin.Id},
          group: ['Phone'],
        });

        for (const order of orderList) {
          const createdAtDate = new Date(order.createdAt);
      
          const d = createdAtDate.getDate() < 10 ? "0" + createdAtDate.getDate() : createdAtDate.getDate();
          const m = (createdAtDate.getMonth() + 1) < 10 ? "0" + (createdAtDate.getMonth() + 1) : (createdAtDate.getMonth() + 1);
          const y = createdAtDate.getFullYear();
          
          const h = createdAtDate.getHours() < 10 ? "0" + createdAtDate.getHours() : createdAtDate.getHours();
          const min = createdAtDate.getMinutes() < 10 ? "0" + createdAtDate.getMinutes() : createdAtDate.getMinutes();
          const sec = createdAtDate.getSeconds() < 10 ? "0" + createdAtDate.getSeconds() : createdAtDate.getSeconds();
  
          order.created = `${d}-${m}-${y} ${h}:${min}:${sec}`;
        }

        const totalPages = Math.ceil(count / perPage);
        return res.render('admin/customer/index', { orderList, totalPages, currentPage: page });
      }
      
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải khách hàng.");
    }
  }

  //[GET] /admin/customer/is-owner/:id
  async owner(req, res) {
    try {
      const { id } = req.params;
  
      // Lấy khách hàng theo id
      const customer = await Customer.findOne({ where: { id } });
  
      if (!customer) {
        return res.status(404).send("Khách hàng không tồn tại.");
      }
  
      // Đổi giá trị của trường IsOwner
      const updatedIsOwner = customer.IsOwner == 1 ? 0 : 1;
  
      // Cập nhật trường IsOwner
      await customer.update({ IsOwner: updatedIsOwner });
      
      const pitch = await Pitch.findOne({ where: { CustomerId: id } });

      console.log(id)

      if(updatedIsOwner == 0){
        if(pitch){
          await pitch.update({ Status: 0 });
        }
      }else{
        if(pitch){
          await pitch.update({ Status: 1 });
        }
      }
  
      // Trả về phản hồi sau khi cập nhật
      return res.redirect("/admin/customer");
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi cập nhật trạng thái IsOwner.");
    }
  }

}

module.exports = new customerController();
