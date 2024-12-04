const Sequelize = require('sequelize');
const News = require("../../models/news.models");
const Category = require("../../models/category.models");


class newsController {
    //[GET] /tin-tuc
    async viewAll(req, res) {
        try {
            const perPage = 5;
            const page = parseInt(req.query.trang) || 1;

            const { count, rows: newsList } = await News.findAndCountAll({
                limit: perPage,
                offset: (page - 1) * perPage,
                order: [['Id', 'DESC']], // Thêm điều kiện ORDER BY Id DESC
                include: [{ model: Category, as: 'category' }]
            });

            const category = await Category.findAll({
                where: {type: 1}
            });

            const totalPages = Math.ceil(count / perPage);

            for (const news of newsList) {
                const d = new Date(news.createdAt).getDate() < 10 ? "0" + new Date(news.createdAt).getDate() : new Date(news.createdAt).getDate()
                const m = (new Date(news.createdAt).getMonth() + 1) < 10 ? "0" + (new Date(news.createdAt).getMonth() + 1) : (new Date(news.createdAt).getMonth() + 1)
                news.created = `${d}-${m}-${new Date(news.createdAt).getFullYear()}`;
                news.Content = news.Content.substring(0, 124) + " ...";
            }

            const tag = await News.findAll({
                attributes: ['Tag'],
            });

            let allTags = [];

            for (const t of tag) {
                const tags = t.dataValues.Tag.split(',').map(tag => tag.trim());
                allTags = [...allTags, ...tags];
            }
            
            allTags = [...new Set(allTags)];

            const suggestNews = await News.findAll({
                order: Sequelize.literal('RAND()'),
                limit: 4 // Lấy ra 4 bản ghi
            });

            for (const c of suggestNews) {
                const d = new Date(c.createdAt).getDate() < 10 ? "0" + new Date(c.createdAt).getDate() : new Date(c.createdAt).getDate()
                const m = (new Date(c.createdAt).getMonth() + 1) < 10 ? "0" + (new Date(c.createdAt).getMonth() + 1) : (new Date(c.createdAt).getMonth() + 1)
                c.created = `${d}-${m}-${new Date(c.createdAt).getFullYear()}`;
            }
              
            return res.render('website/news/all', { newsList, tag:allTags, totalPages, suggestNews, currentPage: page, category, title: "MyPitch - Tin tức" });
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải danh tin tức.");
        }
    }

    //[GET] /tin-tuc/:slug
    async viewDetail(req, res) {
        const { id } = req.params;
        try {
            const news = await News.findOne({
                where: {slug: id},
                include: [{ model: Category, as: 'category' }]
            });

            if (!news) {
                return res.render('website/error/index');
            }

            const d = new Date(news.createdAt).getDate() < 10 ? "0" + new Date(news.createdAt).getDate() : new Date(news.createdAt).getDate()
            const m = (new Date(news.createdAt).getMonth() + 1) < 10 ? "0" + (new Date(news.createdAt).getMonth() + 1) : (new Date(news.createdAt).getMonth() + 1)
            news.dataValues.createdAt = `${d}-${m}-${new Date(news.createdAt).getFullYear()}`;

            const category = await Category.findAll({
                where: {type: 1}
            });

            const tag = await News.findAll({
                attributes: ['Tag'],
            });

            let allTags = [];

            for (const t of tag) {
                const tags = t.dataValues.Tag.split(',').map(tag => tag.trim());
                allTags = [...allTags, ...tags];
            }
            
            allTags = [...new Set(allTags)];

            const newNews = await News.findAll({
                order: [['Id', 'DESC']],
                limit: 4 // Lấy ra 4 bản ghi
            });

            for (const c of newNews) {
                const d = new Date(c.createdAt).getDate() < 10 ? "0" + new Date(c.createdAt).getDate() : new Date(c.createdAt).getDate()
                const m = (new Date(c.createdAt).getMonth() + 1) < 10 ? "0" + (new Date(c.createdAt).getMonth() + 1) : (new Date(c.createdAt).getMonth() + 1)
                c.created = `${d}-${m}-${new Date(c.createdAt).getFullYear()}`;
            }

            const related = await News.findAll({
                where: { CategoryId: news.CategoryId },
                order: Sequelize.literal('RAND()'), // Sử dụng hàm RAND() để sắp xếp ngẫu nhiên
                limit: 3, // Lấy ra 4 bản ghi
                include: [{ model: Category, as: 'category' }]
            });

            for (const c of related) {
                const d = new Date(c.createdAt).getDate() < 10 ? "0" + new Date(c.createdAt).getDate() : new Date(c.createdAt).getDate()
                const m = (new Date(c.createdAt).getMonth() + 1) < 10 ? "0" + (new Date(c.createdAt).getMonth() + 1) : (new Date(c.createdAt).getMonth() + 1)
                c.created = `${d}-${m}-${new Date(c.createdAt).getFullYear()}`;
                c.Content = c.Content.substring(0, 124) + " ...";
            }

            console.log(related)

            return res.render('website/news/detail', {news,tag:allTags,category,related,newNews,title: "Tin tức - " + news.Title});
        } catch (err) {
            console.error(err);
            return res.status(500).send("Đã xảy ra lỗi khi tải chi tiết tin tức.");
        }
    }

}

module.exports = new newsController();
