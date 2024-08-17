export async function loader() {
  try {
    const data = await fetch(`https://hasanhub-arthouse.turso.io/v2/pipeline`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.TURSO_TOKEN}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        requests: [
          { type: "execute", stmt: { sql: "SELECT * FROM Candidate" } },
          { type: "close" },
        ],
      }),
    })
      .then((res) => res.json())
      .then((data) => console.log(data))
      .catch((err) => console.log(err));

    return new Response(JSON.stringify(data), { status: 200 });
  } catch (error) {
    console.log(error);
    return new Response(JSON.stringify(error), { status: 500 });
  }
}
