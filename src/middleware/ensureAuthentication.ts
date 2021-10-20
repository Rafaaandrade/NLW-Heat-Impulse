import { NextFunction, Request, Response } from "express";
import { verify } from "jsonwebtoken";


interface IPayload {
    sub: string
}

export const ensureAuthentication = (
  request: Request,
  response: Response,
  next: NextFunction
) => {
  //Verifica a existencia do token
  const authToken = request.headers.authorization;

  if (!authToken) {
    return response.status(401).json({
      errorCode: "Token inválido",
    });
  }

  const [, token] = authToken.split(" ");

  //Verifica se o token ainda está válido
  try {
    const { sub } = verify(token, process.env.JWT_TOKEN_SECRET) as IPayload

    request.user_id = sub;

    return next();

  } catch (error) {
    return response.status(401).json({ errorCode: "Token expirou" });
  }
};
