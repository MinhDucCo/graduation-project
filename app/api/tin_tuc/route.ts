import { NextResponse } from "next/server";
import { TinTucModel } from "@/database";

export async function GET() {
  try {
    const data = await TinTucModel.findAll({
      order: [["id", "DESC"]],
    });
    return NextResponse.json(data);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Lỗi khi lấy tin tức" }, { status: 500 });
  }
}
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const created = await TinTucModel.create(body);
    return NextResponse.json(created);
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Không tạo được tin" }, { status: 500 });
  }
}

