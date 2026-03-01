import { NextResponse } from 'next/server';

export async function GET() {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = `https://sgcseuguiadecompras.vercel.app/api/auth/callback`;

  const githubAuthUrl = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&scope=repo`;

  return NextResponse.redirect(githubAuthUrl);
}
