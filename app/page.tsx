import { doRequest, HttpMethod } from "./api/request";
import { ApiUsers } from "./api/routes";
import { CurrentUser } from "./auth/signup/types";

export default async function LandingPage() {
  const result = await doRequest<CurrentUser>({
    url: ApiUsers.CurrentUser,
    method: HttpMethod.Get,
    fallbackMessage: 'Request failed',
  });

  return result.data ? <div>Welcome, {result.data?.currentUser?.email}!</div> : <div>Not signed in</div>;

}
