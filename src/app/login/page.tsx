"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Cabecera, Campo, Pantalla, inputCls } from "@/components/ui";
import { CLAVE_INICIAL } from "@/lib/config";
import { haySupabase, iniciarSesion } from "@/lib/datos";
import { useStore } from "@/lib/store";

export default function Login() {
  const { s, set } = useStore();
  const router = useRouter();
  const [cod, setCod] = useState(s.perfil?.codigo ?? "");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");

  async function entrar() {
    const c = cod.trim().toUpperCase();
    if (!/^LMY-[A-Z0-9]{5}$/.test(c)) {
      return setErr("Revisa tu código. Se ve así: LMY-K4T9P");
    }
    let debeCambiar = !s.claveCambiada;
    let diaServidor: number | null = null;
    let codigoEstudio: string | null = null;

    if (haySupabase) {
      const r = await iniciarSesion(c, clave);
      if (!r.ok) {
        return setErr(
          navigator.onLine
            ? "Código o contraseña incorrectos."
            : "Necesitas conexión solo la primera vez que ingresas.",
        );
      }
      if (r.estado === "retirada") {
        return setErr("Esta cuenta ya no está activa en el estudio.");
      }
      // Manda lo que diga el servidor, no lo que quedó en este navegador.
      debeCambiar = r.claveCambiada === false;
      diaServidor = r.diaActual ?? null;
      codigoEstudio = r.codigoEstudio ?? null;
    } else if (!s.claveCambiada && clave !== CLAVE_INICIAL) {
      return setErr("Contraseña incorrecta.");
    }

    set((e) => {
      e.claveCambiada = !debeCambiar;
      // El servidor sabe en que dia va. Si la participante reinstalo la app,
      // esto recupera su avance en vez de empezar de cero.
      if (diaServidor) e.dia = diaServidor;
      if (e.perfil && codigoEstudio) e.perfil.codigoEstudio = codigoEstudio;
      if (!e.perfil) {
        e.perfil = { codigo: c, inicial: "", apellidos: "", edad: null, sexo: "", grado: "", viveConAmbosPadres: "" };
      } else {
        e.perfil.codigo = c;
      }
      return e;
    });
    router.push(debeCambiar ? "/clave" : "/app");
  }

  return (
    <Pantalla>
      <Cabecera titulo="Ingresar" volver="/ingreso" />
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-center font-display text-2xl font-bold">¡Hola de nuevo!</h1>
        <p className="mb-6 text-center text-sm text-lumy-tintaSuave">
          Usa el mismo código con el que te registraste
        </p>

        <Campo label="Código de acceso" hint="El que está en tu papel. Ejemplo: LMY-K4T9P">
          <input
            className={`${inputCls} font-display tracking-wider`}
            placeholder="LMY-XXXXX"
            value={cod}
            onChange={(e) => setCod(e.target.value.toUpperCase())}
            autoCapitalize="characters"
            autoComplete="off"
          />
        </Campo>
        <Campo label="Contraseña">
          <input className={inputCls} type="password" placeholder="••••••••" value={clave} onChange={(e) => setClave(e.target.value)} />
        </Campo>

        {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
        <Boton onClick={() => void entrar()}>Entrar a mi espacio</Boton>
      </div>
    </Pantalla>
  );
}
