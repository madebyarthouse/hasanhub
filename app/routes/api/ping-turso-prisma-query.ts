import getVideos from "~/lib/get-videos";

export async function loader() {
  try {
    const data = await getVideos({
      order: "desc",
      by: "publishedAt",
    });
    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
