import { Channel, Tag } from "@prisma/client";
import { prisma } from "../lib/prisma";

async function main() {
  let channelsData = [
    { youtubeId: "UCtoaZpBnrd0lhycxYJ4MNOQ" },
    { youtubeId: "UCr0GF7FXLV-NZf-3nD7YTMA" },
    { youtubeId: "UCnI_h3e6b5jGLfly2SY57SA" },
    { youtubeId: "UCobue-_fUPSIwdWULdE3MbQ" },
    { youtubeId: "UC5vHrvxeB612CrM9kmiNeZw" },
    { youtubeId: "UCqsq-k2LLwJ-UM77pLrEbHw" },
    { youtubeId: "UCBBQ9PIs8ARguuwVJZowGIg" },
    { youtubeId: "UCH_LUZtCuG1F3m7v74jtebw" },
    { youtubeId: "UCQl65LbQ58aCi74marnYi0Q" },
    { youtubeId: "UCoatplmazYmGMPe-3LRCeyg" },
    { youtubeId: "UC5KRuWEAEVgYORPfgNHgDFg" },
    { youtubeId: "UCCm5xK2EY4uBJ1T2adrc3hA" },
    { youtubeId: "UC9q-CD7NLfYiB0hK5656_6A" },
    { youtubeId: "UCz2n05fvYYoVTrhq1ZUnyHA" },
    { youtubeId: "UCswIFeQ749hM3XgHsitI3tA" },
    { youtubeId: "UCBwbwVWMGEQSzJ0T7-YwtHA" },
    { youtubeId: "UC1hW1iEFDsW-6V0zC8jqVQA" },
    { youtubeId: "UCPATNnO0ee5VY4Cqu9U9QCg" },
    { youtubeId: "UCRz3YRwS7EQKkJDf5rNAMGg" },
  ];
  let playlistsData = [{ youtubeId: "PLvcSNZqNYJCmQq4sIJaLLVMahgdRWH-Qx" }];
  let tagsData = [
    { name: "React", synonyms: "react,reacts,reacting", slug: "react" },
    {
      name: "GTA",
      synonyms: "gta,grand theft auto,don,rp,humberto,pecorino",
      slug: "gta",
    },
    {
      name: "Gaming",
      synonyms: "plays,gaming,game,gta,rust,pokemon,arceus,cyberpunk",
      slug: "gaming",
    },
    { name: "Joe Rogan", synonyms: "joe rogan,rogan", slug: "joe-rogan" },
    {
      name: "Ben Shapiro",
      synonyms: "ben shapiro,shapiro",
      slug: "ben-shapiro",
    },
    { name: "Pokimane", synonyms: "pokimane", slug: "pokimane" },
    { name: "Trump", synonyms: "donald trump,trump", slug: "trump" },
    { name: "TikTok", synonyms: "tiktok", slug: "tiktok" },
    {
      name: "AustinShow",
      synonyms: "austin,austinshow,austin show",
      slug: "austinshow",
    },
    {
      name: "Ludwig Ahgren",
      synonyms: "ludwig,ludwig ahgren",
      slug: "ludwig-ahgren",
    },
    {
      name: "Jordan Peterson",
      synonyms: "jordan peterson,peterson",
      slug: "jordan-peterson",
    },
    { name: "Jubilee", synonyms: "jubilee", slug: "jubilee" },
    { name: "Myth", synonyms: "myth", slug: "myth" },
    { name: "Joe Biden", synonyms: "joe biden,biden", slug: "joe-biden" },
    { name: "Valkyrae", synonyms: "valkyrae", slug: "valkyrae" },
    {
      name: "Andrew Callaghan",
      synonyms: "andrew callaghan",
      slug: "andrew-callaghan",
    },
    { name: "Mizkif", synonyms: "mizkif", slug: "mizkif" },
    {
      name: "AOC",
      synonyms: "aoc,alexandria ocasio cortez,ocasio cortez",
      slug: "alexandria-ocasio-cortez",
    },
    { name: "Rust", synonyms: "rust", slug: "rust" },
    { name: "OTV", synonyms: "otv", slug: "otv" },
    { name: "Cringe", synonyms: "cringe", slug: "cringe" },
    { name: "Pokemon", synonyms: "pokemon,arceus", slug: "pokemon" },
    { name: "Amouranth", synonyms: "amouranth", slug: "amouranth" },
    {
      name: "Tucker Carlson",
      synonyms: "tucker carlson",
      slug: "tucker-carlson",
    },
    {
      name: "Felix Biederman",
      synonyms: "felix biederman",
      slug: "felix-biederman",
    },
    {
      name: "Steven Crowder",
      synonyms: "steven crowder,crowder",
      slug: "steven-crowder",
    },
    { name: "h3h3", synonyms: "ethan klein,leftovers,h3h3", slug: "h3h3" },
    { name: "Chadvice", synonyms: "chadvice", slug: "chadvice" },
    { name: "IRL", synonyms: "irl", slug: "irl" },
    { name: "Ukraine", synonyms: "ukraine", slug: "ukraine" },
    { name: "Putin", synonyms: "putin", slug: "putin" },
    { name: "Fox News", synonyms: "fox,fox news", slug: "fox-news" },
    { name: "JCS", synonyms: "jcs", slug: "jcs" },
    {
      name: "Kyle Rittenhouse",
      synonyms: "rittenhouse, kyle rittenhouse",
      slug: "kyle-rittenhouse",
    },
    { name: "Maya", synonyms: "maya", slug: "maya" },
    { name: "Covid", synonyms: "covid,coronavirus,pandemic", slug: "covid" },
    { name: "Sex", synonyms: "sex", slug: "sex" },
    {
      name: "Dave Chappelle",
      synonyms: "chappelle, dave chappelle",
      slug: "dave-chappelle",
    },
    { name: "JPEGMAFIA", synonyms: "jpegmafia", slug: "jpegmafia" },
    { name: "Hogwatch", synonyms: "hog,hogs,hogwatch", slug: "hogwatch" },
    { name: "39daph", synonyms: "39daph", slug: "39daph" },
    { name: "Will Neff", synonyms: "will neff", slug: "will-neff" },
    { name: "Sykkuno", synonyms: "sykkuno", slug: "sykkuno" },
    { name: "Kanye West", synonyms: "kanye,kanye west", slug: "kanye-west" },
    { name: "Texas", synonyms: "texas", slug: "texas" },
    { name: "Grimes", synonyms: "grimes", slug: "grimes" },
    { name: "Elon Musk", synonyms: "elon,musk,elon musk", slug: "elon-musk" },
    { name: "Capitalism", synonyms: "capitalism", slug: "capitalism" },
    { name: "Adin Ross", synonyms: "adin ross", slug: "adin-ross" },
    { name: "Vice", synonyms: "vice", slug: "vice" },
    { name: "QTCinderella", synonyms: "qtcinderella", slug: "qtcinderella" },
    {
      name: "Mia Malkova",
      synonyms: "malkova,mia malkova",
      slug: "mia-malkova",
    },
    { name: "Tubbo", synonyms: "tubbo", slug: "tubbo" },
    {
      name: "Crypto/NFTs",
      synonyms: "crypto,nft,nfts,bitcoin,cryptocurrency",
      slug: "crypto-nfts",
    },
    {
      name: "Bernie Sanders",
      synonyms: "bernie sanders",
      slug: "bernie-sanders",
    },
    { name: "Afghanistan", synonyms: "afghanistan", slug: "afghanistan" },
    { name: "Cyberpunk", synonyms: "cyberpunk", slug: "cyberpunk" },
    { name: "Homeless", synonyms: "homeless", slug: "homeless" },
    { name: "Israel", synonyms: "israel", slug: "israel" },
    {
      name: "Christian Walker",
      synonyms: "christian walker",
      slug: "christian-walker",
    },
    { name: "CNN", synonyms: "cnn", slug: "cnn" },
    { name: "Socialism", synonyms: "socialism", slug: "socialism" },
    { name: "Tim Pool", synonyms: "tim pool", slug: "tim-pool" },
    { name: "Elden Ring", synonyms: "elden ring", slug: "elden-ring" },
    { name: "CRT", synonyms: "crt,critical race theory", slug: "crt" },
    { name: "Masterchef", synonyms: "masterchef", slug: "masterchef" },
    { name: "Rants", synonyms: "rant ,rants", slug: "rants" },
  ];

  const existingChannels = await prisma.channel.findMany({
    where: { youtubeId: { in: channelsData.map((c) => c.youtubeId) } },
    select: { youtubeId: true },
  });

  const existingTags = await prisma.tag.findMany({
    where: { slug: { in: tagsData.map((t) => t.slug) } },
    select: { slug: true },
  });

  const newChannels = channelsData.filter(
    (c) => !existingChannels.find((e) => e.youtubeId === c.youtubeId),
  );

  const newTags = tagsData.filter(
    (t) => !existingTags.find((e) => e.slug === t.slug),
  );

  if (newChannels.length > 0) {
    await prisma.channel.createMany({ data: newChannels });
  }

  if (newTags.length > 0) {
    await prisma.tag.createMany({ data: newTags });
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
