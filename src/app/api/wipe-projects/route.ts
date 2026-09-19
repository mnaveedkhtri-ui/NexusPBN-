import { NextResponse } from 'next/server';
import { sql } from '@vercel/postgres';

export async function GET() {
  try {
    const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
    const VERCEL_TOKEN = process.env.VERCEL_TOKEN;

    // 1. Fetch all projects from DB
    const dbRes = await sql`SELECT * FROM projects`;
    const projects = dbRes.rows;

    let deletedGithub = 0;
    let deletedVercel = 0;

    for (const project of projects) {
      const repoName = project.githubrepo;

      // Delete from Vercel
      if (VERCEL_TOKEN && repoName) {
        try {
          const vRes = await fetch(`https://api.vercel.com/v9/projects/${repoName}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${VERCEL_TOKEN}` }
          });
          if (vRes.ok) deletedVercel++;
        } catch (e) {}
      }

      // Delete from GitHub
      if (GITHUB_TOKEN && repoName) {
        try {
          // Find username first
          const uRes = await fetch('https://api.github.com/user', {
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
          });
          const uData = await uRes.json();
          const username = uData.login;

          const gRes = await fetch(`https://api.github.com/repos/${username}/${repoName}`, {
            method: 'DELETE',
            headers: { 'Authorization': `token ${GITHUB_TOKEN}` }
          });
          if (gRes.ok) deletedGithub++;
        } catch (e) {}
      }
    }

    // Clear DB
    await sql`DELETE FROM projects`;

    return NextResponse.json({ 
      success: true, 
      message: 'Wiped everything!',
      deletedGithub,
      deletedVercel,
      clearedDbRows: projects.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
