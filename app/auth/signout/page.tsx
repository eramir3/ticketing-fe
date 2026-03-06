"use client";

import { useEffect } from "react";
import { ApiUsers } from "@/app/api/routes";
import { HttpMethod } from "../signin/types";

export default function SignoutPage() {
  useEffect(() => {
    const signOut = async () => {
      try {
        const response = await fetch(ApiUsers.Signout, {
          method: HttpMethod.Post,
        });

        if (!response.ok) {
          throw new Error("Signout failed");
        }

        window.location.assign("/");
      } catch (error) {
        console.error("Error during signout:", error);
      }
    };

    signOut();
  }, []);

  return <div>Signing you out...</div>;
}