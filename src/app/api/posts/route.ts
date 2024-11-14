import { prisma } from "@/lib/db";
import { NextRequest, NextResponse } from "next/server";

export async function POST(request: NextRequest) {
  try {
    // Parse the request body
    const { title, slug, content } = await request.json();

    // Auto-generate slug from title if not provided
    const generatedSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

    // Create the new post
    const newPost = await prisma.post.create({
      data: {
        title,
        slug: generatedSlug,
        content,
      },
    });

    // Return the created post with a 201 status
    return NextResponse.json(newPost, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error creating post" }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get("slug");

  try {
    if (slug) {
      // Fetch a single post by slug
      const post = await prisma.post.findUnique({
        where: { slug },
      });

      if (post) {
        return NextResponse.json(post, { status: 200 });
      } else {
        return NextResponse.json({ error: "Post not found" }, { status: 404 });
      }
    } else {
      // Fetch all posts
      const posts = await prisma.post.findMany();
      return NextResponse.json(posts, { status: 200 });
    }
  } catch (error) {
    console.error(error);
    return NextResponse.json(
      { error: "Error fetching posts" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    // Parse the request body
    const { id, title, slug, content } = await request.json();

    // Generate slug from title if not provided
    const generatedSlug = slug || title.toLowerCase().replace(/\s+/g, "-");

    // Update the post
    const updatedPost = await prisma.post.update({
      where: { id: Number(id) },
      data: {
        title,
        slug: generatedSlug,
        content,
      },
    });

    return NextResponse.json(updatedPost, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error updating post" }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    // Parse the request body
    const { id } = await request.json();

    // Delete the post
    const deletedPost = await prisma.post.delete({
      where: { id: Number(id) },
    });

    return NextResponse.json(deletedPost, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Error deleting post" }, { status: 500 });
  }
}
