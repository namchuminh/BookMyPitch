const Pitch = require("../../models/pitchs.models");
const Category = require("../../models/category.models");
const Facility = require("../../models/facility.models");
const Rule = require("../../models/rule.models");
const Image = require("../../models/image.models");
const Customer = require("../../models/customer.models");

class pitchController {
  //[GET] /admin/pitch
  async index(req, res) {
    try {
      const perPage = 5; 
      const page = parseInt(req.query.page) || 1; 

      if(!req.session.admin.IsOwner){
        const { count, rows: pitchList } = await Pitch.findAndCountAll({
          limit: perPage,
          offset: (page - 1) * perPage,
          include: [{ model: Category, as: 'category' }, { model: Customer, as: 'customer' }],
          order: [['Id', 'DESC']] // Thêm điều kiện ORDER BY Id DESC
        });

        const totalPages = Math.ceil(count / perPage); 
      
        return res.render('admin/pitch/index', { pitchList, totalPages, currentPage: page });
      }else{
        const { count, rows: pitchList } = await Pitch.findAndCountAll({
          limit: perPage,
          offset: (page - 1) * perPage,
          include: [{ model: Category, as: 'category' }],
          where: {
            CustomerId: req.session.admin.Id // Điều kiện lọc theo CustomerId
          },
          order: [['Id', 'DESC']] // Thêm điều kiện ORDER BY Id DESC
        });

        const totalPages = Math.ceil(count / perPage); 
      
        return res.render('admin/pitch/index', { pitchList, totalPages, currentPage: page });
      }
      
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải danh sách sân.");
    }
  }

  //[GET] /admin/pitch/add
  async viewAdd(req, res) {
    const category = await Category.findAll({
      where: {Type: 2}
    });
    return res.render('admin/pitch/add', {category});
  }

  //[POST] /admin/pitch/add
  async add(req, res) {
    const { name, description, price, people, categoryId, slug, address } = req.body;
    try {
      const category = await Category.findAll({
        where: {Type: 2}
      });

      if (!name || !description || !price || !people || !categoryId || !slug || !address ) return res.render('admin/pitch/add', {category, error: "Vui lòng nhập đủ thông tin của Sân Bóng này!"});

      if (!/^\d+$/.test(people) || people < 1) return res.render('admin/pitch/add', {category, error: "Số người tối đa trong Sân Bóng không hợp lệ!"}); 

      if (!/^\d+$/.test(people) || people < 1) return res.render('admin/pitch/add', {category, error: "Giá tiền cho 90 phút thuê Sân Bóng không hợp lệ!"}); 
      
      if (!await Category.findByPk(categoryId)) return res.render('admin/pitch/add', {category, error: "Danh mục Sân Bóng không tồn tại trong hệ thống!"}); 

      if (!req.file) return res.render('admin/pitch/add', {category, error: "Vui lòng tải lên ảnh đại diện cho Sân Bóng này!"});

      let insertPitch;
      if(!req.session.admin.IsOwner){
        insertPitch = await Pitch.create({
          Name: name,
          Description: description,
          Avatar: req.base_url + req.file.path.replace(/\\/g, '/'),
          Price: price,
          People: people,
          CategoryId: categoryId,
          Slug: slug,
          Address: address,
          Status: 1
        });
      }else{
        insertPitch = await Pitch.create({
          Name: name,
          Description: description,
          Avatar: req.base_url + req.file.path.replace(/\\/g, '/'),
          Price: price,
          People: people,
          CategoryId: categoryId,
          Slug: slug,
          CustomerId: req.session.admin.Id,
          Address: address,
          Status: 1
        });
      }

      await Facility.create({
        PitchId: insertPitch.Id,
        Shirt: 0,
        Water: 0,
        Referee: 0,
        Shoe: 0,
        Bathroom: 0,
        Ball: 0
      });

      return res.redirect('/admin/pitch/');
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi thêm mới Sân.");
    }
  }  

  //[GET] /admin/pitch/update/:id
  async viewUpdate(req, res) {
    const { id } = req.params;
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      const category = await Category.findAll({
        where: {Type: 2}
      });

      return res.render('admin/pitch/update', { pitch, category });
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi tải thông tin Sân Bóng để cập nhật.");
    }
  }

  //[POST] /admin/pitch/update/:id
  async update(req, res) {
    const { id } = req.params;
    const { name, description, price, people, categoryId, slug, status, address } = req.body;
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      const category = await Category.findAll({
        where: {Type: 2}
      });

      if (!name || !description || !price || !people || !slug || !status || !address ) return res.render('admin/pitch/update', {pitch, category, error: "Vui lòng nhập đủ thông tin của Sân Bóng này!"});

      if (!/^\d+$/.test(people) || people < 1) return res.render('admin/pitch/update', {pitch, category, error: "Số người tối đa trong Sân Bóng không hợp lệ!"}); 

      if (!/^\d+$/.test(people) || people < 1) return res.render('admin/pitch/update', {pitch, category, error: "Giá tiền cho 90 phút thuê Sân Bóng không hợp lệ!"}); 
      
      if (!await Category.findByPk(categoryId)) return res.render('admin/pitch/update', {pitch, category, error: "Danh mục Sân Bóng không tồn tại trong hệ thống!"}); 

      if (status != 1 && status != 0) return res.render('admin/pitch/update', {pitch, category, error: "Trạng thái Sân Bóng không hợp lệ!"}); 

      if (!req.file){
        pitch.Name = name;
        pitch.Description = description;
        pitch.Price = price;
        pitch.People = people;
        pitch.CategoryId = categoryId;
        pitch.Slug = slug;
        pitch.Address = address;
        pitch.Status = status;
        await pitch.save();
      }else{
        pitch.Name = name;
        pitch.Description = description;
        pitch.Price = price;
        pitch.People = people;
        pitch.CategoryId = categoryId;
        pitch.Slug = slug;
        pitch.Address = address;
        pitch.Status = status;
        pitch.Avatar = req.base_url + req.file.path.replace(/\\/g, '/');
        await pitch.save();
      }

      return res.render('admin/pitch/update', { pitch, category, success: "Cập nhật thông tin Sân Bóng thành công!" }); 
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi cập nhật thông tin Sân.");
    }
  }
  
  //[GET] /admin/pitch/delete/:id
  async delete(req, res) {
    const { id } = req.params;
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      await pitch.destroy();

      return res.redirect('/admin/pitch');
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi xóa Sân.");
    }
  }

  //[GET] /admin/pitch/:id/facility
  async facility(req, res) {
    const { id } = req.params;
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      if(!await Facility.findOne({where: {PitchId: id} })){
        await Facility.create({
            PitchId:	id,
            Wifi: 0,	
            Washer: 0,	
            Bed: 1,	
            Gym: 0,	
            Kitchen: 0,	
            Air: 0,	
            Support: 0,	
            Storage: 0,	
            Bathpitch: 0,
        });
      }

      const facility = await Facility.findOne({where: {PitchId: id} });

      return res.render('admin/pitch/facility', { pitch, facility }); 
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi xem tiện ích Sân.");
    }
  }

  //[POST] /admin/pitch/:id/facility
  async updateFacility(req, res) {
    const { id } = req.params;
    const { shirt, water, referee, shoe, bathroom, ball } = req.body;
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      const facility = await Facility.findOne({where: {PitchId: id} });

      if(!shirt || !water || !referee || !shoe || !bathroom || !ball ) return res.render('admin/pitch/facility', { pitch, facility, error: "Vui lòng chọn tiện ích cho Sân!" }); 

      if(shirt != 0 && shirt != 1) return res.render('admin/pitch/facility', { pitch, facility, error: "Trạng thái cấp trang phục chọn không hợp lệ!" });
      
      if(water != 0 && water != 1) return res.render('admin/pitch/facility', { pitch, facility, error: "Trạng thái tặng nước uống không hợp lệ!" }); 

      if(referee != 0 && referee != 1) return res.render('admin/pitch/facility', { pitch, facility, error: "Trạng thái có trọng tài không hợp lệ!" }); 

      if(shoe != 0 && shoe != 1) return res.render('admin/pitch/facility', { pitch, facility, error: "Trạng thái cho thuê giày chọn không hợp lệ!" }); 

      if(bathroom != 0 && bathroom != 1) return res.render('admin/pitch/facility', { pitch, facility, error: "Trạng thái có phòng tắm chọn không hợp lệ!" }); 

      if(ball != 0 && ball != 1) return res.render('admin/pitch/facility', { pitch, facility, error: "Trạng thái cung cấp bóng không hợp lệ!" }); 


      facility.Shirt = shirt;
      facility.Water = water;
      facility.Referee = referee;
      facility.Shoe = shoe;
      facility.Bathroom = bathroom;
      facility.Ball = ball;
      await facility.save();

      return res.render('admin/pitch/facility', { pitch, facility, success: "Cập nhật tiện ích sân bóng thành công!" }); 
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi cập nhật tiện ích Sân.");
    }
  }

  //[GET] /admin/pitch/:id/rule
  async rule(req, res) {
    const { id } = req.params;
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      const ruleCount = await Rule.count({ where: { PitchId: id } });
      const rule = await Rule.findAll({where: {PitchId: id} });
      return res.render('admin/pitch/rule', { pitch, ruleCount, rule});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi khi hiển thị quy tắc.");
    }
  }

  //[POST] /admin/pitch/:id/rule
  async updateRule(req, res) {
    const { id } = req.params;
    
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      await Rule.destroy({ where: { PitchId: id } });

      for (const key in req.body) {
        const value = req.body[key];
        await Rule.create({ Rules: value, PitchId: id }); 
      }

      const ruleCount = await Rule.count({ where: { PitchId: id } });
      const rule = await Rule.findAll({where: {PitchId: id} });
      return res.render('admin/pitch/rule', { pitch, ruleCount, rule, success: "Cập nhật quy tắc cho Sân Bóng thành công!"});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi cập nhật quy tắc.");
    }
  }

  //[GET] /admin/pitch/:id/image
  async image(req, res) {
    const { id } = req.params;
    
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      const imageCount = await Image.count({ where: { PitchId: id } });
      const image = await Image.findAll({where: {PitchId: id} });

      return res.render('admin/pitch/image', { pitch, imageCount, image});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi hiển thị hình ảnh Sân.");
    }
  }

  //[POST] /admin/pitch/:id/image
  async updateImage(req, res) {
    const { id } = req.params;
    
    try {
      const pitch = await Pitch.findByPk(id);
      if (!pitch) {
        return res.redirect('/admin/pitch/');
      }

      const imageCount = await Image.count({ where: { PitchId: id } });
      const image = await Image.findAll({where: {PitchId: id} });

      if(imageCount < 1){
        if (req.files && Object.keys(req.files).length == 4) {
          await Image.create({
            PitchId: id, 
            Image: req.base_url + req.files.image1[0].path.replace(/\\/g, '/'), 
          });

          await Image.create({
            PitchId: id, 
            Image: req.base_url + req.files.image2[0].path.replace(/\\/g, '/'), 
          });

          await Image.create({
            PitchId: id, 
            Image: req.base_url + req.files.image3[0].path.replace(/\\/g, '/'), 
          });

          await Image.create({
            PitchId: id, 
            Image: req.base_url + req.files.image4[0].path.replace(/\\/g, '/'), 
          });

        }else{
          return res.render('admin/pitch/image', { pitch, imageCount, image, error: "Vui lòng nhập đủ số lượng hình ảnh!"});
        }
      }else{
        const images = await Image.findAll({where: {PitchId: id} });
        const ids = [];
        for (const image of images) {
          ids.push(image.dataValues.Id);
        }

        if(req.files.image1){
          await Image.update({ Image: req.base_url + req.files.image1[0].path.replace(/\\/g, '/') }, { where: { Id: ids[0], }, });
        }

        if(req.files.image2){
          await Image.update({ Image: req.base_url + req.files.image2[0].path.replace(/\\/g, '/') }, { where: { Id: ids[1], }, });
        }

        if(req.files.image3){
          await Image.update({ Image: req.base_url + req.files.image3[0].path.replace(/\\/g, '/') }, { where: { Id: ids[2], }, });
        }

        if(req.files.image4){
          await Image.update({ Image: req.base_url + req.files.image4[0].path.replace(/\\/g, '/') }, { where: { Id: ids[3], }, });
        }
      }

      const imageUpdated = await Image.findAll({where: {PitchId: id} });
      const imageCountUpdated = await Image.count({ where: { PitchId: id } });
      return res.render('admin/pitch/image', { pitch, imageCount: imageCountUpdated, image: imageUpdated, success: "Cập nhật hình ảnh Sân Bóng thành công!"});
    } catch (err) {
      console.error(err);
      return res.status(500).send("Đã xảy ra lỗi cập nhật quy tắc.");
    }
  }
}

module.exports = new pitchController();
