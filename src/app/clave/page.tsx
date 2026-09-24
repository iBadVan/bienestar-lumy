"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Campo, Pantalla, inputCls } from "@/components/ui";
import { CLAVE_INICIAL } from "@/lib/config";
import { useStore } from "@/lib/store";

export default function CambiarClave() {
  const { set } = useStore();
  const router = useRouter();
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState("");

  function guardar() {
    if (a.length < 6) return setErr("Usa al menos 6 caracteres.");
    if (a !== b) return setErr("Las dos contraseñas no coinciden.");
    if (a === CLAVE_INICIAL) return setErr("Elige una distinta a la que te dieron.");
    set((e) => {
      e.claveCambiada = true;
      return e;
    });
    router.push("/app");
  }

  return (
    <Pantalla>
      <div className="flex flex-1 flex-col justify-center">
        <h1 className="font-display text-2xl font-bold">Crea tu contraseña</h1>
        <p className="mb-6 text-sm text-lumy-tintaSuave">
          Por seguridad, cambia la contraseña que te entregaron. Solo tú debes conocerla.
        </p>
        <Campo label="Nueva contraseña">
          <input className={inputCls} type="password" placeholder="Mínimo 6 caracteres" value={a} onChange={(e) => setA(e.target.value)} />
        </Campo>
        <Campo label="Repítela">
          <input className={inputCls} type="password" value={b} onChange={(e) => setB(e.target.value)} />
        </Campo>
        {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
        <Boton onClick={guardar}>Guardar y continuar</Boton>
      </div>
    </Pantalla>
  );
}
