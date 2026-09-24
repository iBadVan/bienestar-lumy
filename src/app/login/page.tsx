"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Cabecera, Campo, Pantalla, inputCls } from "@/components/ui";
import { CLAVE_INICIAL, CODIGO_MAX, CODIGO_MIN } from "@/lib/config";
import { useStore } from "@/lib/store";

export default function Login() {
  const { s, set } = useStore();
  const router = useRouter();
  const [cod, setCod] = useState(s.perfil?.codigo ?? "");
  const [clave, setClave] = useState("");
  const [err, setErr] = useState("");

  function entrar() {
    const c = cod.trim().toUpperCase();
    const n = Number(c.replace("LMY-", ""));
    if (!/^LMY-\d{4}$/.test(c) || Number.isNaN(n) || n < CODIGO_MIN || n > CODIGO_MAX) {
      return setErr("Revisa tu código. Debe verse así: LMY-0001.");
    }
    if (!s.claveCambiada && clave !== CLAVE_INICIAL) {
      return setErr("Contraseña incorrecta.");
    }
    set((e) => {
      if (!e.perfil) {
        e.perfil = { codigo: c, inicial: "", apellidos: "", edad: null, sexo: "", grado: "", viveConAmbosPadres: "" };
      } else {
        e.perfil.codigo = c;
      }
      return e;
    });
    router.push(s.claveCambiada ? "/app" : "/clave");
  }

  return (
    <Pantalla>
      <Cabecera titulo="Ingresar" volver="/ingreso" />
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="text-center font-display text-2xl font-bold">¡Hola de nuevo!</h1>
        <p className="mb-6 text-center text-sm text-lumy-tintaSuave">
          Ingresa con tu código para continuar
        </p>

        <Campo label="Código de acceso">
          <input className={inputCls} placeholder="LMY-0001" value={cod} onChange={(e) => setCod(e.target.value)} />
        </Campo>
        <Campo label="Contraseña">
          <input className={inputCls} type="password" placeholder="••••••••" value={clave} onChange={(e) => setClave(e.target.value)} />
        </Campo>

        {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
        <Boton onClick={entrar}>Entrar a mi espacio</Boton>
      </div>
    </Pantalla>
  );
}
