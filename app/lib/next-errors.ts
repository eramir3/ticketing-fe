type NextErrorWithDigest = Error & { digest?: string };

export function rethrowNextErrors(error: unknown): void {
  if (
    error instanceof Error &&
    typeof (error as NextErrorWithDigest).digest === 'string'
  ) {
    const digest = (error as NextErrorWithDigest).digest as string;
    if (
      digest.startsWith('NEXT_REDIRECT') ||
      digest.startsWith('NEXT_NOT_FOUND')
    ) {
      throw error;
    }
  }
}
