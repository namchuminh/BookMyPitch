const { Op } = require("sequelize");
const Orders = require("../../models/orders.models");
const Pitchs = require("../../models/pitchs.models");
const Category = require("../../models/category.models");


class dashboardController {
    //[GET] /admin/
    async index(req, res) {
        try {
            // Lấy ngày hiện tại
            const today = new Date();

            const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            let ordersCount;
            if (!req.session.admin.IsOwner) {
                // Lấy tổng số orders có trường createdAt bằng ngày hiện tại
                ordersCount = await Orders.count({
                    where: {
                        createdAt: {
                            [Op.gte]: startOfToday, // createdAt >= startOfToday (bắt đầu từ 00:00:00)
                            [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // createdAt < ngày tiếp theo (đến 00:00:00)
                        }
                    }
                });
            }else{
                // Lấy tổng số orders có trường createdAt bằng ngày hiện tại
                ordersCount = await Orders.count({
                    where: {
                        createdAt: {
                            [Op.gte]: startOfToday, // createdAt >= startOfToday (bắt đầu từ 00:00:00)
                            [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // createdAt < ngày tiếp theo (đến 00:00:00)
                        },
                        OwnerId: req.session.admin.Id
                    }
                });
            }


            const startOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay()); // Ngày đầu tiên của tuần (thứ 2)
            const endOfWeek = new Date(today.getFullYear(), today.getMonth(), today.getDate() + (6 - today.getDay())); // Ngày cuối cùng của tuần (Chủ nhật)
            // Lấy tổng số orders có trường createdAt trong tuần này
            const ordersWeekCount = await Orders.count({
                where: {
                    createdAt: {
                        [Op.gte]: startOfWeek, // createdAt >= startOfWeek (bắt đầu từ 00:00:00 thứ 2)
                        [Op.lt]: new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1) // createdAt < ngày tiếp theo của Chủ nhật (đến 00:00:00)
                    }
                }
            });
            
            let totalForToday;
            let totalForThisWeek;
            if (!req.session.admin.IsOwner) {
                totalForToday = await Orders.sum('Total', {
                    where: {
                        createdAt: {
                            [Op.gte]: startOfToday, // createdAt >= startOfToday (bắt đầu từ 00:00:00)
                            [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // createdAt < ngày tiếp theo (đến 00:00:00)
                        },
                        StatusPay: 1
                    }
                });

                // Tính tổng của trường Total trong các đơn hàng có trường createdAt trong tuần này
                totalForThisWeek = await Orders.sum('Total', {
                    where: {
                        createdAt: {
                            [Op.gte]: startOfWeek, // createdAt >= startOfWeek (bắt đầu từ 00:00:00 thứ 2)
                            [Op.lt]: new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1) // createdAt < ngày tiếp theo của Chủ nhật (đến 00:00:00)
                        },
                        StatusPay: 1
                    }
                });

                totalForToday = !totalForToday ? 0 : totalForToday
                totalForThisWeek = !totalForThisWeek ? 0 : totalForThisWeek
                
            }else{
                totalForToday = await Orders.sum('Total', {
                    where: {
                        createdAt: {
                            [Op.gte]: startOfToday, // createdAt >= startOfToday (bắt đầu từ 00:00:00)
                            [Op.lt]: new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1) // createdAt < ngày tiếp theo (đến 00:00:00)
                        },
                        OwnerId: req.session.admin.Id,
                        StatusPay: 1
                    }
                });

                totalForToday = !totalForToday ? 0 : totalForToday

                // Tính tổng của trường Total trong các đơn hàng có trường createdAt trong tuần này
                totalForThisWeek = await Orders.sum('Total', {
                    where: {
                        createdAt: {
                            [Op.gte]: startOfWeek, // createdAt >= startOfWeek (bắt đầu từ 00:00:00 thứ 2)
                            [Op.lt]: new Date(endOfWeek.getFullYear(), endOfWeek.getMonth(), endOfWeek.getDate() + 1) // createdAt < ngày tiếp theo của Chủ nhật (đến 00:00:00)
                        },
                        StatusPay: 1,
                        OwnerId: req.session.admin.Id,
                    }
                });

                totalForThisWeek = !totalForThisWeek ? 0 : totalForThisWeek
            }

            

            let totalPitchsEmpty;
            let totalPitchs;
            
            if (!req.session.admin.IsOwner) {
                // Lấy tổng số lượng Sân Bóng có
                totalPitchsEmpty = await Pitchs.count({
                    where: {
                        Status: 1
                    }
                });

                // Lấy tổng số lượng Sân Bóng có
                totalPitchs = await Pitchs.count();
            }else{
                // Lấy tổng số lượng Sân Bóng có
                totalPitchsEmpty = await Pitchs.count({
                    where: {
                        Status: 1,
                        CustomerId: req.session.admin.Id
                    }
                });

                // Lấy tổng số lượng Sân Bóng có
                totalPitchs = await Pitchs.count({
                    where: {
                        CustomerId: req.session.admin.Id
                    }
                });
            }

            // Lấy tổng số lượng Sân Bóng có
            const totalCategory = await Category.count({
                where: {
                    Type: 2
                }
            });

            totalForToday = parseInt(totalForToday).toLocaleString('en-US');
            totalForThisWeek = parseInt(totalForThisWeek).toLocaleString('en-US');

            return res.render('admin/dashboard/index', { ordersCount, ordersWeekCount, totalForToday, totalForThisWeek, totalPitchsEmpty, totalPitchs, totalCategory });
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải trang chủ.");
        }
    }

    //[GET] /admin/revenue
    async revenue(req, res) {
        const monthlyRevenue = [];

        if (!req.session.admin.IsOwner) {
            // Lấy từng tổng doanh thu của các tháng từ tháng 1 đến tháng 12
            for (let month = 1; month <= 12; month++) {
                const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
                const endOfMonth = new Date(new Date().getFullYear(), month, 0);

                const totalRevenue = await Orders.sum('Total', {
                    where: {
                        createdAt: {
                            [Op.between]: [startOfMonth, endOfMonth]
                        },
                        StatusPay: 1,
                    }
                });

                monthlyRevenue.push(parseInt(totalRevenue) || 0); // Đưa tổng doanh thu của tháng vào mảng
            }
        } else {
            // Lấy từng tổng doanh thu của các tháng từ tháng 1 đến tháng 12
            for (let month = 1; month <= 12; month++) {
                const startOfMonth = new Date(new Date().getFullYear(), month - 1, 1);
                const endOfMonth = new Date(new Date().getFullYear(), month, 0);

                const totalRevenue = await Orders.sum('Total', {
                    where: {
                        createdAt: {
                            [Op.between]: [startOfMonth, endOfMonth]
                        },
                        StatusPay: 1,
                        OwnerId: req.session.admin.Id
                    }
                });

                monthlyRevenue.push(parseInt(totalRevenue) || 0); // Đưa tổng doanh thu của tháng vào mảng
            }
        }


        return res.json(monthlyRevenue);
    }

}

module.exports = new dashboardController();
