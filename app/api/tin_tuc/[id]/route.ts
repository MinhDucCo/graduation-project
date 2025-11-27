import { NextResponse } from "next/server";
import { TinTucModel } from "@/database";

export async function PUT(req: Request, { params }: any) {
  try {
    const id = params.id;
    const body = await req.json();

    await TinTucModel.update(body, { where: { id } });

    return NextResponse.json({ message: "Cập nhật thành công" });
  } catch (error) {
    console.log(error);
    return NextResponse.json({ error: "Lỗi cập nhật tin" }, { status: 500 });
  }
}

export async function DELETE(req: Request, { params }: any) {
  try {
    await TinTucModel.destroy({ where: { id: params.id } });
    return NextResponse.json({ message: "Đã xóa tin" });
  } catch (error) {
    return NextResponse.json({ error: "Không xóa được" }, { status: 500 });
  }
}
