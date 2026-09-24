"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Boton, Cabecera, Campo, Pantalla, inputCls } from "@/components/ui";
import { CLAVE_INICIAL, CODIGO_MAX, CODIGO_MIN } from "@/lib/config";
import { useStore } from "@/lib/store";

const GRADOS = ["1ro de secundaria", "2do de secundaria", "3ro de secundaria", "4to de secundaria", "5to de secundaria"];

export default function Registro() {
  const { set } = useStore();
  const router = useRouter();
  const [f, setF] = useState({
    codigo: "",
    inicial: "",
    apellidos: "",
    edad: "",
    sexo: "",
    grado: "",
    padres: "",
    clave: "",
  });
  const [err, setErr] = useState("");

  const cambia = (k: string, v: string) => setF((p) => ({ ...p, [k]: v }));

  function enviar() {
    const cod = f.codigo.trim().toUpperCase();
    const n = Number(cod.replace("LMY-", ""));
    // G3: todos los campos son obligatorios
    if (!/^LMY-\d{4}$/.test(cod) || Number.isNaN(n) || n < CODIGO_MIN || n > CODIGO_MAX) {
      return setErr(`El código debe ir de LMY-${String(CODIGO_MIN).padStart(4, "0")} a LMY-${CODIGO_MAX}.`);
    }
    const edad = Number(f.edad);
    // G4: validación del rango de edad del estudio (C8)
    if (!edad || edad < 12 || edad > 17) return setErr("La edad debe estar entre 12 y 17 años.");
    if (!f.inicial.trim() || !f.apellidos.trim()) return setErr("Completa tu inicial y tus apellidos.");
    if (!f.sexo || !f.grado || !f.padres) return setErr("Faltan campos por completar.");
    if (f.clave !== CLAVE_INICIAL) return setErr("Usa la contraseña inicial que te entregaron.");

    set((e) => {
      e.perfil = {
        codigo: cod,
        inicial: f.inicial.trim().toUpperCase(),
        apellidos: f.apellidos.trim(),
        edad,
        sexo: f.sexo,
        grado: f.grado,
        viveConAmbosPadres: f.padres,
      };
      e.consentido = true;
      return e;
    });
    router.push("/clave");
  }

  return (
    <Pantalla>
      <Cabecera titulo="Crea tu cuenta" volver="/ingreso" />
      <h1 className="mb-5 font-display text-2xl font-bold">Crea tu cuenta</h1>

      <Campo label="Código de acceso (Ej: LMY-0001)">
        <input
          className={inputCls}
          placeholder="LMY-XXXX"
          value={f.codigo}
          onChange={(e) => cambia("codigo", e.target.value)}
        />
      </Campo>

      <div className="grid grid-cols-2 gap-3">
        <Campo label="Inicial del nombre">
          <input className={inputCls} placeholder="A" maxLength={1} value={f.inicial} onChange={(e) => cambia("inicial", e.target.value)} />
        </Campo>
        <Campo label="Apellidos">
          <input className={inputCls} placeholder="Pérez" value={f.apellidos} onChange={(e) => cambia("apellidos", e.target.value)} />
        </Campo>
        <Campo label="Edad">
          <input className={inputCls} inputMode="numeric" placeholder="15" value={f.edad} onChange={(e) => cambia("edad", e.target.value)} />
        </Campo>
        <Campo label="Sexo">
          <select className={inputCls} value={f.sexo} onChange={(e) => cambia("sexo", e.target.value)}>
            <option value="">Selecciona</option>
            <option value="F">Femenino</option>
            <option value="M">Masculino</option>
          </select>
        </Campo>
      </div>

      <Campo label="Grado escolar">
        <select className={inputCls} value={f.grado} onChange={(e) => cambia("grado", e.target.value)}>
          <option value="">Selecciona</option>
          {GRADOS.map((g) => (
            <option key={g} value={g}>
              {g}
            </option>
          ))}
        </select>
      </Campo>

      <Campo label="¿Vives con ambos padres?">
        <select className={inputCls} value={f.padres} onChange={(e) => cambia("padres", e.target.value)}>
          <option value="">Selecciona</option>
          <option value="si">Sí</option>
          <option value="no">No</option>
        </select>
      </Campo>

      <Campo label="Contraseña" hint={`Usa la que te entregaron: ${CLAVE_INICIAL}`}>
        <input
          className={inputCls}
          type="password"
          placeholder="••••••••"
          value={f.clave}
          onChange={(e) => cambia("clave", e.target.value)}
        />
      </Campo>

      {err ? <p className="mb-3 text-sm text-red-600">{err}</p> : null}
      <Boton onClick={enviar}>Registrarme</Boton>
    </Pantalla>
  );
}
