// This is an example file
// Uncomment the code to test locally

exports.update = async () => {
  // await strapi.db.connection.raw(
  //   `UPDATE admin_users
  //       SET username = 'new custom user name'
  //       WHERE id = 2;`
  // );
};

exports.isNecessary = async () => {
  // const rawBuilder = await strapi.db.connection.raw(
  //   `SELECT * FROM admin_users;`
  // );
  // return rawBuilder[0].length === 2;
  return false;
};
