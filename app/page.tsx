import { doRequest, HttpMethod } from "./api/request";
import { ApiUsers } from "./api/routes";
import { cookies } from 'next/headers';



export default async function LandingPage() {
  const result = await doRequest<{ currentUser: { id: string, email: string } | null }>({
    url: ApiUsers.CurrentUser,
    method: HttpMethod.Get,
    fallbackMessage: 'Request failed',
  });

  return result.ok && result.data?.currentUser ? <div>Welcome, {result.data?.currentUser?.email}!</div> : <div>Not signed in</div>;

}
