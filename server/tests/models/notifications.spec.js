import chai from "chai";
import chaiAsPromise from "chai-as-promised";
import models from "@models";
import { userData, articleData, category } from "@fixtures";

chai.use(chaiAsPromise);
const { Users, Articles, Notifications, Categories } = models;
const { expect } = chai;

const notificationDependencies = async () => {
  const createdUser = await Users.create(userData[0]);
  const userId = createdUser.get("id");
  const articleCategory = await Categories.create(category);
  const categoryId = articleCategory.get("id");
  const articleTemplate = Object.assign(articleData, {
    authorId: userId,
    categoryId
  });
  const articleInstance = await Articles.create(articleTemplate);
  const articleId = articleInstance.get("id");

  return Promise.resolve({
    userId,
    articleId,
    user: createdUser,
    article: articleInstance
  });
};

beforeEach(async () => {
  await models.sequelize.sync({ force: true });
});

describe("Notifications model", () => {
  it("should create a notification model with valid user and article", async () => {
    const { userId, articleId } = await notificationDependencies();
    const notification = await Notifications.create({
      userId,
      articleId,
      message: "An article is liked"
    });
    expect(notification.get("userId")).equals(userId);
    expect(notification.get("articleId")).equals(articleId);
  });

  it("should remove notification when user is not reachable", async () => {
    const { userId, articleId, user } = await notificationDependencies();
    await Notifications.create({
      userId,
      articleId,
      message: "An article is liked"
    });
    const notificationBefore = await Notifications.findOne({
      Where: { userId }
    });
    expect(notificationBefore).to.not.be.null;
    await user.destroy();
    const notificationAfter = await Notifications.findOne({
      Where: { userId }
    });
    expect(notificationAfter).to.be.null;
  });

  it("should remove notification when Article is not reachable", async () => {
    const { userId, articleId, article } = await notificationDependencies();
    await Notifications.create({
      userId,
      articleId,
      message: "An article is liked"
    });
    const notificationBefore = await Notifications.findOne({
      Where: { userId }
    });
    expect(notificationBefore).to.not.be.null;
    await article.destroy();
    const notificationAfter = await Notifications.findOne({
      where: { articleId }
    });
    expect(notificationAfter).to.be.null;
  });
});
