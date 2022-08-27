export async function getTagsForSidebar(url: string) {
  const data = await fetch(url);
  return await data.json();
}
