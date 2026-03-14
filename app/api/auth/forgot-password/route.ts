import { NextResponse } from "next/server";
import { sendPasswordResetForIdentifier } from "@/lib/server/auth-helpers";

const GENERIC_SUCCESS_MESSAGE =
  "Si existe una cuenta asociada, te enviaremos instrucciones para restablecer tu contraseña.";

export async function POST(request: Request) {
  try {
    const body = await request.json();

    const identifier =
      typeof body?.identifier === "string" ? body.identifier : "";

    if (!identifier.trim()) {
      return NextResponse.json(
        { error: "Debes ingresar un correo o nombre de usuario." },
        { status: 400 }
      );
    }

    const origin = new URL(request.url).origin;
    const redirectTo = `${origin}/reset-password`;

    await sendPasswordResetForIdentifier(identifier, redirectTo);

    return NextResponse.json({
      ok: true,
      message: GENERIC_SUCCESS_MESSAGE,
    });
  } catch (error) {
    console.error("POST /api/auth/forgot-password error:", error);

    return NextResponse.json(
      { error: "No se pudo procesar la recuperación." },
      { status: 500 }
    );
  }
}