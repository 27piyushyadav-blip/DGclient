/*
 * File: src/app/api/uploadthing/core.js
 */
import { createUploadthing } from "uploadthing/next";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const f = createUploadthing();

const auth = async (req) => {
  const session = await getServerSession(authOptions);
  if (!session?.user) throw new Error("Unauthorized");
  return { userId: session.user.id };
};

export const ourFileRouter = {
  // 1. Profile Pictures
  profilePicture: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(auth)
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Profile Upload:", file.url);
    }),

  // 2. Chat Attachments (Audio/Image/PDF) [!code ++]
  chatAttachment: f({ 
    image: { maxFileSize: "8MB", maxFileCount: 1 },
    pdf: { maxFileSize: "8MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 }, // For voice notes
    blob: { maxFileSize: "16MB", maxFileCount: 1 }   // Fallback for raw audio blobs
  })
    .middleware(auth)
    .onUploadComplete(async ({ file }) => {
      console.log("Chat Attachment:", file.url);
      return { url: file.url };
    }),
};