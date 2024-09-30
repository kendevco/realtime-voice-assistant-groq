import { DeepgramError, createClient } from "@deepgram/sdk";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const url = request.url;
  const deepgram = createClient(process.env.DEEPGRAM_API_KEY ?? "");

  try {
    const projectsResponse = await deepgram.manage.getProjects();

    // Use type assertion to a more specific type
    const projects = (projectsResponse as { projects?: { project_id: string }[] }).projects;

    if (!projects || projects.length === 0) {
      return NextResponse.json(
        new DeepgramError(
          "Cannot find a Deepgram project. Please create a project first."
        )
      );
    }

    const project = projects[0];

    const newKeyResponse = await deepgram.manage.createProjectKey(project.project_id, {
      comment: "Temporary API key",
      scopes: ["usage:write"],
      tags: ["next.js"],
      time_to_live_in_seconds: 10,
    });

    return NextResponse.json({ ...newKeyResponse, url });
  } catch (error) {
    console.error("Error in Deepgram API:", error);
    return NextResponse.json({ error: "An error occurred while processing your request" }, { status: 500 });
  }
}
