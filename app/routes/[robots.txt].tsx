import { prisma } from "~/utils/prisma.server";

export const loader = async () => {
  const tags = await prisma.tag.findMany();
  // handle "GET" request
  // set up our text content that will be returned in the response
  const robotText = `
User-agent: Googlebot
Disallow: /nogooglebot/
Allow: /$    
User-agent: *
${tags
  .map((tag) => {
    return `Allow: /tags/${tag.slug}/`;
  })
  .join("\n")}
Disallow: /

Sitemap: http://hasanhub.com/sitemap.xml
        `;
  // return the text content, a status 200 success response, and set the content type to text/plain
  return new Response(robotText, {
    status: 200,
    headers: {
      "Content-Type": "text/plain",
    },
  });
};
