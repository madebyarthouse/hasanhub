import { prisma } from "~/utils/prisma.server";

export async function loader() {
  try {
    const data = await prisma.channel.findMany();
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
