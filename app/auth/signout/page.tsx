"use client";

import { useEffect } from "react";
import { ApiUsers } from "@/app/api/routes";
import { HttpMethod } from "../signin/types";

export default function SignoutPage() {
  useEffect(() => {
    (async () => {
      const result = await fetch(ApiUsers.Signout, { method: HttpMethod.Post });
      // Force a full reload so the server re-renders Header with the new cookie
      if (result.ok) {
        window.location.assign("/");
      }
    })();
  }, []);

  return <div>Signing you out...</div>;
}
