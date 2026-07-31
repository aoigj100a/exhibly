import Link from "next/link";
import { prisma } from "@exhibly/db";

const featured = ["動漫", "療癒", "原住民文化", "當代藝術", "沉浸式", "好拍"];

export default async function Home() {
  return (
    <div>
      <h1>Exhibly</h1>
      <p>用主題逛台灣的展覽</p>

      {/* 精选主题：每个连到带 ?tags= 的筛选页 */}
      <div>
        {featured.map((name) => (
          <Link key={name} href={`/list?tags=${name}`}>
            {name}
          </Link>
        ))}
      </div>

      <Link href="/list">看全部展覽</Link>
    </div>
  );
}