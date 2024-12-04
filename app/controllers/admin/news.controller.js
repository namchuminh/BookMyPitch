const News = require("../../models/news.models");
const Category = require("../../models/category.models");

class newsController {
  //[GET] /admin/news
  async index(req, res) {
    try {
      const perPage = 5; 
      const page = parseInt(req.query.page) || 1; 

      const { count, rows: newsList } = await News.findAndCountAll({
        limit: perPage,
        offset: (page - 1) * perPage,
        include: [{ model: Category, as: 'category' }],
        order: [['id', 'DESC']] // Thêm điều kiện ORDER BY id DESC
      });

      const totalPages = Math.ceil(count / perPage); 
      
      return res.render('admin/news/index', { newsList, totalPages, currentPage: page });
    } catch (err) {
      // Xử lý lỗi
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải tin tức.");
    }
  }

  
  //[GET] /admin/news/add
  async viewAdd(req, res) {
    const category = await Category.findAll({
      where: {Type: 1}
    });
    return res.render('admin/news/add', {category});
  }

  //[POST] /admin/news/add
  async add(req, res) {
    const { tieude, chuyenmuc, duongdan, the, noidung } = req.body;
    try{
      const category = await Category.findAll({
        where: {Type: 1}
      });

      if(!tieude || !chuyenmuc || !duongdan || !the || !noidung) return res.render('admin/news/add', {category, error: "Vui lòng nhập đủ thông tin của tin tức này!"});

      if (!req.file) return res.render('admin/news/add', {category, error: "Vui lòng tải lên ảnh chính của tin tức này!"});

      if (!await Category.findByPk(chuyenmuc)) return res.render('admin/news/add', {category, error: "Chuyên mục không có trong hệ thống!"}); 

      await News.create({
        Title: tieude,
        Content: noidung,
        Avatar: req.base_url + req.file.path.replace(/\\/g, '/'),
        Tag: the,
        Slug: duongdan,
        CategoryId: chuyenmuc
      });

      return res.redirect('/admin/news/');
    }catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi thêm mới tin tức.");
    }
  }  

  //[GET] /admin/news/update/:id
  async viewUpdate(req, res) {
    const { id } = req.params;
    try {
      const news = await News.findByPk(id);
      if (!news) {
        return res.redirect('/admin/news/');
      }

      const category = await Category.findAll({
        where: {Type: 1}
      });

      return res.render('admin/news/update', { news, category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải tin tức để cập nhật.");
    }
  }
  

  //[POST] /admin/news/update/:id
  async update(req, res) {
    const { id } = req.params;
    const { tieude, chuyenmuc, duongdan, the, noidung } = req.body;
    try {
      const news = await News.findByPk(id);
      if (!news) {
        return res.redirect('/admin/news/');
      }

      const category = await Category.findAll({
        where: {Type: 1}
      });

      if(!tieude || !chuyenmuc || !duongdan || !the || !noidung) return res.render('admin/news/update', { news, category, error: "Vui lòng nhập đủ thông tin của tin tức này!" });

      if (!await Category.findByPk(chuyenmuc)) return res.render('admin/news/update', {news, category, error: "Chuyên mục không có trong hệ thống!"}); 

      if (!req.file){
        news.Title = tieude;
        news.Content = noidung;
        news.Tag = the;
        news.Slug = duongdan;
        news.CategoryId = chuyenmuc;
        await news.save();
      }else{
        news.Title = tieude;
        news.Content = noidung;
        news.Avatar = req.base_url + req.file.path.replace(/\\/g, '/');
        news.Tag = the;
        news.Slug = duongdan;
        news.CategoryId = chuyenmuc;
        await news.save();
      }

      return res.render('admin/news/update', {news, category, success: "Cập nhật tin tức thành công!"}); 
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi cập nhật tin tức.");
    }
  }
  

  //[GET] /admin/news/delete/:id
  async delete(req, res) {
    const { id } = req.params;
    try {
      const news = await News.findByPk(id);
      if (!news) {
        return res.redirect('/admin/news/');
      }

      await news.destroy();

      return res.redirect('/admin/news');
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi xóa tin tức.");
    }
  }
  
}

module.exports = new newsController();
