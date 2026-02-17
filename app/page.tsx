import { serverFetch } from "./api/server-fetch";
import { ApiUsers } from "./api/routes";
import { HttpMethod } from "./auth/signin/types";
import { CurrentUser } from "./auth/signup/types";

export default async function LandingPage() {
  const result = await serverFetch<CurrentUser>({
    url: ApiUsers.CurrentUser,
    method: HttpMethod.Get,
    fallbackMessage: 'Request failed',
  });

  return result.ok && result.data?.currentUser ? <div>Welcome, {result.data.currentUser.email}!</div> : <div>Not signed in</div>;
  //return result.data?.currentUser ? <div>Welcome, {result.data.currentUser.email}!</div> : <div>Not signed in</div>;
}
