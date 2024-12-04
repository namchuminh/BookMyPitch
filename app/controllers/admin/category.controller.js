const Category = require("../../models/category.models");

class categoryController {
  //[GET] /admin/category
  async index(req, res) {
    try {
      const perPage = 5;
      const page = parseInt(req.query.page) || 1;

      const { count, rows: categoryList } = await Category.findAndCountAll({
        limit: perPage,
        offset: (page - 1) * perPage,
        order: [['Id', 'DESC']] // Thêm điều kiện ORDER BY Id DESC
      });

      const totalPages = Math.ceil(count / perPage);

      return res.render('admin/category/index', { categoryList, totalPages, currentPage: page });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải danh mục.");
    }
  }

  //[GET] /admin/category/add
  async viewAdd(req, res) {
    // Code để hiển thị trang thêm danh mục
    return res.render('admin/category/add');
  }

  //[POST] /admin/category/add
  async add(req, res) {
    const { name, slug, type } = req.body;
    try {
      if (!name || !slug || !type) return res.render('admin/category/add', { error: "Vui lòng nhập đủ thông tin của danh mục này!" });

      if (type != 1 && type != 2) return res.render('admin/category/add', { error: "Vui lòng chọn kiểu chuyên mục hợp lệ!" });

      if (!req.file) return res.render('admin/category/add', {error: "Vui lòng tải lên ảnh chính của danh mục này!"});

      await Category.create({
        Name: name,
        Avatar: req.base_url + req.file.path.replace(/\\/g, '/'),
        Slug: slug,
        Type: type
      });

      return res.redirect('/admin/category/');
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi thêm mới danh mục.");
    }
  }

  //[GET] /admin/category/update/:id
  async viewUpdate(req, res) {
    const { id } = req.params;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return res.redirect('/admin/category/');
      }

      return res.render('admin/category/update', { category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải danh mục để cập nhật.");
    }
  }

  //[POST] /admin/category/update/:id
  async update(req, res) {
    const { id } = req.params;
    const { name, avatar, slug, type } = req.body;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return res.redirect('/admin/category/');
      }

      if (!name || !slug || !type) return res.render('admin/category/update', { category, error: "Vui lòng nhập đủ thông tin của danh mục này!" });

      if (type != 1 && type != 2) return res.render('admin/category/add', { error: "Vui lòng chọn kiểu chuyên mục hợp lệ!" });

      if (!req.file){
        category.Name = name;
        category.Slug = slug;
        category.Type = type;
        await category.save();
      }else{
        category.Name = name;
        category.Avatar = avatar;
        category.Slug = slug;
        category.Type = type;
        category.Avatar = req.base_url + req.file.path.replace(/\\/g, '/');
        await category.save();
      }

      return res.render('admin/category/update', { category, success: "Cập nhật danh mục thành công!" });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi cập nhật danh mục.");
    }
  }

  //[GET] /admin/category/delete/:id
  async delete(req, res) {
    const { id } = req.params;
    try {
      const category = await Category.findByPk(id);
      if (!category) {
        return res.redirect('/admin/category/');
      }

      await category.destroy();

      return res.redirect('/admin/category');
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi xóa danh mục.");
    }
  }
}

module.exports = new categoryController();
