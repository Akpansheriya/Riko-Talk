const Database = require("../../../connections/connection");
const Category = Database.contactCategory;
const Content = Database.contactContent;

const category = async (req, res) => {
  try {
    const { category_name } = req.body;
    const data = {
      category_name: category_name,
    };
    Category.create(data).then((result) => {
      res.status(200).send({
        message: "category created successfulyy",
        category: result,
      });
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send({
      message: "Error creating category",
      error: error,
    });
  }
};

const categoryData = async (req, res) => {
  try {
    const categories = await Category.findAll({});
    res.status(200).send({
      message: "categories data",
      categories: categories,
    });
  } catch (error) {
    console.error("Error creating category:", error);
    res.status(500).send({
      message: "Error creating category",
      error: error,
    });
  }
};

const content = async (req, res) => {
  try {
    const { title, categoryId, content } = req.body;
    const data = {
      categoryId: categoryId,
      title: title,
      content: content,
    };
    Content.create(data).then((result) => {
      res.status(200).send({
        message: "content created successfulyy",
        content: result,
      });
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).send({
      message: "Error creating content",
      error: error,
    });
  }
};
const contentDataByCategory = async (req, res) => {
  try {
    const { id } = req.params;
    const ContentData = await Content.findAll({ where: { categoryId: id } });
    res.status(200).send({
      message: "content data",
      content: ContentData,
    });
  } catch (error) {
    console.error("Error creating content:", error);
    res.status(500).send({
      message: "Error creating content",
      error: error,
    });
  }
};

module.exports = {
  category,
  categoryData,
  content,
  contentDataByCategory,
};
