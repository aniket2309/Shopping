//v7 imports
import user from "./api/v1/controllers/user/routes";
import shopContent from "./api/v1/controllers/shopping/routes";

/**
 *
 *
 * @export
 * @param {any} app
 */

export default function routes(app) {

  app.use('/api/v1/user', user);
  app.use('/api/v1/shop', shopContent);
  return app;
}
