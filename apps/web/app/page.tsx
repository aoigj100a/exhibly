import { prisma } from "@exhibly/db";

export default async function Home() {
  const exhibitions = await prisma.exhibition.findMany();

  return (
    <ul>
      {exhibitions.map((e) => (
        <li key={e.id}>{e.name}</li>
      ))}
    </ul>
  );
}