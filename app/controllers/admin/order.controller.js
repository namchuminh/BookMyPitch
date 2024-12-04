const { where } = require("sequelize");
const Order = require("../../models/orders.models");
const Pitchs = require("../../models/pitchs.models");
const Facility = require("../../models/facility.models");
const Category = require("../../models/category.models");
const Customer = require("../../models/customer.models");

class orderController {
  //[GET] /admin/order
  async index(req, res) {
    try {
      const perPage = 5;
      const page = parseInt(req.query.page) || 1;

      if (!req.session.admin.IsOwner) {
        const { count, rows: orderList } = await Order.findAndCountAll({
          limit: perPage,
          offset: (page - 1) * perPage,
          order: [['Id', 'DESC']],
          include: [
            {
              model: Pitchs,
              as: 'pitch',
            }
          ]
        });

        const totalPages = Math.ceil(count / perPage);
        return res.render('admin/order/index', { orderList, totalPages, currentPage: page });
      } else {
        const { count, rows: orderList } = await Order.findAndCountAll({
          limit: perPage,
          offset: (page - 1) * perPage,
          order: [['Id', 'DESC']],
          include: [
            {
              model: Pitchs,
              as: 'pitch',
            }
          ],
          where: { OwnerId: req.session.admin.Id },
        });

        const totalPages = Math.ceil(count / perPage);
        return res.render('admin/order/index', { orderList, totalPages, currentPage: page });
      }
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải đơn đặt sân.");
    }
  }

  //[GET] /admin/order/:id/action/:action
  async action(req, res) {
    const { id, action } = req.params;

    try {
      await Order.update(
        { StatusOrder: action },
        { where: { Id: id } }
      );

      if (action == 3) {
        const idpitch = await Order.findByPk(id);

        await Pitchs.update(
          { Status: 0 },
          { where: { Id: idpitch.dataValues.PitchId } }
        );
      }

      if (action == 4) {
        const idpitch = await Order.findByPk(id);

        await Pitchs.update(
          { Status: 1 },
          { where: { Id: idpitch.dataValues.PitchId } }
        );
      }

      return res.redirect('back');
    } catch (err) {
      return res.redirect('back');
    }
  }

  //[GET] /admin/order/:id/paid/:action
  async paid(req, res) {
    const { id, action } = req.params;
    try {
      await Order.update(
        { StatusPay: action },
        { where: { Id: id } }
      );

      return res.redirect('back');
    } catch (err) {
      return res.redirect('back');
    }
  }

  //[GET] /admin/order/:id
  async view(req, res) {
    const { id } = req.params;
    try {
      const order = await Order.findByPk(id);

      if (!order) {
        return res.redirect('back');
      }

      const ds = new Date(order.dataValues.Start).getDate() < 10 ? "0" + new Date(order.dataValues.Start).getDate() : new Date(order.dataValues.Start).getDate()
      const ms = (new Date(order.dataValues.Start).getMonth() + 1) < 10 ? "0" + (new Date(order.dataValues.Start).getMonth() + 1) : (new Date(order.dataValues.Start).getMonth() + 1)
      order.dataValues.Start = `${ds}/${ms}/${new Date(order.dataValues.Start).getFullYear()}`;

      const de = new Date(order.dataValues.End).getDate() < 10 ? "0" + new Date(order.dataValues.End).getDate() : new Date(order.dataValues.End).getDate()
      const me = (new Date(order.dataValues.End).getMonth() + 1) < 10 ? "0" + (new Date(order.dataValues.End).getMonth() + 1) : (new Date(order.dataValues.End).getMonth() + 1)
      order.dataValues.End = `${de}/${me}/${new Date(order.dataValues.End).getFullYear()}`;

      return res.render('admin/order/view', { order });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải đơn đặt sân.");
    }
  }

  async print(req, res) {
    const { id } = req.params;

    try {
      // Tìm đơn đặt sân (Order) và liên kết với Pitch, Facility, Customer, và Category
      const order = await Order.findByPk(id, {
        include: [
          {
            model: Pitchs,
            as: "pitch",
            include: [
              {
                model: Facility,
                required: false,
              },
              {
                model: Customer,
                as: "customer",
                required: false,
              },
              {
                model: Category,
                as: "category",
                required: false,
              },
            ],
          },
        ],
      });

      // Kiểm tra nếu không tìm thấy đơn đặt phòng
      if (!order) {
        return res.status(404).json({ message: "Không tìm thấy hóa đơn." });
      }

      // Hàm chuyển đổi giá trị Facility
      const formatFacility = (facility) => {
        if (!facility) return null;
        const convert = (value) => (value === 1 ? "Có" : "Không");
        return {
          shirt: convert(facility.Shirt),
          water: convert(facility.Water),
          referee: convert(facility.Referee),
          shoe: convert(facility.Shoe),
          bathroom: convert(facility.Bathroom),
          ball: convert(facility.Ball),
        };
      };

      // Chuẩn bị dữ liệu để trả về
      const data = {
        orderId: order.Id,
        code: order.Code,
        customerName: order.FullName,
        customerEmail: order.Email,
        customerPhone: order.Phone,
        date: order.Date,
        time: order.Time,
        totalPrice: order.Total,
        statusOrder: order.StatusOrder,
        statusPay: order.StatusPay,
        pitch: {
          name: order.pitch?.Name || "N/A",
          description: order.pitch?.Description || "N/A",
          price: order.pitch?.Price || 0,
          avatar: order.pitch?.Avatar || "N/A",
          people: order.pitch?.People || 0,
          slug: order.pitch?.Slug || "N/A",
          status: order.pitch?.Status || "N/A",
          facilities: formatFacility(order.pitch?.facility), // Chuyển đổi thông tin tiện ích
          category: order.pitch?.category?.Name || "N/A", // Loại sân
          customer: order.pitch?.customer?.Name || "N/A", // Tên khách hàng
        },
      };

      // Trả dữ liệu JSON
      return res.json(data);
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Đã xảy ra lỗi khi tải hóa đơn.", error: err.message });
    }
  }
}

module.exports = new orderController();
