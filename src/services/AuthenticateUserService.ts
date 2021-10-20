import axios from "axios";
import { sign } from "jsonwebtoken";
import prismaClient from "../prisma";

interface IAcessTokenResponse {
  access_token: string;
}

interface IUserResponse {
  avatar_url: string;
  login: string;
  name: string;
  id: number;
}
class AuthenticateUserService {
  async execute(code: string) {
    const url = "https://github.com/login/oauth/access_token";

    //Recupera o acess_token do github
    const { data: accessTokenResponse } = await axios.post<IAcessTokenResponse>(
      url,
      null,
      {
        params: {
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code,
        },
        headers: {
          Accept: "application/json",
        },
      }
    );

    //Recupera as informações do usuário do github
    const response = await axios.get<IUserResponse>(
      "https://api.github.com/user",
      {
        headers: {
          authorization: `Bearer ${accessTokenResponse.access_token}`,
        },
      }
    );

    const { login, id, avatar_url, name } = response.data;
    //Verifica-se a existencia do usuário no banco, se existir, cria um Token
    const user = await prismaClient.user.findFirst({
      where: {
        github_id: id,
      },
    });

    if (!user) {
      await prismaClient.user.create({
        data: {
          github_id: id,
          login,
          avatar_url,
          name,
        },
      });
    }

    //Caso exista usuário no banco, será criado um novo token 
    const token = sign(
      {
        user: {
          name: user.name,
          avatar_url: user.avatar_url,
          id: user.id,
        },
      },
      process.env.JWT_TOKEN_SECRET,
      {
        subject: user.id,
        expiresIn: "1d",
      }
    );

    //Retorna os dados do token e do usuário
    return { token, user };
  }
}

export { AuthenticateUserService };
