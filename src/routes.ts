import { ensureAuthentication } from "./middleware/ensureAuthentication";
import { Router } from "express";
import { AuthenticateUserController } from "./controllers/AuthenticateUserController";
import { CreateMessageController } from "./controllers/CreateMessageController";
import { GetLast3MessagesController } from "./controllers/GetLast3MessagesController";
import { ProfileUserController } from "./controllers/ProfileUserController";

const router = Router();

router.post(
  "/authenticate",
  new AuthenticateUserController().handleAuthenticate
);
router.post(
  "/messages",
  ensureAuthentication,
  new CreateMessageController().handleMessage
);
router.get("/messages/last3", new GetLast3MessagesController().handle);
router.get(
  "/profile",
  ensureAuthentication,
  new ProfileUserController().handle
);

export { router };
