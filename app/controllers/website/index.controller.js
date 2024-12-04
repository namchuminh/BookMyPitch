const Sequelize = require('sequelize');
const News = require("../../models/news.models");
const Category = require("../../models/category.models");
const Pitch = require("../../models/pitchs.models");
const Facility = require("../../models/facility.models");


class indexController {
    //[GET] /
    async index(req, res) {
        try {
            const newPitchs = await Pitch.findAll({
                order: [['id', 'DESC']],
                limit: 3,
            });

            const Pitchs = await Pitch.findAll({
                order: [['id', 'DESC']],
                limit: 4,
                order: Sequelize.literal('RAND()'),
            });

            const { count, rows: newsList } = await News.findAndCountAll({
                limit: 3,
                order: [['Id', 'DESC']], // Thêm điều kiện ORDER BY Id DESC
                include: [{ model: Category, as: 'category' }]
            });

            for (const news of newsList) {
                const d = new Date(news.createdAt).getDate() < 10 ? "0" + new Date(news.createdAt).getDate() : new Date(news.createdAt).getDate()
                const m = (new Date(news.createdAt).getMonth() + 1) < 10 ? "0" + (new Date(news.createdAt).getMonth() + 1) : (new Date(news.createdAt).getMonth() + 1)
                news.created = `${d}-${m}-${new Date(news.createdAt).getFullYear()}`;
                news.Content = news.Content.substring(0, 124) + " ...";
            }

            for (const pitch of newPitchs) {
                const facilityInfo = await Facility.findOne({ where: { PitchId: pitch.Id } });
                pitch.Bed = facilityInfo ? facilityInfo.dataValues.Bed : null;
            }

            return res.render('website/index', {newPitchs, Pitchs, newsList, title: "MyPitch - Sân Bóng chất lượng" });
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải trang chủ.");
        }
    }

}

module.exports = new indexController();
