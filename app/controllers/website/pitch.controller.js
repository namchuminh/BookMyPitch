const Sequelize = require('sequelize');
const Pitchs = require("../../models/pitchs.models");
const Orders = require("../../models/orders.models");
const Facility = require("../../models/facility.models");
const Rule = require("../../models/rule.models");
const Image = require("../../models/image.models");
const { Op } = require('sequelize');
const { htmlToText } = require("html-to-text");

class pitchController {
    //[GET] /phong-nghi
    async viewAll(req, res) {
        try {
            const { thanhpho, quanhuyen, kieusan, trang } = req.query;

            const perPage = 15;
            const page = parseInt(trang) || 1;

            // Điều kiện tìm kiếm
            const whereCondition = {
                Status: 1, // Luôn kiểm tra trạng thái
            };

            // Nếu có điều kiện tìm kiếm theo Address
            if (thanhpho) {
                whereCondition.Address = { [Op.like]: `%${thanhpho}%` };
            }

            if (quanhuyen) {
                whereCondition.Address = { [Op.like]: `%${quanhuyen}%` };
            }

            // Nếu có tìm kiếm theo People (kieusan)
            if (kieusan) {
                whereCondition.People = { [Op.like]: `%${kieusan}%` };
            }

            // Tìm kiếm danh sách sân
            const { count, rows: pitchList } = await Pitchs.findAndCountAll({
                limit: perPage,
                offset: (page - 1) * perPage,
                order: [['Id', 'DESC']], // ORDER BY Id DESC
                where: whereCondition,
            });

            // Tổng số trang
            const totalPages = Math.ceil(count / perPage);

            // Xử lý dữ liệu pitchList
            for (const pitch of pitchList) {
                const facilityInfo = await Facility.findOne({ where: { PitchId: pitch.Id } });

                pitch.Referee = facilityInfo ? facilityInfo.dataValues.Referee : null;
                
                pitch.Description = htmlToText(pitch.Description, {
                    wordwrap: false, // Không ngắt dòng
                });

                pitch.Description = pitch.Description.substring(0, 62) + " ...";
            }

            // Render kết quả
            return res.render('website/pitch/all', { 
                pitchList, 
                totalPages, 
                currentPage: page, 
                title: "MyPitch - Danh sách Sân Bóng", 
                search: Boolean(thanhpho || quanhuyen || kieusan)
            });
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải danh sách Sân.");
        }
    }

    //[GET] /san-bong/:slug
    async viewDetail(req, res) {
        const { id } = req.params;
        try {
            const pitch = await Pitchs.findOne({ where: { slug: id } });
            if (!pitch) {
                return res.render('website/error/index');
            }

            const facility = await Facility.findAll({
                where: { PitchId: pitch.Id }
            });

            const rule = await Rule.findAll({
                where: { PitchId: pitch.Id }
            });

            const image = await Image.findAll({
                where: { PitchId: pitch.Id }
            });

            const related = await Pitchs.findAll({
                where: { CategoryId: pitch.CategoryId },
                include: [Facility], //Lấy kèm theo Facility tương ứng
                order: Sequelize.literal('RAND()'), // Sử dụng hàm RAND() để sắp xếp ngẫu nhiên
                limit: 4 // Lấy ra 4 bản ghi
            });

            return res.render('website/pitch/detail', {pitch,facility,rule,image,related,title: "MyPitch - " + pitch.Name});
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải chi tiết Sân.");
        }
    }

}

module.exports = new pitchController();
