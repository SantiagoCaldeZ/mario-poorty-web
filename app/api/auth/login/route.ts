import { NextResponse } from "next/server";
import { signInWithIdentifier } from "@/lib/server/auth-helpers";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const identifier =
      typeof body?.identifier === "string" ? body.identifier : "";
    const password = typeof body?.password === "string" ? body.password : "";

    if (!identifier.trim() || !password) {
      return NextResponse.json(
        { error: "Debes completar el usuario/correo y la contraseña." },
        { status: 400 }
      );
    }

    const result = await signInWithIdentifier(identifier, password);

    if (!result.ok) {
      return NextResponse.json(
        { error: result.error },
        { status: 401 }
      );
    }

    return NextResponse.json({
      session: result.session,
    });
  } catch (error) {
    console.error("POST /api/auth/login error:", error);

    return NextResponse.json(
      { error: "No se pudo procesar el inicio de sesión." },
      { status: 500 }
    );
  }
}